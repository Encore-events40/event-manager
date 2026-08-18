"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";

interface ExperienceEvent {
  id: string;
  title: string;
  image: string;
  date: string;
  photoCount: number;
}

export default function ExperienceBoardPage() {
  const [events, setEvents] = useState<ExperienceEvent[]>([
    {
      id: "1",
      title: "Riverside Music Fest '25",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
      date: "12 Jul 2025",
      photoCount: 6,
    },
    {
      id: "2",
      title: "Charity Run 5K",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
      date: "15 Jul 2025",
      photoCount: 6,
    },
    {
      id: "3",
      title: "Tech Founders Meetup",
      image: "https://images.unsplash.com/photo-1540575467063-178f50002cbc?w=400&h=300&fit=crop",
      date: "12 Jul 2025",
      photoCount: 6,
    },
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-500">Admin's HQ</span>
          <span className="text-gray-400">/</span>
          <span className="text-sm font-semibold text-gray-700">Experience Board</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Experience Board</h1>
        <p className="text-gray-500">Visible to everyone, including logged-out visitors.</p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
          >
            {/* Event Image */}
            <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Event Details */}
            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2">
                {event.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{event.date}</span>
                <span>· {event.photoCount} photos</span>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Entry Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center min-h-80 cursor-pointer group">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-300 text-white flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-400 transition-colors">
              <FiPlus className="w-8 h-8" />
            </div>
            <p className="text-gray-600 font-medium">Add New Entry</p>
          </div>
        </div>
      </div>
    </div>
  );
}
