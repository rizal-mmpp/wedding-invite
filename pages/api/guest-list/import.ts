import type { NextApiRequest, NextApiResponse } from "next";
import { createGuest, getGuestBySlug } from "@/lib/supabase";
import type { APIResponse } from "@/types/wedding";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return undefined;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() ?? "";
    });
    return row;
  });
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<ImportResult>>
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    const { csv } = req.body as { csv?: string };
    if (!csv) {
      return res.status(400).json({ success: false, error: "CSV content is required" });
    }

    const rows = parseCSV(csv);
    const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

    for (const [index, row] of rows.entries()) {
      const name = row.name?.trim();
      const whatsapp = row.whatsapp?.trim();

      if (!name || !whatsapp) {
        result.skipped += 1;
        result.errors.push(`Row ${index + 2}: missing name or whatsapp`);
        continue;
      }

      const country: GuestCountry =
        row.country?.trim() === "Singapore" ||
        row.country?.trim() === "United States" ||
        row.country?.trim() === "Netherlands"
          ? (row.country.trim() as GuestCountry)
          : "Indonesia";
      const normalizedWhatsApp = normalizeWhatsApp(whatsapp, country);
      if (!normalizedWhatsApp) {
        result.skipped += 1;
        result.errors.push(`Row ${index + 2}: invalid whatsapp`);
        continue;
      }

      const title = row.title?.trim() || undefined;
      const invited = toBoolean(row.invited);
      const rsvpStatusRaw = row.rsvp_status?.trim();
      const rsvpStatus =
        rsvpStatusRaw === "attending" || rsvpStatusRaw === "not_attending"
          ? rsvpStatusRaw
          : "not_responded";
      const language =
        row.language?.trim() === "en"
          ? "en"
          : country === "Indonesia"
          ? "id"
          : "en";

      const slugBase = slugify(name);
      const slug = await getUniqueSlug(slugBase);

      await createGuest({
        name,
        title,
        whatsapp: normalizedWhatsApp,
        slug,
        invited: invited ?? false,
        rsvpStatus,
        country,
        language,
      });
      result.imported += 1;
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Guest list import error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

