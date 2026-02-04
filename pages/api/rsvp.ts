import type { NextApiRequest, NextApiResponse } from "next";
import type { RSVPGuest, APIResponse } from "@/types/wedding";
import { createRSVPGuest, getAllRSVPGuests } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<RSVPGuest | RSVPGuest[]>>
) {
  if (req.method === "GET") {
    // Get all RSVP responses
    const guests = await getAllRSVPGuests();
    res.status(200).json({
      success: true,
      data: guests.map((guest) => ({
        id: String(guest.id),
        name: guest.name,
        email: guest.email || undefined,
        phone: guest.phone || undefined,
        attendance: guest.attendance,
        numberOfGuests: guest.number_of_guests,
        message: guest.message || undefined,
        createdAt: guest.created_at,
      })),
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

    if (!["attending", "not_attending", "pending"].includes(attendance)) {
      return res.status(400).json({
        success: false,
        error: "Invalid attendance status",
      });
    }

    const newGuest = await createRSVPGuest({
      name,
      email,
      phone,
      attendance,
      numberOfGuests: numberOfGuests || 1,
      message,
    });

    res.status(201).json({
      success: true,
      data: {
        id: String(newGuest.id),
        name: newGuest.name,
        email: newGuest.email || undefined,
        phone: newGuest.phone || undefined,
        attendance: newGuest.attendance,
        numberOfGuests: newGuest.number_of_guests,
        message: newGuest.message || undefined,
        createdAt: newGuest.created_at,
      },
      message: "RSVP submitted successfully",
    });
  } else {
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }
}
