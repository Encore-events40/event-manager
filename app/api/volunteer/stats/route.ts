import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// GET /api/volunteer/stats
// Returns dashboard stats: events worked, total earned, upcoming events,
// hours contributed (estimate), application breakdown, recent events
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

  // Run all queries in parallel
  const [
    { data: applications },
    { data: payouts },
    { data: upcomingEvents },
  ] = await Promise.all([
    // All applications for this volunteer
    supabase
      .from('applications')
      .select('id, status, applied_at, events(id, title, date, time, location, volunteer_pay)')
      .eq('volunteer_id', profile.id)
      .order('applied_at', { ascending: false }),

    // All payouts
    supabase
      .from('payouts')
      .select('id, amount, paid_on, created_at, events(id)')
      .eq('volunteer_id', profile.id),

    // Upcoming published events (next 30 days) with approved application
    supabase
      .from('applications')
      .select('id, events(id, title, date, time, location, volunteer_pay)')
      .eq('volunteer_id', profile.id)
      .eq('status', 'approved'),
  ])

  // Compute stats
  const appList = applications ?? []
  const payoutList = payouts ?? []

  const totalEarned = payoutList.reduce((sum, p) => sum + Number(p.amount || 0), 0)

  // Events worked = distinct events with a payout
  const eventsWorked = new Set(
    payoutList
      .map((p) => {
        const ev = p.events as unknown as { id: string } | null
        return ev?.id ?? null
      })
      .filter(Boolean)
  ).size

  // Application counts
  const counts = { pending: 0, approved: 0, rejected: 0 }
  for (const app of appList) {
    const s = app.status as keyof typeof counts
    if (s in counts) counts[s]++
  }

  // Upcoming confirmed events (approved application, future date)
  const now = new Date()
  const upcoming = (upcomingEvents ?? [])
    .map((a) => {
      const ev = a.events as unknown as {
        id: string
        title: string
        date: string
        time: string | null
        location: string | null
        volunteer_pay: number | null
      } | null
      return ev
    })
    .filter((ev): ev is NonNullable<typeof ev> => {
      if (!ev) return false
      return new Date(ev.date) >= now
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  // Monthly earnings for last 6 months
  const monthlyMap: Record<string, number> = {}
  for (const payout of payoutList) {
    const dateStr = payout.paid_on || payout.created_at
    if (!dateStr) continue
    const d = new Date(dateStr)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(payout.amount || 0)
  }

  const monthly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      key,
      label: d.toLocaleString('en-US', { month: 'short' }),
      value: monthlyMap[key] ?? 0,
    }
  })

  // Hours contributed estimate: 8h per event worked
  const hoursContributed = eventsWorked * 8

  return NextResponse.json({
    success: true,
    stats: {
      eventsWorked,
      totalEarned,
      upcomingCount: upcoming.length,
      hoursContributed,
    },
    counts,
    upcoming,
    monthly,
  })
}
