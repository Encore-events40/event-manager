"use client";

import { useState } from "react";

const toggleStyles =
  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300";

export default function VolunteerSettingsPage() {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="relative mx-auto max-w-[980px] px-2 py-6 lg:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-[#7cc6ff]">My Profile</h1>
      <p className="mt-1 text-lg text-slate-300">Volunteer</p>

      <div className="mt-8 rounded-[26px] border border-white/10 bg-[#162130]/80 p-6 shadow-[0_35px_80px_rgba(2,6,23,0.5)] backdrop-blur-xl">
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-2xl font-semibold text-white">
          Account settings
        </div>

        <div className="rounded-[22px] border border-white/10 bg-[#1d2a39]/80 p-6">
          <div className="mb-6 text-3xl font-semibold text-white">Personal Details</div>
          <p className="mb-6 text-slate-300">Update your name and contact details.</p>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-300">
              <span className="mb-2 block">Full name</span>
              <input
                defaultValue="Admin's name"
                className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500"
              />
            </label>

            <label className="block text-sm font-medium text-slate-300">
              <span className="mb-2 block">Phone no.</span>
              <input
                defaultValue="91 9988552211"
                className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500"
              />
            </label>
          </div>

          <div className="mt-6 flex gap-4">
            <button className="rounded-xl bg-[#9ecbff] px-6 py-3 font-semibold text-[#08172b] shadow-[0_12px_30px_rgba(130,180,255,0.4)] transition hover:brightness-110">
              Save Changes
            </button>
            <button className="rounded-xl border border-white/15 bg-transparent px-6 py-3 font-semibold text-white transition hover:bg-white/5">
              Cancel
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-[22px] border border-white/10 bg-[#1d2a39]/80 p-6">
          <div className="mb-3 text-3xl font-semibold text-white">Security</div>
          <p className="mb-6 text-slate-300">Manage how you sign in. Handled securely via Supabase Auth.</p>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-300">
              <span className="mb-2 block">New password</span>
              <input
                type="password"
                defaultValue="********"
                className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-white outline-none ring-0"
              />
            </label>

            <label className="block text-sm font-medium text-slate-300">
              <span className="mb-2 block">Confirm password</span>
              <input
                type="password"
                defaultValue="********"
                className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-white outline-none ring-0"
              />
            </label>
          </div>

          <button className="mt-6 rounded-xl bg-[#9ecbff] px-6 py-3 font-semibold text-[#08172b] shadow-[0_12px_30px_rgba(130,180,255,0.4)] transition hover:brightness-110">
            Update Password
          </button>
        </div>

        <div className="mt-8 rounded-[22px] border border-white/10 bg-[#1d2a39]/80 p-6">
          <div className="mb-3 text-3xl font-semibold text-white">Notifications</div>
          <p className="mb-6 text-slate-300">Choose what triggers an email to you.</p>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#142030]/80 px-4 py-3">
            <div>
              <div className="text-lg font-medium text-white">Application updates</div>
              <div className="text-sm text-slate-300">Get notified when your application is approved or rejected</div>
            </div>
            <button
              type="button"
              onClick={() => setNotifications((current) => !current)}
              className={`${toggleStyles} ${notifications ? "bg-[#f27bb8]" : "bg-slate-600"}`}
              aria-label="Toggle application updates"
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  notifications ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
