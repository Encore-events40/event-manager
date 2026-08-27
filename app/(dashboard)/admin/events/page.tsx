"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EventWithCount } from "@/lib/supabase/types";
import Toast from "@/components/admin/Toast";

function formatDate(dateStr: string) {
  if (!dateStr) return "--";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function statusBadge(status: string | null) {
  const s = status?.toLowerCase() ?? "published";
  switch (s) {
    case "published":
      return "bg-emerald-100 text-emerald-700";
    case "closed":
      return "bg-gray-200 text-gray-700";
    case "draft":
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function EventListContent() {
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [sortField, setSortField] = useState<"date" | "created_at">(
    (searchParams.get("sort") as "date" | "created_at") || "date"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [total, setTotal] = useState(0);
  const pageSize = 8;

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<EventWithCount | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const toastType = searchParams.get("toast");
    void Promise.resolve().then(() => {
      if (toastType === "created") setToastMessage("Event created successfully!");
      if (toastType === "updated") setToastMessage("Event updated successfully!");
    });
  }, [searchParams]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("sort", sortField);
      params.set("order", sortOrder);

      const res = await fetch(`/api/admin/events?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setEvents(data.events || []);
        setTotal(data.total || 0);
      } else {
        setError(data.message || "Failed to load events.");
      }
    } catch {
      setError("Network error while fetching events.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    void Promise.resolve().then(fetchEvents);
  }, [fetchEvents]);

  // Debounced search reset to page 1
  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  function handleStatusChange(val: string) {
    setStatusFilter(val);
    setPage(1);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        setToastMessage("Event deleted successfully.");
        fetchEvents();
      } else {
        alert(data.message || "Could not delete event.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Create, search, filter, and manage all events.
          </p>
        </div>
        <Link
          id="create-event-btn"
          href="/admin/events/new"
          className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[#7C9BD2] hover:bg-[#6888c3] transition text-white text-sm font-bold shadow-sm"
        >
          + Create Event
        </Link>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            id="event-search-input"
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-xl px-4 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="event-status-filter" className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Status:
          </label>
          <select
            id="event-status-filter"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-10 border border-gray-300 rounded-xl px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Sort Field */}
        <div className="flex items-center gap-2">
          <label htmlFor="event-sort-field" className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="event-sort-field"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as "date" | "created_at")}
            className="h-10 border border-gray-300 rounded-xl px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition bg-white"
          >
            <option value="date">Event Date</option>
            <option value="created_at">Date Created</option>
          </select>

          <button
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="h-10 px-3 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
            title="Toggle sort direction"
          >
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </div>

      {/* Events Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400 text-sm">
            <span className="inline-block animate-spin mr-2">⏳</span> Loading events...
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center text-red-500 text-sm">{error}</div>
        ) : events.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-900 font-semibold text-base mb-1">No events found</p>
            <p className="text-gray-500 text-sm">
              {search || statusFilter !== "all"
                ? "Try adjusting your search filters."
                : "Get started by creating your first event!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-center">Apps</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      <div className="flex flex-col">
                        <span>{ev.title}</span>
                        {ev.needs_influencer && (
                          <span className="inline-block w-max mt-1 text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                            Influencer Promotion
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(ev.date)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-[180px] truncate">
                      {ev.location || <span className="text-gray-300">--</span>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusBadge(
                          ev.status
                        )}`}
                      >
                        {ev.status || "draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Link
                        href={`/admin/applications?event_id=${ev.id}`}
                        className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition"
                        title="View applications for this event"
                      >
                        {ev.application_count}
                      </Link>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-500 text-xs">
                      {formatDate(ev.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          id={`edit-event-${ev.id}`}
                          href={`/admin/events/${ev.id}/edit`}
                          className="px-3 py-1.5 rounded-lg bg-[#B8C8E6] hover:bg-[#A8BCDF] transition text-white text-xs font-semibold"
                        >
                          Edit
                        </Link>
                        <button
                          id={`delete-event-${ev.id}`}
                          onClick={() => setDeleteTarget(ev)}
                          className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition text-red-600 text-xs font-semibold"
                        >
                          Delete
                        </button>
                        <Link
                          href={`/admin/applications?event_id=${ev.id}`}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-gray-700 text-xs font-semibold"
                        >
                          Apps
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100 text-sm">
            <span className="text-gray-500 text-xs font-medium">
              Page {page} of {totalPages} ({total} total events)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Event?</h3>
            <p className="text-gray-500 text-sm mb-6">
              <span className="font-semibold text-gray-700">{deleteTarget.title}</span> will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 transition text-white text-sm font-bold disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminEventsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading events page...</div>}>
      <EventListContent />
    </Suspense>
  );
}
