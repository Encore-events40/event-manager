"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "success", onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bg =
    type === "error"
      ? "bg-red-600 text-white"
      : type === "info"
      ? "bg-blue-600 text-white"
      : "bg-emerald-600 text-white";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-200 text-sm font-medium">
      <div className={`${bg} px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 border border-white/10`}>
        <span>{type === "error" ? "⚠️" : type === "info" ? "ℹ️" : "✓"}</span>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-3 text-white/80 hover:text-white text-xs font-bold leading-none"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
