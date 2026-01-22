export interface Person {
  name: string;
  fullName: string;
  photo: string;
  fatherName: string;
  motherName: string;
  childOrder: string;
  instagram?: string;
}

export interface Couple {
  bride: Person;
  groom: Person;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  address: string;
  mapUrl: string;
  description?: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  featured?: boolean;
}

export interface LoveStory {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
}

export interface Gift {
  id: string;
  type: "bank" | "ewallet" | "address";
  name: string;
  accountNumber?: string;
  accountHolder?: string;
  address?: string;
}

export interface RSVPGuest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  attendance: "attending" | "not_attending" | "pending";
  numberOfGuests: number;
  message?: string;
  createdAt: string;
}

export interface WeddingData {
  id: string;
  slug: string;
  backgroundImage: string;
  desktopBackgroundImage: string;
  couple: Couple;
  weddingDate: string;
  quote: {
    text: string;
    source: string;
  };
  events: Event[];
  gallery: GalleryImage[];
  loveStory: LoveStory[];
  gifts: Gift[];
  music?: {
    url: string;
    title: string;
    artist: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
