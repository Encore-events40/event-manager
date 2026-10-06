import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// GET /api/volunteer/applications
// Returns all applications for the current volunteer, with event details
// ---------------------------------------------------------------------------
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'volunteer') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      event_id,
      status,
      applied_at,
      reviewed_at,
      events (id, title, date, time, location, volunteer_pay, description)
    `)
    .eq('volunteer_id', profile.id)
    .order('applied_at', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  // Count by status
  const counts = { pending: 0, approved: 0, rejected: 0 }
  for (const app of data ?? []) {
    const s = app.status as keyof typeof counts
    if (s in counts) counts[s]++
  }

  return NextResponse.json({ success: true, applications: data ?? [], counts })
}
