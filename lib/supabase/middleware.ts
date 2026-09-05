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

  const isCreateProfile = url.pathname === '/create-profile'

  // Rule 1: Block logged-out users from protected routes
  if ((isDashboard || isCreateProfile) && !user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Rule 2: Enforce Profile Setup and Role-Based Routing
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('user_id', user.id)
      .single()

    const role = profile?.role
    const isProfileComplete = !!profile?.full_name

    // If the database can't find a role, kick them out
    if (!role) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Force incomplete profiles to the setup page
    if (!isProfileComplete && !isCreateProfile) {
      url.pathname = '/create-profile'
      return NextResponse.redirect(url)
    }

    // Route fully onboarded users
    if (isProfileComplete) {
      // Keep them out of auth and setup pages
      if (
        url.pathname === '/login' ||
        url.pathname === '/signup' ||
        url.pathname === '/' ||
        isCreateProfile
      ) {
        url.pathname = `/${role}`
        return NextResponse.redirect(url)
      }

      // Restrict dashboard access to specific roles
      if (isDashboard) {
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
    }
  }

  return supabaseResponse
}