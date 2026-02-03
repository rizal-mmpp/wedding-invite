import { useState, useEffect, useCallback } from "react";
import type { WeddingData } from "@/types/wedding";

interface FloatingButtonsProps {
  data: WeddingData;
  isPlaying: boolean;
  isAutoScrolling: boolean;
  onToggleMusic: () => void;
  onToggleAutoScroll: () => void;
  onScrollToSection: (sectionId: string) => void;
}

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function FloatingButtons({
  data,
  isPlaying,
  isAutoScrolling,
  onToggleMusic,
  onToggleAutoScroll,
  onScrollToSection,
}: FloatingButtonsProps) {
  const [activeSection, setActiveSection] = useState<string>("hero");

  // Define all sections with their icons
  const sections: Section[] = [
    {
      id: "hero",
      label: "Home",
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "couple",
      label: "Couple",
      icon: (
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      id: "events",
      label: "Events",
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "rsvp",
      label: "RSVP",
      icon: (
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "gallery",
      label: "Gallery",
      icon: (
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "gifts",
      label: "Gifts",
      icon: (
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
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
    },
  ];

  // Track active section based on scroll position
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    // Find the current active section
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i].id);
      if (section) {
        const sectionTop = section.offsetTop;
        if (scrollPosition >= sectionTop) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    }
  }, [sections]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-wedding-gold/20 shadow-lg">
        <div className="flex justify-around items-center py-2 px-2 max-w-lg mx-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onScrollToSection(section.id)}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all duration-300 min-w-[50px] ${
                activeSection === section.id
                  ? "text-wedding-gold bg-wedding-gold/10"
                  : "text-gray-500 hover:text-wedding-gold hover:bg-wedding-gold/5"
              }`}
              aria-label={`Go to ${section.label}`}
            >
              <span
                className={`transition-transform duration-300 ${
                  activeSection === section.id ? "scale-110" : ""
                }`}
              >
                {section.icon}
              </span>
              <span
                className={`text-[10px] mt-0.5 font-medium transition-all duration-300 ${
                  activeSection === section.id ? "opacity-100" : "opacity-70"
                }`}
              >
                {section.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Buttons - Bottom Left */}
      <div className="fixed bottom-20 left-4 z-50 flex flex-col gap-2">
        {/* Auto Scroll Button */}
        <button
          onClick={onToggleAutoScroll}
          className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group relative ${
            isAutoScrolling
              ? "bg-wedding-gold text-white"
              : "bg-white/90 text-wedding-gold border border-wedding-gold/30 hover:bg-wedding-gold/10"
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
          {/* Tooltip */}
          <span className="absolute left-full ml-2 px-2 py-1 bg-wedding-charcoal text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isAutoScrolling ? "Stop Scroll" : "Auto Scroll"}
          </span>
        </button>

        {/* Music Button */}
        <button
          onClick={onToggleMusic}
          className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group relative ${
            isPlaying
              ? "bg-wedding-gold text-white"
              : "bg-white/90 text-wedding-gold border border-wedding-gold/30 hover:bg-wedding-gold/10"
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
          {/* Tooltip */}
          <span className="absolute left-full ml-2 px-2 py-1 bg-wedding-charcoal text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isPlaying ? "Pause Music" : "Play Music"}
          </span>
        </button>
      </div>
    </>
  );
}
