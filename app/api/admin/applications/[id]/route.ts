import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getAdminOrError() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', supabase: null, adminProfile: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Forbidden: Admin only', supabase: null, adminProfile: null }

  return { error: null, supabase, adminProfile: profile }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/applications/[id]
// Body: { status: 'approved' | 'rejected' }
// Updates application status, reviewed_at, and reviewed_by.
// Uses explicit FK hints for joined responses:
//   applicant:profiles!volunteer_id(...)
//   reviewer:profiles!reviewed_by(...)
// ---------------------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, supabase, adminProfile } = await getAdminOrError()
  if (error || !supabase || !adminProfile) {
    return NextResponse.json({ success: false, message: error }, { status: error === 'Unauthorized' ? 401 : 403 })
  }

  let body: { status: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  if (body.status !== 'approved' && body.status !== 'rejected') {
    return NextResponse.json({ success: false, message: 'Invalid status. Must be approved or rejected.' }, { status: 400 })
  }

  // Update application status with reviewer tracking
  const { data: updatedApp, error: updateError } = await supabase
    .from('applications')
    .update({
      status: body.status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminProfile.id,
    })
    .eq('id', id)
    .select(`
      id,
      event_id,
      volunteer_id,
      status,
      applied_at,
      reviewed_at,
      reviewed_by,
      events (id, title, date),
      applicant:profiles!volunteer_id (id, full_name, email, role, phone, skills),
      reviewer:profiles!reviewed_by (id, full_name, email)
    `)
    .single()

  if (updateError) {
    return NextResponse.json({ success: false, message: updateError.message }, { status: 500 })
  }

  // Trigger transactional email notification if approved
  if (body.status === 'approved' && updatedApp) {
    try {
      const targetEmail = (updatedApp.applicant as any)?.email
      const eventName = (updatedApp.events as any)?.title

      if (targetEmail && eventName) {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '')}.supabase.co/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: targetEmail, eventName }),
        })
      }
    } catch (emailErr) {
      console.error('Database status updated, but notification email ping failed:', emailErr)
    }
  }

  return NextResponse.json({ success: true, application: updatedApp })
}
