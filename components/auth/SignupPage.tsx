"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<
    "volunteer" | "influencer" | null
  >(null);

  return (
    <main className="min-h-screen bg-[#F6F4F3] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* LEFT PANEL */}
        <div className="hidden lg:block relative h-[500px] lg:h-[600px] rounded-2xl lg:rounded-[28px] overflow-hidden bg-[#12001E]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 40% 5%, #c100ff 0%, #6b00ff 30%, #2a0054 70%, #12001E 100%)",
            }}
          />

          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute bottom-8 lg:bottom-14 left-6 lg:left-12 right-6 lg:right-12">
            <h1 className="text-white text-3xl lg:text-5xl font-bold leading-tight">
              where events find
              <br />
              <span className="text-[#8EA7FF]">their people.</span>
            </h1>

            <p className="text-white/80 text-sm lg:text-xl leading-6 lg:leading-8 mt-4 lg:mt-6 max-w-md lg:max-w-lg">
              Apply to work events, promote what's coming up, or run the whole
              show one account, one role, one dashboard built for it.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full max-w-md lg:max-w-xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-black">
              Create your account
            </h2>

            <p className="text-gray-500 text-sm lg:text-lg mt-2">
              Choose how you'll show up at events.
            </p>
          </div>

          {/* Role Selection */}
          <div className="mt-4 lg:mt-5 grid grid-cols-2 gap-2 lg:gap-3">
            {/* Volunteer Option */}
            <button
              onClick={() => setSelectedRole("volunteer")}
              className={`p-2 lg:p-3 rounded-lg border-2 transition-all ${
                selectedRole === "volunteer"
                  ? "border-[#8B5CF6] bg-[#F3E8FF]"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              <div className="text-lg lg:text-2xl mb-0.5">🎯</div>
              <h3
                className={`text-xs lg:text-sm font-bold mb-0 ${selectedRole === "volunteer" ? "text-[#7C3AED]" : "text-gray-400"}`}
              >
                Volunteer
              </h3>
              <p className="text-[0.65rem] text-gray-500">Apply</p>
            </button>

            {/* Influencer Option */}
            <button
              onClick={() => setSelectedRole("influencer")}
              className={`p-2 lg:p-3 rounded-lg border-2 transition-all ${
                selectedRole === "influencer"
                  ? "border-[#8B5CF6] bg-[#F3E8FF]"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              <div className="text-lg lg:text-2xl mb-0.5">🌐</div>
              <h3
                className={`text-xs lg:text-sm font-bold mb-0 ${selectedRole === "influencer" ? "text-[#7C3AED]" : "text-gray-400"}`}
              >
                Influencer
              </h3>
              <p className="text-[0.65rem] text-gray-500">Grow</p>
            </button>
          </div>

          <form className="mt-5 lg:mt-6 space-y-4 lg:space-y-5">
            {/* Email Field */}
            <div>
              <label className="text-gray-600 text-sm lg:text-base font-semibold block mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your Email here"
                className="w-full h-12 lg:h-14 rounded-lg lg:rounded-xl border border-gray-300 px-4 text-sm lg:text-base outline-none focus:border-indigo-500"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="text-gray-600 text-sm lg:text-base font-semibold block mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your Password here"
                className="w-full h-12 lg:h-14 rounded-lg lg:rounded-xl border border-gray-300 px-4 text-sm lg:text-base outline-none focus:border-indigo-500"
              />
            </div>

            {/* Sign Up Button */}
            <button
              disabled={!selectedRole}
              className={`w-full h-12 lg:h-14 rounded-lg lg:rounded-xl transition text-white text-lg lg:text-xl font-bold ${
                selectedRole
                  ? "bg-[#7C9BD2] hover:bg-[#6888c3]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Sign up as {selectedRole || "..."}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />

              <span className="text-gray-500 text-xs lg:text-sm font-semibold">
                or
              </span>

              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              className="w-full h-11 lg:h-13 rounded-lg lg:rounded-xl bg-[#B8C8E6] hover:bg-[#A8BCDF] transition flex items-center justify-center gap-2 text-white text-xs lg:text-sm font-semibold"
            >
              <FcGoogle size={20} />
              continue with google
            </button>

            {/* Sign In Link */}
             <div className="text-center pt-1">
              <p className="text-gray-400 text-xs">
                Already have an account?
                <Link href="/login">
                  <span className="text-[#7697D5] font-semibold cursor-pointer ml-2">
                    Log in
                  </span>
                </Link>
              </p>
            </div>

            <p className="text-center text-[0.65rem] tracking-widest text-gray-300 uppercase">
              ADMIN ACCESS IS ISSUED DIRECTLY NOT SELF-SERVE
            </p>  
          </form>
        </div>
      </div>
    </main>
  );
}
