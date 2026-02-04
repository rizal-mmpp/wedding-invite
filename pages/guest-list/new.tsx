"use client";

import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type GuestCountry = "Indonesia" | "Singapore" | "United States" | "Netherlands";

export default function GuestListNewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    whatsapp: "",
    invited: false,
    rsvpStatus: "not_responded" as "attending" | "not_attending" | "not_responded",
    country: "Indonesia" as GuestCountry,
    language: "id" as "id" | "en",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value as GuestCountry;
    setFormData((prev) => ({
      ...prev,
      country,
      language: country === "Indonesia" ? "id" : "en",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.whatsapp.trim()) {
      setError("Name and WhatsApp are required.");
      return;
    }
    try {
      setIsSubmitting(true);
      setError("");
      const response = await fetch("/api/guest-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          title: formData.title.trim() || undefined,
          whatsapp: formData.whatsapp.trim(),
          invited: formData.invited,
          rsvpStatus: formData.rsvpStatus,
          country: formData.country,
          language: formData.language,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.error || "Failed to add guest");
        return;
      }
      router.push(`/guest-list/${result.data.slug}`);
    } catch (err) {
      setError("Failed to add guest");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Add Guest - Guest List</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-wedding-cream to-white py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-script text-4xl text-foreground mb-2">
              Add New Guest
            </h1>
            <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
          </motion.div>

          <Card className="border-wedding-gold/20">
            <CardHeader>
              <CardTitle>Guest Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Guest name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Mr/Bpk/Ibu/Sdr/Sdri"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="082233999510"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    name="country"
                    className="w-full border rounded px-2 py-2"
                    value={formData.country}
                    onChange={handleCountryChange}
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
                  <Button type="submit" variant="outline" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Add Guest"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => router.push("/guest-list")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
