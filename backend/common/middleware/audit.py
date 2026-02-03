# common/middleware/audit.py
"""
Automatic audit logging middleware for OASIS services.

Captures all mutating operations (POST, PUT, PATCH, DELETE) and logs them
to the audit.logs table for compliance and debugging purposes.
"""
import logging
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from common.database.client import get_admin_client

logger = logging.getLogger(__name__)

AUDITABLE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


class AuditMiddleware(BaseHTTPMiddleware):
    """
    Middleware that automatically logs mutating HTTP operations to audit.logs.

    Only logs successful operations (2xx status codes) to avoid cluttering
    the audit log with failed requests.

    Usage:
        from common.middleware import AuditMiddleware
        app.add_middleware(AuditMiddleware, service_name="auth_service")
    """

    def __init__(self, app, service_name: str = "unknown"):
        super().__init__(app)
        self.service_name = service_name

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Response]
    ) -> Response:
        # Skip non-mutating methods
        if request.method not in AUDITABLE_METHODS:
            return await call_next(request)

        # Process the request
        response = await call_next(request)

        # Only audit successful operations (2xx status codes)
        if 200 <= response.status_code < 300:
            await self._log_audit(request, response)

        return response

    async def _log_audit(self, request: Request, response: Response) -> None:
        """Log the operation to audit.logs table."""
        try:
            # Extract user_id from request state (set by auth dependency)
            user_id = getattr(request.state, "user_id", None)
            org_id = request.headers.get("x-organization-id")

            db = await get_admin_client()
            await db.schema("audit").from_("logs").insert(
                {
                    "actor_id": user_id,
                    "organization_id": org_id,
                    "category_code": self._get_category(request.url.path),
                    "action": self._get_action(request.method, request.url.path),
                    "resource": self._get_resource(request.url.path),
                    "metadata": {"service": self.service_name},
                    "ip_address": request.client.host if request.client else None,
                    "user_agent": request.headers.get("user-agent"),
                }
            ).execute()
        except Exception as e:
            # Don't fail the request if audit logging fails
            logger.error(f"Audit log failed: {e}")

    def _get_category(self, path: str) -> str:
        """Determine the audit category based on the request path."""
        if "/auth/" in path:
            return "auth"
        if "/organizations/" in path or "/orgs/" in path:
            return "org"
        if "/users/" in path or "/profiles/" in path:
            return "profile"
        if "/journeys/" in path or "/enrollments/" in path:
            return "journey"
        if "/webhooks/" in path:
            return "system"
        return "system"

    def _get_action(self, method: str, path: str) -> str:
        """Determine the action based on method and path."""
        # Auth-specific actions
        if "/login" in path:
            return "LOGIN"
        if "/logout" in path:
            return "LOGOUT"
        if "/register" in path:
            return "REGISTER"
        if "/password" in path:
            return "PASSWORD_CHANGE"

        # Membership actions
        if "/members" in path:
            if method == "POST":
                return "ADD_MEMBER"
            if method == "DELETE":
                return "REMOVE_MEMBER"
            if method in ("PUT", "PATCH"):
                return "UPDATE_MEMBER"

        # Generic CRUD actions
        action_map = {
            "POST": "CREATE",
            "PUT": "UPDATE",
            "PATCH": "UPDATE",
            "DELETE": "DELETE",
        }
        return action_map.get(method, "UNKNOWN")

    def _get_resource(self, path: str) -> str:
        """Extract the resource type from the path."""
        # Remove API version prefix and query string
        clean_path = path.split("?")[0]
        parts = [p for p in clean_path.split("/") if p and p != "api" and p != "v1"]

        if parts:
            # Return first meaningful segment as resource type
            return parts[0]
        return "unknown"
