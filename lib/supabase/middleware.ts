import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes check
  const isProtectedRoute = pathname.startsWith('/student') || pathname.startsWith('/staff') || pathname.startsWith('/admin')
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    // We should redirect to their specific dashboard based on role, but we need to fetch the profile first.
    // For middleware, fetching DB is possible but adds latency.
    // Let's redirect to a generic /redirect route that handles role routing, or fetch here.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    const role = profile?.role?.toLowerCase() || 'student'
    const url = request.nextUrl.clone()
    url.pathname = `/${role}/dashboard`
    return NextResponse.redirect(url)
  }

  // Handle cross-role access (e.g. student trying to access /admin)
  if (isProtectedRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    const role = profile?.role?.toLowerCase() || 'student'
    
    if (!pathname.startsWith(`/${role}`)) {
       const url = request.nextUrl.clone()
       url.pathname = `/${role}/dashboard`
       return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
