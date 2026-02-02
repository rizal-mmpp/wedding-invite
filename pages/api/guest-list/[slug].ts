import type { NextApiRequest, NextApiResponse } from "next";
import { getGuestBySlug, updateGuest } from "@/lib/db";
import type { APIResponse } from "@/types/wedding";

interface GuestDetailResponse {
  id: string;
  name: string;
  title?: string;
  whatsapp: string;
  slug: string;
  invited: boolean;
  rsvpStatus: "attending" | "not_attending" | "not_responded";
  rsvpMessage?: string;
  messageSent: boolean;
  messageSentAt?: string;
  country: "Indonesia" | "Singapore" | "United States" | "Netherlands";
  language: "id" | "en";
  createdAt: string;
  updatedAt: string;
}

function formatGuest(row: ReturnType<typeof getGuestBySlug>): GuestDetailResponse {
  if (!row) {
    throw new Error("Guest not found");
  }
  return {
    id: String(row.id),
    name: row.name,
    title: row.title || undefined,
    whatsapp: row.whatsapp,
    slug: row.slug,
    invited: row.invited === 1,
    rsvpStatus: row.rsvp_status,
    rsvpMessage: row.rsvp_message || undefined,
    messageSent: row.message_sent === 1,
    messageSentAt: row.message_sent_at || undefined,
    country: row.country,
    language: row.language,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<GuestDetailResponse>>
) {
  try {
    const { slug } = req.query;
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ success: false, error: "Slug is required" });
    }

    if (req.method === "GET") {
      const guest = getGuestBySlug(slug);
      if (!guest) {
        return res.status(404).json({ success: false, error: "Guest not found" });
      }
      return res.status(200).json({ success: true, data: formatGuest(guest) });
    }

    if (req.method === "POST") {
      const { attendance, message } = req.body as {
        attendance?: "attending" | "not_attending";
        message?: string;
      };

      if (!attendance || !["attending", "not_attending"].includes(attendance)) {
        return res.status(400).json({
          success: false,
          error: "Attendance is required",
        });
      }

      const existing = getGuestBySlug(slug);
      if (!existing) {
        return res.status(404).json({ success: false, error: "Guest not found" });
      }

      const updated = updateGuest(existing.id, {
        rsvpStatus: attendance,
        rsvpMessage: message ?? null,
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: "Guest not found" });
      }

      return res.status(200).json({ success: true, data: formatGuest(updated) });
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (error) {
    console.error("Guest slug API error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

