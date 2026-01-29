import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_ROUTES, matchRoute, findRouteConfig } from '@/core/config/routes';
import { hasPermission } from '@/core/config/permissions';
import type { OrganizationRole } from '@/core/types';

const ORG_COOKIE_NAME = 'oasis_current_org';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Crear respuesta inicial
  // Necesario para que el cliente de Supabase pueda manipular las cabeceras
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
          // CORRECCIÓN TS: Actualizar request cookies solo con name y value (2 argumentos)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          
          // Actualizar la respuesta (response) para pasar las cookies actualizadas al siguiente paso
          response = NextResponse.next({
            request,
          });

          // CORRECCIÓN TS: Actualizar response cookies con opciones (3 argumentos)
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 3. Refrescar sesión (esto ejecutará setAll si es necesario)
  // IMPORTANTE: No usar la variable 'user' extraída directamente aquí para lógica compleja posterior
  // si el token se refrescó, es mejor confiar en getUser() limpio.
  const { data: { user }, error } = await supabase.auth.getUser();

  // 4. Verificar ruta pública
  const isPublic = PUBLIC_ROUTES.some(route => matchRoute(pathname, route));

  // --- LÓGICA DE REDIRECCIÓN ---

  // CASO A: Usuario NO autenticado
  if (error || !user) {
    // Si la ruta es pública, permitimos el paso
    if (isPublic) {
      return response;
    }

    // Si es privada, redirigimos al login
    const loginUrl = new URL('/login', request.url);
    // Guardamos a dónde quería ir para redirigirlo después
    loginUrl.searchParams.set('redirect', pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // CASO B: Usuario autenticado
  if (user) {
    // Si intenta entrar a login/register estando logueado -> ir a la Raíz (Dispatcher)
    // CAMBIO: Antes iba a '/participant', ahora va a '/' para que page.tsx decida.
    if (isPublic && (pathname === '/login' || pathname === '/register')) {
      const rootUrl = new URL('/', request.url);
      return NextResponse.redirect(rootUrl);
    }
  }

  // 5. Verificación de Roles (RBAC) para rutas protegidas [LÓGICA ORIGINAL RESTAURADA]
  const routeConfig = findRouteConfig(pathname);

  if (routeConfig) {
    // Si la ruta requiere configuración especial
    const orgId = request.cookies.get(ORG_COOKIE_NAME)?.value;

    // Validación: Solo Platform Admins
    if (routeConfig.isPlatformAdminOnly) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_platform_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_platform_admin) {
        // Si no tiene permiso, lo mandamos a la raíz (o a 403)
        return NextResponse.redirect(new URL('/', request.url));
      }
    } 
    // Validación: Roles de Organización
    else if (routeConfig.minRole || routeConfig.roles) {
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
        // No es miembro -> fuera
        return NextResponse.redirect(new URL('/', request.url));
      }

      const userRole = membership.role as OrganizationRole;

      // Verificar si cumple el rol mínimo o está en la lista de roles permitidos
      if (
        (routeConfig.roles && !routeConfig.roles.includes(userRole)) ||
        (routeConfig.minRole && !hasPermission(userRole, routeConfig.minRole))
      ) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (svg, png, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};