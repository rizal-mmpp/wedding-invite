import type { NextApiRequest, NextApiResponse } from "next";
import { getLiveStreamSettings, upsertLiveStreamSettings } from "@/lib/supabase";
import type { APIResponse, LiveStreamSettings } from "@/types/wedding";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<LiveStreamSettings>>
) {
  try {
    if (req.method === "GET") {
      const settings = await getLiveStreamSettings();
      return res.status(200).json({
        success: true,
        data: {
          url: settings?.url ?? null,
        },
      });
    }

    if (req.method === "POST") {
      const { url } = req.body as { url?: string | null };
      const normalizedUrl = typeof url === "string" ? url.trim() : null;

      if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl)) {
        return res.status(400).json({
          success: false,
          error: "Live stream URL must start with http:// or https://",
        });
      }

      const saved = await upsertLiveStreamSettings(normalizedUrl || null);
      return res.status(200).json({
        success: true,
        data: { url: saved.url ?? null },
      });
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (error) {
    console.error("Live stream settings API error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
