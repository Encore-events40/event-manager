"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      id="sign-out"
      onClick={handleSignOut}
      className="px-6 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700 text-sm font-semibold"
    >
      Sign out
    </button>
  );
}
