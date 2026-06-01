import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Este middleware protege rutas administrativas puras (/admin/*) si deciden separarse.
// Adicionalmente asegura que requests a API operativas contengan token de sesión.
export function middleware(request: NextRequest) {
  const isApiAdminRoute = request.nextUrl.pathname.startsWith('/api/admin');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute || isApiAdminRoute) {
    // Buscar la cookie de sesión nativa de Supabase (por defecto sb-<project>-auth-token)
    // Para una validación estricta, Supabase Server Client debería inicializarse aquí,
    // pero a nivel Edge, simplemente validamos la existencia del token para rechazo temprano.
    const hasAuthToken = request.cookies.getAll().some(cookie => cookie.name.includes('-auth-token'));

    if (!hasAuthToken) {
      if (isApiAdminRoute) {
        return NextResponse.json({ error: 'No autorizado. Se requiere token de sesión operativo.' }, { status: 401 });
      } else {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
