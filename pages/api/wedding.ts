import type { NextApiRequest, NextApiResponse } from "next";
import type { WeddingData, APIResponse } from "@/types/wedding";

export const dummyWeddingData: WeddingData = {
  id: "1",
  slug: "rizal-royanti",
  backgroundImage: "/assets/prewedding-home.png",
  desktopBackgroundImage: "/assets/prewedding-home-desktop.png",
  couple: {
    groom: {
      name: "Rizal",
      fullName: "Rizal Iswandy",
      photo: "/assets/prewedding-home.png",
      fatherName: "Yusuf Deppa",
      motherName: "Magdalena S.",
      childOrder: "",
    },
    bride: {
      name: "Royanti",
      fullName: "Royanti",
      photo: "/assets/prewedding-home.png",
      fatherName: "Ambek",
      motherName: "Indo",
      childOrder: "",
    },
  },
  weddingDate: "2025-02-16T08:00:00.000Z",
  quote: {
    text: "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
    source: "Matius 19:6",
  },
  events: [
    {
      id: "1",
      name: "Pemberkatan Nikah",
      date: "2025-02-16",
      time: "10:00",
      endTime: "11:00",
      venue: "Desa Leppan, Toraja",
      address: "Desa Leppan, Toraja",
      mapUrl: "",
    },
    {
      id: "2",
      name: "Resepsi",
      date: "2025-02-16",
      time: "12:00",
      endTime: "14:00",
      venue: "Desa Leppan, Toraja",
      address: "Desa Leppan, Toraja",
      mapUrl: "",
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
        "Di momen Natal yang spesial, Rizal melamar Royanti dengan penuh ketulusan dan cinta.",
      image: "/assets/gallery-mobile/photo-4.png",
    },
  ],
  gifts: [
    {
      id: "1",
      type: "bank",
      name: "Bank Central Asia (BCA)",
      accountNumber: "4050373199",
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
