import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PROTECTED_ROUTES, PUBLIC_ROUTES, matchRoute, findRouteConfig } from '@/core/config/routes';
import { hasPermission } from '@/core/config/permissions';
import type { OrganizationRole } from '@/core/types';

const ORG_COOKIE_NAME = 'oasis_current_org';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Create response object ONCE at the start
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // First update the request cookies (for subsequent middleware/server code)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Then set the response cookies (for the browser)
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if needed
  const { data: { user }, error } = await supabase.auth.getUser();

  // Check if route is public
  const isPublic = PUBLIC_ROUTES.some(route => matchRoute(pathname, route));

  // If not authenticated
  if (error || !user) {
    // Allow public routes
    if (isPublic) {
      return response;
    }

    // Redirect to login for protected routes
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated

  // Redirect away from auth pages if already logged in
  if (isPublic && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Find route config for protected routes
  const routeConfig = findRouteConfig(pathname);

  if (routeConfig) {
    // Get user's role in current organization
    const orgId = request.cookies.get(ORG_COOKIE_NAME)?.value;

    if (routeConfig.isPlatformAdminOnly) {
      // Check if user is platform admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_platform_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_platform_admin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else if (routeConfig.minRole || routeConfig.roles) {
      // Get user's role in current organization
      let memberQuery = supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (orgId) {
        memberQuery = memberQuery.eq('organization_id', orgId);
      }

      const { data: membership } = await memberQuery.limit(1).single();

      if (!membership) {
        // User has no active organization membership
        return NextResponse.redirect(new URL('/', request.url));
      }

      const userRole = membership.role as OrganizationRole;

      // Check specific roles
      if (routeConfig.roles && !routeConfig.roles.includes(userRole)) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Check minimum role
      if (routeConfig.minRole && !hasPermission(userRole, routeConfig.minRole)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
