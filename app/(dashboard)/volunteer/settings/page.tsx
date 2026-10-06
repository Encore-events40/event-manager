"use client";

import { useState, useEffect } from "react";
import {
  FiSave,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiLock,
  FiBell,
  FiUser,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  full_name: string | null;
  phone: string | null;
  city: string | null;
  skills: string | null;
  gender: string | null;
}

export default function VolunteerSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    city: "",
    skills: "",
    gender: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordToast, setPasswordToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/volunteer/profile");
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          setProfileForm({
            full_name: data.profile.full_name ?? "",
            phone: data.profile.phone ?? "",
            city: data.profile.city ?? "",
            skills: data.profile.skills ?? "",
            gender: data.profile.gender ?? "",
          });
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    void fetchProfile();
  }, []);

  const showToast = (
    setter: typeof setProfileToast,
    type: "success" | "error",
    msg: string
  ) => {
    setter({ type, msg });
    setTimeout(() => setter(null), 3500);
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      const res = await fetch("/api/volunteer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(setProfileToast, "error", data.message || "Failed to save.");
        return;
      }
      setProfile(data.profile);
      showToast(setProfileToast, "success", "Profile updated successfully!");
    } catch {
      showToast(setProfileToast, "error", "Network error. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.newPassword) {
      showToast(setPasswordToast, "error", "Please enter a new password.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast(setPasswordToast, "error", "Passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast(
        setPasswordToast,
        "error",
        "Password must be at least 6 characters."
      );
      return;
    }
    setPasswordSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) {
        showToast(setPasswordToast, "error", error.message);
        return;
      }
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      showToast(setPasswordToast, "success", "Password updated successfully!");
    } catch {
      showToast(setPasswordToast, "error", "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 transition focus:border-[#3b82f6]/60 focus:ring-1 focus:ring-[#3b82f6]/30";

  const Toast = ({
    toast,
  }: {
    toast: { type: "success" | "error"; msg: string } | null;
  }) =>
    toast ? (
      <div
        className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
          toast.type === "success"
            ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
            : "border border-red-500/30 bg-red-500/15 text-red-300"
        }`}
      >
        {toast.type === "success" ? (
          <FiCheckCircle className="h-4 w-4 shrink-0" />
        ) : (
          <FiAlertCircle className="h-4 w-4 shrink-0" />
        )}
        {toast.msg}
      </div>
    ) : null;

  return (
    <div className="relative mx-auto max-w-[980px] px-2 py-6 lg:px-6">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
        <span>Volunteer Dashboard</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300">Settings</span>
      </div>
      <h1 className="text-4xl font-black tracking-tight text-white">
        Account Settings
      </h1>
      <p className="mt-2 text-slate-400">
        Manage your account preferences and security.
      </p>

      <div className="mt-8 space-y-6">
        {/* Personal Details */}
        <div className="rounded-[26px] border border-white/10 bg-[#162130]/80 p-6 shadow-[0_35px_80px_rgba(2,6,23,0.5)] backdrop-blur-xl">
          <div className="mb-1 flex items-center gap-2 text-xl font-bold text-white">
            <FiUser className="h-5 w-5 text-[#7cc6ff]" />
            Personal Details
          </div>
          <p className="mb-6 text-sm text-slate-400">
            Update your name and contact details.
          </p>

          <Toast toast={profileToast} />

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <FiLoader className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-300">
                  <span className="mb-2 block">Full Name</span>
                  <input
                    id="settings-full-name"
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        full_name: e.target.value,
                      }))
                    }
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-medium text-slate-300">
                  <span className="mb-2 block">Phone Number</span>
                  <input
                    id="settings-phone"
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="Your phone number"
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-medium text-slate-300">
                  <span className="mb-2 block">City</span>
                  <input
                    id="settings-city"
                    type="text"
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="Your city"
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-medium text-slate-300">
                  <span className="mb-2 block">Gender</span>
                  <select
                    id="settings-gender"
                    value={profileForm.gender}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        gender: e.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="" className="bg-[#1e293b]">
                      Select gender
                    </option>
                    <option value="Male" className="bg-[#1e293b]">
                      Male
                    </option>
                    <option value="Female" className="bg-[#1e293b]">
                      Female
                    </option>
                    <option value="Other" className="bg-[#1e293b]">
                      Other
                    </option>
                    <option value="Prefer not to say" className="bg-[#1e293b]">
                      Prefer not to say
                    </option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-300 md:col-span-2">
                  <span className="mb-2 block">
                    Skills{" "}
                    <span className="text-slate-500">(comma-separated)</span>
                  </span>
                  <input
                    id="settings-skills"
                    type="text"
                    value={profileForm.skills}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        skills: e.target.value,
                      }))
                    }
                    placeholder="e.g. Photography, Event Planning, Social Media"
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.4)] transition hover:bg-[#2563eb] disabled:opacity-50"
                >
                  {profileSaving ? (
                    <FiLoader className="h-4 w-4 animate-spin" />
                  ) : (
                    <FiSave className="h-4 w-4" />
                  )}
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Security */}
        <div className="rounded-[26px] border border-white/10 bg-[#162130]/80 p-6 shadow-[0_35px_80px_rgba(2,6,23,0.5)] backdrop-blur-xl">
          <div className="mb-1 flex items-center gap-2 text-xl font-bold text-white">
            <FiLock className="h-5 w-5 text-[#a78bfa]" />
            Security
          </div>
          <p className="mb-6 text-sm text-slate-400">
            Manage your password. Handled securely via Supabase Auth.
          </p>

          <Toast toast={passwordToast} />

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-300">
              <span className="mb-2 block">New Password</span>
              <input
                id="settings-new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="Enter new password"
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-medium text-slate-300">
              <span className="mb-2 block">Confirm Password</span>
              <input
                id="settings-confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm new password"
                className={inputClass}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handlePasswordUpdate}
            disabled={passwordSaving}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.4)] transition hover:bg-[#6d28d9] disabled:opacity-50"
          >
            {passwordSaving ? (
              <FiLoader className="h-4 w-4 animate-spin" />
            ) : (
              <FiLock className="h-4 w-4" />
            )}
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </div>

        {/* Notifications */}
        <div className="rounded-[26px] border border-white/10 bg-[#162130]/80 p-6 shadow-[0_35px_80px_rgba(2,6,23,0.5)] backdrop-blur-xl">
          <div className="mb-1 flex items-center gap-2 text-xl font-bold text-white">
            <FiBell className="h-5 w-5 text-amber-400" />
            Notifications
          </div>
          <p className="mb-6 text-sm text-slate-400">
            Choose what triggers an email to you.
          </p>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#142030]/80 px-4 py-3">
            <div>
              <div className="text-base font-medium text-white">
                Application updates
              </div>
              <div className="text-sm text-slate-400">
                Get notified when your application is approved or rejected
              </div>
            </div>
            <button
              type="button"
              id="toggle-notifications"
              onClick={() => setNotifications((current) => !current)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                notifications ? "bg-[#3b82f6]" : "bg-slate-600"
              }`}
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
