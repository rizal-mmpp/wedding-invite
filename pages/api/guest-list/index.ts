import type { NextApiRequest, NextApiResponse } from "next";
import {
  createGuest,
  deleteGuest,
  getAllGuests,
  getGuestBySlug,
  updateGuest,
  GuestListRow,
} from "@/lib/supabase";
import type { APIResponse } from "@/types/wedding";

interface GuestResponse {
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

function formatGuest(row: GuestListRow): GuestResponse {
  return {
    id: String(row.id),
    name: row.name,
    title: row.title || undefined,
    whatsapp: row.whatsapp,
    slug: row.slug,
    invited: row.invited,
    rsvpStatus: row.rsvp_status,
    rsvpMessage: row.rsvp_message || undefined,
    messageSent: row.message_sent,
    messageSentAt: row.message_sent_at || undefined,
    country: row.country,
    language: row.language,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type GuestCountry = "Indonesia" | "Singapore" | "United States" | "Netherlands";

function getCountryCode(country: GuestCountry): string {
  switch (country) {
    case "Singapore":
      return "65";
    case "United States":
      return "1";
    case "Netherlands":
      return "31";
    case "Indonesia":
    default:
      return "62";
  }
}

function normalizeWhatsApp(value: string, country: GuestCountry): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const countryCode = getCountryCode(country);
  if (digits.startsWith("0")) {
    return `${countryCode}${digits.slice(1)}`;
  }
  if (digits.startsWith(countryCode)) {
    return digits;
  }
  if (countryCode === "62" && digits.startsWith("8")) {
    return `62${digits}`;
  }
  return digits;
}

async function getUniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let counter = 1;
  while (await getGuestBySlug(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

function getLanguageForCountry(country: GuestCountry): "id" | "en" {
  return country === "Indonesia" ? "id" : "en";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<GuestResponse | GuestResponse[]>>
) {
  try {
    if (req.method === "GET") {
      const { invited, messageSent, rsvpStatus } = req.query;
      const guests = await getAllGuests({
        invited: invited === undefined ? undefined : invited === "true",
        messageSent: messageSent === undefined ? undefined : messageSent === "true",
        rsvpStatus:
          rsvpStatus === "attending" ||
          rsvpStatus === "not_attending" ||
          rsvpStatus === "not_responded"
            ? rsvpStatus
            : undefined,
      });
      return res.status(200).json({
        success: true,
        data: guests.map(formatGuest),
      });
    }

    if (req.method === "POST") {
      const { name, title, whatsapp, invited, rsvpStatus, language, country } = req.body;

      if (!name || !whatsapp) {
        return res.status(400).json({
          success: false,
          error: "Name and WhatsApp number are required",
        });
      }

      const resolvedCountry: GuestCountry =
        country === "Singapore" ||
        country === "United States" ||
        country === "Netherlands"
          ? country
          : "Indonesia";
      const normalizedWhatsApp = normalizeWhatsApp(whatsapp, resolvedCountry);
      if (!normalizedWhatsApp) {
        return res.status(400).json({
          success: false,
          error: "Invalid WhatsApp number",
        });
      }

      const slugBase = slugify(name);
      const guest = await createGuest({
        name,
        title,
        whatsapp: normalizedWhatsApp,
        slug: await getUniqueSlug(slugBase),
        invited: Boolean(invited),
        rsvpStatus:
          rsvpStatus === "attending" || rsvpStatus === "not_attending"
            ? rsvpStatus
            : "not_responded",
        country: resolvedCountry,
        language: language === "en" ? "en" : resolvedCountry === "Indonesia" ? "id" : "en",
      });

      return res.status(201).json({
        success: true,
        data: formatGuest(guest),
      });
    }

    if (req.method === "PATCH") {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Guest id is required",
        });
      }

      const {
        name,
        title,
        whatsapp,
        invited,
        rsvpStatus,
        messageSent,
        messageSentAt,
        language,
        country,
      } = req.body;

      const existing = (await getAllGuests()).find(
        (guest) => guest.id === parseInt(id, 10)
      );
      const resolvedCountry: GuestCountry =
        country === "Singapore" ||
        country === "United States" ||
        country === "Netherlands"
          ? country
          : country === "Indonesia"
          ? "Indonesia"
          : existing?.country || "Indonesia";

      const updated = await updateGuest(parseInt(id, 10), {
        name,
        title,
        whatsapp:
          typeof whatsapp === "string"
            ? normalizeWhatsApp(whatsapp, resolvedCountry)
            : undefined,
        invited: typeof invited === "boolean" ? invited : undefined,
        rsvpStatus:
          rsvpStatus === "attending" ||
          rsvpStatus === "not_attending" ||
          rsvpStatus === "not_responded"
            ? rsvpStatus
            : undefined,
        messageSent: typeof messageSent === "boolean" ? messageSent : undefined,
        messageSentAt: messageSentAt ?? undefined,
        country: resolvedCountry,
        language:
          language === "en"
            ? "en"
            : language === "id"
            ? "id"
            : country
            ? getLanguageForCountry(resolvedCountry)
            : undefined,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: "Guest not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: formatGuest(updated),
      });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Guest id is required",
        });
      }

      const deleted = await deleteGuest(parseInt(id, 10));
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Guest not found",
        });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (error) {
    console.error("Guest list API error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

