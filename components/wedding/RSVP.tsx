"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  isGroup?: boolean;
  rsvpStatus?: "attending" | "not_attending" | "not_responded";
}

interface GroupAttendee {
  name: string;
  phone: string;
}

interface GuestMessageItem {
  id: string;
  name: string;
  title?: string;
  slug: string;
  rsvpStatus: "attending" | "not_attending" | "not_responded";
  rsvpMessage?: string;
}

export function RSVP({
  data,
  lang,
  guestName,
  guestSlug,
  isGroup = false,
  rsvpStatus = "not_responded",
}: RSVPProps) {
  const isEn = lang === "en";
  const getStatusLabel = (
    status: "attending" | "not_attending" | "not_responded"
  ) => {
    if (status === "attending") return isEn ? "Attending" : "Hadir";
    if (status === "not_attending") return isEn ? "Not Attending" : "Tidak Hadir";
    return isEn ? "Not Responded" : "Belum Merespons";
  };
  const defaultName = useMemo(() => guestName?.trim() || "", [guestName]);
  const isAlreadyResponded = !isGroup && rsvpStatus !== "not_responded";
  const [formData, setFormData] = useState({
    name: defaultName,
    attendance: "attending" as "attending" | "not_attending",
    message: "",
  });
  const [groupAttendees, setGroupAttendees] = useState<GroupAttendee[]>([
    { name: "", phone: "" },
  ]);
  const [messages, setMessages] = useState<GuestMessageItem[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState("");
  const [activeMessage, setActiveMessage] = useState<GuestMessageItem | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const filteredMessages = useMemo(
    () => messages.filter((message) => message.rsvpMessage?.trim()),
    [messages]
  );

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setMessagesLoading(true);
        setMessagesError("");
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
          setMessagesError("Missing NEXT_PUBLIC_SUPABASE_URL configuration");
          return;
        }
        const response = await fetch(`${supabaseUrl}/functions/v1/guest-messages`);
        if (!response.ok) {
          setMessagesError("Failed to load messages");
          return;
        }
        const result = await response.json();
        if (!result.success) {
          setMessagesError(result.error || "Failed to load messages");
          return;
        }
        setMessages(result.data || []);
      } catch (err) {
        setMessagesError("Failed to load messages");
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, []);

  useEffect(() => {
    if (!messagesContainerRef.current || filteredMessages.length < 2) return;
    const container = messagesContainerRef.current;
    const intervalId = window.setInterval(() => {
      const nextLeft = container.scrollLeft + container.clientWidth;
      const maxLeft = container.scrollWidth - container.clientWidth;
      container.scrollTo({
        left: nextLeft >= maxLeft ? 0 : nextLeft,
        behavior: "smooth",
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [filteredMessages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestSlug) {
      setError(isEn ? "Guest is not found." : "Data tamu tidak ditemukan.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      if (isGroup) {
        const sanitized = groupAttendees
          .map((attendee) => ({
            name: attendee.name.trim(),
            phone: attendee.phone.trim(),
          }))
          .filter((attendee) => attendee.name || attendee.phone);

        if (!sanitized.length) {
          setError(
            isEn
              ? "Please add at least one attendee."
              : "Mohon tambahkan minimal satu tamu."
          );
          return;
        }

        if (sanitized.some((attendee) => !attendee.name || !attendee.phone)) {
          setError(
            isEn
              ? "Each attendee must include a name and phone number."
              : "Setiap tamu wajib mengisi nama dan nomor telepon."
          );
          return;
        }

        const responses = await Promise.all(
          sanitized.map((attendee) =>
            fetch("/api/submit-rsvp", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: attendee.name,
                phone: attendee.phone,
                attendance: formData.attendance,
                numberOfGuests: 1,
                message: formData.message,
                guestSlug,
              }),
            })
          )
        );

        const results = await Promise.all(responses.map((response) => response.json()));
        const failed = results.find((result) => !result?.success);

        if (failed) {
          setError(failed.error || "Something went wrong. Please try again.");
        } else {
          setIsSubmitted(true);
          setGroupAttendees([{ name: "", phone: "" }]);
        }
      } else {
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

  const handleGroupChange = (
    index: number,
    field: keyof GroupAttendee,
    value: string
  ) => {
    setGroupAttendees((prev) =>
      prev.map((attendee, idx) =>
        idx === index ? { ...attendee, [field]: value } : attendee
      )
    );
  };

  const handleAddAttendee = () => {
    setGroupAttendees((prev) => [...prev, { name: "", phone: "" }]);
  };

  const handleRemoveAttendee = (index: number) => {
    setGroupAttendees((prev) => prev.filter((_, idx) => idx !== index));
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
              {isSubmitted || isAlreadyResponded ? (
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
                  {!isGroup && (
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {isEn ? "Full Name" : "Nama Lengkap"} *
                      </Label>
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
                  )}

                  {isGroup && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">
                          {isEn ? "Group Attendees" : "Daftar Tamu"}
                        </Label>
                        <Button type="button" variant="outline" onClick={handleAddAttendee}>
                          {isEn ? "Add Attendee" : "Tambah Tamu"}
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {groupAttendees.map((attendee, index) => (
                          <div
                            key={`attendee-${index}`}
                            className="grid gap-3 rounded-lg border border-border p-4"
                          >
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`attendee-name-${index}`}>
                                  {isEn ? "Full Name" : "Nama Lengkap"} *
                                </Label>
                                <Input
                                  id={`attendee-name-${index}`}
                                  value={attendee.name}
                                  onChange={(e) =>
                                    handleGroupChange(index, "name", e.target.value)
                                  }
                                  placeholder={
                                    isEn
                                      ? "Enter full name"
                                      : "Masukkan nama lengkap"
                                  }
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`attendee-phone-${index}`}>
                                  {isEn ? "Phone Number" : "Nomor Telepon"} *
                                </Label>
                                <Input
                                  id={`attendee-phone-${index}`}
                                  value={attendee.phone}
                                  onChange={(e) =>
                                    handleGroupChange(index, "phone", e.target.value)
                                  }
                                  placeholder={
                                    isEn ? "08xxxxxxxx" : "08xxxxxxxx"
                                  }
                                  required
                                />
                              </div>
                            </div>
                            {groupAttendees.length > 1 && (
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => handleRemoveAttendee(index)}
                                >
                                  {isEn ? "Remove" : "Hapus"}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                          {isEn ? "Submit" : "Kirim"}
                          <Send className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                        </span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="mt-10 space-y-6">
            <div className="text-center">
              <h3 className="font-script text-3xl text-foreground">
                {isEn ? "Guest Messages" : "Ucapan Tamu"}
              </h3>
              <Separator className="w-24 mx-auto bg-wedding-gold h-0.5 mt-3" />
            </div>

            {messagesLoading ? (
              <p className="text-center text-muted-foreground">
                {isEn ? "Loading..." : "Memuat..."}
              </p>
            ) : messagesError ? (
              <p className="text-center text-red-500">{messagesError}</p>
            ) : filteredMessages.length === 0 ? (
              <p className="text-center text-muted-foreground">
                {isEn ? "No messages yet." : "Belum ada ucapan."}
              </p>
            ) : (
              <div className="relative">
                <div
                  ref={messagesContainerRef}
                  className="flex gap-4 overflow-x-auto pb-2 pr-10 snap-x snap-mandatory"
                >
                  {filteredMessages.map((guestMessage) => (
                    <Card
                      key={guestMessage.id}
                      className="border-wedding-gold/20 min-w-[260px] max-w-[320px] w-[280px] shrink-0 snap-start"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>
                            {guestMessage.title ? `${guestMessage.title} ` : ""}
                            {guestMessage.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {getStatusLabel(guestMessage.rsvpStatus)}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="whitespace-pre-line text-foreground line-clamp-5 max-h-[220px]">
                          {guestMessage.rsvpMessage}
                        </p>
                        <div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-0"
                            onClick={() => setActiveMessage(guestMessage)}
                          >
                            {isEn ? "Show more" : "Lihat selengkapnya"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background via-background/80 to-transparent" />
              </div>
            )}
            {filteredMessages.length > 0 && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCommentModalOpen(true)}
                >
                  {isEn ? "View all messages" : "Lihat semua ucapan"}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {activeMessage && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl">
            <button
              type="button"
              className="absolute right-4 top-4 text-sm text-muted-foreground"
              onClick={() => setActiveMessage(null)}
              aria-label={isEn ? "Close" : "Tutup"}
            >
              {isEn ? "Close" : "Tutup"}
            </button>
            <h4 className="text-lg font-semibold text-foreground">
              {activeMessage.title ? `${activeMessage.title} ` : ""}
              {activeMessage.name}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {getStatusLabel(activeMessage.rsvpStatus)}
            </p>
            <p className="whitespace-pre-line text-foreground">
              {activeMessage.rsvpMessage}
            </p>
          </div>
        </div>
      )}
      <AnimatePresence>
        {isCommentModalOpen && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-end justify-center bg-black/60"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-2xl rounded-t-3xl bg-background p-6 shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="mx-auto h-1.5 w-14 rounded-full bg-muted" />
                <button
                  type="button"
                  className="absolute right-4 top-4 text-sm text-muted-foreground"
                  onClick={() => setIsCommentModalOpen(false)}
                  aria-label={isEn ? "Close" : "Tutup"}
                >
                  {isEn ? "Close" : "Tutup"}
                </button>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-4">
                {isEn ? "Guest Messages" : "Ucapan Tamu"}
              </h4>
              <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
                {filteredMessages.map((guestMessage) => (
                  <div
                    key={`modal-${guestMessage.id}`}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">
                        {guestMessage.title ? `${guestMessage.title} ` : ""}
                        {guestMessage.name}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {getStatusLabel(guestMessage.rsvpStatus)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-foreground">
                      {guestMessage.rsvpMessage}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
