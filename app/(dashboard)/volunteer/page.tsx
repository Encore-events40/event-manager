import {
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiTrendingUp,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileWidget from "@/components/dashboard/ProfileWidget";
import Link from "next/link";

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  volunteer_pay: number | null;
}

interface MonthBucket {
  key: string;
  label: string;
  value: number;
}

interface DashboardStats {
  eventsWorked: number;
  totalEarned: number;
  upcomingCount: number;
  hoursContributed: number;
}

interface AppCounts {
  pending: number;
  approved: number;
  rejected: number;
}

async function getVolunteerDashboardData(userId: string, profileId: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Fetch dashboard stats from our API route (server-side fetch)
  try {
    // We can't call our own API from server component easily, so query Supabase directly
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const supabase = await createServerClient();

    const [{ data: applications }, { data: payouts }, { data: upcomingApps }] =
      await Promise.all([
        supabase
          .from("applications")
          .select("id, status, applied_at")
          .eq("volunteer_id", profileId),

        supabase
          .from("payouts")
          .select("id, amount, paid_on, created_at, events(id)")
          .eq("volunteer_id", profileId),

        supabase
          .from("applications")
          .select(
            "id, events(id, title, date, time, location, volunteer_pay)"
          )
          .eq("volunteer_id", profileId)
          .eq("status", "approved"),
      ]);

    const payoutList = payouts ?? [];
    const appList = applications ?? [];

    const totalEarned = payoutList.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const eventsWorked = new Set(
      payoutList
        .map((p) => {
          const ev = p.events as unknown as { id: string } | null;
          return ev?.id ?? null;
        })
        .filter(Boolean)
    ).size;

    const counts = { pending: 0, approved: 0, rejected: 0 };
    for (const app of appList) {
      const s = app.status as keyof typeof counts;
      if (s in counts) counts[s]++;
    }

    const now = new Date();
    const upcoming = (upcomingApps ?? [])
      .map((a) => {
        return a.events as unknown as UpcomingEvent | null;
      })
      .filter((ev): ev is UpcomingEvent => {
        if (!ev) return false;
        return new Date(ev.date) >= now;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    // Monthly earnings for last 7 months
    const monthlyMap: Record<string, number> = {};
    for (const payout of payoutList) {
      const dateStr = payout.paid_on || payout.created_at;
      if (!dateStr) continue;
      const d = new Date(dateStr);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(payout.amount || 0);
    }

    const monthly: MonthBucket[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        key,
        label: d.toLocaleString("en-US", { month: "short" }),
        value: monthlyMap[key] ?? 0,
      };
    });

    return {
      stats: {
        eventsWorked,
        totalEarned,
        upcomingCount: upcoming.length,
        hoursContributed: eventsWorked * 8,
      } as DashboardStats,
      counts: counts as AppCounts,
      upcoming,
      monthly,
    };
  } catch {
    return {
      stats: {
        eventsWorked: 0,
        totalEarned: 0,
        upcomingCount: 0,
        hoursContributed: 0,
      } as DashboardStats,
      counts: { pending: 0, approved: 0, rejected: 0 } as AppCounts,
      upcoming: [] as UpcomingEvent[],
      monthly: [] as MonthBucket[],
    };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

const GRADIENT_COLORS = [
  "#5fa1ff",
  "#7c4dff",
  "#1d4ed8",
  "#f9a125",
  "#e7dffd",
  "#10b981",
  "#f59e0b",
];

export default async function VolunteerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { stats, counts, upcoming, monthly } =
    await getVolunteerDashboardData(user.id, profile?.id ?? "");

  const statCards = [
    {
      label: "Events Worked",
      value: String(stats.eventsWorked),
      meta: "Completed events",
      icon: FiCheckCircle,
    },
    {
      label: "Total Earned",
      value: formatCurrency(stats.totalEarned),
      meta: "Lifetime earnings",
      icon: FiTrendingUp,
    },
    {
      label: "Upcoming Events",
      value: String(stats.upcomingCount),
      meta: "Confirmed upcoming",
      icon: FiCalendar,
    },
    {
      label: "Hours Contributed",
      value: String(stats.hoursContributed),
      meta: "Estimated hours",
      icon: FiClock,
    },
  ];

  const totalApplications = counts.pending + counts.approved + counts.rejected;
  const approvedPct =
    totalApplications > 0
      ? Math.round((counts.approved / totalApplications) * 100)
      : 0;
  const pendingPct =
    totalApplications > 0
      ? Math.round((counts.pending / totalApplications) * 100)
      : 0;

  const maxMonthlyValue = Math.max(...monthly.map((m) => m.value), 1);

  type Achievement = { title: string; detail: string; color: string };

  const achievements: Achievement[] = [];
  if (stats.eventsWorked >= 10)
    achievements.push({ title: "Event Star", detail: "Completed 10+ events", color: "bg-[#93c5fd]" });
  if (stats.eventsWorked >= 1)
    achievements.push({ title: "First Steps", detail: "Worked your first event", color: "bg-[#c4b5fd]" });
  if (stats.hoursContributed >= 50)
    achievements.push({ title: "Rising Volunteer", detail: "50+ hours contributed", color: "bg-[#fcd34d]" });
  if (counts.approved >= 5)
    achievements.push({ title: "Team Player", detail: "5+ approved applications", color: "bg-[#6ee7b7]" });
  if (stats.totalEarned >= 5000)
    achievements.push({ title: "Earner", detail: "Earned ₹5,000+", color: "bg-[#fda4af]" });

  const displayAchievements: Achievement[] =
    achievements.length > 0
      ? achievements.slice(0, 3)
      : [{ title: "Keep Going!", detail: "Complete events to earn achievements", color: "bg-[#94a3b8]" }];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1424] px-2 py-4 lg:px-6">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-[#7cc6ff] to-[#a78bfa] bg-clip-text text-transparent">
                {profile?.full_name || "Volunteer"}
              </span>
              !
            </h1>
            <p className="mt-2 text-slate-400">
              Here&apos;s your activity overview.
            </p>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]"
            >
              <FiBell className="h-5 w-5" />
            </button>

            <ProfileWidget profile={profile} />
          </div>
        </header>

        {/* Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, meta, icon: Icon }) => (
            <div
              key={label}
              className="rounded-[22px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_15px_40px_rgba(10,20,40,0.35)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white">{value}</div>
                  <div className="mt-2 text-sm text-slate-300">{meta}</div>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#83b5ff]/20 text-[#b7d4ff]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 text-sm font-medium text-[#b7d4ff]">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Earnings Chart + Monthly */}
        <div className="mt-8 grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-[26px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                Earnings Overview
              </h2>
              <Link
                href="/volunteer/earnings"
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#7cc6ff] transition hover:bg-white/10"
              >
                View All
              </Link>
            </div>

            {/* Bar chart */}
            {monthly.every((m) => m.value === 0) ? (
              <div className="flex h-[220px] flex-col items-center justify-center text-center">
                <FiTrendingUp className="mb-3 h-10 w-10 text-slate-600" />
                <p className="text-sm text-slate-500">
                  No earnings recorded yet.
                  <br />
                  Complete events to see your chart.
                </p>
              </div>
            ) : (
              <div className="flex h-[200px] items-end gap-2 pb-6">
                {monthly.map((bucket, i) => {
                  const heightPct = Math.max(
                    4,
                    Math.round((bucket.value / maxMonthlyValue) * 100)
                  );
                  return (
                    <div
                      key={bucket.key}
                      className="group relative flex flex-1 flex-col items-center gap-1"
                    >
                      {/* Tooltip */}
                      {bucket.value > 0 && (
                        <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 group-hover:block">
                          <span className="whitespace-nowrap rounded-md bg-[#1e293b] px-2 py-1 text-xs font-bold text-white shadow">
                            {formatCurrency(bucket.value)}
                          </span>
                        </div>
                      )}
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#3b82f6] to-[#6366f1] transition-all duration-500"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[11px] font-semibold text-slate-400">
                        {bucket.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monthly breakdown donut */}
          <div className="rounded-[26px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-white">
                Earnings by Month
              </h2>
            </div>

            <div className="flex flex-col items-center">
              {stats.totalEarned === 0 ? (
                <div className="flex h-52 w-52 flex-col items-center justify-center rounded-full border-4 border-white/10 text-center">
                  <div className="text-3xl font-bold text-slate-500">₹0</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-600">
                    Total
                  </div>
                </div>
              ) : (
                <div
                  className="relative flex h-52 w-52 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(${monthly
                      .filter((m) => m.value > 0)
                      .map((m, i, arr) => {
                        const pct = (m.value / stats.totalEarned) * 100;
                        const color =
                          GRADIENT_COLORS[i % GRADIENT_COLORS.length];
                        return `${color} ${arr
                          .slice(0, i)
                          .reduce(
                            (s, x) =>
                              s + (x.value / stats.totalEarned) * 100,
                            0
                          )}% ${arr
                          .slice(0, i + 1)
                          .reduce(
                            (s, x) =>
                              s + (x.value / stats.totalEarned) * 100,
                            0
                          )}%`;
                      })
                      .join(", ")})`,
                  }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#101a2f] text-center shadow-inner">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(stats.totalEarned)}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      Total
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 w-full space-y-2">
                {monthly
                  .filter((m) => m.value > 0)
                  .slice(0, 5)
                  .map((item, index) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between text-sm text-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{
                            background:
                              GRADIENT_COLORS[index % GRADIENT_COLORS.length],
                          }}
                        />
                        {item.label}
                      </div>

                      <div>{formatCurrency(item.value)}</div>
                    </div>
                  ))}
                {monthly.every((m) => m.value === 0) && (
                  <p className="py-2 text-center text-xs text-slate-500">
                    No payouts recorded yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom sections */}
        <div className="mt-8 grid gap-5 xl:grid-cols-[1.2fr_1fr_1fr]">
          {/* Upcoming Events */}
          <div className="rounded-[26px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <h3 className="text-2xl font-semibold text-white">
              Upcoming Events
            </h3>

            <p className="mt-1 text-sm text-slate-300">
              Your confirmed upcoming
            </p>

            <div className="mt-5 space-y-4">
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#121d2d]/80 py-10 text-center">
                  <FiCalendar className="mb-3 h-8 w-8 text-slate-600" />
                  <p className="text-sm text-slate-400">
                    No upcoming events.
                  </p>
                  <Link
                    href="/volunteer/events"
                    className="mt-3 rounded-lg bg-[#3b82f6]/20 px-4 py-2 text-xs font-semibold text-[#7cc6ff] transition hover:bg-[#3b82f6]/30"
                  >
                    Browse Events
                  </Link>
                </div>
              ) : (
                upcoming.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-white/10 bg-[#121d2d]/80 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br from-[#22c1c3] via-[#1f7ae0] to-[#8b5cf6]" />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="truncate text-base font-semibold text-white">
                            {event.title}
                          </div>

                          {event.volunteer_pay != null && (
                            <div className="shrink-0 text-sm font-semibold text-[#ddd7ff]">
                              {formatCurrency(event.volunteer_pay)}
                            </div>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                          <FiCalendar className="h-4 w-4" />
                          {formatDate(event.date)}
                          {event.time && <span>• {event.time}</span>}
                        </div>

                        {event.location && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                            <FiMapPin className="h-4 w-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/volunteer/events"
              className="mt-5 flex w-full items-center justify-center rounded-xl border border-[#7dd3fc] bg-transparent px-4 py-3 text-sm font-medium text-[#7dd3fc] transition hover:bg-[#7dd3fc]/10"
            >
              View All Events
            </Link>
          </div>

          {/* Application Overview */}
          <div className="rounded-[26px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <h3 className="text-2xl font-semibold text-white">
              Application Overview
            </h3>

            <div className="mt-5 flex flex-col items-center">
              {totalApplications === 0 ? (
                <div className="flex h-44 w-44 flex-col items-center justify-center rounded-full border-4 border-white/10 text-center">
                  <div className="text-2xl font-bold text-slate-500">0</div>
                  <div className="text-xs text-slate-600">Applications</div>
                </div>
              ) : (
                <div
                  className="relative flex h-44 w-44 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(
                      #8b5cf6 0 ${approvedPct}%,
                      #60a5fa ${approvedPct}% ${approvedPct + pendingPct}%,
                      #f59e0b ${approvedPct + pendingPct}% 100%
                    )`,
                  }}
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#101a2f] text-center text-sm text-slate-300">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {counts.approved}
                      </div>
                      <div>Approved</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 w-full space-y-2">
                {[
                  { label: "Approved", value: counts.approved, color: "#8b5cf6" },
                  { label: "Pending", value: counts.pending, color: "#60a5fa" },
                  { label: "Rejected", value: counts.rejected, color: "#f59e0b" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: item.color }}
                      />

                      {item.label}
                    </div>

                    <span>{item.value}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/volunteer/applications"
                className="mt-5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm font-medium text-slate-300 transition hover:bg-white/10"
              >
                View Applications
              </Link>
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded-[26px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <h3 className="text-2xl font-semibold text-white">
              Achievements
            </h3>

            <div className="mt-5 space-y-3">
              {displayAchievements.map((item) => (
                <div
                  key={item!.title}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#121d2d]/80 p-3"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.color} text-sm font-bold text-[#08172b]`}
                  >
                    ★
                  </div>

                  <div>
                    <div className="font-semibold text-white">
                      {item.title}
                    </div>

                    <div className="text-sm text-slate-300">
                      {item.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {achievements.length === 0 && (
              <p className="mt-4 text-center text-xs text-slate-500">
                Complete events to unlock achievements!
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 pb-8" />
      </div>
    </div>
  );
}
