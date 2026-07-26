import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F4F3]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-3 group">
              <span className="text-2xl">⚡</span>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-[#7C9BD2] transition">
                  Admin Control Centre
                </h1>
                <span className="inline-block bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                  ADMIN
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/admin"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/events"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              >
                Events
              </Link>
              <Link
                href="/admin/applications"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              >
                Applications
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}
