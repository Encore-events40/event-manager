import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// POST /api/volunteer/events/apply
// Body: { event_id: string }
// Submits an application for the current volunteer to an event
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
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

  let body: { event_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  const eventId = body.event_id?.trim()
  if (!eventId) {
    return NextResponse.json({ success: false, message: 'event_id is required' }, { status: 400 })
  }

  // Check event exists and is published
  const { data: event } = await supabase
    .from('events')
    .select('id, status, application_deadline')
    .eq('id', eventId)
    .single()

  if (!event) {
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 })
  }

  if (event.status !== 'published') {
    return NextResponse.json({ success: false, message: 'This event is not open for applications' }, { status: 400 })
  }

  if (event.application_deadline) {
    const deadline = new Date(event.application_deadline)
    if (new Date() > deadline) {
      return NextResponse.json({ success: false, message: 'Application deadline has passed' }, { status: 400 })
    }
  }

  // Check for duplicate application
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('event_id', eventId)
    .eq('volunteer_id', profile.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ success: false, message: 'You have already applied for this event' }, { status: 409 })
  }

  const { data: application, error: insertError } = await supabase
    .from('applications')
    .insert([{
      event_id: eventId,
      volunteer_id: profile.id,
      status: 'pending',
      applied_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ success: false, message: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, application }, { status: 201 })
}
