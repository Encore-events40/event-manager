"use client";

import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
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
              Welcome Back
            </h2>

            <p className="text-gray-500 text-sm lg:text-lg mt-2">
              Log in to reach your dashboard.
            </p>
          </div>

          <form action={login} className="mt-6 lg:mt-7 space-y-4 lg:space-y-5">
            <div>
              <label className="text-gray-600 text-sm lg:text-base font-semibold block mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                required
                placeholder="Enter your Email here"
                className="w-full h-12 lg:h-14 rounded-lg lg:rounded-xl border border-gray-300 bg-white px-4 text-black text-sm lg:text-base outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-gray-600 text-sm lg:text-base font-semibold block mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                required
                placeholder="Enter your Password here"
                className="w-full h-12 lg:h-14 rounded-lg lg:rounded-xl border border-gray-300 bg-white px-4 text-black text-sm lg:text-base outline-none focus:border-indigo-500"
              />
            </div>

            <button type="submit" className="w-full h-11 lg:h-13 rounded-lg lg:rounded-xl bg-[#7C9BD2] hover:bg-[#6888c3] transition text-white text-base lg:text-lg font-bold">
              Log in
            </button>

            {/* Divider */}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />

              <span className="text-gray-500 text-xs lg:text-sm font-semibold">
                or
              </span>

              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <button
              type="button"
              className="w-full h-11 lg:h-13 rounded-lg lg:rounded-xl bg-[#B8C8E6] hover:bg-[#A8BCDF] transition flex items-center justify-center gap-2 text-white text-xs lg:text-sm font-semibold"
            >
              <FcGoogle size={20} />
              continue with google
            </button>

            <div className="text-center pt-1">
              <p className="text-gray-400 text-xs">
                New here?
                <Link href="/signup">
                  <span className="text-[#7697D5] font-semibold cursor-pointer ml-2">
                    Create an account
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