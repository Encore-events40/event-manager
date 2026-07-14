import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function InfluencerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F6F4F3] flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🌐</div>
        <h1 className="text-2xl font-bold text-black mb-1">Influencer Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">Signed in as <span className="font-semibold text-gray-700">{user.email}</span></p>
        <div className="inline-block bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full mb-8">
          ROLE: INFLUENCER
        </div>
        <div>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}