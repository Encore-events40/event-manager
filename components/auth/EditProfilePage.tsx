"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/profiles";
import { Profile } from "@/lib/supabase/types";

export default function EditProfilePage({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Split the full name back into first and last name for the form
  const nameParts = profile.full_name ? profile.full_name.split(" ") : ["", ""];
  const defaultFirstName = nameParts[0] || "";
  const defaultLastName = nameParts.slice(1).join(" ") || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await updateProfile(formData);
      router.push(`/${profile.role}`);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setIsLoading(false);
      alert("Failed to save profile. Please check the console.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F4F3] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl lg:rounded-[28px] shadow-sm p-6 md:p-10 border border-gray-100">
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-black">Edit your profile</h1>
            <p className="text-gray-500 text-sm md:text-base mt-2">
              Update your details and profile image.
            </p>
          </div>
          {profile.avatar_url && (
             <img src={profile.avatar_url} alt="Current Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-600 text-sm font-semibold block mb-2">
              Profile Image (Upload new to replace)
            </label>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#F3E8FF] file:text-[#7C3AED] hover:file:bg-[#E9D5FF] transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                defaultValue={defaultFirstName}
                required
                className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                defaultValue={defaultLastName}
                required
                className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={profile.email}
                required
                disabled
                className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-500 text-sm outline-none cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
            </div>
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                defaultValue={profile.phone || ""}
                required
                className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-600 text-sm font-semibold block mb-2">Gender</label>
            <select
              name="gender"
              defaultValue={profile.gender || ""}
              required
              className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
            >
              <option value="" disabled>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">Address Line 1</label>
              <input
                type="text"
                name="address_line_1"
                defaultValue={profile.address_line_1 || ""}
                required
                className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">Address Line 2</label>
              <input
                type="text"
                name="address_line_2"
                defaultValue={profile.address_line_2 || ""}
                className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="text-gray-600 text-sm font-semibold block mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  defaultValue={profile.city || ""}
                  required
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm font-semibold block mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  defaultValue={profile.pincode || ""}
                  required
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.push(`/${profile.role}`)}
              className="text-gray-500 hover:text-gray-700 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 px-8 rounded-xl bg-[#7C9BD2] hover:bg-[#6888c3] transition text-white text-base font-bold disabled:opacity-70"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}