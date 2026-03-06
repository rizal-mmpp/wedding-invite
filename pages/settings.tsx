import { useEffect, useState } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { LiveStreamSettings, APIResponse, WeddingDateSettings } from "@/types/wedding";

export default function SettingsPage() {
  const [liveStreamUrl, setLiveStreamUrl] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [liveStreamResponse, weddingDateResponse] = await Promise.all([
          fetch("/api/settings/live-stream"),
          fetch("/api/settings/wedding-date"),
        ]);

        const liveStreamJson =
          (await liveStreamResponse.json()) as APIResponse<LiveStreamSettings>;
        const weddingDateJson =
          (await weddingDateResponse.json()) as APIResponse<WeddingDateSettings>;

        if (!liveStreamResponse.ok || !liveStreamJson.success) {
          throw new Error(liveStreamJson.error || "Failed to load live stream settings");
        }
        if (!weddingDateResponse.ok || !weddingDateJson.success) {
          throw new Error(weddingDateJson.error || "Failed to load wedding date settings");
        }
        setLiveStreamUrl(liveStreamJson.data?.url ?? "");
        setWeddingDate(weddingDateJson.data?.weddingDate ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const [liveStreamResponse, weddingDateResponse] = await Promise.all([
        fetch("/api/settings/live-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: liveStreamUrl || null }),
        }),
        fetch("/api/settings/wedding-date", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weddingDate: weddingDate || null }),
        }),
      ]);

      const liveStreamJson =
        (await liveStreamResponse.json()) as APIResponse<LiveStreamSettings>;
      const weddingDateJson =
        (await weddingDateResponse.json()) as APIResponse<WeddingDateSettings>;

      if (!liveStreamResponse.ok || !liveStreamJson.success) {
        throw new Error(liveStreamJson.error || "Failed to save live stream settings");
      }
      if (!weddingDateResponse.ok || !weddingDateJson.success) {
        throw new Error(weddingDateJson.error || "Failed to save wedding date settings");
      }

      setLiveStreamUrl(liveStreamJson.data?.url ?? "");
      setWeddingDate(weddingDateJson.data?.weddingDate ?? "");
      setMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <div className="min-h-screen bg-wedding-cream py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-2xl bg-background p-8 shadow-lg">
            <div className="text-center">
              <p className="text-wedding-gold uppercase tracking-widest text-sm mb-2">
                Admin
              </p>
              <h1 className="font-script text-4xl md:text-5xl text-foreground mb-4">
                Settings
              </h1>
              <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
              <p className="text-muted-foreground mt-4">
                Update the live stream link and wedding date/time used on the invitation.
              </p>
            </div>

            <form onSubmit={handleSave} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weddingDate">Wedding date &amp; time</Label>
                <Input
                  id="weddingDate"
                  name="weddingDate"
                  type="datetime-local"
                  value={weddingDate}
                  onChange={(event) => setWeddingDate(event.target.value)}
                  disabled={isLoading || isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  Use your local time. Leave empty to keep the default date.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="liveStreamUrl">Live stream link</Label>
                <Input
                  id="liveStreamUrl"
                  name="liveStreamUrl"
                  type="url"
                  placeholder="https://your-livestream-url"
                  value={liveStreamUrl}
                  onChange={(event) => setLiveStreamUrl(event.target.value)}
                  disabled={isLoading || isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to hide the button on the invitation.
                </p>
              </div>

              {message && <p className="text-sm text-green-600">{message}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" variant="wedding" size="lg" disabled={isLoading || isSaving}>
                {isSaving ? "Saving..." : isLoading ? "Loading..." : "Save settings"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
