import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getAdminOrError() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', supabase: null, user: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, id')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Forbidden: Admin only', supabase: null, user: null }

  return { error: null, supabase, user }
}

// ---------------------------------------------------------------------------
// GET /api/admin/events
// Query params: page, pageSize, search, status, sort (date|created_at), order (asc|desc)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { error, supabase } = await getAdminOrError()
  if (error || !supabase) {
    return NextResponse.json({ success: false, message: error }, { status: error === 'Unauthorized' ? 401 : 403 })
  }

  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '10')))
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''
  const sort = searchParams.get('sort') === 'created_at' ? 'created_at' : 'date'
  const order = searchParams.get('order') === 'asc' ? true : false

  // Build base query with application count via subquery
  let query = supabase
    .from('events')
    .select('*, applications(count)', { count: 'exact' })

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }
  if (status) {
    query = query.eq('status', status)
  }

  query = query.order(sort, { ascending: order })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error: fetchError, count } = await query

  if (fetchError) {
    return NextResponse.json({ success: false, message: fetchError.message }, { status: 500 })
  }

  // Flatten the application count from the nested relation
  const events = (data ?? []).map((ev: Record<string, unknown>) => {
    const appArr = ev.applications as { count: number }[] | null
    return {
      ...ev,
      application_count: appArr?.[0]?.count ?? 0,
      applications: undefined,
    }
  })

  return NextResponse.json({
    success: true,
    events,
    total: count ?? 0,
    page,
    pageSize,
  })
}

// ---------------------------------------------------------------------------
// POST /api/admin/events
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const { error, supabase, user } = await getAdminOrError()
  if (error || !supabase || !user) {
    return NextResponse.json({ success: false, message: error }, { status: error === 'Unauthorized' ? 401 : 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.title || !body.date) {
    return NextResponse.json({ success: false, message: 'title and date are required' }, { status: 400 })
  }

  const insertData = {
    title: body.title as string,
    description: (body.description as string) || null,
    date: body.date as string,
    time: (body.time as string) || null,
    location: (body.location as string) || null,
    volunteers_needed: body.volunteers_needed != null ? Number(body.volunteers_needed) : null,
    volunteer_pay: body.volunteer_pay != null ? Number(body.volunteer_pay) : null,
    skills_required: (body.skills_required as string) || null,
    needs_influencer: Boolean(body.needs_influencer),
    status: (body.status as string) || 'draft',
    application_deadline: (body.application_deadline as string) || null,
    created_by: user.id,
  }

  const { data, error: insertError } = await supabase
    .from('events')
    .insert([insertData])
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ success: false, message: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, event: data }, { status: 201 })
}
