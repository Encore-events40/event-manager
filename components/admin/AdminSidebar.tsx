"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiCalendar,
  FiCreditCard,
  FiGrid,
  FiLogOut,
  FiMessageSquare,
  FiSettings,
  FiUser,
  FiUsers,
  FiMenu,
  FiX,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { createClient } from "@/lib/supabase/client";

const manageLinks = [
  { href: "/admin", label: "Dashboard", icon: FiGrid },
  { href: "/admin/events", label: "Events", icon: FiCalendar },
  { href: "/admin/applications", label: "Applications", icon: FiGrid },
  { href: "/admin/payouts", label: "Payouts", icon: FiCreditCard },
  {
    href: "/admin/experience-board",
    label: "Experience Board",
    icon: FiMessageSquare,
  },
  { href: "/admin/brand-enquiries", label: "Brand Enquiries", icon: FiUsers },
];

const accountLinks = [
  { href: "/admin/settings", label: "Settings", icon: FiSettings },
  { href: "/admin/profile", label: "View Profile", icon: FiUser },
];

function SidebarLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: IconType;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`flex h-12 items-center gap-4 px-6 text-[15px] font-bold transition ${
        active ? "text-black" : "text-[#111111] hover:text-[#8B35E3]"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0 text-[#8a8099]" />
      <span>{label}</span>
    </Link>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

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
      <aside className="fixed inset-y-0 left-0 hidden w-[294px] flex-col overflow-hidden rounded-r-[28px] border border-[#D3D1D1] bg-[#ECEAEA] shadow-[1px_0_4px_rgba(0,0,0,0.06)] lg:flex">
        <div className="px-9 pt-16">
          <Link href="/admin" className="block w-max text-center leading-none">
            <span className="block text-[32px] font-black tracking-[0.04em] text-[#8B35E3]">
              ENCORE
            </span>
            <span className="mt-2 block text-[28px] font-black tracking-[0.03em] text-black">
              EVENTS
            </span>
          </Link>
        </div>

        <nav className="mt-16">
          <h2 className="mb-12 px-9 text-[22px] font-black tracking-wide text-black">
            MANAGE
          </h2>
          <div className="space-y-5">
            {manageLinks.map((link) => (
              <SidebarLink key={link.href} {...link} />
            ))}
          </div>
        </nav>

        <div className="mt-auto border-t-[6px] border-white/80 py-9">
          <div className="space-y-5">
            {accountLinks.map((link) => (
              <SidebarLink key={link.href} {...link} />
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#0f172a] px-4 text-[15px] font-bold text-white shadow-[0_8px_25px_rgba(15,23,42,0.28)] transition hover:bg-[#111827]"
            >
              <FiLogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {!open && (
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-40 inline-flex items-center justify-center rounded-md bg-white p-2 shadow lg:hidden"
        >
          <FiMenu className="h-6 w-6 text-[#8B35E3]" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <aside className="relative z-50 h-full w-72 flex-col overflow-auto rounded-r-2xl border border-[#D3D1D1] bg-[#ECEAEA] shadow-[1px_0_4px_rgba(0,0,0,0.06)]">
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between">
                <Link
                  href="/admin"
                  className="block w-max text-center leading-none"
                >
                  <span className="block text-[24px] font-black tracking-[0.04em] text-[#8B35E3]">
                    ENCORE
                  </span>
                  <span className="mt-1 block text-[20px] font-black tracking-[0.03em] text-black">
                    EVENTS
                  </span>
                </Link>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-md bg-white p-2 shadow"
                >
                  <FiX className="h-5 w-5 text-[#8B35E3]" />
                </button>
              </div>
            </div>

            <nav className="mt-8 px-6">
              <h2 className="mb-6 text-[18px] font-black tracking-wide text-black">
                MANAGE
              </h2>
              <div className="space-y-4">
                {manageLinks.map((link) => (
                  <SidebarLink key={link.href} {...link} />
                ))}
              </div>
            </nav>

            <div className="mt-auto border-t-[6px] border-white/80 py-6 px-6">
              <div className="space-y-4">
                {accountLinks.map((link) => (
                  <SidebarLink key={link.href} {...link} />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleSignOut();
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-[#0f172a] px-4 py-3 text-[15px] font-bold text-white shadow-[0_8px_25px_rgba(15,23,42,0.28)] transition hover:bg-[#111827]"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
