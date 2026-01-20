import { useState, useEffect } from "react";
import Head from "next/head";
import type { GetStaticProps } from "next";
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
        <LoveStory data={weddingData} />
        <RSVP data={weddingData} />
        <Gifts data={weddingData} />
      </main>

      <Footer data={weddingData} />
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  return {
    props: {
      weddingData: getDefaultWeddingData(),
    },
  };
};

function getDefaultWeddingData(): WeddingData {
  return {
    id: "1",
    slug: "bambang-partini",
    couple: {
      groom: {
        name: "Bambang",
        fullName: "Bambang Sutrisno, S.Kom",
        photo: "/assets/prewedding-home.png",
        fatherName: "Bapak Sutrisno",
        motherName: "Ibu Sartini",
        childOrder: "Putra pertama",
        instagram: "@bambang.sutrisno",
      },
      bride: {
        name: "Partini",
        fullName: "Partini Wulandari, S.E",
        photo: "/assets/prewedding-home.png",
        fatherName: "Bapak Wulandono",
        motherName: "Ibu Kartini",
        childOrder: "Putri kedua",
        instagram: "@partini.wulandari",
      },
    },
    weddingDate: "2024-06-15T08:00:00.000Z",
    quote: {
      text: "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought.",
      source: "QS. Ar-Rum: 21",
    },
    events: [
      {
        id: "1",
        name: "Akad Nikah",
        date: "2024-06-15",
        time: "08:00",
        endTime: "10:00",
        venue: "Masjid Al-Ikhlas",
        address: "Jl. Merdeka No. 123, Jakarta Selatan",
        mapUrl: "https://maps.google.com/?q=-6.2088,106.8456",
        description: "Akad nikah akan dilaksanakan secara khidmat",
      },
      {
        id: "2",
        name: "Resepsi",
        date: "2024-06-15",
        time: "11:00",
        endTime: "14:00",
        venue: "Gedung Serbaguna Permata",
        address: "Perum Permata Hijau Blok F No. 45, Jakarta Selatan",
        mapUrl: "https://maps.google.com/?q=-6.2188,106.8556",
        description: "Resepsi pernikahan dengan tema garden party",
      },
    ],
    gallery: [
      {
        id: "1",
        src: "/assets/gallery-mobile/photo-1.png",
        alt: "Prewedding photo 1",
        width: 800,
        height: 1200,
        featured: true,
      },
      {
        id: "2",
        src: "/assets/gallery-mobile/photo-2.png",
        alt: "Prewedding photo 2",
        width: 800,
        height: 1200,
      },
      {
        id: "3",
        src: "/assets/gallery-mobile/photo-3.png",
        alt: "Prewedding photo 3",
        width: 800,
        height: 600,
      },
      {
        id: "4",
        src: "/assets/gallery-mobile/photo-4.png",
        alt: "Prewedding photo 4",
        width: 800,
        height: 600,
      },
      {
        id: "5",
        src: "/assets/gallery-mobile/photo-5.png",
        alt: "Prewedding photo 5",
        width: 1200,
        height: 800,
      },
    ],
    loveStory: [
      {
        id: "1",
        title: "Pertama Bertemu",
        date: "2020-01-15",
        description:
          "Kami pertama kali bertemu di sebuah acara kampus. Saat itu, pandangan kami bertemu dan ada sesuatu yang berbeda.",
        image: "/assets/gallery-mobile/photo-1.png",
      },
      {
        id: "2",
        title: "Mulai Dekat",
        date: "2020-06-20",
        description:
          "Setelah beberapa bulan saling mengenal, kami mulai sering menghabiskan waktu bersama dan berbagi cerita.",
        image: "/assets/gallery-mobile/photo-2.png",
      },
      {
        id: "3",
        title: "Resmi Berpacaran",
        date: "2021-02-14",
        description:
          "Di hari Valentine, kami memutuskan untuk memulai hubungan yang lebih serius sebagai sepasang kekasih.",
        image: "/assets/gallery-mobile/photo-3.png",
      },
      {
        id: "4",
        title: "Lamaran",
        date: "2023-12-25",
        description:
          "Di momen Natal yang spesial, Bambang melamar Partini dengan penuh ketulusan dan cinta.",
        image: "/assets/gallery-mobile/photo-4.png",
      },
    ],
    gifts: [
      {
        id: "1",
        type: "bank",
        name: "Bank Central Asia (BCA)",
        accountNumber: "1234567890",
        accountHolder: "Bambang Sutrisno",
      },
      {
        id: "2",
        type: "bank",
        name: "Bank Mandiri",
        accountNumber: "0987654321",
        accountHolder: "Partini Wulandari",
      },
      {
        id: "3",
        type: "ewallet",
        name: "GoPay",
        accountNumber: "081234567890",
        accountHolder: "Bambang Sutrisno",
      },
      {
        id: "4",
        type: "address",
        name: "Alamat Pengiriman Kado",
        address:
          "Perum Permata Hijau Blok F No. 45, Jakarta Selatan, DKI Jakarta 12345",
      },
    ],
    music: {
      url: "/audio/wedding-song.mp3",
      title: "Perfect",
      artist: "Ed Sheeran",
    },
    theme: {
      primaryColor: "#D4AF37",
      secondaryColor: "#E8B4B8",
      fontFamily: "Playfair Display",
    },
  };
}
