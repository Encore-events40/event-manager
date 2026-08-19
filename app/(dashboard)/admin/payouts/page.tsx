"use client";

import { useState } from "react";
import { FiDollarSign, FiUsers, FiClipboard } from "react-icons/fi";

interface PayoutRecord {
  id: string;
  volunteerName: string;
  eventName: string;
  amount: number;
}

export default function PayoutsPage() {
  const [formData, setFormData] = useState({
    volunteerName: "",
    amount: "",
    notes: "",
    additionalAmount: "",
  });

  const [payouts, setPayouts] = useState<PayoutRecord[]>([
    {
      id: "1",
      volunteerName: "Priya Nair",
      eventName: "Riverside Music Fest",
      amount: 7.0,
    },
    {
      id: "2",
      volunteerName: "Kabir Singh",
      eventName: "Riverside Music Fest",
      amount: 6.0,
    },
    {
      id: "3",
      volunteerName: "Priya Nair",
      eventName: "Riverside Music Fest",
      amount: 7.0,
    },
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecordPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.volunteerName && formData.amount) {
      const newPayout: PayoutRecord = {
        id: Date.now().toString(),
        volunteerName: formData.volunteerName,
        eventName: "Event Name",
        amount: parseFloat(formData.amount),
      };
      setPayouts([newPayout, ...payouts]);
      setFormData({
        volunteerName: "",
        amount: "",
        notes: "",
        additionalAmount: "",
      });
    }
  };

  const totalPaid = payouts.reduce((sum, payout) => sum + payout.amount, 0);
  const volunteersPaid = new Set(payouts.map((p) => p.volunteerName)).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-500">
            Admin's HQ
          </span>
          <span className="text-gray-400">/</span>
          <span className="text-sm font-semibold text-gray-700">Payouts</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Payouts</h1>
        <p className="text-gray-500 max-w-2xl">
          Payments happen outside the platform. Record what's been paid
          volunteer totals update automatically.
        </p>
      </div>

      {/* Stats Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">
              Payout by Months
            </h2>
          </div>

          {/* Histogram */}
          <div className="flex items-end justify-center gap-4 h-64">
            {[
              { month: "J", value: 8 },
              { month: "F", value: 10 },
              { month: "M", value: 18 },
              { month: "A", value: 15 },
            ].map((item) => (
              <div
                key={item.month}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex items-end gap-2">
                  <div
                    className="w-12 bg-cyan-500 rounded-sm transition-all hover:bg-cyan-600"
                    style={{ height: `${item.value * 8}px` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {item.month}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-semibold text-gray-500">
              Payout by Months
            </p>
          </div>
        </div>

        {/* Stats Cards Column */}
        <div className="space-y-4">
          {/* Total Paid */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Total Paid
                </p>
                <p className="text-2xl font-black text-gray-900">
                  ₹
                  {totalPaid.toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ↑ 12% vs last This Month
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Volunteers Paid */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Volunteers Paid
                </p>
                <p className="text-2xl font-black text-gray-900">
                  {volunteersPaid}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <FiUsers className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Pending Applications */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Pending Applications
                </p>
                <p className="text-2xl font-black text-gray-900">3</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <FiClipboard className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record a Payout Form */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-black text-gray-900 mb-6">
          Record a payout
        </h2>

        <form onSubmit={handleRecordPayout} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Volunteer Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Volunteer
              </label>
              <input
                type="text"
                name="volunteerName"
                value={formData.volunteerName}
                onChange={handleInputChange}
                placeholder="Volunteer's name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Total Amount"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Type here"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition resize-none"
              />
            </div>

            {/* Additional Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                name="additionalAmount"
                value={formData.additionalAmount}
                onChange={handleInputChange}
                placeholder="Total Amount"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Record Payout
          </button>
        </form>
      </div>

      {/* Payouts List */}
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-4">
          Recent Payouts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
            >
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {payout.volunteerName}
              </p>
              <p className="text-xs text-gray-500 mb-3">{payout.eventName}</p>
              <p className="text-lg font-black text-gray-900">
                ₹{payout.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
