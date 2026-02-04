import type { NextApiRequest, NextApiResponse } from "next";
import {
  createRSVPGuest,
  getAllRSVPGuests,
  deleteRSVPGuest,
  deleteAllRSVPGuests,
  RSVPGuestRow,
} from "@/lib/supabase";
import type { APIResponse } from "@/types/wedding";

interface RSVPResponse {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  guestSlug?: string;
  attendance: "attending" | "not_attending" | "pending";
  numberOfGuests: number;
  message?: string;
  createdAt: string;
}

function formatGuestResponse(guest: RSVPGuestRow): RSVPResponse {
  return {
    id: String(guest.id),
    name: guest.name,
    email: guest.email || undefined,
    phone: guest.phone || undefined,
    guestSlug: guest.guest_slug || undefined,
    attendance: guest.attendance,
    numberOfGuests: guest.number_of_guests,
    message: guest.message || undefined,
    createdAt: guest.created_at,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<RSVPResponse | RSVPResponse[] | { deleted: number }>>
) {
  try {
    if (req.method === "GET") {
      // Get all RSVP responses
      const guests = await getAllRSVPGuests();
      res.status(200).json({
        success: true,
        data: guests.map(formatGuestResponse),
      });
    } else if (req.method === "POST") {
      // Create new RSVP
      const { name, email, phone, attendance, numberOfGuests, message, guestSlug } = req.body;

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
        guestSlug: typeof guestSlug === "string" ? guestSlug : undefined,
        attendance,
        numberOfGuests: numberOfGuests || 1,
        message,
      });

      res.status(201).json({
        success: true,
        data: formatGuestResponse(newGuest),
        message: "RSVP submitted successfully",
      });
    } else if (req.method === "DELETE") {
      // Delete RSVP(s)
      const { id, deleteAll } = req.query;

      if (deleteAll === "true") {
        const deletedCount = await deleteAllRSVPGuests();
        return res.status(200).json({
          success: true,
          data: { deleted: deletedCount },
          message: `Deleted ${deletedCount} RSVP(s)`,
        });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "ID is required for deletion",
        });
      }

      const deleted = await deleteRSVPGuest(parseInt(id, 10));
      if (deleted) {
        res.status(200).json({
          success: true,
          message: "RSVP deleted successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          error: "RSVP not found",
        });
      }
    } else {
      res.status(405).json({
        success: false,
        error: "Method not allowed",
      });
    }
  } catch (error) {
    console.error("RSVP API Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
