import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardHub() {
  const supabase = await createClient();

  // Fetch quick metrics for stats cards
  const [{ count: totalEvents }, { count: totalApps }, { count: totalPromos }] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("promotions").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#7C9BD2] to-[#5A7BB8] text-white rounded-3xl p-8 shadow-sm">
        <h2 className="text-3xl font-extrabold mb-2">Welcome to Admin Portal</h2>
        <p className="text-white/90 text-sm max-w-xl">
          Manage event listings, review volunteer applications, oversee influencer campaigns, and monitor platform activity.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Total Events
            </span>
            <span className="text-3xl font-extrabold text-gray-900">{totalEvents ?? 0}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#7C9BD2] flex items-center justify-center text-2xl font-bold">
            📅
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Volunteer Applications
            </span>
            <span className="text-3xl font-extrabold text-gray-900">{totalApps ?? 0}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
            🙋‍♂️
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Influencer Promotions
            </span>
            <span className="text-3xl font-extrabold text-gray-900">{totalPromos ?? 0}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-bold">
            📢
          </div>
        </div>
      </div>

      {/* Quick Access Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature 1 Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#7C9BD2] flex items-center justify-center text-3xl mb-5">
              📅
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#7C9BD2] transition">
              Event Management (Feature 1)
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Create new events, edit details, set registration deadlines, manage volunteers needed, and search/filter existing events with server-side pagination.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/events"
              className="px-5 py-2.5 rounded-xl bg-[#7C9BD2] hover:bg-[#6888c3] transition text-white text-sm font-bold shadow-xs"
            >
              Manage Events →
            </Link>
            <Link
              href="/admin/events/new"
              className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 transition text-gray-700 text-sm font-semibold"
            >
              + Create Event
            </Link>
          </div>
        </div>

        {/* Feature 2 Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl mb-5">
              📄
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition">
              Applications Review (Feature 2)
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Unified view for volunteer applications & influencer promotions. Filter by event, status, or role type, search applicants, and approve or reject submissions.
            </p>
          </div>
          <div>
            <Link
              href="/admin/applications"
              className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-bold shadow-xs"
            >
              Review Applications →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
