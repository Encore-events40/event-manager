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
// GET /api/admin/applications
// Query params: page, pageSize, event_id, status, role (volunteer|influencer|all), search
// Uses explicit FK hints to avoid PostgREST embedding ambiguity:
//   applicant:profiles!volunteer_id(...)
//   reviewer:profiles!reviewed_by(...)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { error, supabase } = await getAdminOrError()
  if (error || !supabase) {
    return NextResponse.json({ success: false, message: error }, { status: error === 'Unauthorized' ? 401 : 403 })
  }

  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '10')))
  const eventId = searchParams.get('event_id') ?? ''
  const status = searchParams.get('status') ?? ''
  const role = searchParams.get('role') ?? 'all'
  const search = searchParams.get('search') ?? ''

  // Build query with explicit foreign key hints
  let query = supabase
    .from('applications')
    .select(`
      id,
      event_id,
      volunteer_id,
      status,
      applied_at,
      reviewed_at,
      reviewed_by,
      events (id, title, date, location),
      applicant:profiles!volunteer_id (id, full_name, email, role, phone, skills),
      reviewer:profiles!reviewed_by (id, full_name, email)
    `, { count: 'exact' })

  if (eventId) {
    query = query.eq('event_id', eventId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  query = query.order('applied_at', { ascending: false })

  const { data, error: fetchError, count } = await query

  if (fetchError) {
    return NextResponse.json({ success: false, message: fetchError.message }, { status: 500 })
  }

  let filteredItems = (data ?? []) as any[]

  // Filter by applicant role (from applicant profile)
  if (role !== 'all') {
    filteredItems = filteredItems.filter((item) => item.applicant?.role === role)
  }

  // Filter by applicant name or email search term
  if (search) {
    const s = search.toLowerCase()
    filteredItems = filteredItems.filter((item) => {
      const nameMatch = item.applicant?.full_name?.toLowerCase().includes(s)
      const emailMatch = item.applicant?.email?.toLowerCase().includes(s)
      return Boolean(nameMatch || emailMatch)
    })
  }

  // Server-side pagination
  const total = filteredItems.length
  const from = (page - 1) * pageSize
  const paginatedItems = filteredItems.slice(from, from + pageSize)

  return NextResponse.json({
    success: true,
    items: paginatedItems,
    total: role !== 'all' || search ? total : (count ?? total),
    page,
    pageSize,
  })
}
