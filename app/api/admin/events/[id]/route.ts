import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getAdminOrError() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', supabase: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Forbidden: Admin only', supabase: null }

  return { error: null, supabase }
}

// ---------------------------------------------------------------------------
// GET /api/admin/events/[id]
// ---------------------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, supabase } = await getAdminOrError()
  if (error || !supabase) {
    return NextResponse.json({ success: false, message: error }, { status: error === 'Unauthorized' ? 401 : 403 })
  }

  const { data, error: fetchError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) {
    const status = fetchError.code === 'PGRST116' ? 404 : 500
    return NextResponse.json({ success: false, message: fetchError.message }, { status })
  }

  return NextResponse.json({ success: true, event: data })
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/events/[id]
// ---------------------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, supabase } = await getAdminOrError()
  if (error || !supabase) {
    return NextResponse.json({ success: false, message: error }, { status: error === 'Unauthorized' ? 401 : 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  // Only update fields that were actually sent
  const updateData: Record<string, unknown> = {}
  const allowed = [
    'title', 'description', 'date', 'time', 'location',
    'volunteers_needed', 'volunteer_pay', 'skills_required',
    'needs_influencer', 'status', 'application_deadline',
  ]
  for (const key of allowed) {
    if (key in body) updateData[key] = body[key]
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ success: false, message: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error: updateError } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ success: false, message: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, event: data })
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/events/[id]
// ---------------------------------------------------------------------------
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, supabase } = await getAdminOrError()
  if (error || !supabase) {
    return NextResponse.json({ success: false, message: error }, { status: error === 'Unauthorized' ? 401 : 403 })
  }

  const { error: deleteError } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ success: false, message: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
