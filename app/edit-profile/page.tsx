import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EditProfilePage from "@/components/auth/EditProfilePage";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all existing profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/create-profile");

  return <EditProfilePage profile={profile} />;
}