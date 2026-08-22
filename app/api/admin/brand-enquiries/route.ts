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
// GET /api/admin/brand-enquiries
// Query params: page, pageSize, status
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { error, supabase } = await getAdminOrError()
  if (error || !supabase) {
    return NextResponse.json(
      { success: false, message: error },
      { status: error === 'Unauthorized' ? 401 : 403 }
    )
  }

  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20')))
  const status = searchParams.get('status') ?? ''

  let query = supabase
    .from('brand_enquiries')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error: fetchError, count } = await query

  if (fetchError) {
    return NextResponse.json(
      { success: false, message: fetchError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  })
}

// ---------------------------------------------------------------------------
// POST /api/admin/brand-enquiries
// Body: { company, contact, email?, summary?, status? }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const { error, supabase } = await getAdminOrError()
  if (error || !supabase) {
    return NextResponse.json(
      { success: false, message: error },
      { status: error === 'Unauthorized' ? 401 : 403 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.company || !body.contact) {
    return NextResponse.json(
      { success: false, message: 'company and contact are required' },
      { status: 400 }
    )
  }

  const { data, error: insertError } = await supabase
    .from('brand_enquiries')
    .insert([{
      company: body.company as string,
      contact: body.contact as string,
      email: (body.email as string) || null,
      summary: (body.summary as string) || null,
      status: (body.status as string) || 'new',
    }])
    .select()
    .single()

  if (insertError) {
    return NextResponse.json(
      { success: false, message: insertError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, item: data }, { status: 201 })
}
