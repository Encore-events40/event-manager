"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Event, EventStatus } from "@/lib/supabase/types";

interface EventFormProps {
  mode: "create" | "edit";
  initialData?: Event | null;
}

interface FormState {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  volunteers_needed: string;
  volunteer_pay: string;
  skills_required: string;
  needs_influencer: boolean;
  application_deadline: string;
  status: EventStatus;
}

export default function EventForm({ mode, initialData }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    volunteers_needed: "",
    volunteer_pay: "",
    skills_required: "",
    needs_influencer: false,
    application_deadline: "",
    status: "draft",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        date: initialData.date ? initialData.date.slice(0, 10) : "",
        time: initialData.time ?? "",
        location: initialData.location ?? "",
        volunteers_needed:
          initialData.volunteers_needed != null ? String(initialData.volunteers_needed) : "",
        volunteer_pay:
          initialData.volunteer_pay != null ? String(initialData.volunteer_pay) : "",
        skills_required: initialData.skills_required ?? "",
        needs_influencer: initialData.needs_influencer ?? false,
        application_deadline: initialData.application_deadline
          ? initialData.application_deadline.slice(0, 10)
          : "",
        status: initialData.status ?? "draft",
      });
    }
  }, [initialData]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!form.title.trim()) return "Title is required.";
    if (!form.date) return "Event date is required.";

    if (form.application_deadline && form.date) {
      const eventDateObj = new Date(form.date);
      const deadlineObj = new Date(form.application_deadline);
      if (deadlineObj >= eventDateObj) {
        return "Application deadline must be strictly before the event date.";
      }
    }

    if (form.volunteers_needed !== "" && Number(form.volunteers_needed) < 0) {
      return "Volunteers needed cannot be negative.";
    }

    if (form.volunteer_pay !== "" && Number(form.volunteer_pay) < 0) {
      return "Volunteer pay cannot be negative.";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      date: form.date,
      description: form.description.trim() || null,
      time: form.time || null,
      location: form.location.trim() || null,
      volunteers_needed: form.volunteers_needed !== "" ? Number(form.volunteers_needed) : null,
      volunteer_pay: form.volunteer_pay !== "" ? Number(form.volunteer_pay) : null,
      skills_required: form.skills_required.trim() || null,
      needs_influencer: form.needs_influencer,
      application_deadline: form.application_deadline || null,
      status: form.status,
    };

    const url = mode === "edit" && initialData ? `/api/admin/events/${initialData.id}` : `/api/admin/events`;
    const method = mode === "edit" ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save event. Please check the fields and try again.");
        setLoading(false);
        return;
      }

      // Success redirect to list page with message query
      const actionParam = mode === "edit" ? "updated" : "created";
      router.push(`/admin/events?toast=${actionParam}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          Event Details
        </h3>

        <div>
          <label htmlFor="event-title" className="block text-sm font-semibold text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="event-title"
            type="text"
            required
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. Annual Charity Marathon 2026"
            className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition"
          />
        </div>

        <div>
          <label htmlFor="event-description" className="block text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="event-description"
            rows={4}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Describe the event, goals, responsibilities, and expectations..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition resize-y"
          />
        </div>

        <div>
          <label htmlFor="event-status" className="block text-sm font-semibold text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="event-status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value as EventStatus)}
            className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition bg-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Date & Location */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          Date & Location
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="event-date" className="block text-sm font-semibold text-gray-700 mb-1">
              Event Date <span className="text-red-500">*</span>
            </label>
            <input
              id="event-date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition"
            />
          </div>

          <div>
            <label htmlFor="event-time" className="block text-sm font-semibold text-gray-700 mb-1">
              Start Time
            </label>
            <input
              id="event-time"
              type="time"
              value={form.time}
              onChange={(e) => setField("time", e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition"
            />
          </div>

          <div>
            <label htmlFor="event-deadline" className="block text-sm font-semibold text-gray-700 mb-1">
              Application Deadline
            </label>
            <input
              id="event-deadline"
              type="date"
              value={form.application_deadline}
              onChange={(e) => setField("application_deadline", e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="event-location" className="block text-sm font-semibold text-gray-700 mb-1">
            Location
          </label>
          <input
            id="event-location"
            type="text"
            value={form.location}
            onChange={(e) => setField("location", e.target.value)}
            placeholder="e.g. Main Auditorium, City Center or Virtual (Zoom Link)"
            className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition"
          />
        </div>
      </div>

      {/* Volunteer Requirements & Roles */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          Participants & Roles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-volunteers-needed" className="block text-sm font-semibold text-gray-700 mb-1">
              Max Participants / Volunteers
            </label>
            <input
              id="event-volunteers-needed"
              type="number"
              min={0}
              value={form.volunteers_needed}
              onChange={(e) => setField("volunteers_needed", e.target.value)}
              placeholder="e.g. 25"
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition"
            />
          </div>

          <div>
            <label htmlFor="event-volunteer-pay" className="block text-sm font-semibold text-gray-700 mb-1">
              Volunteer Pay / Stipend ($)
            </label>
            <input
              id="event-volunteer-pay"
              type="number"
              min={0}
              step="0.01"
              value={form.volunteer_pay}
              onChange={(e) => setField("volunteer_pay", e.target.value)}
              placeholder="0.00"
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="event-skills-required" className="block text-sm font-semibold text-gray-700 mb-1">
            Skills Required
          </label>
          <input
            id="event-skills-required"
            type="text"
            value={form.skills_required}
            onChange={(e) => setField("skills_required", e.target.value)}
            placeholder="e.g. Social Media Management, First Aid, Photography"
            className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 outline-none focus:border-[#7C9BD2] transition"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              id="event-needs-influencer"
              type="checkbox"
              checked={form.needs_influencer}
              onChange={(e) => setField("needs_influencer", e.target.checked)}
              className="w-4 h-4 rounded text-[#7C9BD2] focus:ring-[#7C9BD2] accent-[#7C9BD2]"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900">Needs Influencer Promotion</span>
              <p className="text-xs text-gray-500">Allow influencers to join and promote this event</p>
            </div>
          </label>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/admin/events")}
          className="h-10 px-5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          id="event-form-submit-btn"
          type="submit"
          disabled={loading}
          className="h-10 px-6 rounded-xl bg-[#7C9BD2] hover:bg-[#6888c3] transition text-white text-sm font-bold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin text-sm">⏳</span>
              <span>Saving...</span>
            </>
          ) : (
            <span>{mode === "edit" ? "Update Event" : "Create Event"}</span>
          )}
        </button>
      </div>
    </form>
  );
}
