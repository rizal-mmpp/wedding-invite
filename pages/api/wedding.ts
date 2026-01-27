import type { NextApiRequest, NextApiResponse } from "next";
import type { WeddingData, APIResponse } from "@/types/wedding";

export const dummyWeddingData: WeddingData = {
  id: "1",
  slug: "rizal-royanti",
  backgroundImage: "/assets/prewedding-home.jpg",
  desktopBackgroundImage: "/assets/prewedding-home-desktop.jpg",
  couple: {
    groom: {
      name: "Rizal",
      fullName: "Rizal Iswandy",
      photo: "/assets/rizal.jpg",
      fatherName: "Yusuf Deppa",
      motherName: "Magdalena S.",
      childOrder: "",
    },
    bride: {
      name: "Royanti",
      fullName: "Royanti",
      photo: "/assets/roya.jpg",
      fatherName: "Musa Sattu Ari'",
      motherName: "Hermin Ratte",
      childOrder: "",
    },
  },
  weddingDate: "2026-02-16T02:00:00.000Z",
  quote: {
    text: "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
    source: "Matius 19:6",
  },
  events: [
    {
      id: "1",
      name: "Pemberkatan Nikah",
      date: "2026-02-16",
      time: "10:00",
      endTime: "11:00",
      venue: "GKA Leppan City Blessing",
      address: "Desa Leppan, Toraja",
      mapUrl: "",
    },
    {
      id: "2",
      name: "Resepsi",
      date: "2026-02-16",
      time: "12:00",
      endTime: "14:00",
      venue: "Kediaman mempelai wanita",
      address: "Desa Leppan, Toraja",
      mapUrl: "",
    },
  ],
  gallery: [
    {
      id: "1",
      src: "/assets/gallery-mobile/photo-1.jpg",
      alt: "Prewedding photo 1",
      width: 800,
      height: 1200,
      featured: true,
    },
    {
      id: "2",
      src: "/assets/gallery-mobile/photo-2.jpg",
      alt: "Prewedding photo 2",
      width: 800,
      height: 1200,
    },
    {
      id: "3",
      src: "/assets/gallery-mobile/photo-3.jpg",
      alt: "Prewedding photo 3",
      width: 800,
      height: 600,
    },
    {
      id: "4",
      src: "/assets/gallery-mobile/photo-4.jpg",
      alt: "Prewedding photo 4",
      width: 800,
      height: 600,
    },
    {
      id: "5",
      src: "/assets/gallery-mobile/photo-5.jpg",
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
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      image: "/assets/gallery-mobile/photo-1.jpg",
    },
    {
      id: "2",
      title: "Mulai Dekat",
      date: "2020-06-20",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      image: "/assets/gallery-mobile/photo-2.jpg",
    },
    {
      id: "3",
      title: "Resmi Berpacaran",
      date: "2021-02-14",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      image: "/assets/gallery-mobile/photo-3.jpg",
    },
    {
      id: "4",
      title: "Lamaran",
      date: "2023-12-25",
      description:
        "Di momen Natal yang spesial, Rizal melamar Royanti dengan penuh ketulusan dan cinta.",
      image: "/assets/gallery-mobile/photo-4.jpg",
    },
  ],
  gifts: [
    {
      id: "1",
      type: "bank",
      name: "Bank Central Asia (BCA)",
      accountNumber: "4050373199",
      accountHolder: "Rizal Iswandy",
    },
    {
      id: "1",
      type: "bank",
      name: "Bank Nasional Indonesia (BNI)",
      accountNumber: "1912372137",
      accountHolder: "Rizal Iswandy",
    }
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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<WeddingData>>
) {
  if (req.method === "GET") {
    res.status(200).json({
      success: true,
      data: dummyWeddingData,
    });
  } else {
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }
}
