import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_ROUTES, matchRoute, findRouteConfig } from '@/core/config/routes';
import { hasPermission } from '@/core/config/permissions';
import type { OrganizationRole } from '@/core/types';

const ORG_COOKIE_NAME = 'oasis_current_org';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Crear respuesta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Configurar cliente Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Actualizar request cookies para que el servidor las vea
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Actualizar response cookies para que el navegador las guarde
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 3. Refrescar sesión (esto puede modificar las cookies en 'response')
  const { data: { user }, error } = await supabase.auth.getUser();

  // 4. Verificar ruta pública
  const isPublic = PUBLIC_ROUTES.some(route => matchRoute(pathname, route));

  // --- LÓGICA DE REDIRECCIÓN CON PRESERVACIÓN DE COOKIES ---

  // CASO A: Usuario NO autenticado
  if (error || !user) {
    // Si la ruta es pública, permitimos el paso
    if (isPublic) {
      return response;
    }

    // Si es privada, redirigimos al login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    // IMPORTANTE: Crear redirección y copiar las cookies de la respuesta original
    // (por si supabase intentó limpiar una sesión inválida)
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  // CASO B: Usuario autenticado
  if (user) {
    // Si intenta entrar a login/register estando logueado -> ir a Dashboard
    if (isPublic && (pathname === '/login' || pathname === '/register')) {
      const dashboardUrl = new URL('/participant', request.url);
      const redirectResponse = NextResponse.redirect(dashboardUrl);
      copyCookies(response, redirectResponse);
      return redirectResponse;
    }
  }

  // 5. Verificación de Roles (RBAC) para rutas protegidas
  const routeConfig = findRouteConfig(pathname);

  if (routeConfig) {
    const orgId = request.cookies.get(ORG_COOKIE_NAME)?.value;

    if (routeConfig.isPlatformAdminOnly) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_platform_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_platform_admin) {
        const redirectResponse = NextResponse.redirect(new URL('/', request.url));
        copyCookies(response, redirectResponse);
        return redirectResponse;
      }
    } else if (routeConfig.minRole || routeConfig.roles) {
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
        const redirectResponse = NextResponse.redirect(new URL('/', request.url));
        copyCookies(response, redirectResponse);
        return redirectResponse;
      }

      const userRole = membership.role as OrganizationRole;

      if (
        (routeConfig.roles && !routeConfig.roles.includes(userRole)) ||
        (routeConfig.minRole && !hasPermission(userRole, routeConfig.minRole))
      ) {
        const redirectResponse = NextResponse.redirect(new URL('/', request.url));
        copyCookies(response, redirectResponse);
        return redirectResponse;
      }
    }
  }

  return response;
}

/**
 * Función auxiliar para transferir cookies entre respuestas.
 * Esto evita que se pierda la sesión (o el cierre de sesión) al redirigir.
 */
function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};