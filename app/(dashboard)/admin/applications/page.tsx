"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Toast from "@/components/admin/Toast";

interface ApplicationRecord {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: "pending" | "approved" | "rejected";
  applied_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  events: { id: string; title: string; date: string; location?: string } | null;
  applicant: {
    id: string;
    full_name: string | null;
    email: string;
    role: "volunteer" | "influencer";
    phone: string | null;
    skills: string | null;
  } | null;
  reviewer: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

interface EventOption {
  id: string;
  title: string;
}

function formatDate(dateStr: string | null) {
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

function statusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-emerald-100 text-emerald-700";
    case "rejected":
      return "bg-red-100 text-red-600";
    case "pending":
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function ApplicationsContent() {
  const searchParams = useSearchParams();

  const [items, setItems] = useState<ApplicationRecord[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [roleTab, setRoleTab] = useState<"all" | "volunteer" | "influencer">(
    (searchParams.get("role") as any) || "all"
  );
  const [eventId, setEventId] = useState(searchParams.get("event_id") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // Detail Modal
  const [selectedItem, setSelectedItem] = useState<ApplicationRecord | null>(null);

  // Status Action Modal (Approve / Reject)
  const [actionTarget, setActionTarget] = useState<{
    item: ApplicationRecord;
    nextStatus: "approved" | "rejected";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load events dropdown
  useEffect(() => {
    async function loadEventsList() {
      try {
        const res = await fetch("/api/admin/events?pageSize=100");
        const data = await res.json();
        if (data.success) setEvents(data.events || []);
      } catch {
        // Dropdown soft fallback
      }
    }
    loadEventsList();
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (roleTab !== "all") params.set("role", roleTab);
      if (eventId) params.set("event_id", eventId);
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/applications?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setItems(data.items || []);
        setTotal(data.total || 0);
      } else {
        setError(data.message || "Failed to load applications.");
      }
    } catch {
      setError("Network error loading applications.");
    } finally {
      setLoading(false);
    }
  }, [page, roleTab, eventId, statusFilter, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function handleStatusUpdate() {
    if (!actionTarget) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/applications/${actionTarget.item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionTarget.nextStatus,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setToastMessage(`Application successfully ${actionTarget.nextStatus}.`);
        setActionTarget(null);
        if (selectedItem?.id === actionTarget.item.id) {
          setSelectedItem(data.application || { ...selectedItem, status: actionTarget.nextStatus });
        }
        fetchApplications();
      } else {
        alert(data.message || "Failed to update application status.");
      }
    } catch {
      alert("Network error updating status.");
    } finally {
      setActionLoading(false);
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Applications Review</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Review, filter, approve, or reject participant applications.
          </p>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button
          onClick={() => {
            setRoleTab("all");
            setPage(1);
          }}
          className={`px-4 py-2.5 rounded-t-xl font-semibold text-sm transition border-b-2 ${
            roleTab === "all"
              ? "border-[#7C9BD2] text-[#7C9BD2] bg-white shadow-xs"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          All Applications
        </button>
        <button
          onClick={() => {
            setRoleTab("volunteer");
            setPage(1);
          }}
          className={`px-4 py-2.5 rounded-t-xl font-semibold text-sm transition border-b-2 ${
            roleTab === "volunteer"
              ? "border-[#7C9BD2] text-[#7C9BD2] bg-white shadow-xs"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Volunteer Applications 🙋‍♂️
        </button>
        <button
          onClick={() => {
            setRoleTab("influencer");
            setPage(1);
          }}
          className={`px-4 py-2.5 rounded-t-xl font-semibold text-sm transition border-b-2 ${
            roleTab === "influencer"
              ? "border-[#7C9BD2] text-[#7C9BD2] bg-white shadow-xs"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Influencer Applications 📢
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <input
            id="app-search-input"
            type="text"
            placeholder="Search by applicant name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 border border-gray-300 rounded-xl px-4 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition"
          />
        </div>

        {/* Filter by Event */}
        <div className="flex items-center gap-2">
          <label htmlFor="app-event-filter" className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Event:
          </label>
          <select
            id="app-event-filter"
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setPage(1);
            }}
            className="h-10 border border-gray-300 rounded-xl px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition bg-white max-w-[200px] truncate"
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-2">
          <label htmlFor="app-status-filter" className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Status:
          </label>
          <select
            id="app-status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 border border-gray-300 rounded-xl px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400 text-sm">
            <span className="inline-block animate-spin mr-2">⏳</span> Loading applications...
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center text-red-500 text-sm">{error}</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-gray-900 font-semibold text-base mb-1">No applications found</p>
            <p className="text-gray-500 text-sm">
              {search || eventId || statusFilter || roleTab !== "all"
                ? "Try adjusting your search or filters."
                : "Submitted applications will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Applicant</th>
                  <th className="px-5 py-3.5">Role Type</th>
                  <th className="px-5 py-3.5">Associated Event</th>
                  <th className="px-5 py-3.5">Submitted Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {items.map((item) => {
                  const applicantName = item.applicant?.full_name || item.applicant?.email || "Unknown";
                  const applicantRole = item.applicant?.role || "volunteer";
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{applicantName}</span>
                          <span className="text-xs text-gray-400">{item.applicant?.email}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                            applicantRole === "influencer"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {applicantRole}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {item.events ? (
                          <Link
                            href={`/admin/events/${item.events.id}/edit`}
                            className="font-medium text-[#7C9BD2] hover:underline"
                          >
                            {item.events.title}
                          </Link>
                        ) : (
                          <span className="text-gray-300">--</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-gray-600 text-xs">
                        {formatDate(item.applied_at)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-gray-700 text-xs font-semibold"
                          >
                            View Details
                          </button>

                          {item.status === "pending" && (
                            <>
                              <button
                                id={`approve-app-${item.id}`}
                                onClick={() => setActionTarget({ item, nextStatus: "approved" })}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition text-white text-xs font-bold"
                              >
                                Approve
                              </button>
                              <button
                                id={`reject-app-${item.id}`}
                                onClick={() => setActionTarget({ item, nextStatus: "rejected" })}
                                className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition text-red-600 text-xs font-semibold"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100 text-sm">
            <span className="text-gray-500 text-xs font-medium">
              Page {page} of {totalPages} ({total} applications)
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

      {/* Application Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={(e) => e.target === e.currentTarget && setSelectedItem(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-base font-bold text-gray-900">Application Details</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Applicant Name</span>
                  <span className="font-bold text-gray-900">
                    {selectedItem.applicant?.full_name || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Email</span>
                  <span className="font-medium text-gray-700">{selectedItem.applicant?.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Role</span>
                  <span className="capitalize font-semibold text-gray-800">
                    {selectedItem.applicant?.role || "volunteer"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Phone</span>
                  <span className="font-medium text-gray-700">
                    {selectedItem.applicant?.phone || "Not provided"}
                  </span>
                </div>
              </div>

              {selectedItem.applicant?.skills && (
                <div className="pb-3 border-b border-gray-100">
                  <span className="text-xs text-gray-400 font-semibold block mb-1">
                    Captured Skills / Profile Attributes
                  </span>
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded-lg text-gray-800 font-medium">
                    {selectedItem.applicant.skills}
                  </span>
                </div>
              )}

              <div className="pb-3 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-semibold block">Associated Event</span>
                <span className="font-bold text-gray-900">
                  {selectedItem.events?.title || "N/A"}
                </span>
                {selectedItem.events?.date && (
                  <span className="text-xs text-gray-500 block">
                    Event Date: {formatDate(selectedItem.events.date)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Submitted Date</span>
                  <span className="text-gray-700">{formatDate(selectedItem.applied_at)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Current Status</span>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5 ${statusBadge(
                      selectedItem.status
                    )}`}
                  >
                    {selectedItem.status}
                  </span>
                </div>
              </div>

              {selectedItem.reviewed_at && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 font-semibold block">Reviewed Date</span>
                    <span className="text-gray-700">{formatDate(selectedItem.reviewed_at)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-semibold block">Reviewed By</span>
                    <span className="text-gray-700">
                      {selectedItem.reviewer?.full_name || selectedItem.reviewer?.email || "Admin"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div>
                {selectedItem.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setActionTarget({ item: selectedItem, nextStatus: "approved" })
                      }
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                    >
                      Approve Application
                    </button>
                    <button
                      onClick={() =>
                        setActionTarget({ item: selectedItem, nextStatus: "rejected" })
                      }
                      className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 font-semibold text-xs transition"
                    >
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Status Updates */}
      {actionTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={(e) => e.target === e.currentTarget && setActionTarget(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="text-4xl mb-3">
              {actionTarget.nextStatus === "approved" ? "✅" : "❌"}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 capitalize">
              {actionTarget.nextStatus} Application?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to set status of{" "}
              <span className="font-semibold text-gray-700">
                {actionTarget.item.applicant?.full_name || actionTarget.item.applicant?.email}
              </span>{" "}
              to <span className="font-bold">{actionTarget.nextStatus}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setActionTarget(null)}
                className="flex-1 h-10 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={actionLoading}
                className={`flex-1 h-10 rounded-xl transition text-white text-sm font-bold disabled:opacity-60 ${
                  actionTarget.nextStatus === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading applications review...</div>}>
      <ApplicationsContent />
    </Suspense>
  );
}
