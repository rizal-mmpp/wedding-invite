import { useState, useEffect, useRef } from "react";
import type { WeddingData } from "@/types/wedding";

interface FloatingButtonsProps {
  data: WeddingData;
  isPlaying: boolean;
  isAutoScrolling: boolean;
  onToggleMusic: () => void;
  onToggleAutoScroll: () => void;
}

export default function FloatingButtons({
  data,
  isPlaying,
  isAutoScrolling,
  onToggleMusic,
  onToggleAutoScroll,
}: FloatingButtonsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Auto Scroll Button */}
      <button
        onClick={onToggleAutoScroll}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isAutoScrolling
            ? "bg-wedding-gold text-white"
            : "bg-white/90 text-wedding-gold border border-wedding-gold/30"
        }`}
        aria-label={isAutoScrolling ? "Stop auto scroll" : "Start auto scroll"}
        title={isAutoScrolling ? "Stop auto scroll" : "Start auto scroll"}
      >
        {isAutoScrolling ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        )}
      </button>

      {/* Music Button */}
      <button
        onClick={onToggleMusic}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isPlaying
            ? "bg-wedding-gold text-white"
            : "bg-white/90 text-wedding-gold border border-wedding-gold/30"
        }`}
        aria-label={isPlaying ? "Pause music" : "Play music"}
        title={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
