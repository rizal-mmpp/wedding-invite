import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
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

interface HomeProps {
  weddingData: WeddingData;
}

export default function Home({ weddingData }: HomeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showCover, setShowCover] = useState(true);
  const [coverImageLoaded, setCoverImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoScrollRef = useRef<number | null>(null);
  const router = useRouter();
  const { to } = router.query;
  const guestName = typeof to === "string" ? decodeURIComponent(to) : "Nama Tamu";

  const handleCoverImageLoad = () => {
    setCoverImageLoaded(true);
  };

  useEffect(() => {
    // Wait for cover image to load before hiding loading screen
    if (coverImageLoaded) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [coverImageLoaded]);

  // Initialize audio element
  useEffect(() => {
    if (weddingData.music?.url) {
      audioRef.current = new Audio(weddingData.music.url);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.7; // Set default volume to 70%
      
      // Preload the audio
      audioRef.current.load();
      
      // Add error handling
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [weddingData.music?.url]);

  // Auto scroll function
  const startAutoScroll = useCallback(() => {
    const scrollStep = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const currentScroll = window.scrollY;

      // Check if we've reached the bottom
      if (currentScroll + clientHeight >= scrollHeight - 10) {
        // Stop auto scroll when reaching bottom
        setIsAutoScrolling(false);
        if (autoScrollRef.current) {
          cancelAnimationFrame(autoScrollRef.current);
          autoScrollRef.current = null;
        }
        return;
      }

      // Scroll slowly (1 pixel per frame at ~60fps = ~60px per second)
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

  // Handle auto scroll state changes
  useEffect(() => {
    if (isAutoScrolling) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
    return () => stopAutoScroll();
  }, [isAutoScrolling, startAutoScroll, stopAutoScroll]);

  // Stop auto scroll on user interaction
  useEffect(() => {
    const handleUserScroll = () => {
      // Only stop if user manually scrolls (wheel or touch)
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
              console.log('Audio resumed successfully');
            })
            .catch((error) => {
              console.error('Audio playback failed:', error);
              setIsPlaying(false);
            });
        }
      }
    }
  }, [isPlaying]);

  const handleToggleAutoScroll = useCallback(() => {
    setIsAutoScrolling((prev) => !prev);
  }, []);

  const handleOpenInvitation = () => {
    setShowCover(false);
    // Enable scrolling after cover is hidden
    document.body.style.overflow = "auto";
    
    // Start playing music
    if (audioRef.current) {
      // Reset audio to beginning
      audioRef.current.currentTime = 0;
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log('Audio playback started successfully');
          })
          .catch((error) => {
            console.error('Audio playback failed:', error);
            // Still allow manual play via button
            setIsPlaying(false);
          });
      }
    }
    
    // Start auto scroll after a short delay
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 500);
  };

  // Prevent scrolling when cover is shown
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
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-wedding-cream flex items-center justify-center z-[200]">
          <div className="text-center">
            <div className="animate-pulse">
              <h1 className="font-script text-4xl md:text-6xl text-wedding-gold mb-4">
                {weddingData.couple.groom.name} &amp; {weddingData.couple.bride.name}
              </h1>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      )}

      <Head>
        <title>
          {weddingData.couple.groom.name} &amp; {weddingData.couple.bride.name} |
          Wedding Invitation
        </title>
        <meta
          name="description"
          content={`You are cordially invited to the wedding of ${weddingData.couple.groom.name} and ${weddingData.couple.bride.name}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={`${weddingData.couple.groom.name} & ${weddingData.couple.bride.name} Wedding`}
        />
        <meta
          property="og:description"
          content={`You are cordially invited to celebrate our special day`}
        />
        <meta property="og:image" content={weddingData.couple.groom.photo} />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${weddingData.couple.groom.name} & ${weddingData.couple.bride.name} Wedding`}
        />
        <meta
          name="twitter:description"
          content={`You are cordially invited to celebrate our special day`}
        />
        <meta name="twitter:image" content={weddingData.couple.groom.photo} />
      </Head>

      {/* Invitation Cover */}
      {showCover && (
        <InvitationCover
          data={weddingData}
          guestName={guestName}
          onOpen={handleOpenInvitation}
          onImageLoad={handleCoverImageLoad}
        />
      )}

      {/* Floating Buttons - Music & Auto Scroll */}
      {!showCover && (
        <FloatingButtons
          data={weddingData}
          isPlaying={isPlaying}
          isAutoScrolling={isAutoScrolling}
          onToggleMusic={handleToggleMusic}
          onToggleAutoScroll={handleToggleAutoScroll}
        />
      )}

      <main>
        <Hero data={weddingData} />
        <Couple data={weddingData} />
        <Events data={weddingData} />
        <Gallery data={weddingData} />
        {/* <LoveStory data={weddingData} /> */}
        <RSVP data={weddingData} />
        <Gifts data={weddingData} />
      </main>

      <Footer data={weddingData} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${apiBaseUrl}/api/wedding`);
  const data = await res.json();
  return {
    props: {
      weddingData: data.data,
    },
  };
};

