"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"volunteer" | "influencer" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    async function redirectIfRoleSet() {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (cancelled) return;

      if (profile?.role) {
        router.push(`/${profile.role}`);
      }
    }

    redirectIfRoleSet();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleRoleSelect() {
    if (!selectedRole) return;

    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (existingProfile?.role) {
      router.push(`/${existingProfile.role}`);
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .update({ role: selectedRole })
      .eq("user_id", user.id)
      .select("role");

    if (profileError || !data?.length) {
      setError("Could not save your role. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/${selectedRole}`);
  }

  return (
    <main className="min-h-screen bg-[#F6F4F3] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md mx-auto text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">
          One last step
        </h1>
        <p className="text-gray-500 text-sm lg:text-lg mb-8">
          How will you show up at events?
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            id="select-volunteer"
            type="button"
            onClick={() => setSelectedRole("volunteer")}
            className={`p-5 rounded-xl border-2 transition-all ${selectedRole === "volunteer"
              ? "border-[#8B5CF6] bg-[#F3E8FF]"
              : "border-gray-300 bg-white hover:border-gray-400"
              }`}
          >
            <div className="text-4xl mb-2">🎯</div>
            <h3 className={`text-sm font-bold ${selectedRole === "volunteer" ? "text-[#7C3AED]" : "text-gray-500"}`}>
              Volunteer
            </h3>
            <p className="text-xs text-gray-400 mt-1">Apply to work events</p>
          </button>

          <button
            id="select-influencer"
            type="button"
            onClick={() => setSelectedRole("influencer")}
            className={`p-5 rounded-xl border-2 transition-all ${selectedRole === "influencer"
              ? "border-[#8B5CF6] bg-[#F3E8FF]"
              : "border-gray-300 bg-white hover:border-gray-400"
              }`}
          >
            <div className="text-4xl mb-2">🌐</div>
            <h3 className={`text-sm font-bold ${selectedRole === "influencer" ? "text-[#7C3AED]" : "text-gray-500"}`}>
              Influencer
            </h3>
            <p className="text-xs text-gray-400 mt-1">Promote upcoming events</p>
          </button>
        </div>

        <button
          id="confirm-role"
          onClick={handleRoleSelect}
          disabled={!selectedRole || loading}
          className={`w-full h-13 rounded-xl transition text-white text-lg font-bold ${selectedRole && !loading
            ? "bg-[#7C9BD2] hover:bg-[#6888c3]"
            : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          {loading ? "Saving..." : `Continue as ${selectedRole || "..."}`}
        </button>

        <p className="text-center text-[0.65rem] tracking-widest text-gray-300 uppercase mt-6">
          ADMIN ACCESS IS ISSUED DIRECTLY NOT SELF-SERVE
        </p>
      </div>
    </main>
  );
}
