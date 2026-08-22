import Link from "next/link";
import { FiPlus } from "react-icons/fi";

const entries = [
  {
    title: "Riverside Music Fest '25",
    date: "12 Jul 2025",
    photos: 6,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Charity Run 5K",
    date: "15 Jul 2025",
    photos: 6,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Tech Founders Meetup",
    date: "12 Jul 2025",
    photos: 6,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85",
  },
];

export default function ExperienceBoardPage() {
  return (
    <section className="mx-auto max-w-[1120px]">
      <header className="mb-14 sm:mb-16">
        <p className="text-sm text-[#8B858C] sm:text-base">
          Admin&apos;s HQ / <span className="font-bold">Experience Board</span>
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#81778B] sm:text-3xl">
          Experience Board
        </h1>
        <p className="mt-1 text-sm font-medium text-[#B9A5BE] sm:text-base">
          Visible to everyone, including logged-out visitors.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map((entry) => (
          <article
            key={entry.title}
            className="rounded-lg border border-[#DDD7DC] bg-[#FCFBFB] p-3 shadow-[0_1px_2px_rgba(80,60,80,0.03)]"
          >
            <div
              role="img"
              aria-label={entry.title}
              className="aspect-[1.8] w-full rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${entry.image})` }}
            />
            <h2 className="mt-3 truncate text-base font-bold text-[#8B8091] sm:text-lg">
              {entry.title}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-[#B7AAB8]">
              {entry.date} · {entry.photos} photos
            </p>
          </article>
        ))}

        <Link
          href="/admin/events/new"
          className="flex min-h-[178px] flex-col items-center justify-center rounded-lg border border-[#DDD7DC] bg-[#FCFBFB] p-4 text-center transition hover:border-[#8B35E3] hover:bg-white"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8B8091] text-white">
            <FiPlus className="h-7 w-7" aria-hidden="true" />
          </span>
          <span className="mt-3 text-lg font-bold text-[#8B8091] sm:text-xl">
            Add New Entry
          </span>
        </Link>
      </div>
    </section>
  );
}