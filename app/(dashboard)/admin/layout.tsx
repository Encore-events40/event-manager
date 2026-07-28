import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#171717]">
      <AdminSidebar />
      <main className="min-h-screen px-5 py-10 lg:ml-[294px] lg:px-10 lg:py-20">
        {children}
      </main>
    </div>
  );
}
