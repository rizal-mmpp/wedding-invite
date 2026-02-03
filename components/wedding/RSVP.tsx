"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Send, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { WeddingData } from "@/types/wedding";

interface RSVPProps {
  data: WeddingData;
  lang: "id" | "en";
  guestName?: string;
  guestSlug?: string;
}

export function RSVP({ data, lang, guestName, guestSlug }: RSVPProps) {
  const isEn = lang === "en";
  const defaultName = useMemo(() => guestName?.trim() || "", [guestName]);
  const [formData, setFormData] = useState({
    name: defaultName,
    attendance: "attending" as "attending" | "not_attending",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestSlug) {
      setError(isEn ? "Guest is not found." : "Data tamu tidak ditemukan.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/guest-list/${guestSlug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendance: formData.attendance,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to submit RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <section id="rsvp" className="section-padding bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-wedding-gold uppercase tracking-widest text-sm mb-4">
            {isEn ? "Be Our Guest" : "Tamu Kami"}
          </p>
          <h2 className="font-script text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            RSVP
          </h2>
          <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto">
            {isEn
              ? "We would be honored to have you celebrate our special day with us. Please let us know if you can attend."
              : "Kami sangat berbahagia jika Anda berkenan hadir merayakan hari spesial kami. Mohon konfirmasi kehadiran Anda."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-xl mx-auto"
        >
            <Card className="border-wedding-gold/20 shadow-lg shadow-wedding-gold/10">
              <CardHeader>
                <CardTitle className="text-center font-serif text-2xl">
                  {isEn ? "Confirm Your Attendance" : "Konfirmasi Kehadiran"}
                </CardTitle>
              </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {isEn ? "Thank You!" : "Terima Kasih!"}
                  </h3>
                  <p className="text-muted-foreground">
                    {isEn
                      ? "Thank you for filling out the RSVP form. We look forward to celebrating our special day with you!"
                      : "Terimakasih sudah mengisi form RSVP. Kami sangat berharap bisa merayakan hari spesial kami bersama Anda!"}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">{isEn ? "Full Name" : "Nama Lengkap"} *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={
                        isEn ? "Enter your full name" : "Masukkan nama lengkap"
                      }
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Attendance */}
                  <div className="space-y-3">
                    <Label>{isEn ? "Will you attend?" : "Apakah Anda hadir?"} *</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {([
                        {
                          value: "attending",
                          title: isEn ? "Attending" : "Hadir",
                          description: isEn
                            ? "Yes, I will be there"
                            : "Ya, saya akan hadir",
                        },
                        {
                          value: "not_attending",
                          title: isEn ? "Not Attending" : "Tidak Hadir",
                          description: isEn
                            ? "Sorry, I can't make it"
                            : "Maaf, belum bisa hadir",
                        },
                      ] as const).map((option) => (
                        <label
                          key={option.value}
                          className={`group relative flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-all duration-200 ${
                            formData.attendance === option.value
                              ? "border-wedding-gold bg-wedding-gold/10 shadow-md"
                              : "border-border bg-background hover:border-wedding-gold/60"
                          }`}
                        >
                          <input
                            type="radio"
                            name="attendance"
                            value={option.value}
                            checked={formData.attendance === option.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span className="text-base font-semibold text-foreground">
                            {option.title}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {option.description}
                          </span>
                          <span
                            className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-all ${
                              formData.attendance === option.value
                                ? "border-wedding-gold bg-wedding-gold text-white"
                                : "border-muted-foreground/40 text-muted-foreground"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {isEn ? "Message for the Couple" : "Ucapan untuk Mempelai"}
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder={
                        isEn
                          ? "Write your wishes or message..."
                          : "Tulis doa dan ucapan Anda..."
                      }
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="wedding"
                    size="xl"
                    className="group relative w-full overflow-hidden"
                    disabled={isSubmitting}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-wedding-gold via-wedding-rose to-wedding-gold opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {isEn ? "Submitting..." : "Mengirim..."}
                      </>
                    ) : (
                      <>
                        <span className="relative inline-flex items-center">
                          <Sparkles className="w-5 h-5 mr-2" />
                          {isEn ? "Submit RSVP" : "Kirim RSVP"}
                          <Send className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                        </span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
