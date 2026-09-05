import { FiEdit3, FiMapPin, FiMail, FiPhone, FiUser } from "react-icons/fi";

const profileFields = [
  { label: "Full Name", value: "Ananya Sharma" },
  { label: "Email Address", value: "AnanyaSharma@gmail.com" },
  { label: "Phone Number", value: "996332255" },
  { label: "Location", value: "Delhi, India" },
  { label: "Skills", value: "Photoshop, Illustrator, Indesign, Canva" },
];

export default function VolunteerProfilePage() {
  return (
    <div className="relative overflow-hidden px-2 py-6 lg:px-6">
      <div className="mx-auto max-w-[1070px]">
        <h1 className="text-4xl font-bold tracking-tight text-[#7cc6ff]">My Profile</h1>
        <p className="mt-1 text-lg text-slate-300">Volunteer</p>

        <div className="mt-8 rounded-[26px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f4b8a0] via-[#c96f77] to-[#733b66] text-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                A
              </div>
              <div>
                <div className="text-3xl font-semibold text-white">Ananya Sharma</div>
                <div className="text-base text-slate-300">Volunteer</div>
              </div>
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5">
              <FiEdit3 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-[26px] border border-white/10 bg-[#1a2433]/80 p-6 shadow-[0_18px_60px_rgba(2,6,23,0.5)]">
          <div className="mb-6 text-2xl font-semibold text-white">Personal Details</div>

          <div className="space-y-4">
            {profileFields.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-1 gap-2 border-b border-white/8 py-3 text-base md:grid-cols-[220px_1fr]"
              >
                <div className="font-medium text-slate-300">{item.label}</div>
                <div className="text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
