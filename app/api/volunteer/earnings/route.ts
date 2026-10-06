import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// GET /api/volunteer/earnings
// Returns all payouts for the current volunteer with event details
// Also returns aggregated totals and monthly breakdown
// ---------------------------------------------------------------------------
export async function GET() {
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

  const { data, error } = await supabase
    .from('payouts')
    .select(`
      id,
      amount,
      paid_on,
      created_at,
      notes,
      events (id, title, date, location)
    `)
    .eq('volunteer_id', profile.id)
    .order('paid_on', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  const payouts = data ?? []

  // Aggregate total
  const totalEarned = payouts.reduce((sum, p) => sum + Number(p.amount || 0), 0)

  // Monthly breakdown for the last 6 months
  const monthlyMap: Record<string, number> = {}
  for (const payout of payouts) {
    const dateStr = payout.paid_on || payout.created_at
    if (!dateStr) continue
    const d = new Date(dateStr)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(payout.amount || 0)
  }

  // Build last 6 months array
  const now = new Date()
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      key,
      label: d.toLocaleString('en-US', { month: 'short' }),
      value: monthlyMap[key] ?? 0,
    }
  })

  return NextResponse.json({
    success: true,
    payouts,
    totalEarned,
    monthly,
    eventsWorked: new Set(
      payouts
        .map((p) => {
          const ev = p.events as unknown as { id: string } | null
          return ev?.id ?? null
        })
        .filter(Boolean)
    ).size,
  })
}
