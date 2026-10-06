"use client";

import { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiCalendar,
  FiMapPin,
  FiTrendingUp,
  FiLoader,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";

interface EventInfo {
  id: string;
  title: string;
  date: string;
  location: string | null;
}

interface PayoutItem {
  id: string;
  amount: number;
  paid_on: string | null;
  created_at: string;
  notes: string | null;
  events: EventInfo | null;
}

interface MonthBucket {
  key: string;
  label: string;
  value: number;
}

interface EarningsData {
  payouts: PayoutItem[];
  totalEarned: number;
  monthly: MonthBucket[];
  eventsWorked: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function MyEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/volunteer/earnings");
        const json = await res.json();
        if (!json.success) {
          setError(json.message || "Failed to load earnings.");
          return;
        }
        setData(json);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    void fetchEarnings();
  }, []);

  const maxMonthlyValue = Math.max(
    ...(data?.monthly.map((m) => m.value) ?? [0]),
    1
  );

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <span>Volunteer Dashboard</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">My Earnings</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">
          My Earnings
        </h1>
        <p className="mt-2 text-slate-400">
          Track your payouts and earnings history.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-[22px] border border-white/10 bg-white/5"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-[22px] border border-white/10 bg-white/5" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-[22px] border border-white/10 bg-white/5"
              />
            ))}
          </div>
        </div>
      ) : !data ? null : (
        <>
          {/* Stat Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Total Earned",
                value: formatCurrency(data.totalEarned),
                icon: FiDollarSign,
                gradient: "from-[#059669]/20 to-[#064e3b]/30",
                iconColor: "text-emerald-400",
                iconBg: "bg-emerald-500/20",
              },
              {
                label: "Events Worked",
                value: String(data.eventsWorked),
                icon: FiCalendar,
                gradient: "from-[#1e40af]/20 to-[#1e3a8a]/30",
                iconColor: "text-blue-400",
                iconBg: "bg-blue-500/20",
              },
              {
                label: "Total Payouts",
                value: String(data.payouts.length),
                icon: FiTrendingUp,
                gradient: "from-[#7c3aed]/20 to-[#4c1d95]/30",
                iconColor: "text-violet-400",
                iconBg: "bg-violet-500/20",
              },
            ].map(({ label, value, icon: Icon, gradient, iconColor, iconBg }) => (
              <div
                key={label}
                className={`rounded-[22px] border border-white/10 bg-gradient-to-br ${gradient} p-5 backdrop-blur-xl`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-black text-white">{value}</div>
                    <div className="mt-1 text-sm font-medium text-slate-400">
                      {label}
                    </div>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Bar Chart */}
          <div className="mb-6 rounded-[22px] border border-white/10 bg-[rgba(89,103,123,0.22)] p-5 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-bold text-white">
              Earnings by Month
            </h2>
            {data.monthly.every((m) => m.value === 0) ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No earnings recorded yet.
              </p>
            ) : (
              <div className="flex h-48 items-end gap-3">
                {data.monthly.map((bucket) => {
                  const heightPct = Math.max(
                    4,
                    Math.round((bucket.value / maxMonthlyValue) * 100)
                  );
                  return (
                    <div
                      key={bucket.key}
                      className="group flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="relative w-full overflow-hidden rounded-t-lg bg-gradient-to-t from-[#3b82f6] to-[#6366f1] transition-all duration-500"
                        style={{ height: `${heightPct}%` }}
                      >
                        {/* Tooltip on hover */}
                        {bucket.value > 0 && (
                          <div className="absolute inset-x-0 top-0 hidden -translate-y-full pb-1 text-center group-hover:block">
                            <span className="rounded-md bg-[#1e293b] px-2 py-1 text-xs font-bold text-white shadow">
                              {formatCurrency(bucket.value)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {bucket.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payouts List */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-white">
              Payout History
            </h2>
            {data.payouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[22px] border border-white/10 bg-white/5 py-20 text-center">
                <FiFileText className="mb-4 h-12 w-12 text-slate-500" />
                <h3 className="text-lg font-semibold text-slate-300">
                  No payouts yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Your payouts will appear here once processed by the admin.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between rounded-[18px] border border-white/10 bg-[rgba(89,103,123,0.22)] px-5 py-4 backdrop-blur-xl transition hover:border-white/20"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-white">
                        {payout.events?.title ?? "Event"}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                        {payout.events?.date && (
                          <span className="flex items-center gap-1">
                            <FiCalendar className="h-3.5 w-3.5" />
                            {formatDate(payout.events.date)}
                          </span>
                        )}
                        {payout.events?.location && (
                          <span className="flex items-center gap-1">
                            <FiMapPin className="h-3.5 w-3.5" />
                            {payout.events.location}
                          </span>
                        )}
                        {payout.paid_on && (
                          <span>
                            Paid {formatDate(payout.paid_on)}
                          </span>
                        )}
                      </div>
                      {payout.notes && (
                        <p className="mt-1 text-xs italic text-slate-500">
                          {payout.notes}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 shrink-0 text-right">
                      <div className="text-lg font-black text-emerald-300">
                        {formatCurrency(payout.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10">
          <FiLoader className="h-6 w-6 animate-spin text-[#7cc6ff]" />
        </div>
      )}
    </div>
  );
}
