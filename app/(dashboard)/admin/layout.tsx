import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F7F7] text-[#171717]">
      <AdminSidebar />
      <main className="min-h-screen px-4 py-8 lg:ml-[294px] lg:px-8 lg:py-12 xl:px-9">
        {children}
      </main>
    </div>
  );
}
