"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface GuestDetail {
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

export default function GuestDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [guest, setGuest] = useState<GuestDetail | null>(null);
  const [formData, setFormData] = useState<GuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug || typeof slug !== "string") return;
    const loadGuest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/guest-list/${slug}`);
        const result = await response.json();
        if (!result.success) {
          setError(result.error || "Guest not found");
          return;
        }
        setGuest(result.data);
        setFormData(result.data);
      } catch (err) {
        setError("Failed to load guest");
      } finally {
        setLoading(false);
      }
    };
    loadGuest();
  }, [slug]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    try {
      setIsSaving(true);
      setError("");
      const response = await fetch(`/api/guest-list?id=${formData.id}` as string, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          title: formData.title?.trim() || undefined,
          whatsapp: formData.whatsapp.trim(),
          invited: formData.invited,
          isGroup: formData.isGroup,
          rsvpStatus: formData.rsvpStatus,
          country: formData.country,
          language: formData.language,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.error || "Failed to update guest");
        return;
      }
      setGuest(result.data);
      setFormData(result.data);
    } catch (err) {
      setError("Failed to update guest");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Guest Details - Guest List</title>
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
              Guest Details
            </h1>
            <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
          </motion.div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : guest && formData ? (
            <div className="grid gap-6">
              <Card className="border-wedding-gold/20">
                <CardHeader>
                  <CardTitle>
                    {guest.title ? `${guest.title} ` : ""}{guest.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-wedding-gold/10 px-3 py-1 text-wedding-gold">
                      Attendance: {guest.rsvpStatus}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                      Invited: {guest.invited ? "Yes" : "No"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-wedding-gold/20">
                <CardHeader>
                  <CardTitle>Edit Guest</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title || ""}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp *</Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invited">Invitation Sent</Label>
                      <select
                        id="invited"
                        name="invited"
                        className="w-full border rounded px-2 py-2"
                        value={formData.invited ? "true" : "false"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            invited: e.target.value === "true",
                          })
                        }
                      >
                        <option value="true">Sent</option>
                        <option value="false">Not Sent</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isGroup">Invitation Type</Label>
                      <select
                        id="isGroup"
                        name="isGroup"
                        className="w-full border rounded px-2 py-2"
                        value={formData.isGroup ? "group" : "single"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isGroup: e.target.value === "group",
                          })
                        }
                      >
                        <option value="single">Single Guest</option>
                        <option value="group">Group Invitation</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rsvpStatus">Attendance</Label>
                      <select
                        id="rsvpStatus"
                        name="rsvpStatus"
                        className="w-full border rounded px-2 py-2"
                        value={formData.rsvpStatus}
                        onChange={handleChange}
                      >
                        <option value="not_responded">Not Responded</option>
                        <option value="attending">Attending</option>
                        <option value="not_attending">Not Attending</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <select
                        id="country"
                        name="country"
                        className="w-full border rounded px-2 py-2"
                        value={formData.country}
                        onChange={handleChange}
                      >
                        <option value="Indonesia">Indonesia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="United States">United States</option>
                        <option value="Netherlands">Netherlands</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <select
                        id="language"
                        name="language"
                        className="w-full border rounded px-2 py-2"
                        value={formData.language}
                        onChange={handleChange}
                      >
                        <option value="id">ID</option>
                        <option value="en">EN</option>
                      </select>
                    </div>
                    {error && (
                      <p className="text-red-500 text-sm md:col-span-2">{error}</p>
                    )}
                    <div className="md:col-span-2 flex gap-3">
                      <Button type="submit" variant="outline" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => router.push("/guest-list")}>
                        Back to Guest List
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-wedding-gold/20">
                <CardHeader>
                  <CardTitle>Guest Message</CardTitle>
                </CardHeader>
                <CardContent>
                  {guest.rsvpMessage ? (
                    <p className="text-foreground whitespace-pre-line">{guest.rsvpMessage}</p>
                  ) : (
                    <p className="text-muted-foreground">No message yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
