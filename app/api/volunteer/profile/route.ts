import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// GET /api/volunteer/profile
// Returns the current volunteer's profile
// ---------------------------------------------------------------------------
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !profile) {
    return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, profile })
}

// ---------------------------------------------------------------------------
// PATCH /api/volunteer/profile
// Updates the current volunteer's profile (full_name, phone, city, skills, etc.)
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!existing || existing.role !== 'volunteer') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  // Only allow safe fields to be updated
  const allowed = ['full_name', 'phone', 'city', 'pincode', 'address_line_1', 'address_line_2', 'skills', 'gender']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, message: 'No valid fields to update' }, { status: 400 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, profile })
}
