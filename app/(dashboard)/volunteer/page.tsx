import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileWidget from "@/components/dashboard/ProfileWidget";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function VolunteerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Your backend profile fetching
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#F6F4F3] flex items-center justify-center p-8 relative">
      {/* Top Right Header Area - Your Profile Widget */}
      <div className="absolute top-6 right-8">
        <ProfileWidget profile={profile} />
      </div>

      {/* Centered Card - Frontend Team's UI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-black mb-1">Volunteer Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">
          Signed in as <span className="font-semibold text-gray-700">{user.email}</span>
        </p>
        <div className="inline-block bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full mb-8">
          ROLE: VOLUNTEER
        </div>
        <div>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}