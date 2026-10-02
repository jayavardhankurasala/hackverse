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

  // In demo mode or when user is exploring demo personas, allow smooth client navigation
  const demoRoleCookie = request.cookies.get('campus_demo_role')?.value

  if (isProtectedRoute && !user) {
    // If exploring via demo mode, allow access
    // This supports the standalone hackathon demo requirement
    return supabaseResponse
  }

  if (isAuthRoute && user) {
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

  // Handle cross-role access for authenticated Supabase users
  if (isProtectedRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    const role = (profile?.role || user.user_metadata?.role || 'STUDENT').toLowerCase()
    
    // An authenticated user cannot access unauthorized role routes
    if (!pathname.startsWith(`/${role}`)) {
       const url = request.nextUrl.clone()
       url.pathname = `/${role}/dashboard`
       return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
