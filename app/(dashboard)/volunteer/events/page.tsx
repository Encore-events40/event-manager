"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  volunteers_needed: number | null;
  volunteer_pay: number | null;
  skills_required: string | null;
  category: string | null;
  application_deadline: string | null;
  application: { status: string; applied_at: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  approved:
    "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  rejected:
    "bg-red-500/15 text-red-300 border border-red-500/30",
};

const GRADIENT_PALETTE = [
  "from-[#22c1c3] via-[#1f7ae0] to-[#8b5cf6]",
  "from-[#f97316] via-[#ef4444] to-[#ec4899]",
  "from-[#10b981] via-[#3b82f6] to-[#6366f1]",
  "from-[#a855f7] via-[#ec4899] to-[#f97316]",
  "from-[#0ea5e9] via-[#2dd4bf] to-[#22c55e]",
  "from-[#f59e0b] via-[#f97316] to-[#ef4444]",
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function EventCard({
  event,
  index,
  applying,
  onApply,
}: {
  event: EventItem;
  index: number;
  applying: boolean;
  onApply: (id: string) => void;
}) {
  const grad = GRADIENT_PALETTE[index % GRADIENT_PALETTE.length];
  const appStatus = event.application?.status;
  const isDeadlinePassed =
    event.application_deadline &&
    new Date() > new Date(event.application_deadline);

  return (
    <div className="group flex flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(89,103,123,0.22)] shadow-[0_15px_40px_rgba(10,20,40,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_60px_rgba(10,20,40,0.45)]">
      {/* Banner */}
      <div
        className={`h-32 w-full bg-gradient-to-br ${grad} relative overflow-hidden`}
      >
        {event.category && (
          <span className="absolute left-3 top-3 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
            {event.category}
          </span>
        )}
        {appStatus && (
          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize backdrop-blur-sm ${STATUS_STYLES[appStatus] ?? ""}`}
          >
            {appStatus}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-white">
          {event.title}
        </h3>
        {event.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-400">
            {event.description}
          </p>
        )}

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <FiCalendar className="h-4 w-4 shrink-0 text-[#7cc6ff]" />
            <span>{formatDate(event.date)}</span>
            {event.time && <span>• {event.time}</span>}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <FiMapPin className="h-4 w-4 shrink-0 text-[#7cc6ff]" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          {event.volunteer_pay != null && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <FiDollarSign className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="font-semibold text-emerald-300">
                ₹{event.volunteer_pay.toLocaleString("en-IN")}
              </span>
            </div>
          )}
          {event.volunteers_needed != null && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <FiUsers className="h-4 w-4 shrink-0 text-[#7cc6ff]" />
              <span>{event.volunteers_needed} volunteers needed</span>
            </div>
          )}
          {event.application_deadline && (
            <div
              className={`flex items-center gap-2 text-sm ${isDeadlinePassed ? "text-red-400" : "text-slate-300"}`}
            >
              <FiClock className="h-4 w-4 shrink-0" />
              <span>
                Deadline: {formatDate(event.application_deadline)}
                {isDeadlinePassed && " (closed)"}
              </span>
            </div>
          )}
        </div>

        {event.skills_required && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {event.skills_required
              .split(",")
              .slice(0, 3)
              .map((s) => (
                <span
                  key={s.trim()}
                  className="rounded-full bg-[#1e3a5f]/80 px-2.5 py-0.5 text-xs text-[#7cc6ff]"
                >
                  {s.trim()}
                </span>
              ))}
          </div>
        )}

        <div className="mt-auto pt-4">
          {appStatus === "approved" ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 py-3 text-sm font-semibold text-emerald-300">
              <FiCheckCircle className="h-4 w-4" />
              Application Approved
            </div>
          ) : appStatus === "rejected" ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-red-500/15 py-3 text-sm font-semibold text-red-400">
              <FiXCircle className="h-4 w-4" />
              Application Rejected
            </div>
          ) : appStatus === "pending" ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/15 py-3 text-sm font-semibold text-amber-300">
              <FiClock className="h-4 w-4" />
              Application Pending
            </div>
          ) : (
            <button
              type="button"
              disabled={applying || Boolean(isDeadlinePassed)}
              onClick={() => onApply(event.id)}
              className="w-full rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {applying ? (
                <span className="flex items-center justify-center gap-2">
                  <FiLoader className="h-4 w-4 animate-spin" />
                  Applying...
                </span>
              ) : isDeadlinePassed ? (
                "Applications Closed"
              ) : (
                "Apply Now"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowseEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const pageSize = 9;
  const totalPages = Math.ceil(total / pageSize);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/volunteer/events?${params}`);
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to load events.");
        return;
      }
      setEvents(data.events ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleApply = async (eventId: string) => {
    setApplyingId(eventId);
    try {
      const res = await fetch("/api/volunteer/events/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast("error", data.message || "Failed to apply.");
        return;
      }
      showToast("success", "Application submitted successfully!");
      // Update event in place to show pending status
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId
            ? { ...ev, application: { status: "pending", applied_at: new Date().toISOString() } }
            : ev
        )
      );
    } catch {
      showToast("error", "Network error. Please try again.");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-xl transition-all ${
            toast.type === "success"
              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
              : "bg-red-500/20 text-red-200 border border-red-500/30"
          }`}
        >
          {toast.type === "success" ? (
            <FiCheckCircle className="h-4 w-4" />
          ) : (
            <FiAlertCircle className="h-4 w-4" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span>Volunteer Dashboard</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">Browse Events</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            Browse Events
          </h1>
          <p className="mt-2 text-slate-400">
            Discover and apply for volunteer opportunities near you.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8 flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="event-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search events by title..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none ring-0 transition focus:border-[#3b82f6]/60 focus:bg-white/8 focus:ring-1 focus:ring-[#3b82f6]/30"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Clear
            </button>
          )}
        </form>

        {/* Stats bar */}
        {!loading && (
          <p className="mb-6 text-sm text-slate-400">
            {total === 0
              ? "No events found"
              : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} event${total !== 1 ? "s" : ""}`}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <FiAlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[380px] animate-pulse rounded-[22px] border border-white/10 bg-white/5"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[22px] border border-white/10 bg-white/5 py-24 text-center">
            <FiCalendar className="mb-4 h-12 w-12 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-300">
              No events available
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different search term."
                : "Check back later for new volunteer opportunities."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((ev, i) => (
              <EventCard
                key={ev.id}
                event={ev}
                index={i}
                applying={applyingId === ev.id}
                onApply={handleApply}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="text-slate-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item as number)}
                    className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${
                      page === item
                        ? "bg-[#3b82f6] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
