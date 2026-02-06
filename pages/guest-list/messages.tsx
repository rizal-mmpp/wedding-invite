"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface GuestMessageItem {
  id: string;
  name: string;
  title?: string;
  slug: string;
  rsvpStatus: "attending" | "not_attending" | "not_responded";
  rsvpMessage?: string;
}

export default function GuestMessagesPage() {
  const [guests, setGuests] = useState<GuestMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
          setError("Missing NEXT_PUBLIC_SUPABASE_URL configuration");
          return;
        }
        const response = await fetch(`${supabaseUrl}/functions/v1/guest-messages`);
        if (!response.ok) {
          setError("Failed to load messages");
          return;
        }
        const result = await response.json();
        if (!result.success) {
          setError(result.error || "Failed to load messages");
          return;
        }
        setGuests(result.data || []);
      } catch (err) {
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, []);

  return (
    <>
      <Head>
        <title>Guest Messages - Guest List</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-wedding-cream to-white py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-script text-4xl text-foreground mb-2">
              Guest Messages
            </h1>
            <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
          </motion.div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : guests.length === 0 ? (
            <p className="text-center text-muted-foreground">No messages yet.</p>
          ) : (
            <div className="grid gap-4">
              {guests.map((guest) => (
                <Card key={guest.id} className="border-wedding-gold/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {guest.title ? `${guest.title} ` : ""}{guest.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {guest.rsvpStatus}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="whitespace-pre-line text-foreground">
                      {guest.rsvpMessage}
                    </p>
                    <Button asChild variant="ghost">
                      <a href={`/guest-list/${guest.slug}`}>View Details</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
