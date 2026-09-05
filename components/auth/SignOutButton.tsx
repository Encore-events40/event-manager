"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      } else {
        router.replace("/login");
      }
    }
  }

  return (
    <button
      id="sign-out"
      type="button"
      onClick={handleSignOut}
      className="rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
    >
      Sign out
    </button>
  );
}
