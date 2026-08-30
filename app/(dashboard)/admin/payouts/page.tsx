"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FiDollarSign, FiUsers, FiClipboard, FiChevronRight, FiCheck } from "react-icons/fi";

interface EventItem {
  id: string;
  title: string;
  date: string;
  volunteer_pay: number | null;
}

interface ParticipantItem {
  id: string;
  full_name: string | null;
  email: string;
  role: "volunteer" | "influencer";
  eventTitle: string;
  amount: number;
}

interface PayoutRecord {
  id: string;
  amount: number;
  paid_on?: string | null;
  created_at?: string | null;
  event_id?: string;
  volunteer_id?: string;
  volunteerName?: string;
  eventName?: string;
  events?: { id: string; title: string; date?: string } | null;
  recipient?: { id: string; full_name?: string | null; email?: string; role?: string } | null;
}

export default function PayoutsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState<boolean>(false);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    volunteerName: "",
    eventName: "",
    amount: "",
    notes: "",
  });

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId),
    [events, selectedEventId]
  );

  const paidKeySet = useMemo(
    () => new Set(payouts.map((row) => `${row.event_id || ""}:${row.volunteer_id || ""}`)),
    [payouts]
  );

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("/api/admin/events?pageSize=50&order=asc");
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to load events.");
        return;
      }
      setEvents(data.events || []);
    } catch {
      setError("Network error loading events.");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const fetchPayouts = useCallback(async () => {
    setLoadingPayouts(true);
    try {
      const res = await fetch("/api/admin/payouts");
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to load payouts.");
        return;
      }
      setPayouts(data.payouts || []);
    } catch {
      setError("Network error loading payouts.");
    } finally {
      setLoadingPayouts(false);
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/applications?status=pending&pageSize=1");
      const data = await res.json();
      if (data.success) {
        setPendingCount(Number(data.total || 0));
      }
    } catch {
      // Keep count unchanged when auxiliary request fails.
    }
  }, []);

  const fetchParticipants = useCallback(async (eventId: string) => {
    setLoadingParticipants(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/applications?event_id=${eventId}&status=approved&role=all&pageSize=50`
      );
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to load participants.");
        setParticipants([]);
        return;
      }

      const mapped: ParticipantItem[] = (data.items || [])
        .filter((item: { applicant?: ParticipantItem }) => Boolean(item?.applicant?.id))
        .map(
          (item: {
            applicant: {
              id: string;
              full_name: string | null;
              email: string;
              role: "volunteer" | "influencer";
            };
            events: {
              title: string;
              volunteer_pay: number | null;
            } | null;
          }) => ({
            id: item.applicant.id,
            full_name: item.applicant.full_name,
            email: item.applicant.email,
            role: item.applicant.role,
            eventTitle: item.events?.title || "Event",
            amount: Number(item.events?.volunteer_pay ?? 0),
          })
        );

      setParticipants(mapped);
    } catch {
      setError("Network error loading participants.");
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      await Promise.all([fetchEvents(), fetchPayouts(), fetchPendingCount()]);
      setIsLoading(false);
    });
  }, [fetchEvents, fetchPayouts, fetchPendingCount]);

  const recordPayout = async (person: ParticipantItem) => {
    if (!selectedEventId) return;
    setRecordingId(person.id);
    setError("");
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: selectedEventId,
          volunteer_id: person.id,
          amount: person.amount,
          notes: formData.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to record payout.");
        return;
      }
      await fetchPayouts();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to record payout.");
    } finally {
      setRecordingId(null);
    }
  };

  const totalPaid = payouts.reduce((sum, payout) => sum + Number(payout.amount || 0), 0);
  const volunteersPaid = new Set(payouts.map((p) => p.volunteer_id).filter(Boolean)).size;

  const payoutByMonths = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 4 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        month: date.toLocaleString("en-US", { month: "short" }),
        value: 0,
      };
    });

    for (const payout of payouts) {
      const dateValue = payout.paid_on || payout.created_at;
      if (!dateValue) continue;
      const date = new Date(dateValue);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const bucket = buckets.find((item) => item.key === key);
      if (bucket) bucket.value += Number(payout.amount || 0);
    }

    const maxValue = Math.max(...buckets.map((item) => item.value), 1);
    return buckets.map((item) => ({
      ...item,
      height: Math.max(18, Math.round((item.value / maxValue) * 120)),
    }));
  }, [payouts]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-1 sm:px-2">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-500">
            Admin&apos;s HQ
          </span>
          <span className="text-gray-400">/</span>
          <span className="text-sm font-semibold text-gray-700">Payouts</span>
        </div>
        <h1 className="text-3xl font-black text-[#857b91] sm:text-4xl mb-2">
          Payouts
        </h1>
        <p className="text-gray-500 max-w-2xl">
          Select an event, then mark volunteers and influencers as paid using
          the check button next to their names.
        </p>
        {error && (
          <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
        )}
      </div>

      {/* Stats Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">
              Payout by Months
            </h2>
          </div>

          {/* Histogram */}
          <div className="flex h-64 items-end justify-around gap-2 border-b border-gray-200 bg-white px-2 pt-5 sm:gap-8">
            {payoutByMonths.map((item) => (
              <div
                key={item.key}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex items-end gap-2">
                  <div
                    className="w-10 bg-cyan-500 transition-all hover:bg-cyan-600 sm:w-16 rounded-t"
                    style={{ height: `${item.height}px` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {item.month}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-semibold text-gray-500">
              Payout by Months
            </p>
          </div>
        </div>

        {/* Stats Cards Column */}
        <div className="space-y-4">
          {/* Total Paid */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Total Paid
                </p>
                <p className="text-2xl font-black text-gray-900">
                  ₹
                  {totalPaid.toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Updated from recorded payouts
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Volunteers Paid */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  People Paid
                </p>
                <p className="text-2xl font-black text-gray-900">
                  {volunteersPaid}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <FiUsers className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Pending Applications */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Pending Applications
                </p>
                <p className="text-2xl font-black text-gray-900">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <FiClipboard className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event and participant payout recording */}
      <div className="bg-white p-5 sm:p-8 border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="text-2xl font-black text-gray-900 mb-6">
          Select event and mark payout
        </h2>

        <div className="space-y-4">
          {loadingEvents ? (
            <p className="text-sm text-gray-500">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500">No events available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {events.map((event) => {
                const active = selectedEventId === event.id;
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => {
                      setSelectedEventId(event.id);
                      fetchParticipants(event.id);
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-gray-200 bg-white hover:border-cyan-300"
                    }`}
                  >
                    <p className="font-black text-gray-900">{event.title}</p>
                    <p className="mt-1 text-xs font-semibold text-gray-500">
                      {event.date}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-cyan-700">
                      <FiChevronRight className="h-4 w-4" />
                      <span className="text-xs font-bold">View people</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedEventId && (
            <div className="mt-6 rounded-xl border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-black text-gray-900">
                {selectedEvent?.title || "Selected event"}
              </h3>
              <p className="text-xs font-semibold text-gray-500 mt-1">
                Click the check button to record payout.
              </p>

              <div className="mt-4 space-y-3">
                {loadingParticipants ? (
                  <p className="text-sm text-gray-500">Loading participants...</p>
                ) : participants.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No approved volunteers or influencers for this event.
                  </p>
                ) : (
                  participants.map((person) => {
                    const paid = paidKeySet.has(`${selectedEventId}:${person.id}`);
                    const disabled = paid || recordingId === person.id;

                    return (
                      <div
                        key={person.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                      >
                        <div>
                          <p className="font-bold text-gray-900">
                            {person.full_name || person.email}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {person.role} • ₹{person.amount.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => recordPayout(person)}
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                            paid
                              ? "border-green-300 bg-green-100 text-green-700"
                              : "border-cyan-400 bg-cyan-500 text-white hover:bg-cyan-600"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                          aria-label={paid ? "Payout recorded" : "Record payout"}
                          title={paid ? "Payout recorded" : "Record payout"}
                        >
                          <FiCheck className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payouts List */}
      <div className="bg-white p-5 sm:p-8 border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="text-lg font-black text-gray-900 mb-4">
          Recent Payouts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingPayouts ? (
            <p className="text-sm text-gray-500">Loading payouts...</p>
          ) : payouts.length === 0 ? (
            <p className="text-sm text-gray-500">No payouts recorded yet.</p>
          ) : (
            payouts.map((payout) => (
              <div
                key={payout.id}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
              >
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  {payout.recipient?.full_name || payout.recipient?.email || payout.volunteerName || "Unknown person"}
                </p>
                <p className="text-xs text-gray-500 mb-1 capitalize">
                  {payout.recipient?.role || "volunteer"}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {payout.events?.title || payout.eventName || "Event"}
                </p>
                <p className="text-lg font-black text-gray-900">
                  ₹{Number(payout.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
