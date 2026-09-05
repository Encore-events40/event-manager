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
import SignOutButton from "@/components/auth/SignOutButton";

const statCards = [
  {
    label: "Events Worked",
    value: "12",
    meta: "Total events completed",
    icon: FiCheckCircle,
  },
  {
    label: "Total Earned",
    value: "₹8,400",
    meta: "Total events completed",
    icon: FiTrendingUp,
  },
  {
    label: "Upcoming Events",
    value: "2",
    meta: "Total events completed",
    icon: FiCalendar,
  },
  {
    label: "Hours Contributed",
    value: "28",
    meta: "Total events completed",
    icon: FiClock,
  },
];

const months = [
  { label: "Jan", value: 600 },
  { label: "Feb", value: 1000 },
  { label: "Mar", value: 1200 },
  { label: "Apr", value: 1500 },
  { label: "May", value: 1300 },
  { label: "Jun", value: 1100 },
  { label: "Jul", value: 1700 },
];

const upcomingEvents = [
  {
    title: "Summer Music Fest 2025",
    amount: "₹700",
    date: "20 Jul 2025",
    time: "10:00 AM - 6:00 PM",
    location: "Wave Park, Mumbai",
    status: "Confirmed",
  },
  {
    title: "Summer Music Fest 2025",
    amount: "₹700",
    date: "20 Jul 2025",
    time: "10:00 AM - 6:00 PM",
    location: "Wave Park, Mumbai",
    status: "Confirmed",
  },
];

const applicationBreakdown = [
  { label: "Approved", value: 5, color: "#8b5cf6" },
  { label: "Pending", value: 3, color: "#60a5fa" },
  { label: "Rejected", value: 1, color: "#f59e0b" },
];

const achievements = [
  { title: "Event Star", detail: "Completed 10 events", color: "bg-[#93c5fd]" },
  {
    title: "Team Player",
    detail: "Great collaboration!",
    color: "bg-[#c4b5fd]",
  },
  {
    title: "Rising Volunteer",
    detail: "50+ hours contributed",
    color: "bg-[#fcd34d]",
  },
];

export default function VolunteerDashboardPage() {
  return (
    <div className="relative overflow-hidden px-2 py-4 lg:px-6">
      <div className="mx-auto max-w-[1280px]">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Welcome back, Ananya!
            </h1>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]">
              <FiBell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f4b8a0] via-[#c96f77] to-[#733b66] text-lg font-bold text-white">
                A
              </div>
              <div>
                <div className="text-base font-semibold text-white">
                  Ananya Sharma
                </div>
                <div className="text-sm text-slate-300">Volunteer</div>
              </div>
            </div>
          </div>
        </header>

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
  // Your backend profile fetching
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#F6F4F3] flex items-center justify-center p-8 relative">
      {/* Top Right Header Area - Your Profile Widget */}
      <div className="absolute top-6 right-8">
        <ProfileWidget profile={profile} />
      </div>

      {/* Centered Card - Frontend Team's UI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-black mb-1">Volunteer Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">
          Signed in as <span className="font-semibold text-gray-700">{user.email}</span>
        </p>
        <div className="inline-block bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full mb-8">
          ROLE: VOLUNTEER
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-[26px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                Earnings Overview
              </h2>
            </div>

            <svg
              viewBox="0 0 640 250"
              className="h-[220px] w-full"
              aria-label="Earnings chart"
            >
              <defs>
                <linearGradient id="lineGlow" x1="0" x2="1">
                  <stop offset="0%" stopColor="#f7a85d" />
                  <stop offset="100%" stopColor="#ffb872" />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3].map((row) => (
                <line
                  key={row}
                  x1="0"
                  x2="640"
                  y1={35 + row * 55}
                  y2={35 + row * 55}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                />
              ))}

              {months.map((item, index) => (
                <text
                  key={item.label}
                  x={40 + index * 84}
                  y="225"
                  fill="rgba(255,255,255,0.75)"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              ))}

              <path
                d="M 20 170 C 80 155, 110 135, 150 145 S 220 170, 260 138 S 340 120, 380 128 S 460 118, 520 112 S 590 105, 620 90"
                fill="none"
                stroke="url(#lineGlow)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                Earnings by Month
              </h2>
            </div>

            <div className="flex flex-col items-center">
              <div
                className="relative flex h-52 w-52 items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#7c4dff 0 28%, #5fa1ff 28% 46%, #f9a125 46% 68%, #7c6df2 68% 82%, #e7dffd 82% 100%)",
                }}
              >
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#101a2f] text-center shadow-inner">
                  <div className="text-3xl font-bold text-white">₹8,400</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                    Total
                  </div>
                </div>
              </div>

              <div className="mt-6 w-full space-y-2">
                {months.slice(0, 5).map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{
                          background: [
                            "#5fa1ff",
                            "#7c4dff",
                            "#1d4ed8",
                            "#f9a125",
                            "#e7dffd",
                          ][index],
                        }}
                      />
                      {item.label}
                    </div>
                    <div>₹{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1.2fr_1fr_1fr]">
          <div className="rounded-[26px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <h3 className="text-2xl font-semibold text-white">
              Upcoming events
            </h3>
            <p className="mt-1 text-sm text-slate-300">Open to apply</p>

            <div className="mt-5 space-y-4">
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-[#121d2d]/80 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#22c1c3] via-[#1f7ae0] to-[#8b5cf6]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-lg font-semibold text-white">
                          {event.title}
                        </div>
                        <div className="text-lg font-semibold text-[#ddd7ff]">
                          {event.amount}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                        <FiCalendar className="h-4 w-4" />
                        {event.date} • {event.time}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                        <FiMapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-5 w-full rounded-xl border border-[#7dd3fc] bg-transparent px-4 py-3 text-sm font-medium text-[#7dd3fc] transition hover:bg-[#7dd3fc]/10">
              View All Upcoming Events
            </button>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <h3 className="text-2xl font-semibold text-white">
              Application Overview
            </h3>
            <div className="mt-5 flex flex-col items-center">
              <div
                className="relative flex h-44 w-44 items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#8b5cf6 0 55%, #60a5fa 55% 85%, #f59e0b 85% 100%)",
                }}
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#101a2f] text-center text-sm text-slate-300">
                  <div>
                    <div className="text-2xl font-bold text-white">5</div>
                    <div>Approved</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 w-full space-y-2">
                {applicationBreakdown.map((item) => (
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
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <h3 className="text-2xl font-semibold text-white">
              Recent Achievements
            </h3>
            <div className="mt-5 space-y-3">
              {achievements.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#121d2d]/80 p-3"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${item.color} text-sm font-bold text-[#08172b]`}
                  >
                    ★
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="text-sm text-slate-300">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
