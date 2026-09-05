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
// PATCH /api/admin/brand-enquiries/[id]
// Body: { status: 'new' | 'in_progress' | 'resolved' }
// ---------------------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, supabase } = await getAdminOrError()
  if (error || !supabase) {
    return NextResponse.json(
      { success: false, message: error },
      { status: error === 'Unauthorized' ? 401 : 403 }
    )
  }

  let body: { status: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  const validStatuses = ['new', 'in_progress', 'resolved']
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json(
      { success: false, message: 'Invalid status. Must be new, in_progress, or resolved.' },
      { status: 400 }
    )
  }

  const { data, error: updateError } = await supabase
    .from('brand_enquiries')
    .update({ status: body.status })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json(
      { success: false, message: updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, item: data })
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/brand-enquiries/[id]
// ---------------------------------------------------------------------------
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, supabase } = await getAdminOrError()
  if (error || !supabase) {
    return NextResponse.json(
      { success: false, message: error },
      { status: error === 'Unauthorized' ? 401 : 403 }
    )
  }

  const { error: deleteError } = await supabase
    .from('brand_enquiries')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json(
      { success: false, message: deleteError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
