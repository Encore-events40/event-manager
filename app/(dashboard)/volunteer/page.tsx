import { createClient } from "@/lib/supabase/server";
import ProfileWidget from "@/components/dashboard/ProfileWidget";

export default async function VolunteerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  return (
    <div className="relative min-h-screen p-8 bg-black text-white">
      {/* Top Right Header Area */}
      <div className="absolute top-6 right-8">
        <ProfileWidget profile={profile} />
      </div>

      <div>
        <h1 className="text-2xl font-bold">Volunteer Dashboard</h1>
        <p className="text-gray-400 mt-2">Browse events and track earnings here.</p>
      </div>
    </div>
  );
}