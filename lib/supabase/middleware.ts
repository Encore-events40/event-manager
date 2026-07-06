import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  
  // Define protected paths
  const isDashboard = 
    url.pathname.startsWith('/admin') || 
    url.pathname.startsWith('/volunteer') || 
    url.pathname.startsWith('/influencer')

  // Rule 1: Block logged-out users from dashboards
  if (isDashboard && !user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Rule 2: Enforce Role-Based Routing
  if (user && isDashboard) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (!role) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (url.pathname.startsWith('/admin') && role !== 'admin') {
      url.pathname = `/${role}`
      return NextResponse.redirect(url)
    }
    
    if (url.pathname.startsWith('/volunteer') && role !== 'volunteer') {
      url.pathname = `/${role}`
      return NextResponse.redirect(url)
    }
    
    if (url.pathname.startsWith('/influencer') && role !== 'influencer') {
      url.pathname = `/${role}`
      return NextResponse.redirect(url)
    }
  }

  // Rule 3: Redirect logged-in users away from auth pages
  if (user && (url.pathname === '/login' || url.pathname === '/signup')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile?.role) {
      url.pathname = `/${profile.role}`
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}