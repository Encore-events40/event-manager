import Link from "next/link";
import EventForm from "@/components/admin/EventForm";

export default function CreateEventPage() {
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
        <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Fill out the event details to create a draft or published event.
        </p>
      </div>

      <EventForm mode="create" />
    </div>
  );
}
