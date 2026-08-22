"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Toast from "@/components/admin/Toast";

interface BrandEnquiry {
  id: string;
  company: string;
  contact: string;
  email: string | null;
  summary: string | null;
  status: "new" | "in_progress" | "resolved";
  created_at: string;
}

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
] as const;

function statusClass(status: BrandEnquiry["status"]) {
  if (status === "new")
    return "border-[#FFD486] bg-[#FFF4D7] text-[#FF9F1C]";
  if (status === "in_progress")
    return "border-[#D45EE7] bg-[#EDB6F1] text-[#8A167B]";
  return "border-[#86D781] bg-[#CFF3C8] text-[#1D8F2C]";
}

function statusLabel(status: BrandEnquiry["status"]) {
  if (status === "new") return "New";
  if (status === "in_progress") return "In Progress";
  return "Resolved";
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function BrandEnquiriesContent() {
  const [items, setItems] = useState<BrandEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<(typeof STATUS_TABS)[number]["value"]>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/brand-enquiries?pageSize=50");
      const data = await res.json();
      if (data.success) {
        setItems(data.items ?? []);
      } else {
        setError(data.message || "Failed to load brand enquiries.");
      }
    } catch {
      setError("Network error loading brand enquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  async function updateStatus(
    id: string,
    status: BrandEnquiry["status"]
  ) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/brand-enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`Enquiry marked as ${statusLabel(status)}.`);
        fetchEnquiries();
      } else {
        setToastMessage(data.message || "Failed to update status.");
      }
    } catch {
      setToastMessage("Network error updating enquiry.");
    } finally {
      setUpdatingId(null);
    }
  }

  const visibleItems =
    activeTab === "all"
      ? items
      : items.filter((item) => item.status === activeTab);

  const counts = {
    all: items.length,
    new: items.filter((i) => i.status === "new").length,
    in_progress: items.filter((i) => i.status === "in_progress").length,
    resolved: items.filter((i) => i.status === "resolved").length,
  };

  return (
    <section className="mx-auto max-w-[1468px]">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      <div>
        <p className="text-[24px] font-medium tracking-wide text-[#77727A]">
          Admin&apos;s HQ <span className="font-bold">/ Brand Enquiries</span>
        </p>
        <h1 className="mt-6 text-[34px] font-black leading-tight text-[#7D7189]">
          Public contact form submissions
        </h1>
      </div>

      {/* Status tabs */}
      <div className="mt-16 flex flex-wrap gap-5">
        {STATUS_TABS.map((tab) => (
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

      <div className="mt-14 overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Table header */}
          <div className="grid h-[79px] grid-cols-[1.2fr_1.1fr_1fr_1fr_0.9fr_1.1fr] items-center rounded-[12px] bg-white px-6 text-[19px] font-black text-[#A7A0A0]">
            <span>Company</span>
            <span>Contact</span>
            <span>Email</span>
            <span>Summary</span>
            <span>Status</span>
            <span />
          </div>

          {/* Rows */}
          <div className="mt-3 space-y-3">
            {loading ? (
              <div className="rounded-[12px] bg-white px-10 py-10 text-center text-[#81768C]">
                Loading enquiries...
              </div>
            ) : error ? (
              <div className="rounded-[12px] bg-white px-10 py-10 text-center text-red-500">
                {error}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="rounded-[12px] bg-white px-10 py-12 text-center">
                <div className="text-4xl mb-3">📬</div>
                <p className="text-[#81768C] font-semibold text-lg">
                  No enquiries yet
                </p>
                <p className="mt-1 text-sm text-[#A7A0A0]">
                  Brand enquiries submitted via the contact form will appear here.
                </p>
              </div>
            ) : (
              visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="grid min-h-[77px] grid-cols-[1.2fr_1.1fr_1fr_1fr_0.9fr_1.1fr] items-center rounded-[12px] bg-white px-5 text-[17px] text-[#777078]"
                >
                  <div className="leading-tight">
                    <p className="font-black text-[#71809B]">{item.company}</p>
                    <p className="text-xs text-[#A7A0A0] mt-0.5">
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  <p className="font-bold text-[#71809B]">{item.contact}</p>

                  <p className="font-medium text-[#777078] text-sm truncate pr-2">
                    {item.email ?? (
                      <span className="text-[#C9C3C5]">—</span>
                    )}
                  </p>

                  <p className="font-medium text-[#777078] text-sm truncate pr-2">
                    {item.summary ?? (
                      <span className="text-[#C9C3C5]">—</span>
                    )}
                  </p>

                  <span
                    className={`w-max rounded-[16px] border px-4 py-2 font-mono text-[14px] font-black tracking-wide ${statusClass(
                      item.status
                    )}`}
                  >
                    {statusLabel(item.status)}
                  </span>

                  <div className="flex justify-end gap-5 pr-2 text-[16px] font-bold text-[#777078]">
                    {item.status !== "resolved" && (
                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={() => updateStatus(item.id, "resolved")}
                        className="hover:text-[#1D8F2C] transition disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    )}
                    {item.status === "new" && (
                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={() => updateStatus(item.id, "in_progress")}
                        className="hover:text-[#8A167B] transition disabled:opacity-50"
                      >
                        In Progress
                      </button>
                    )}
                    {item.status === "resolved" && (
                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={() => updateStatus(item.id, "new")}
                        className="hover:text-[#FF9F1C] transition disabled:opacity-50"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BrandEnquiriesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-[#81768C]">
          Loading brand enquiries...
        </div>
      }
    >
      <BrandEnquiriesContent />
    </Suspense>
  );
}
