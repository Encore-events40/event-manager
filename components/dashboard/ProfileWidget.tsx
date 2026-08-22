"use client";

import { useState } from "react";
import Link from "next/link";
import { Profile } from "@/lib/supabase/types";

export default function ProfileWidget({ profile }: { profile: Profile | null }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!profile) return null;

  // Extract initials for the avatar placeholder
  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  return (
    <div className="relative">
      {/* Profile Button - Now w-10 h-10 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-[#7C9BD2] text-white text-sm font-bold flex items-center justify-center shadow-md hover:bg-[#6888c3] transition border border-white/10 overflow-hidden"
      >
        {profile.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {/* Profile Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col">
          <div className="bg-[#12001E] p-4">
            <h3 className="text-white font-bold text-lg">{profile.full_name}</h3>
            <p className="text-[#8EA7FF] text-sm font-mono">{profile.role.toUpperCase()}</p>
          </div>
          
          <div className="p-4 space-y-3 text-sm text-gray-700 flex-1">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</span>
              <p>{profile.email}</p>
              <p>{profile.phone || "No phone provided"}</p>
            </div>
            
            <div className="h-px bg-gray-100" />
            
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Details</span>
              <p className="capitalize">Gender: {profile.gender || "N/A"}</p>
            </div>

            <div className="h-px bg-gray-100" />

            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location</span>
              <p>{profile.address_line_1 || "No address"}</p>
              {profile.address_line_2 && <p>{profile.address_line_2}</p>}
              <p>{profile.city ? `${profile.city}, ${profile.pincode}` : "N/A"}</p>
            </div>
          </div>

          {/* Edit Profile Link */}
          <div className="bg-gray-50 p-3 flex justify-end border-t border-gray-100">
            <Link 
              href="/edit-profile" 
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#7C9BD2] hover:text-[#6888c3] transition uppercase tracking-wider px-2 py-1"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}