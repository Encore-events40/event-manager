"use client";

import { useState, useEffect } from "react";
import {
  FiCalendar,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiLoader,
  FiFileText,
} from "react-icons/fi";

interface ApplicationEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  volunteer_pay: number | null;
  description: string | null;
}

interface AppItem {
  id: string;
  event_id: string;
  status: "pending" | "approved" | "rejected";
  applied_at: string;
  reviewed_at: string | null;
  events: ApplicationEvent | null;
}

interface Counts {
  pending: number;
  approved: number;
  rejected: number;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; bg: string; text: string; border: string }
> = {
  pending: {
    label: "Pending",
    icon: FiClock,
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/30",
  },
  approved: {
    label: "Approved",
    icon: FiCheckCircle,
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    border: "border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    icon: FiXCircle,
    bg: "bg-red-500/15",
    text: "text-red-300",
    border: "border-red-500/30",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ApplicationCard({ app }: { app: AppItem }) {
  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const ev = app.events;

  return (
    <div className="group rounded-[22px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 shadow-[0_15px_40px_rgba(10,20,40,0.3)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-white">
          {ev?.title ?? "Unknown Event"}
        </h3>
        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {cfg.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ev?.date && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <FiCalendar className="h-4 w-4 shrink-0 text-[#7cc6ff]" />
            <span>{formatDate(ev.date)}</span>
            {ev.time && <span>• {ev.time}</span>}
          </div>
        )}
        {ev?.location && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <FiMapPin className="h-4 w-4 shrink-0 text-[#7cc6ff]" />
            <span className="line-clamp-1">{ev.location}</span>
          </div>
        )}
        {ev?.volunteer_pay != null && (
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <span className="font-bold">₹</span>
            <span className="font-semibold">
              {ev.volunteer_pay.toLocaleString("en-IN")} pay
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <FiClock className="h-4 w-4 shrink-0" />
          <span>Applied {formatDate(app.applied_at)}</span>
        </div>
      </div>

      {app.reviewed_at && (
        <div className="mt-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs text-slate-400">
          Reviewed on {formatDate(app.reviewed_at)}
        </div>
      )}
    </div>
  );
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<AppItem[]>([]);
  const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/volunteer/applications");
        const data = await res.json();
        if (!data.success) {
          setError(data.message || "Failed to load applications.");
          return;
        }
        setApplications(data.applications ?? []);
        setCounts(data.counts ?? { pending: 0, approved: 0, rejected: 0 });
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    void fetchApplications();
  }, []);

  const filtered =
    filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const statCards = [
    {
      label: "Total",
      value: applications.length,
      color: "text-white",
      bg: "from-[#1e3a5f]/60 to-[#0f2035]/60",
    },
    {
      label: "Pending",
      value: counts.pending,
      color: "text-amber-300",
      bg: "from-amber-500/20 to-amber-900/20",
    },
    {
      label: "Approved",
      value: counts.approved,
      color: "text-emerald-300",
      bg: "from-emerald-500/20 to-emerald-900/20",
    },
    {
      label: "Rejected",
      value: counts.rejected,
      color: "text-red-300",
      bg: "from-red-500/20 to-red-900/20",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <span>Volunteer Dashboard</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">My Applications</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">
          My Applications
        </h1>
        <p className="mt-2 text-slate-400">
          Track the status of all your volunteer applications.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-[18px] border border-white/10 bg-gradient-to-br ${card.bg} p-4 backdrop-blur-xl`}
          >
            <div className={`text-3xl font-black ${card.color}`}>
              {card.value}
            </div>
            <div className="mt-1 text-sm font-medium text-slate-400">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Donut chart summary */}
      {!loading && applications.length > 0 && (
        <div className="mb-8 rounded-[22px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-bold text-white">
            Application Breakdown
          </h2>
          <div className="flex items-center gap-8">
            {/* Mini donut */}
            <div
              className="relative h-24 w-24 shrink-0 rounded-full"
              style={{
                background:
                  applications.length > 0
                    ? `conic-gradient(
                        #10b981 0 ${(counts.approved / applications.length) * 100}%,
                        #f59e0b ${(counts.approved / applications.length) * 100}% ${((counts.approved + counts.pending) / applications.length) * 100}%,
                        #ef4444 ${((counts.approved + counts.pending) / applications.length) * 100}% 100%
                      )`
                    : "#1e293b",
              }}
            >
              <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-[#0d1520] text-center">
                <span className="text-lg font-black text-white">
                  {applications.length}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">
                  Total
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Approved", color: "bg-emerald-500", val: counts.approved },
                { label: "Pending", color: "bg-amber-500", val: counts.pending },
                { label: "Rejected", color: "bg-red-500", val: counts.rejected },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <span className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="text-slate-300">{item.label}</span>
                  <span className="ml-auto font-semibold text-white">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {(["all", "pending", "approved", "rejected"] as FilterStatus[]).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              id={`filter-${tab}`}
              onClick={() => setFilter(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                filter === tab
                  ? "bg-[#3b82f6] text-white shadow-[0_0_16px_rgba(59,130,246,0.35)]"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {tab}
              {tab !== "all" && counts[tab as keyof Counts] > 0 && (
                <span className="ml-2 rounded-full bg-white/15 px-1.5 py-0.5 text-xs">
                  {counts[tab as keyof Counts]}
                </span>
              )}
            </button>
          )
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-[22px] border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[22px] border border-white/10 bg-white/5 py-20 text-center">
          <FiFileText className="mb-4 h-12 w-12 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-300">
            {filter === "all"
              ? "No applications yet"
              : `No ${filter} applications`}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {filter === "all"
              ? "Browse events and apply to get started."
              : `You have no ${filter} applications at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10">
          <FiLoader className="h-6 w-6 animate-spin text-[#7cc6ff]" />
        </div>
      )}
    </div>
  );
}
