"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Toast from "@/components/admin/Toast";

interface ApplicationRecord {
  id: string;
  status: "pending" | "approved" | "rejected";
  applied_at: string;
  events: {
    id: string;
    title: string;
    date: string;
    location?: string;
    volunteer_pay?: number | null;
  } | null;
  applicant: {
    id: string;
    full_name: string | null;
    email: string;
    role: "volunteer" | "influencer";
  } | null;
}

const tabs = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

function statusBadge(status: ApplicationRecord["status"]) {
  if (status === "approved") return "border-[#86D781] bg-[#CFF3C8] text-[#1D8F2C]";
  if (status === "rejected") return "border-[#D45EE7] bg-[#EDB6F1] text-[#8A167B]";
  return "border-[#FFD486] bg-[#FFF4D7] text-[#FF9F1C]";
}

function formatPay(value?: number | null) {
  if (typeof value !== "number") return "₹400";
  return `₹${value}`;
}

function ApplicationsContent() {
  const [items, setItems] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["value"]>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/applications?pageSize=50");
      const data = await res.json();

      if (data.success) {
        setItems(data.items || []);
      } else {
        setError(data.message || "Failed to load applications.");
      }
    } catch {
      setError("Network error loading applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchApplications);
  }, [fetchApplications]);

  const counts = useMemo(
    () => ({
      all: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      rejected: items.filter((item) => item.status === "rejected").length,
    }),
    [items]
  );

  const visibleItems = useMemo(() => {
    if (activeTab === "all") return items;
    return items.filter((item) => item.status === activeTab);
  }, [activeTab, items]);

  async function updateStatus(item: ApplicationRecord, status: "approved" | "rejected") {
    try {
      const res = await fetch(`/api/admin/applications/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (data.success) {
        setToastMessage(`Application ${status}.`);
        fetchApplications();
      } else {
        setToastMessage(data.message || "Failed to update application.");
      }
    } catch {
      setToastMessage("Network error updating application.");
    }
  }

  return (
    <section className="mx-auto max-w-[1480px]">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      <div className="ml-2">
        <p className="text-[24px] font-medium tracking-wide text-[#77727A]">
          Admin&apos;s HQ <span className="font-bold">/ Applications</span>
        </p>
        <h1 className="mt-6 text-[34px] font-black leading-tight text-[#7D7189]">
          Volunteer &amp; influencer applications
        </h1>
      </div>

      <div className="mt-20 flex flex-wrap gap-7">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`h-[52px] rounded-[20px] border px-5 text-[18px] font-black text-[#81768C] transition ${
              activeTab === tab.value
                ? "border-[#DED1D1] bg-white"
                : "border-[#DED1D1] bg-transparent hover:bg-white"
            }`}
          >
            {tab.label} ({counts[tab.value]})
          </button>
        ))}
      </div>

      <div className="mt-14 w-full overflow-x-auto">
        <div className="min-w-[1020px]">
          <div className="grid h-[76px] grid-cols-[1.25fr_1.05fr_1fr_0.8fr_1.15fr] items-center rounded-[12px] bg-white px-10 text-[19px] font-black text-[#A7A0A0]">
            <span>Applicant</span>
            <span>Event</span>
            <span>Applied</span>
            <span>Status</span>
            <span />
          </div>

          <div className="mt-3 space-y-3">
            {loading ? (
              <div className="rounded-[12px] bg-white px-10 py-8 text-center text-[#81768C]">
                Loading applications...
              </div>
            ) : error ? (
              <div className="rounded-[12px] bg-white px-10 py-8 text-center text-red-500">
                {error}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="rounded-[12px] bg-white px-10 py-8 text-center text-[#81768C]">
                No applications found.
              </div>
            ) : (
              visibleItems.map((item) => {
                const applicantName = item.applicant?.full_name || item.applicant?.email || "Unknown";
                const role = item.applicant?.role || "volunteer";

                return (
                  <div
                    key={item.id}
                    className="grid min-h-[77px] grid-cols-[1.25fr_1.05fr_1fr_0.8fr_1.15fr] items-center rounded-[12px] bg-white px-9 text-[17px] text-[#777078]"
                  >
                    <div className="leading-tight">
                      <p className="font-black text-[#71809B]">{applicantName}</p>
                      <p className="font-medium capitalize text-[#696469]">{role}</p>
                    </div>

                    <p className="font-bold text-[#71809B]">
                      {item.events?.title || "Charity Run 5K"}
                    </p>

                    <p className="font-bold text-[#71809B]">{formatPay(item.events?.volunteer_pay)}</p>

                    <span
                      className={`w-max rounded-[16px] border px-4 py-2 font-mono text-[16px] font-black capitalize tracking-wide ${statusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                    <div className="flex justify-end gap-8 pr-2 text-[17px] font-bold text-[#777078]">
                      {item.status === "approved" ? (
                        <button type="button">View</button>
                      ) : (
                        <>
                          <button type="button" onClick={() => updateStatus(item, "approved")}>
                            Approve
                          </button>
                          <button type="button" onClick={() => updateStatus(item, "rejected")}>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#81768C]">Loading applications...</div>}>
      <ApplicationsContent />
    </Suspense>
  );
}
