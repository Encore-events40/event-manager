import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getAdminOrError() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', supabase: null, user: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Forbidden: Admin only', supabase: null, user: null }

  return { error: null, supabase, user }
}

// ---------------------------------------------------------------------------
// GET /api/admin/payouts
// ---------------------------------------------------------------------------
export async function GET() {
  const { error, supabase } = await getAdminOrError()
  if (error || !supabase) {
    return NextResponse.json({ success: false, message: error }, { status: error === 'Unauthorized' ? 401 : 403 })
  }

  const { data, error: fetchError } = await supabase
    .from('payouts')
    .select(`
      id,
      amount,
      paid_on,
      created_at,
      event_id,
      volunteer_id,
      events (id, title, date),
      recipient:profiles!volunteer_id (id, full_name, email, role)
    `)
    .order('created_at', { ascending: false })

  if (fetchError) {
    return NextResponse.json({ success: false, message: fetchError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, payouts: data ?? [] })
}

// ---------------------------------------------------------------------------
// POST /api/admin/payouts
// Body: { event_id: string, volunteer_id: string, amount: number, notes?: string }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const { error, supabase, user } = await getAdminOrError()
  if (error || !supabase || !user) {
    return NextResponse.json({ success: false, message: error }, { status: error === 'Unauthorized' ? 401 : 403 })
  }

  let body: { event_id?: string; volunteer_id?: string; amount?: number; notes?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  const eventId = body.event_id?.trim()
  const volunteerId = body.volunteer_id?.trim()
  const amount = Number(body.amount ?? 0)

  if (!eventId || !volunteerId || amount <= 0) {
    return NextResponse.json(
      { success: false, message: 'event_id, volunteer_id and a valid amount are required' },
      { status: 400 }
    )
  }

  const { data: existing } = await supabase
    .from('payouts')
    .select('id')
    .eq('event_id', eventId)
    .eq('volunteer_id', volunteerId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ success: false, message: 'Payout already recorded for this person in this event.' }, { status: 409 })
  }

  const insertData = {
    event_id: eventId,
    volunteer_id: volunteerId,
    amount,
    paid_on: new Date().toISOString().slice(0, 10),
    notes: body.notes?.trim() || null,
    created_by: user.id,
  }

  const { data: payout, error: insertError } = await supabase
    .from('payouts')
    .insert([insertData])
    .select('id, amount, paid_on, created_at, event_id, volunteer_id')
    .single()

  if (insertError) {
    return NextResponse.json({ success: false, message: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, payout }, { status: 201 })
}
