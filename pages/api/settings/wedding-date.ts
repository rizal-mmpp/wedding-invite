import type { NextApiRequest, NextApiResponse } from "next";
import { getWeddingDateSettings, upsertWeddingDateSettings } from "@/lib/supabase";
import type { APIResponse, WeddingDateSettings } from "@/types/wedding";

type WeddingDatePayload = { weddingDate?: string | null };

function normalizeWeddingDate(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<WeddingDateSettings>>
) {
  try {
    if (req.method === "GET") {
      const settings = await getWeddingDateSettings();
      return res.status(200).json({
        success: true,
        data: {
          weddingDate: settings?.wedding_date ?? null,
        },
      });
    }

    if (req.method === "POST") {
      const { weddingDate } = req.body as WeddingDatePayload;
      const normalizedWeddingDate = normalizeWeddingDate(weddingDate);
      if (weddingDate && !normalizedWeddingDate) {
        return res.status(400).json({
          success: false,
          error: "Wedding date must be a valid date-time value",
        });
      }

      const saved = await upsertWeddingDateSettings(normalizedWeddingDate);
      return res.status(200).json({
        success: true,
        data: { weddingDate: saved.wedding_date ?? null },
      });
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (error) {
    console.error("Wedding date settings API error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
