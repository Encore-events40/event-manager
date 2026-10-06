import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// GET /api/volunteer/events
// Returns published events, each annotated with the volunteer's application
// status (null if not yet applied).
// Query params: page, pageSize, search, category
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  // Fetch volunteer profile id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'volunteer') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '12')))
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''

  // 1. Fetch published events
  let eventsQuery = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('date', { ascending: true })

  if (search) {
    eventsQuery = eventsQuery.ilike('title', `%${search}%`)
  }
  if (category) {
    eventsQuery = eventsQuery.eq('category', category)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  eventsQuery = eventsQuery.range(from, to)

  const { data: events, error: eventsError, count } = await eventsQuery

  if (eventsError) {
    return NextResponse.json({ success: false, message: eventsError.message }, { status: 500 })
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ success: true, events: [], total: 0, page, pageSize })
  }

  // 2. Fetch this volunteer's applications for these event IDs
  const eventIds = events.map((e) => e.id)
  const { data: applications } = await supabase
    .from('applications')
    .select('event_id, status, applied_at')
    .eq('volunteer_id', profile.id)
    .in('event_id', eventIds)

  const appByEventId = Object.fromEntries(
    (applications ?? []).map((a) => [a.event_id, { status: a.status, applied_at: a.applied_at }])
  )

  const enriched = events.map((ev) => ({
    ...ev,
    application: appByEventId[ev.id] ?? null,
  }))

  return NextResponse.json({
    success: true,
    events: enriched,
    total: count ?? 0,
    page,
    pageSize,
  })
}
