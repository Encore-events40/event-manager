import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export const runtime = 'nodejs'

/**
 * GET /auth/callback
 * Supabase redirects here after Google OAuth. We exchange the code for a
 * session, look up the user's role, then route them:
 *   - No role yet (first Google sign-in) → /select-role
 *   - Existing role                       → /{role} dashboard
 *   - Missing code / auth error           → /login?error=...
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (!profile?.role) {
    // New Google user — send them to pick a role
    return NextResponse.redirect(`${origin}/select-role`)
  }

  return NextResponse.redirect(`${origin}/${profile.role}`)
}
