import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { pathname } = request.nextUrl

  // Protected & Auth routes classification
  const isProtectedRoute = pathname.startsWith('/student') || pathname.startsWith('/staff') || pathname.startsWith('/admin')
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  // Performance optimization: Public routes bypass auth checks entirely (0ms overhead)
  if (!isProtectedRoute && !isAuthRoute) {
    return supabaseResponse
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  // Fast token presence check: Avoid blocking HTTPS calls to Supabase if no session cookie exists
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

  if (!hasAuthCookie) {
    // Unauthenticated user heading to login/register or exploring demo
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (isAuthRoute && user) {
      const role = (user.user_metadata?.role || 'STUDENT').toLowerCase()
      const url = request.nextUrl.clone()
      url.pathname = `/${role}/dashboard`
      return NextResponse.redirect(url)
    }

    if (isProtectedRoute && user) {
      const role = (user.user_metadata?.role || 'STUDENT').toLowerCase()
      if (!pathname.startsWith(`/${role}`)) {
        const url = request.nextUrl.clone()
        url.pathname = `/${role}/dashboard`
        return NextResponse.redirect(url)
      }
    }
  } catch (err) {
    // Silently fall through on network interruptions to keep navigation responsive
  }

  return supabaseResponse
}
