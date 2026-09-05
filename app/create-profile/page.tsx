import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileCreationPage from "@/components/auth/ProfileCreationPage";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, role")
    .eq("user_id", user.id)
    .single();

  return <ProfileCreationPage initialEmail={profile?.email || user.email} role={profile?.role} />;
}