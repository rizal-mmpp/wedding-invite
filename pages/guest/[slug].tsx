import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import {
  Hero,
  Couple,
  Events,
  Gallery,
  LoveStory,
  RSVP,
  Gifts,
  Footer,
  Navigation,
  InvitationCover,
  FloatingButtons,
} from "@/components/wedding";
import type { WeddingData } from "@/types/wedding";

interface GuestDetail {
  id: string;
  name: string;
  title?: string;
  slug: string;
  language: "id" | "en";
  rsvpStatus: "attending" | "not_attending" | "not_responded";
}

interface GuestPageProps {
  weddingData: WeddingData;
  guest: GuestDetail;
}

export default function GuestInvitationPage({ weddingData, guest }: GuestPageProps) {
  const lang = guest.language;
  const isEn = lang === "en";
  const [isLoading, setIsLoading] = useState(true);
  const [showCover, setShowCover] = useState(true);
  const [coverImageLoaded, setCoverImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoScrollRef = useRef<number | null>(null);
  const guestName = guest.title ? `${guest.title} ${guest.name}` : guest.name;

  const handleCoverImageLoad = () => {
    setCoverImageLoaded(true);
  };

  useEffect(() => {
    if (coverImageLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [coverImageLoaded]);

  useEffect(() => {
    if (weddingData.music?.url) {
      audioRef.current = new Audio(weddingData.music.url);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.7;

      audioRef.current.load();

      audioRef.current.addEventListener("error", (e) => {
        console.error("Audio loading error:", e);
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [weddingData.music?.url]);

  const startAutoScroll = useCallback(() => {
    const scrollStep = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const currentScroll = window.scrollY;

      if (currentScroll + clientHeight >= scrollHeight - 10) {
        setIsAutoScrolling(false);
        if (autoScrollRef.current) {
          cancelAnimationFrame(autoScrollRef.current);
          autoScrollRef.current = null;
        }
        return;
      }

      window.scrollBy(0, 1);
      autoScrollRef.current = requestAnimationFrame(scrollStep);
    };

    autoScrollRef.current = requestAnimationFrame(scrollStep);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isAutoScrolling) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
    return () => stopAutoScroll();
  }, [isAutoScrolling, startAutoScroll, stopAutoScroll]);

  useEffect(() => {
    const handleUserScroll = () => {
      if (isAutoScrolling) {
        setIsAutoScrolling(false);
      }
    };

    window.addEventListener("wheel", handleUserScroll);
    window.addEventListener("touchmove", handleUserScroll);

    return () => {
      window.removeEventListener("wheel", handleUserScroll);
      window.removeEventListener("touchmove", handleUserScroll);
    };
  }, [isAutoScrolling]);

  const handleToggleMusic = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              console.log("Audio resumed successfully");
            })
            .catch((error) => {
              console.error("Audio playback failed:", error);
              setIsPlaying(false);
            });
        }
      }
    }
  }, [isPlaying]);

  const handleToggleAutoScroll = useCallback(() => {
    setIsAutoScrolling((prev) => !prev);
  }, []);

  const handleScrollToSection = useCallback((sectionId: string) => {
    setIsAutoScrolling(false);

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });

      setTimeout(() => {
        setIsAutoScrolling(true);
      }, 1000);
    }
  }, []);

  const handleOpenInvitation = () => {
    setShowCover(false);
    document.body.style.overflow = "auto";

    if (audioRef.current) {
      audioRef.current.currentTime = 0;

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log("Audio playback started successfully");
          })
          .catch((error) => {
            console.error("Audio playback failed:", error);
            setIsPlaying(false);
          });
      }
    }

    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 500);
  };

  useEffect(() => {
    if (showCover) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showCover]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-wedding-cream flex items-center justify-center z-[200]">
          <div className="text-center">
            <div className="animate-pulse">
              <h1 className="font-script text-4xl md:text-6xl text-wedding-gold mb-4">
                {weddingData.couple.groom.name} &amp; {weddingData.couple.bride.name}
              </h1>
              <p className="text-muted-foreground">
                {isEn ? "Loading..." : "Memuat..."}
              </p>
            </div>
          </div>
        </div>
      )}

      <Head>
        <title>
          {weddingData.couple.groom.name} &amp; {weddingData.couple.bride.name} |
          {isEn ? "Wedding Invitation" : "Undangan Pernikahan"}
        </title>
        <meta
          name="description"
          content={
            isEn
              ? `You are cordially invited to the wedding of ${weddingData.couple.groom.name} and ${weddingData.couple.bride.name}`
              : `Anda diundang untuk menghadiri pernikahan ${weddingData.couple.groom.name} dan ${weddingData.couple.bride.name}`
          }
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        <meta
          property="og:title"
          content={`${weddingData.couple.groom.name} & ${weddingData.couple.bride.name} ${
            isEn ? "Wedding" : "Pernikahan"
          }`}
        />
        <meta
          property="og:description"
          content={
            isEn
              ? "You are cordially invited to celebrate our special day"
              : "Anda diundang untuk merayakan hari spesial kami"
          }
        />
        <meta property="og:image" content={weddingData.couple.groom.photo} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${weddingData.couple.groom.name} & ${weddingData.couple.bride.name} ${
            isEn ? "Wedding" : "Pernikahan"
          }`}
        />
        <meta
          name="twitter:description"
          content={
            isEn
              ? "You are cordially invited to celebrate our special day"
              : "Anda diundang untuk merayakan hari spesial kami"
          }
        />
        <meta name="twitter:image" content={weddingData.couple.groom.photo} />
      </Head>

      {showCover && (
        <InvitationCover
          data={weddingData}
          guestName={guestName || (isEn ? "Guest Name" : "Nama Tamu")}
          lang={lang}
          onOpen={handleOpenInvitation}
          onImageLoad={handleCoverImageLoad}
        />
      )}

      {!showCover && (
        <FloatingButtons
          data={weddingData}
          isPlaying={isPlaying}
          isAutoScrolling={isAutoScrolling}
          onToggleMusic={handleToggleMusic}
          onToggleAutoScroll={handleToggleAutoScroll}
          onScrollToSection={handleScrollToSection}
        />
      )}

      <main>
        <Hero data={weddingData} lang={lang} />
        <Couple data={weddingData} lang={lang} />
        <Events data={weddingData} lang={lang} />
        <RSVP
          data={weddingData}
          lang={lang}
          guestName={guestName}
          guestSlug={guest.slug}
        />
        <Gallery data={weddingData} lang={lang} />
        {/* <LoveStory data={weddingData} lang={lang} /> */}
        <Gifts data={weddingData} lang={lang} />
      </main>

      <Footer data={weddingData} lang={lang} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<GuestPageProps> = async (
  context
) => {
  const slug = context.params?.slug;
  if (!slug || typeof slug !== "string") {
    return { notFound: true };
  }

  const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3000";
  const guestRes = await fetch(`${apiBaseUrl}/api/guest-list/${slug}`);
  if (!guestRes.ok) {
    return { notFound: true };
  }

  const guestJson = await guestRes.json();
  if (!guestJson?.success || !guestJson?.data) {
    return { notFound: true };
  }

  const weddingRes = await fetch(`${apiBaseUrl}/api/wedding?slug=${slug}`);
  if (!weddingRes.ok) {
    return { notFound: true };
  }

  const weddingJson = await weddingRes.json();
  if (!weddingJson?.success || !weddingJson?.data) {
    return { notFound: true };
  }

  return {
    props: {
      weddingData: weddingJson.data,
      guest: guestJson.data,
    },
  };
};
