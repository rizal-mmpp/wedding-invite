import type { NextApiRequest, NextApiResponse } from "next";
import {
  createGuest,
  deleteGuest,
  deleteGuests,
  getAllGuests,
  getGuestBySlug,
  getGuestsPaged,
  updateGuest,
  updateGuestsMessageSent,
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
  isGroup: boolean;
  rsvpStatus: "attending" | "not_attending" | "not_responded";
  rsvpMessage?: string;
  messageSent: boolean;
  messageSentAt?: string;
  country: "Indonesia" | "Singapore" | "United States" | "Netherlands";
  language: "id" | "en";
  createdAt: string;
  updatedAt: string;
}

interface GuestListResponse {
  items: GuestResponse[];
  page: number;
  pageSize: number;
  total: number;
}

function formatGuest(row: GuestListRow): GuestResponse {
  return {
    id: String(row.id),
    name: row.name,
    title: row.title || undefined,
    whatsapp: row.whatsapp,
    slug: row.slug,
    invited: row.invited,
    isGroup: row.is_group,
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
  res: NextApiResponse<
    APIResponse<GuestResponse | GuestResponse[] | GuestListResponse | number>
  >
) {
  try {
    if (req.method === "GET") {
      const { invited, messageSent, rsvpStatus, search, page, pageSize } = req.query;
      const resolvedPage = Array.isArray(page) ? page[0] : page;
      const resolvedPageSize = Array.isArray(pageSize) ? pageSize[0] : pageSize;
      const pageNumber = resolvedPage ? Number.parseInt(resolvedPage, 10) : 1;
      const sizeNumber = resolvedPageSize ? Number.parseInt(resolvedPageSize, 10) : 20;
      const safePage = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
      const safePageSize = Number.isFinite(sizeNumber) && sizeNumber > 0 ? sizeNumber : 20;
      const allowedSizes = new Set([20, 50, 100, 500, 1000]);
      const finalPageSize = allowedSizes.has(safePageSize) ? safePageSize : 20;
      const searchValue = Array.isArray(search) ? search[0] : search;

      const { data, total } = await getGuestsPaged({
        invited: invited === undefined ? undefined : invited === "true",
        messageSent: messageSent === undefined ? undefined : messageSent === "true",
        rsvpStatus:
          rsvpStatus === "attending" ||
          rsvpStatus === "not_attending" ||
          rsvpStatus === "not_responded"
            ? rsvpStatus
            : undefined,
        search: typeof searchValue === "string" && searchValue.trim() ? searchValue.trim() : undefined,
        page: safePage,
        pageSize: finalPageSize,
      });

      const response: GuestListResponse = {
        items: data.map(formatGuest),
        page: safePage,
        pageSize: finalPageSize,
        total,
      };

      return res.status(200).json({
        success: true,
        data: response,
      });
    }

    if (req.method === "POST") {
      const {
        name,
        title,
        whatsapp,
        invited,
        rsvpStatus,
        language,
        country,
        isGroup,
      } = req.body;

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
        isGroup: typeof isGroup === "boolean" ? isGroup : false,
      });

      return res.status(201).json({
        success: true,
        data: formatGuest(guest),
      });
    }

    if (req.method === "PATCH") {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        const { ids, messageSent, messageSentAt } = req.body as {
          ids?: string[];
          messageSent?: boolean;
          messageSentAt?: string | null;
        };

        if (!Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({
            success: false,
            error: "Guest id is required",
          });
        }
        if (typeof messageSent !== "boolean") {
          return res.status(400).json({
            success: false,
            error: "messageSent is required",
          });
        }

        const numericIds = ids
          .map((value) => Number.parseInt(value, 10))
          .filter((value) => Number.isFinite(value));
        if (!numericIds.length) {
          return res.status(400).json({
            success: false,
            error: "Invalid guest ids",
          });
        }

        const updated = await updateGuestsMessageSent(
          numericIds,
          messageSent,
          messageSentAt ?? (messageSent ? new Date().toISOString() : null)
        );

        return res.status(200).json({
          success: true,
          data: updated.map(formatGuest),
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
        isGroup,
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
        isGroup: typeof isGroup === "boolean" ? isGroup : undefined,
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
        const { ids } = req.body as { ids?: string[] };
        if (!Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({
            success: false,
            error: "Guest id is required",
          });
        }

        const numericIds = ids
          .map((value) => Number.parseInt(value, 10))
          .filter((value) => Number.isFinite(value));
        if (!numericIds.length) {
          return res.status(400).json({
            success: false,
            error: "Invalid guest ids",
          });
        }

        const deletedCount = await deleteGuests(numericIds);
        return res.status(200).json({
          success: true,
          data: deletedCount,
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

