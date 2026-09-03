"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiBell,
  FiCalendar,
  FiCheckSquare,
  FiCreditCard,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiUser,
  FiX,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const links = [
  { href: "/volunteer", label: "Dashboard", icon: FiGrid },
  { href: "/volunteer/events", label: "Browse Events", icon: FiCalendar },
  {
    href: "/volunteer/applications",
    label: "My Applications",
    icon: FiCheckSquare,
  },
  { href: "/volunteer/earnings", label: "My Earnings", icon: FiCreditCard },
  { href: "/volunteer/profile", label: "My Profile", icon: FiUser },
  { href: "/volunteer/settings", label: "Settings", icon: FiSettings },
];

function SidebarItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: IconType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all ${
        active
          ? "bg-white/10 text-white shadow-[0_0_20px_rgba(87,137,255,0.25)]"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export default function VolunteerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      } else {
        router.replace("/login");
      }
    }
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[280px] flex-col border-r border-white/10 bg-[#0d1117]/95 px-5 py-6 backdrop-blur-xl lg:flex">
        <div className="mb-10 flex items-center gap-3 px-2 pt-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#0d1117] shadow-[0_0_18px_rgba(96,165,250,0.55)]">
            <div className="text-center leading-[0.7]">
              <div>ENCORE</div>
              <div className="mt-1 text-[6px] tracking-[0.2em]">EVENTS</div>
            </div>
          </div>
          <div className="text-left leading-none">
            <div className="text-[18px] font-black tracking-[0.12em] text-white">
              ENCORE
            </div>
            <div className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-slate-300">
              EVENTS
            </div>
          </div>
        </div>

        <nav className="mt-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/volunteer" && pathname.startsWith(link.href));

            return (
              <SidebarItem
                key={link.href}
                href={link.href}
                label={link.label}
                icon={Icon}
                active={isActive}
              />
            );
          })}
        </nav>

        <div className="mt-auto rounded-[22px] border border-[#86b3ff]/30 bg-gradient-to-br from-[#dcecff]/20 via-[#cee7ff]/10 to-[#f0d6bb]/10 p-4 text-white shadow-[0_20px_60px_rgba(37,99,235,0.2)]">
          <div className="text-[28px] font-black leading-none text-white">
            Make every
            <br />
            event amazing!
          </div>
          <p className="mt-4 text-sm text-slate-200/80">
            Your time. Your effort.
            <br />
            Real impact.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
        >
          <FiLogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      {!open && (
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-40 inline-flex items-center justify-center rounded-md bg-white/10 p-2 text-white shadow-lg backdrop-blur lg:hidden"
        >
          <FiMenu className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-50 h-full w-72 overflow-y-auto border-r border-white/10 bg-[#0d1117]/95 px-5 py-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[9px] font-black text-[#0d1117]">
                  ENCORE
                </div>
                <div className="text-left leading-none">
                  <div className="text-[16px] font-black tracking-[0.12em] text-white">
                    ENCORE
                  </div>
                  <div className="mt-1 text-[8px] font-semibold tracking-[0.2em] text-slate-300">
                    EVENTS
                  </div>
                </div>
              </div>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-md bg-white/5 p-2 text-white"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/volunteer" &&
                    pathname.startsWith(link.href));

                return (
                  <SidebarItem
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    icon={Icon}
                    active={isActive}
                  />
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                handleSignOut();
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-200"
            >
              <FiLogOut className="h-4 w-4" />
              Logout
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
