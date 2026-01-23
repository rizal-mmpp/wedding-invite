import { useState, useEffect } from "react";
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
} from "@/components/wedding";
import type { WeddingData } from "@/types/wedding";

interface HomeProps {
  weddingData: WeddingData;
}

export default function Home({ weddingData }: HomeProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for smooth entrance animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-wedding-cream flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-pulse">
            <h1 className="font-script text-4xl md:text-6xl text-wedding-gold mb-4">
              {weddingData.couple.groom.name} &amp; {weddingData.couple.bride.name}
            </h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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

      <Navigation />

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

