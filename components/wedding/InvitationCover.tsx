import { useState } from "react";
import Image from "next/image";
import type { WeddingData } from "@/types/wedding";

interface InvitationCoverProps {
  data: WeddingData;
  guestName?: string;
  lang: "id" | "en";
  onOpen: () => void;
  onImageLoad?: () => void;
}

export default function InvitationCover({
  data,
  guestName = "Nama Tamu",
  lang,
  onOpen,
  onImageLoad,
}: InvitationCoverProps) {
  const [isOpening, setIsOpening] = useState(false);
  const isEn = lang === "en";

  const handleOpenInvitation = () => {
    setIsOpening(true);
    // Wait for animation to complete before calling onOpen
    setTimeout(() => {
      onOpen();
    }, 800);
  };

  return (
    <div
      className={`invitation-cover fixed inset-0 z-[100] flex flex-col items-center justify-between transition-transform duration-700 ease-in-out py-16 ${
        isOpening ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Background Image */}
      <div className="absolute inset-0  z-0">
        <Image
          src="/assets/cover.jpg"
          alt="Wedding Cover"
          fill
          className="object-cover object-center"
          priority
          onLoad={onImageLoad}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-12 px-6">
        {/* Top Section - Title */}
        <div className="text-center mt-8">
          <p className="text-white/90 text-sm tracking-[0.3em] uppercase mb-2 font-light">
            {isEn ? "The Wedding of" : "Pernikahan"}
          </p>
          <h1 className="font-script text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-lg">
            {data.couple.groom.name} & {data.couple.bride.name}
          </h1>
        </div>

        {/* Bottom Section - Guest Info & Button */}
        <div className="text-center mb-8">
          <p className="text-white/80 text-sm mb-1">
            {isEn ? "Dear" : "Kepada Yth."}
          </p>
          <p className="text-white/80 text-sm mb-2">
            {isEn ? "Mr./Mrs./Family" : "Bapak/Ibu/ Saudara/i"}
          </p>
          <h2 className="font-script text-2xl md:text-3xl text-white mb-6">
            {guestName}
          </h2>

          <button
            onClick={handleOpenInvitation}
            className="group flex items-center gap-2 mx-auto px-6 py-3 bg-wedding-gold/90 hover:bg-wedding-gold text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 transition-transform group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm tracking-[0.2em] uppercase font-medium">
              {isEn ? "Open Invitation" : "Buka Undangan"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
