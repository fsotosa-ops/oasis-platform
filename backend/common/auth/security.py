# common/auth/security.py
"""
Authentication and Authorization system for OASIS API.

This module implements a hierarchical permission system:

1. Platform Admin (God Mode):
   - Can access ANY organization without X-Organization-ID header
   - Can manage all users, orgs, and audit logs
   - Bypasses all contextual role checks

2. Organization Roles (Contextual):
   - owner: Full control of their organization
   - admin: Operational management, can invite members
   - facilitador: Staff, can view participant progress
   - participante: End user, access to content and journeys

Usage:
    # Require Platform Admin
    @router.get("/admin/users")
    async def list_users(admin: dict = Depends(PlatformAdminRequired())):
        ...

    # Require specific org role (needs X-Organization-ID header)
    @router.get("/org/members")
    async def list_members(ctx: dict = Depends(OrgRoleChecker(["owner", "admin"]))):
        org_id = ctx["org_id"]
        ...

    # Any authenticated user
    @router.get("/me")
    async def get_me(user: dict = Depends(get_current_user)):
        ...
"""
import logging
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from common.database.client import get_admin_client

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


# ============================================================================
# Token Validation
# ============================================================================


async def validate_token(
    auth: HTTPAuthorizationCredentials = Depends(security),  # noqa: B008
) -> dict:
    """
    Validate JWT using Supabase's native validation.

    Uses Supabase Auth's get_user() which handles all JWT validation internally,
    including signature verification and expiration checks.

    Returns:
        Dict with user claims: sub, email, aud

    Raises:
        HTTPException 401: If token is invalid or expired
    """
    token = auth.credentials
    db = await get_admin_client()

    try:
        user_response = await db.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {
            "sub": str(user_response.user.id),
            "email": user_response.user.email,
            "aud": "authenticated",
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.warning(f"Token validation failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token") from e


# ============================================================================
# User Context
# ============================================================================


async def get_current_user(
    payload: dict = Depends(validate_token),  # noqa: B008
) -> dict:
    """
    Get the current user's profile from the database.

    This is the base user context - it does NOT include organization roles.
    For organization-specific permissions, use OrgRoleChecker or OrgMemberRequired.

    Returns:
        User profile dict with: id, email, full_name, avatar_url,
        is_platform_admin, metadata

    Raises:
        HTTPException 401: If no user ID in token
        HTTPException 404: If profile not found
        HTTPException 500: If database error
    """
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing user identifier")

    db = await get_admin_client()
    try:
        response = (
            await db.table("profiles")
            .select("id, email, full_name, avatar_url, is_platform_admin, metadata")
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")

        return response.data

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching profile for user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching profile") from e


async def get_optional_user(
    auth: Annotated[
        HTTPAuthorizationCredentials | None, Depends(optional_security)  # noqa: B008
    ],
) -> dict | None:
    """
    Get current user if authenticated, None otherwise.
    Useful for endpoints that work differently for authenticated vs anonymous users.
    """
    if auth is None:
        return None

    try:
        payload = await validate_token(auth)
        return await get_current_user(payload)
    except HTTPException:
        return None


# ============================================================================
# Platform Admin Authorization
# ============================================================================


class PlatformAdminRequired:
    """
    Dependency that requires the user to be a Platform Admin.

    Platform Admins have "God Mode" - they can:
    - Access any organization without X-Organization-ID header
    - View all users, orgs, and audit logs
    - Manage any resource in the system

    Usage:
        @router.get("/admin/users")
        async def list_users(admin: dict = Depends(PlatformAdminRequired())):
            # admin is the full user profile
            ...
    """

    async def __call__(
        self,
        user: dict = Depends(get_current_user),  # noqa: B008
    ) -> dict:
        if not user.get("is_platform_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Platform admin access required",
            )
        return user


# ============================================================================
# Organization Role Authorization
# ============================================================================


class OrgRoleChecker:
    """
    Contextual role checker for organization-level permissions.

    Validates that:
    1. User is authenticated
    2. X-Organization-ID header is provided (unless Platform Admin)
    3. User is an active member of that organization
    4. User has one of the allowed roles

    Platform Admins bypass all checks and get access to any organization.

    Usage:
        @router.get("/org/members")
        async def list_members(
            ctx: dict = Depends(OrgRoleChecker(["owner", "admin"]))
        ):
            org_id = ctx["org_id"]
            user_role = ctx["org_role"]  # "owner", "admin", or "platform_admin"
            ...

    Returns dict with:
        - All user profile fields
        - org_id: The organization context
        - org_role: User's role in this org (or "platform_admin")
    """

    def __init__(self, allowed_roles: list[str]):
        """
        Args:
            allowed_roles: List of roles that can access this endpoint.
                           e.g., ["owner", "admin"], ["facilitador", "participante"]
        """
        self.allowed_roles = allowed_roles

    async def __call__(
        self,
        user: dict = Depends(get_current_user),  # noqa: B008
        x_organization_id: Annotated[str | None, Header()] = None,
    ) -> dict:
        # Platform Admin bypass - has access to everything
        if user.get("is_platform_admin"):
            return {
                **user,
                "org_id": x_organization_id,  # May be None, that's OK for admins
                "org_role": "platform_admin",
            }

        # For regular users, organization context is required
        if not x_organization_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Organization-ID header is required",
            )

        # Verify membership and role
        db = await get_admin_client()
        try:
            membership = (
                await db.table("organization_members")
                .select("role, status")
                .eq("organization_id", x_organization_id)
                .eq("user_id", user["id"])
                .limit(1)
                .execute()
            )

            if not membership.data or len(membership.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not a member of this organization",
                )

            member_data = membership.data[0]

            # Check membership status
            if member_data.get("status") != "active":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Membership status: {member_data.get('status')}",
                )

            # Check role permission
            user_role = member_data.get("role")
            if user_role not in self.allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        f"Required roles: {self.allowed_roles}. Your role: {user_role}",
                    ),
                )

            return {
                **user,
                "org_id": x_organization_id,
                "org_role": user_role,
            }

        except HTTPException:
            raise
        except Exception as err:
            logging.error(f"Error checking membership: {err}")
            raise HTTPException(
                status_code=500, detail="Error verifying permissions"
            ) from err


class OrgMemberRequired:
    """
    Simplified checker that only requires active membership.
    Does not check for specific roles - any active member can access.

    Usage:
        @router.get("/org/content")
        async def view_content(ctx: dict = Depends(OrgMemberRequired())):
            org_id = ctx["org_id"]
            ...
    """

    async def __call__(
        self,
        user: dict = Depends(get_current_user),  # noqa: B008
        x_organization_id: Annotated[str | None, Header()] = None,
    ) -> dict:
        # Platform Admin bypass
        if user.get("is_platform_admin"):
            return {
                **user,
                "org_id": x_organization_id,
                "org_role": "platform_admin",
            }

        if not x_organization_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Organization-ID header is required",
            )

        db = await get_admin_client()
        membership = (
            await db.table("organization_members")
            .select("role, status")
            .eq("organization_id", x_organization_id)
            .eq("user_id", user["id"])
            .eq("status", "active")
            .limit(1)
            .execute()
        )

        if not membership.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not an active member of this organization",
            )

        return {
            **user,
            "org_id": x_organization_id,
            "org_role": membership.data[0]["role"],
        }


# ============================================================================
# Helpers for Path-based Organization Checks
# ============================================================================


async def verify_org_permission(
    user_id: str,
    org_id: str,
    required_roles: list[str],
    db=None,
) -> dict:
    """
    Verify user has required role in an organization.
    Use this when org_id comes from path parameter instead of header.

    Args:
        user_id: User's UUID
        org_id: Organization's UUID
        required_roles: List of acceptable roles
        db: Supabase client (will create admin client if None)

    Returns:
        Membership dict with role and status

    Raises:
        HTTPException 403: If user doesn't have required access
    """
    if db is None:
        db = await get_admin_client()

    membership = (
        await db.table("organization_members")
        .select("role, status")
        .eq("organization_id", org_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    if not membership.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this organization",
        )

    member = membership.data[0]

    if member["status"] != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your membership is not active",
        )

    if member["role"] not in required_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Required role: {required_roles}",
        )

    return member


async def verify_org_access(
    user: dict,
    org_id: str,
    required_roles: list[str],
    db=None,
) -> dict:
    """
    Verify user has access to an organization.
    Platform Admins always have access.

    Args:
        user: User dict from get_current_user
        org_id: Organization's UUID
        required_roles: List of acceptable roles
        db: Supabase client

    Returns:
        Dict with org_id and org_role
    """
    # Platform Admin bypass
    if user.get("is_platform_admin"):
        return {"org_id": org_id, "org_role": "platform_admin"}

    membership = await verify_org_permission(
        user_id=user["id"],
        org_id=org_id,
        required_roles=required_roles,
        db=db,
    )

    return {"org_id": org_id, "org_role": membership["role"]}


# ============================================================================
# Role Hierarchy Helpers
# ============================================================================

ROLE_HIERARCHY = {
    "platform_admin": 100,
    "owner": 50,
    "admin": 40,
    "facilitador": 30,
    "participante": 20,
}


def can_manage_role(actor_role: str, target_role: str) -> bool:
    """
    Check if an actor can manage (modify/remove) a target based on role hierarchy.

    Rules:
    - platform_admin can manage anyone
    - owner can manage anyone in their org
    - admin can manage facilitador and participante
    - facilitador and participante can't manage anyone

    Args:
        actor_role: Role of the person trying to make changes
        target_role: Role of the person being changed

    Returns:
        True if actor can manage target
    """
    actor_level = ROLE_HIERARCHY.get(actor_role, 0)
    target_level = ROLE_HIERARCHY.get(target_role, 0)

    # Can't manage equals or superiors (except platform_admin can manage owners)
    if actor_role == "platform_admin":
        return True

    return actor_level > target_level


def can_assign_role(actor_role: str, new_role: str) -> bool:
    """
    Check if an actor can assign a specific role.

    Rules:
    - platform_admin can assign any role
    - owner can assign any role in their org
    - admin can assign facilitador and participante
    - Others can't assign roles

    Args:
        actor_role: Role of the person assigning
        new_role: Role being assigned

    Returns:
        True if actor can assign the role
    """
    if actor_role in ["platform_admin", "owner"]:
        return True

    if actor_role == "admin":
        return new_role in ["facilitador", "participante"]

    return False
