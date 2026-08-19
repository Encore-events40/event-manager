import Image from "next/image";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiGrid,
  FiPlus,
  FiUsers,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/server";

type Status = "pending" | "approved" | "rejected";

type ApplicationRow = {
  id: string;
  status: Status | string | null;
  applied_at: string | null;
  events: { id: string; title: string; date: string | null } | null;
  applicant: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: "volunteer" | "influencer" | "admin" | string | null;
  } | null;
};

type RawApplicationRow = Omit<ApplicationRow, "events" | "applicant"> & {
  events:
    | ApplicationRow["events"]
    | NonNullable<ApplicationRow["events"]>[]
    | null;
  applicant:
    | ApplicationRow["applicant"]
    | NonNullable<ApplicationRow["applicant"]>[]
    | null;
};

type EventRow = {
  id: string;
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  volunteers_needed: number | null;
  volunteer_pay: number | null;
  status: string | null;
};

type PayoutRow = {
  amount: number | null;
  paid_on: string | null;
  created_at: string | null;
};

const brandEnquiries = [
  {
    company: "Nimbus Beverages",
    summary: "Sponsorship enquiry",
    status: "New",
  },
  {
    company: "Pulse Sportswear",
    summary: "Co-brand enquiry",
    status: "In progress",
  },
];

const statusColors = {
  approved: "#48C893",
  pending: "#F5EE91",
  rejected: "#C7B9C9",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date?: string | null) {
  if (!date) return "Date not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

function getLastFourMonths() {
  const now = new Date();
  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: monthLabel(date),
    };
  });
}

function getPayoutMonth(row: PayoutRow) {
  const value = row.paid_on || row.created_at;
  if (!value) return "";
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function firstRelation<T>(value: T | T[] | null) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

async function getDashboardData() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [eventsResult, appsResult, payoutsResult, upcomingResult] =
    await Promise.all([
      supabase
        .from("events")
        .select("id,title,date,time,location,volunteers_needed,volunteer_pay,status")
        .order("date", { ascending: true }),
      supabase
        .from("applications")
        .select(
          `
          id,
          status,
          applied_at,
          events (id, title, date),
          applicant:profiles!volunteer_id (id, full_name, email, role)
        `
        )
        .order("applied_at", { ascending: false }),
      supabase.from("payouts").select("amount, paid_on, created_at"),
      supabase
        .from("events")
        .select("id,title,date,time,location,volunteers_needed,volunteer_pay,status")
        .gte("date", today)
        .neq("status", "closed")
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

  const events = (eventsResult.data ?? []) as EventRow[];
  const applications = ((appsResult.data ?? []) as unknown as RawApplicationRow[]).map(
    (item) => ({
      ...item,
      events: firstRelation(item.events),
      applicant: firstRelation(item.applicant),
    })
  );
  const payouts = (payoutsResult.data ?? []) as PayoutRow[];
  const upcoming = (upcomingResult.data ?? null) as EventRow | null;

  const approved = applications.filter((item) => item.status === "approved").length;
  const pending = applications.filter((item) => item.status === "pending").length;
  const rejected = applications.filter((item) => item.status === "rejected").length;
  const volunteers = applications.filter(
    (item) => item.applicant?.role === "volunteer"
  ).length;
  const influencers = applications.filter(
    (item) => item.applicant?.role === "influencer"
  ).length;
  const liveEvents = events.filter((event) => event.status === "published").length;
  const totalPaid = payouts.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const totalSpots = events.reduce(
    (sum, event) => sum + Number(event.volunteers_needed ?? 0),
    0
  );

  const months = getLastFourMonths();
  const payoutSeries = months.map((month) => ({
    label: month.label,
    value: payouts
      .filter((row) => getPayoutMonth(row) === month.key)
      .reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
  }));

  return {
    approved,
    pending,
    rejected,
    volunteers,
    influencers,
    liveEvents,
    totalPaid,
    totalSpots,
    payoutSeries,
    upcoming,
    recentApplications: applications.slice(0, 2),
  };
}

function DonutChart({
  segments,
  size = 104,
}: {
  segments: { color: string; value: number }[];
  size?: number;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <svg width={size} height={size} viewBox="0 0 42 42" className="-rotate-90">
      <circle
        cx="21"
        cy="21"
        r="15.915"
        fill="transparent"
        stroke="#F5F1F6"
        strokeWidth="5.8"
      />
      {total > 0 &&
        segments.map((segment, index) => {
          const dash = (segment.value / total) * 100;
          const segmentOffset =
            25 -
            segments
              .slice(0, index)
              .reduce((sum, item) => sum + (item.value / total) * 100, 0);

          return (
            <circle
              key={`${segment.color}-${index}`}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={segment.color}
              strokeDasharray={`${dash} ${100 - dash}`}
              strokeDashoffset={segmentOffset}
              strokeWidth="5.8"
            />
          );
        })}
      <circle cx="21" cy="21" r="10.8" fill="white" />
    </svg>
  );
}

function StatusLegend({
  items,
}: {
  items: { label: string; color: string; value: number }[];
}) {
  return (
    <div className="space-y-3 text-[12px] font-semibold text-[#8C858B]">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>
            {item.label} {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function PayoutChart({
  series,
}: {
  series: { label: string; value: number }[];
}) {
  const max = Math.max(...series.map((item) => item.value), 1);
  const points = series
    .map((item, index) => {
      const x = index * 150;
      const y = 176 - (item.value / max) * 126;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `0,176 ${points} 450,196 0,196`;

  return (
    <div className="h-full px-5 pb-5 pt-6">
      <svg viewBox="0 0 500 230" className="h-full w-full overflow-visible">
        {[0, 1, 2, 3, 4].map((line) => (
          <line
            key={line}
            x1="0"
            x2="500"
            y1={34 + line * 40}
            y2={34 + line * 40}
            stroke="#E8E4E6"
            strokeWidth="1"
          />
        ))}
        <text x="0" y="18" className="fill-[#302B2E] text-[9px] font-black">
          Payout Analytics
        </text>
        <polygon points={area} fill="#D2E9F1" opacity="0.9" />
        <polyline points={points} fill="none" stroke="#58AED1" strokeWidth="2.5" />
        {series.map((item, index) => (
          <g key={item.label}>
            <text x={index * 150} y="214" className="fill-[#817A80] text-[9px]">
              {item.label}
            </text>
            <circle
              cx={index * 150}
              cy={176 - (item.value / max) * 126}
              r="3"
              fill="#58AED1"
            />
          </g>
        ))}
        <text x="210" y="226" className="fill-[#817A80] text-[9px]">
          Last 4 months
        </text>
      </svg>
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[12px] bg-white shadow-[0_1px_0_rgba(20,20,20,0.02)] ${className}`}
    >
      {children}
    </section>
  );
}

function MetricCard({
  href,
  label,
  value,
  helper,
  icon: Icon,
  color,
}: {
  href?: string;
  label: string;
  value: string;
  helper: string;
  icon: typeof FiGrid;
  color: string;
}) {
  const content = (
    <div className="flex h-full items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#A7A0A0]">
          {label}
        </p>
        <p className="mt-2 text-[24px] font-black leading-none text-[#7D7189]">
          {value}
        </p>
        <p className="mt-2 truncate text-[11px] font-semibold text-[#9D969B]">
          {helper}
        </p>
      </div>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] ${color}`}
      >
        <Icon className="h-6 w-6" />
      </span>
    </div>
  );

  if (!href) {
    return <Panel className="h-[112px] px-5 py-4">{content}</Panel>;
  }

  return (
    <Link
      href={href}
      className="block h-[112px] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#8B35E3]/30"
    >
      <Panel className="h-full px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-md">
        {content}
      </Panel>
    </Link>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "pending" | "approved" | "rejected" | "new" | "progress";
}) {
  const classes = {
    pending: "border-[#EF4A43] bg-[#FFE4E2] text-[#8E231F]",
    approved: "border-[#6CCD8B] bg-[#E5F8EA] text-[#1E7F43]",
    rejected: "border-[#BEB2C2] bg-[#F2EDF3] text-[#746777]",
    new: "border-[#F5C864] bg-[#FFF8E9] text-[#F2A516]",
    progress: "border-[#D45EE7] bg-[#EDB6F1] text-[#8A167B]",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-[12px] font-black tracking-wide ${classes[tone]}`}
    >
      {children}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();
  const totalApplications = data.approved + data.pending + data.rejected;
  const roleTotal = data.volunteers + data.influencers;
  const upcomingTitle = data.upcoming?.title ?? "No upcoming event";
  const upcomingMeta = data.upcoming
    ? `${formatDate(data.upcoming.date)}, ${data.upcoming.time || "Time not set"} - ${
        data.upcoming.location || "Location not set"
      }`
    : "Create an event to see it here";

  return (
    <section className="w-full">
      <header className="flex flex-col gap-1">
        <p className="text-[16px] font-medium tracking-[0.04em] text-[#77727A]">
          Admin&apos;s HQ <span className="font-black">/ Dashboard</span>
        </p>
        <h1 className="text-[28px] font-black leading-tight text-[#7D7189]">Dashboard</h1>
        <p className="text-[15px] font-semibold tracking-[0.03em] text-[#B18ABA]">
          Good to see you, Admin
        </p>
      </header>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Total Paid"
              value={formatCurrency(data.totalPaid)}
              helper="Recorded payout amount"
              icon={FiDollarSign}
              color="bg-[#15A75E] text-white"
            />
            <MetricCard
              href="/admin/applications?status=pending"
              label="Pending Applications"
              value={String(data.pending)}
              helper="Needs review"
              icon={FiFileText}
              color="bg-[#FFF2C1] text-[#E5A600]"
            />
          </div>

          <Link
            href="/admin/events"
            className="block rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#8B35E3]/30"
          >
            <Panel className="h-[278px] transition hover:shadow-md">
              <PayoutChart series={data.payoutSeries} />
            </Panel>
          </Link>

          <Panel className="px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-black text-[#7D7189]">Brand enquiries</h2>
                <p className="mt-1 text-[12px] font-semibold text-[#A49CA2]">
                  {brandEnquiries.length} open conversations
                </p>
              </div>
              <Link
                href="/admin/brand-enquiries"
                className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#F4F1F5] text-[#81768C]"
                aria-label="Open brand enquiries"
              >
                <FiArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 divide-y divide-dashed divide-[#C9C3C5]">
              {brandEnquiries.map((item) => (
                <Link
                  key={item.company}
                  href="/admin/brand-enquiries"
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[16px] font-black text-[#81768C]">
                      {item.company}
                    </span>
                    <span className="mt-2 block truncate text-[12px] font-semibold text-[#A49CA2]">
                      {item.summary}
                    </span>
                  </span>
                  <Badge tone={item.status === "New" ? "new" : "progress"}>
                    {item.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#A7A0A0]">
              This Week
            </p>
            <h2 className="mt-2 text-[19px] font-black leading-tight text-[#81768C]">
              {data.liveEvents} events live, {data.pending} applications waiting on you.
            </h2>
            <p className="mt-2 text-[13px] font-medium text-[#4C484B]">
              {data.totalSpots > 0
                ? `${data.totalSpots} volunteer spots are configured across all events.`
                : "Add volunteer spots to track event capacity here."}
            </p>
          </Panel>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/applications"
              className="block rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#8B35E3]/30"
            >
              <Panel className="h-[178px] px-5 py-5 transition hover:shadow-md">
                <h2 className="text-[17px] font-black text-[#7D7189]">
                  Application Overview
                </h2>
                <p className="mt-1 text-[12px] font-semibold text-[#817A80]">
                  {totalApplications} total
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <DonutChart
                    segments={[
                      { color: statusColors.approved, value: data.approved },
                      { color: statusColors.pending, value: data.pending },
                      { color: statusColors.rejected, value: data.rejected },
                    ]}
                  />
                  <StatusLegend
                    items={[
                      { color: statusColors.approved, label: "Approved", value: data.approved },
                      { color: statusColors.pending, label: "Pending", value: data.pending },
                      { color: statusColors.rejected, label: "Rejected", value: data.rejected },
                    ]}
                  />
                </div>
              </Panel>
            </Link>

            <Link
              href="/admin/applications"
              className="block rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#8B35E3]/30"
            >
              <Panel className="h-[178px] px-5 py-5 transition hover:shadow-md">
                <h2 className="text-[17px] font-black text-[#7D7189]">
                  Applications by role
                </h2>
                <p className="mt-1 text-[12px] font-semibold text-[#817A80]">
                  {roleTotal} assigned roles
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <DonutChart
                    segments={[
                      { color: statusColors.approved, value: data.volunteers },
                      { color: statusColors.rejected, value: data.influencers },
                    ]}
                  />
                  <StatusLegend
                    items={[
                      { color: statusColors.approved, label: "Volunteer", value: data.volunteers },
                      { color: statusColors.rejected, label: "Influencer", value: data.influencers },
                    ]}
                  />
                </div>
              </Panel>
            </Link>
          </div>

          <Panel className="px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-black text-[#7D7189]">Recent Applications</h2>
                <p className="mt-1 text-[12px] font-semibold text-[#B5ACB0]">Newest first</p>
              </div>
              <Link
                href="/admin/applications"
                className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#F4F1F5] text-[#81768C]"
                aria-label="Open applications"
              >
                <FiArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 divide-y divide-dashed divide-[#C9C3C5]">
              {data.recentApplications.length > 0 ? (
                data.recentApplications.map((application) => (
                  <Link
                    key={application.id}
                    href="/admin/applications"
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[16px] font-black text-[#81768C]">
                        {application.applicant?.full_name ||
                          application.applicant?.email ||
                          "Unnamed applicant"}
                      </span>
                      <span className="mt-2 block truncate text-[12px] font-semibold text-[#A49CA2]">
                        {application.events?.title || "Event not linked"}
                      </span>
                    </span>
                    <Badge
                      tone={
                        application.status === "approved"
                          ? "approved"
                          : application.status === "rejected"
                            ? "rejected"
                            : "pending"
                      }
                    >
                      {application.status || "pending"}
                    </Badge>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center text-[13px] font-semibold text-[#A49CA2]">
                  No applications yet.
                </div>
              )}
            </div>
          </Panel>

          <Link
            href="/admin/events"
            className="block rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#8B35E3]/30"
          >
            <Panel className="flex min-h-[150px] items-center justify-between gap-5 px-5 py-5 transition hover:shadow-md">
              <div className="min-w-0">
                <h2 className="text-[18px] font-black text-[#7D7189]">Upcoming</h2>
                <p className="mt-1 text-[12px] font-semibold text-[#B5ACB0]">Next event</p>
                <p className="mt-6 truncate text-[20px] font-black text-[#81768C]">
                  {upcomingTitle}
                </p>
                <p className="mt-2 truncate text-[13px] font-semibold text-[#817A80]">
                  {upcomingMeta}
                </p>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=240&q=80"
                alt="Concert crowd"
                width={102}
                height={80}
                className="h-20 w-[102px] shrink-0 rounded-[8px] object-cover"
              />
            </Panel>
          </Link>

          <Panel className="px-4 py-5">
            <h2 className="text-[18px] font-black text-[#7D7189]">Quick Actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link
                href="/admin/events/new"
                className="flex min-h-[74px] items-center gap-3 rounded-[10px] border border-[#D4C9C9] bg-white px-3 text-black transition hover:bg-[#FAF8FA]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#81768C] text-white">
                  <FiPlus className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-black leading-tight">Create Event</span>
                  <span className="mt-1 block text-[11px] font-semibold text-[#817A80]">
                    Add event
                  </span>
                </span>
              </Link>
              <Link
                href="/admin/applications"
                className="flex min-h-[74px] items-center gap-3 rounded-[10px] border border-[#D4C9C9] bg-white px-3 text-black transition hover:bg-[#FAF8FA]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#5BAEC8] text-white">
                  <FiUsers className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-black leading-tight">Applications</span>
                  <span className="mt-1 block text-[11px] font-semibold text-[#817A80]">
                    Review now
                  </span>
                </span>
              </Link>
              <Link
                href="/admin/events"
                className="flex min-h-[74px] items-center gap-3 rounded-[10px] border border-[#D4C9C9] bg-white px-3 text-black transition hover:bg-[#FAF8FA]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#5D73FF] text-white">
                  <FiCalendar className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-black leading-tight">Events</span>
                  <span className="mt-1 block text-[11px] font-semibold text-[#817A80]">
                    Manage list
                  </span>
                </span>
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
