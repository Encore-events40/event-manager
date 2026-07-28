"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiCalendar,
  FiCreditCard,
  FiGrid,
  FiMessageSquare,
  FiSettings,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import type { IconType } from "react-icons";

const manageLinks = [
  { href: "/admin", label: "Dashboard", icon: FiGrid },
  { href: "/admin/events", label: "Events", icon: FiCalendar },
  { href: "/admin/applications", label: "Applications", icon: FiGrid },
  { href: "/admin/payouts", label: "Payouts", icon: FiCreditCard },
  { href: "/admin/experience-board", label: "Experience Board", icon: FiMessageSquare },
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
  return (
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
        <h2 className="mb-12 px-9 text-[22px] font-black tracking-wide text-black">MANAGE</h2>
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
        </div>
      </div>
    </aside>
  );
}
