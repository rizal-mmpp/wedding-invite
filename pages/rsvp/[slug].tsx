"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface GuestDetail {
  id: string;
  name: string;
  title?: string;
  slug: string;
  language: "id" | "en";
  rsvpStatus: "attending" | "not_attending" | "not_responded";
}

export default function GuestRSVPPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [guest, setGuest] = useState<GuestDetail | null>(null);
  const [attendance, setAttendance] = useState<"attending" | "not_attending">(
    "attending"
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!slug || typeof slug !== "string") return;
    const loadGuest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/guest-list/${slug}`);
        const result = await response.json();
        if (result.success) {
          setGuest(result.data);
          setAttendance("attending");
        } else {
          setError(result.error || "Guest not found");
        }
      } catch (err) {
        setError("Failed to load guest");
      } finally {
        setLoading(false);
      }
    };
    loadGuest();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || typeof slug !== "string") return;
    try {
      const response = await fetch(`/api/guest-list/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendance, message }),
      });
      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "Failed to submit RSVP");
      }
    } catch (err) {
      setError("Failed to submit RSVP");
    }
  };

  return (
    <>
      <Head>
        <title>RSVP</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-wedding-cream to-white py-8 px-4">
        <div className="container mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-script text-4xl text-foreground mb-2">RSVP</h1>
            <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
          </motion.div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : submitted ? (
            <Card className="border-wedding-gold/20">
              <CardContent className="p-6 text-center">
                <p className="text-foreground">Thank you for your response.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-wedding-gold/20">
              <CardHeader>
                <CardTitle className="text-center">
                  {guest?.title ? `${guest.title} ` : ""}{guest?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Will you attend?</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="attendance"
                          value="attending"
                          checked={attendance === "attending"}
                          onChange={() => setAttendance("attending")}
                          className="w-4 h-4 text-wedding-gold focus:ring-wedding-gold"
                        />
                        <span>Yes, I will attend</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="attendance"
                          value="not_attending"
                          checked={attendance === "not_attending"}
                          onChange={() => setAttendance("not_attending")}
                          className="w-4 h-4 text-wedding-gold focus:ring-wedding-gold"
                        />
                        <span>Sorry, can&apos;t make it</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message for the Couple</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Write your wishes or message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" variant="wedding" size="xl" className="w-full">
                    Submit RSVP
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

