const enquiries = [
  {
    company: "Riverside Music Fest",
    contact: "Ayesha Rao",
    date: "02 Jul 2026",
    status: "In progress",
  },
  {
    company: "Tech Founders Meetup",
    contact: "Rohan Jha",
    date: "08 Jul 2026",
    status: "New",
  },
];

function statusClass(status: string) {
  if (status === "New") return "border-[#FFD486] bg-[#FFF4D7] text-[#FF9F1C]";
  return "border-[#D45EE7] bg-[#EDB6F1] text-[#8A167B]";
}

export default function BrandEnquiriesPage() {
  return (
    <section className="mx-auto max-w-[1468px]">
      <div>
        <p className="text-[24px] font-medium tracking-wide text-[#77727A]">
          Admin&apos;s HQ <span className="font-bold">/ Brand Enquiries</span>
        </p>
        <h1 className="mt-6 text-[34px] font-black leading-tight text-[#7D7189]">
          Public contact form submissions
        </h1>
      </div>

      <div className="mt-[128px] overflow-x-auto">
        <div className="min-w-[1020px]">
          <div className="grid h-[79px] grid-cols-[1.2fr_1.1fr_1fr_0.9fr_1fr] items-center rounded-[12px] bg-white px-6 text-[22px] font-black text-[#A7A0A0]">
            <span>Company</span>
            <span>Contact</span>
            <span>Date</span>
            <span>Status</span>
            <span />
          </div>

          <div className="mt-3 space-y-3">
            {enquiries.map((item) => (
              <div
                key={item.company}
                className="grid min-h-[77px] grid-cols-[1.2fr_1.1fr_1fr_0.9fr_1fr] items-center rounded-[12px] bg-white px-5 text-[18px] text-[#777078]"
              >
                <p className="font-black text-[#71809B]">{item.company}</p>
                <p className="font-bold text-[#71809B]">{item.contact}</p>
                <p className="font-bold text-[#71809B]">{item.date}</p>
                <span
                  className={`w-max rounded-[16px] border px-4 py-2 font-mono text-[16px] font-black tracking-wide ${statusClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
                <div className="flex justify-end gap-6 pr-2 text-[17px] font-bold text-[#777078]">
                  <button type="button">Resolve</button>
                  <button type="button">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
