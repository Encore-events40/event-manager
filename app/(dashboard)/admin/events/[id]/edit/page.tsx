"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Event } from "@/lib/supabase/types";
import EventForm from "@/components/admin/EventForm";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/admin/events/${id}`);
        const data = await res.json();
        if (data.success && data.event) {
          setEvent(data.event);
        } else {
          setError(data.message || "Failed to load event data.");
        }
      } catch {
        setError("Network error fetching event details.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/events"
          className="text-gray-400 hover:text-gray-600 transition text-sm font-semibold flex items-center gap-1"
        >
          ← Back to Events
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Update event specifications, dates, location, or status.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 text-sm shadow-sm border border-gray-200">
          <span className="inline-block animate-spin mr-2">⏳</span> Loading event details...
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-12 text-center text-red-500 text-sm shadow-sm border border-gray-200">
          {error}
        </div>
      ) : (
        <EventForm mode="edit" initialData={event} />
      )}
    </div>
  );
}
