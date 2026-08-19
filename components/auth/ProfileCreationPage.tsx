"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/profiles";

interface ProfileCreationProps {
  initialEmail?: string;
  role?: string;
}

export default function ProfileCreationPage({ initialEmail = "", role = "volunteer" }: ProfileCreationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Execute the server action to save to Supabase
      await updateProfile(formData);

      // Once successfully saved,  proxy will allow this routing to pass
      router.push(`/${role}`);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setIsLoading(false); // Reset the button so you aren't stuck if it fails
      alert("Failed to save profile. Please check the console.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F4F3] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl lg:rounded-[28px] shadow-sm p-6 md:p-10 border border-gray-100">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Complete your profile</h1>
          <p className="text-gray-500 text-sm md:text-base mt-2">
            Please provide your details to finish setting up your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div>
            <label className="text-gray-600 text-sm font-semibold block mb-2">
              Profile Image (Optional)
            </label>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#F3E8FF] file:text-[#7C3AED] hover:file:bg-[#E9D5FF] transition"
            />
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                required
                placeholder="First Name"
                className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                required
                placeholder="Last Name"
                className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={initialEmail}
                required
                placeholder="Email Address"
                className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+1 (555) 000-0000"
                className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Gender Select */}
          <div>
            <label className="text-gray-600 text-sm font-semibold block mb-2">Gender</label>
            <select
              name="gender"
              required
              defaultValue=""
              className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
            >
              <option value="" disabled>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          {/* Address Block */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">Address Line 1</label>
              <input
                type="text"
                name="address_line_1"
                required
                placeholder="Street address, P.O. box, etc."
                className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-semibold block mb-2">Address Line 2</label>
              <input
                type="text"
                name="address_line_2"
                placeholder="Apartment, suite, unit, building, floor, etc."
                className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="text-gray-600 text-sm font-semibold block mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="City"
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm font-semibold block mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="ZIP / Pincode"
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-black text-sm outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Submit Button aligned to Bottom Right */}
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 px-8 rounded-xl bg-[#7C9BD2] hover:bg-[#6888c3] transition text-white text-base font-bold disabled:opacity-70"
            >
              {isLoading ? "Saving..." : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}