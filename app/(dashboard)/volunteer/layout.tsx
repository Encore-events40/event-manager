import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";

export default function VolunteerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030b17] text-white">
      <VolunteerSidebar />
      <main className="min-h-screen px-4 pb-10 pt-6 lg:ml-[280px] lg:px-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
