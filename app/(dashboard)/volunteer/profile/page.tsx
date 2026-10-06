"use client";

import { useState, useEffect } from "react";
import {
  FiEdit3,
  FiSave,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiTool,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

interface Profile {
  id: string;
  user_id: string;
  role: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  skills: string | null;
  gender: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  pincode: string | null;
  created_at: string;
}

function getInitials(name: string | null | undefined, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

export default function VolunteerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    city: "",
    pincode: "",
    address_line_1: "",
    address_line_2: "",
    skills: "",
    gender: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/volunteer/profile");
        const data = await res.json();
        if (!data.success) {
          setError(data.message || "Failed to load profile.");
          return;
        }
        setProfile(data.profile);
        setForm({
          full_name: data.profile.full_name ?? "",
          phone: data.profile.phone ?? "",
          city: data.profile.city ?? "",
          pincode: data.profile.pincode ?? "",
          address_line_1: data.profile.address_line_1 ?? "",
          address_line_2: data.profile.address_line_2 ?? "",
          skills: data.profile.skills ?? "",
          gender: data.profile.gender ?? "",
        });
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    void fetchProfile();
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/volunteer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        showToast("error", data.message || "Failed to save profile.");
        return;
      }
      setProfile(data.profile);
      setEditing(false);
      showToast("success", "Profile updated successfully!");
    } catch {
      showToast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        city: profile.city ?? "",
        pincode: profile.pincode ?? "",
        address_line_1: profile.address_line_1 ?? "",
        address_line_2: profile.address_line_2 ?? "",
        skills: profile.skills ?? "",
        gender: profile.gender ?? "",
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <FiLoader className="h-8 w-8 animate-spin text-[#7cc6ff]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1070px] px-2 py-6 lg:px-6">
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = getInitials(profile.full_name, profile.email);

  const profileFields = [
    {
      label: "Full Name",
      value: profile.full_name || "—",
      icon: FiUser,
      field: "full_name" as keyof typeof form,
    },
    {
      label: "Email Address",
      value: profile.email,
      icon: FiMail,
      field: null,
    },
    {
      label: "Phone Number",
      value: profile.phone || "—",
      icon: FiPhone,
      field: "phone" as keyof typeof form,
    },
    {
      label: "Gender",
      value: profile.gender || "—",
      icon: FiUser,
      field: "gender" as keyof typeof form,
    },
    {
      label: "City",
      value: profile.city || "—",
      icon: FiMapPin,
      field: "city" as keyof typeof form,
    },
    {
      label: "Pincode",
      value: profile.pincode || "—",
      icon: FiMapPin,
      field: "pincode" as keyof typeof form,
    },
    {
      label: "Address Line 1",
      value: profile.address_line_1 || "—",
      icon: FiMapPin,
      field: "address_line_1" as keyof typeof form,
    },
    {
      label: "Address Line 2",
      value: profile.address_line_2 || "—",
      icon: FiMapPin,
      field: "address_line_2" as keyof typeof form,
    },
    {
      label: "Skills",
      value: profile.skills || "—",
      icon: FiTool,
      field: "skills" as keyof typeof form,
    },
  ];

  return (
    <div className="relative overflow-hidden px-2 py-6 lg:px-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-xl transition-all ${
            toast.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-200"
              : "border border-red-500/30 bg-red-500/20 text-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <FiCheckCircle className="h-4 w-4" />
          ) : (
            <FiAlertCircle className="h-4 w-4" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-[1070px]">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <span>Volunteer Dashboard</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">My Profile</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">
          My Profile
        </h1>
        <p className="mt-2 text-slate-400">
          View and manage your volunteer profile.
        </p>

        {/* Avatar + header card */}
        <div className="mt-8 rounded-[26px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7cc6ff] via-[#6366f1] to-[#a78bfa] text-2xl font-black text-white shadow-[0_0_30px_rgba(124,198,255,0.4)]">
                {initials}
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {profile.full_name || "Volunteer"}
                </div>
                <div className="text-sm text-slate-300">{profile.email}</div>
                <span className="mt-1 inline-block rounded-full bg-[#7cc6ff]/15 px-3 py-0.5 text-xs font-semibold text-[#7cc6ff]">
                  Volunteer
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
                  >
                    <FiX className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:opacity-50"
                  >
                    {saving ? (
                      <FiLoader className="h-4 w-4 animate-spin" />
                    ) : (
                      <FiSave className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  <FiEdit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile fields */}
        <div className="mt-6 rounded-[26px] border border-white/10 bg-[#1a2433]/80 p-6 shadow-[0_18px_60px_rgba(2,6,23,0.5)]">
          <div className="mb-6 text-2xl font-semibold text-white">
            Personal Details
          </div>

          <div className="space-y-4">
            {profileFields.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-1 gap-2 border-b border-white/8 py-3 text-base md:grid-cols-[220px_1fr]"
              >
                <div className="flex items-center gap-2 font-medium text-slate-400">
                  <item.icon className="h-4 w-4 text-[#7cc6ff]" />
                  {item.label}
                </div>
                <div>
                  {editing && item.field ? (
                    <input
                      type="text"
                      value={form[item.field]}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [item.field!]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white outline-none ring-0 transition focus:border-[#3b82f6]/60 focus:ring-1 focus:ring-[#3b82f6]/30"
                      placeholder={`Enter ${item.label.toLowerCase()}...`}
                    />
                  ) : (
                    <span
                      className={
                        item.value === "—"
                          ? "text-slate-500 italic"
                          : "text-white"
                      }
                    >
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills tags display */}
        {profile.skills && (
          <div className="mt-6 rounded-[26px] border border-white/10 bg-[#1a2433]/80 p-6">
            <div className="mb-4 text-lg font-semibold text-white">Skills</div>
            <div className="flex flex-wrap gap-2">
              {profile.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-[#1e3a5f]/80 px-3 py-1 text-sm font-medium text-[#7cc6ff]"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Member since */}
        <div className="mt-6 rounded-[26px] border border-white/10 bg-[#1a2433]/80 p-6">
          <div className="text-sm text-slate-400">
            Member since{" "}
            <span className="text-white">
              {new Date(profile.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
