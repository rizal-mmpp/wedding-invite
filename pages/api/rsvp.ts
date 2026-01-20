import type { NextApiRequest, NextApiResponse } from "next";
import type { RSVPGuest, APIResponse } from "@/types/wedding";

// In-memory storage for demo purposes
// In production, this would be a database
let rsvpGuests: RSVPGuest[] = [
  {
    id: "1",
    name: "Ahmad Fauzi",
    email: "ahmad@example.com",
    phone: "081234567891",
    attendance: "attending",
    numberOfGuests: 2,
    message: "Selamat menempuh hidup baru! Semoga menjadi keluarga sakinah mawaddah warahmah.",
    createdAt: "2024-05-01T10:00:00.000Z",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "siti@example.com",
    phone: "081234567892",
    attendance: "attending",
    numberOfGuests: 1,
    message: "Bahagia selalu untuk kalian berdua!",
    createdAt: "2024-05-02T14:30:00.000Z",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "budi@example.com",
    attendance: "not_attending",
    numberOfGuests: 0,
    message: "Mohon maaf tidak bisa hadir, semoga lancar acaranya!",
    createdAt: "2024-05-03T09:15:00.000Z",
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<RSVPGuest | RSVPGuest[]>>
) {
  if (req.method === "GET") {
    // Get all RSVP responses
    res.status(200).json({
      success: true,
      data: rsvpGuests,
    });
  } else if (req.method === "POST") {
    // Create new RSVP
    const { name, email, phone, attendance, numberOfGuests, message } = req.body;

    if (!name || !attendance) {
      return res.status(400).json({
        success: false,
        error: "Name and attendance status are required",
      });
    }

    const newGuest: RSVPGuest = {
      id: String(Date.now()),
      name,
      email,
      phone,
      attendance,
      numberOfGuests: numberOfGuests || 1,
      message,
      createdAt: new Date().toISOString(),
    };

    rsvpGuests.push(newGuest);

    res.status(201).json({
      success: true,
      data: newGuest,
      message: "RSVP submitted successfully",
    });
  } else {
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }
}
