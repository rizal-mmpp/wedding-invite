"use client";

import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Copy,
  Trash2,
  RefreshCw,
  Users,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Send,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { copyToClipboard, formatDate, formatTime } from "@/lib/utils";
import type { WeddingData } from "@/types/wedding";

interface GuestListItem {
  id: string;
  name: string;
  title?: string;
  whatsapp: string;
  slug: string;
  invited: boolean;
  rsvpStatus: "attending" | "not_attending" | "not_responded";
  rsvpMessage?: string;
  messageSent: boolean;
  messageSentAt?: string;
  country: "Indonesia" | "Singapore" | "United States" | "Netherlands";
  language: "id" | "en";
  createdAt: string;
  updatedAt: string;
}

const messageTemplates = {
  id: `Yth. Bapak/Ibu/Saudara/i
*{nama_tamu}*
Di tempat
——————————————
Dengan sukacita, kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara:
✨Pernikahan✨
*{nama_mempelai_pria} & {nama_mempelai_wanita}*

*Pemberkatan Nikah*
🗓️ {tanggal_pemberkatan}
🕛 {waktu_pemberkatan}
📍 {lokasi_pemberkatan}

Resepsi Pernikahan
🗓️ {tanggal_resepsi}
🕛 {waktu_resepsi}
📍 {lokasi_resepsi}

Undangan digital dapat diakses melalui:
{tautan_undangan}

Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. 🙏

Hormat kami,
{nama_mempelai_pria} & {nama_mempelai_wanita}`,
  en: `Dear Mr./Mrs./Ms.
*{nama_tamu}*
Present
——————————————
With joy, we invite you to attend our wedding:
✨ {nama_mempelai_pria} & {nama_mempelai_wanita} ✨

Wedding Ceremony
🗓️ {tanggal_pemberkatan}
🕛 {waktu_pemberkatan}
📍 {lokasi_pemberkatan}

Wedding Reception
🗓️ {tanggal_resepsi}
🕛 {waktu_resepsi}
📍 {lokasi_resepsi}

The digital invitation can be accessed via:
{tautan_undangan}

It would be our honor if you could attend and give your blessing. 🙏

Sincerely,
{nama_mempelai_pria} & {nama_mempelai_wanita}`,
};

function getSiteUrl(): string {
  if (typeof window === "undefined") return "";
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}

function buildMessage(
  guest: GuestListItem,
  weddingData: WeddingData | undefined
): string {
  if (!weddingData) return "";
  const link = `${getSiteUrl()}/guest/${guest.slug}`;
  const locale = guest.language === "en" ? "en-US" : "id-ID";
  const blessingEvent = weddingData.events[0];
  const receptionEvent = weddingData.events[1] ?? weddingData.events[0];
  const namaTamu = `${guest.title ? `${guest.title} ` : ""}${guest.name}`;
  const values: Record<string, string> = {
    nama_tamu: namaTamu,
    nama_mempelai_pria: weddingData.couple.groom.name,
    nama_mempelai_wanita: weddingData.couple.bride.name,
    tanggal_pemberkatan: blessingEvent
      ? formatDate(blessingEvent.date, locale)
      : "",
    waktu_pemberkatan: blessingEvent
      ? formatTime(blessingEvent.time, locale)
      : "",
    lokasi_pemberkatan: blessingEvent
      ? `${blessingEvent.venue}${blessingEvent.address ? `, ${blessingEvent.address}` : ""}`
      : "",
    tanggal_resepsi: receptionEvent
      ? formatDate(receptionEvent.date, locale)
      : "",
    waktu_resepsi: receptionEvent
      ? formatTime(receptionEvent.time, locale)
      : "",
    lokasi_resepsi: receptionEvent
      ? `${receptionEvent.venue}${receptionEvent.address ? `, ${receptionEvent.address}` : ""}`
      : "",
    tautan_undangan: link,
  };
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    messageTemplates[guest.language]
  );
}

export default function GuestListPage() {
  const [guests, setGuests] = useState<GuestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [filters, setFilters] = useState({
    invited: "all",
    messageSent: "all",
    rsvpStatus: "all",
  });
  const [weddingDataByLang, setWeddingDataByLang] = useState<
    Partial<Record<"id" | "en", WeddingData>>
  >({});

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchGuests = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (filters.invited !== "all") query.set("invited", filters.invited);
      if (filters.messageSent !== "all")
        query.set("messageSent", filters.messageSent);
      if (filters.rsvpStatus !== "all")
        query.set("rsvpStatus", filters.rsvpStatus);

      const response = await fetch(`/api/guest-list?${query.toString()}`);
      const result = await response.json();
      if (result.success) {
        setGuests(result.data || []);
      } else {
        setError(result.error || "Failed to fetch guest list");
      }
    } catch (err) {
      setError("Failed to fetch guest list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [filters.invited, filters.messageSent, filters.rsvpStatus]);

  useEffect(() => {
    const loadWeddingData = async () => {
      try {
        const [idRes, enRes] = await Promise.all([
          fetch("/api/wedding?lang=id"),
          fetch("/api/wedding?lang=en"),
        ]);
        const [idJson, enJson] = await Promise.all([
          idRes.json(),
          enRes.json(),
        ]);
        setWeddingDataByLang({
          id: idJson?.data,
          en: enJson?.data,
        });
      } catch (err) {
        showNotification("error", "Failed to load wedding data");
      }
    };
    loadWeddingData();
  }, []);

  const handleCopyMessage = async (guest: GuestListItem) => {
    const text = buildMessage(guest, weddingDataByLang[guest.language]);
    if (!text) {
      showNotification("error", "Wedding data is not ready yet");
      return;
    }
    const success = await copyToClipboard(text);
    if (success) {
      showNotification("success", `Copied message for ${guest.name}`);
    } else {
      showNotification("error", "Failed to copy message");
    }
  };

  const handleWhatsApp = async (guest: GuestListItem) => {
    const text = buildMessage(guest, weddingDataByLang[guest.language]);
    if (!text) {
      showNotification("error", "Wedding data is not ready yet");
      return;
    }
    const url = new URL("https://api.whatsapp.com/send");
    url.searchParams.set("phone", guest.whatsapp);
    url.searchParams.set("text", text);
    window.open(url.toString(), "_blank");
    await updateMessageSent(guest.id, true);
  };

  const updateMessageSent = async (id: string, sent: boolean) => {
    try {
      const response = await fetch(`/api/guest-list?id=${id}` as string, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageSent: sent,
          messageSentAt: sent ? new Date().toISOString() : null,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setGuests((prev) =>
          prev.map((g) => (g.id === id ? result.data : g))
        );
      } else {
        showNotification("error", result.error || "Failed to update status");
      }
    } catch (err) {
      showNotification("error", "Failed to update status");
    }
  };

  const handleDeleteSingle = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const response = await fetch(`/api/guest-list?id=${id}` as string, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setGuests((prev) => prev.filter((g) => g.id !== id));
        showNotification("success", `Deleted ${name}`);
      } else {
        showNotification("error", result.error || "Failed to delete");
      }
    } catch (err) {
      showNotification("error", "Failed to delete guest");
    }
  };

  const handleExportData = () => {
    if (!guests.length) {
      showNotification("error", "No guests to export");
      return;
    }
    const headers = [
      "name",
      "title",
      "whatsapp",
      "slug",
      "invited",
      "rsvp_status",
      "rsvp_message",
      "message_sent",
      "message_sent_at",
      "country",
      "language",
      "created_at",
      "updated_at",
    ];
    const rows = guests.map((guest) => [
      guest.name,
      guest.title ?? "",
      guest.whatsapp,
      guest.slug,
      guest.invited ? "true" : "false",
      guest.rsvpStatus,
      guest.rsvpMessage ?? "",
      guest.messageSent ? "true" : "false",
      guest.messageSentAt ?? "",
      guest.country,
      guest.language,
      guest.createdAt,
      guest.updatedAt,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const escaped = String(value ?? "").replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `guest-list-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const stats = useMemo(() => {
    const invited = guests.filter((g) => g.invited).length;
    const messaged = guests.filter((g) => g.messageSent).length;
    const attending = guests.filter((g) => g.rsvpStatus === "attending").length;
    const notResponded = guests.filter((g) => g.rsvpStatus === "not_responded").length;
    return { invited, messaged, attending, notResponded };
  }, [guests]);

  return (
    <>
      <Head>
        <title>Guest List - Wedding Invitation</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-wedding-cream to-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-script text-4xl md:text-5xl text-foreground mb-2">
              Guest List
            </h1>
            <p className="text-muted-foreground">
              Manage invitations, WhatsApp messages, and RSVP status
            </p>
          </motion.div>

          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
                notification.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {notification.message}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="border-wedding-gold/20">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-wedding-gold" />
                <p className="text-2xl font-bold text-foreground">
                  {guests.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Guests</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="p-4 text-center">
                <Send className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">
                  {stats.messaged}
                </p>
                <p className="text-sm text-muted-foreground">Messaged</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">
                  {stats.attending}
                </p>
                <p className="text-sm text-muted-foreground">Attending</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold text-orange-600">
                  {stats.notResponded}
                </p>
                <p className="text-sm text-muted-foreground">Not Responded</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 mb-8"
          >
            <Card className="border-wedding-gold/20">
              <CardHeader>
                <CardTitle>Guest Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <a href="/guest-list/new">Add New Guest</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/guest-list/import">Import Guests</a>
                </Button>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button asChild variant="outline">
                  <a href="/guest-list/messages">View Messages</a>
                </Button>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <Label>Is Invitation Sent</Label>
                <select
                  className="ml-2 border rounded px-2 py-1"
                  value={filters.invited}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, invited: e.target.value }))
                  }
                >
                  <option value="all">All</option>
                  <option value="true">Sent</option>
                  <option value="false">Not Sent</option>
                </select>
              </div>
              <div>
                <Label>Message Sent</Label>
                <select
                  className="ml-2 border rounded px-2 py-1"
                  value={filters.messageSent}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, messageSent: e.target.value }))
                  }
                >
                  <option value="all">All</option>
                  <option value="true">Sent</option>
                  <option value="false">Not Sent</option>
                </select>
              </div>
              <div>
                <Label>RSVP Status</Label>
                <select
                  className="ml-2 border rounded px-2 py-1"
                  value={filters.rsvpStatus}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, rsvpStatus: e.target.value }))
                  }
                >
                  <option value="all">All</option>
                  <option value="attending">Attending</option>
                  <option value="not_attending">Not Attending</option>
                  <option value="not_responded">Not Responded</option>
                </select>
              </div>
              <Button variant="outline" onClick={fetchGuests}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </motion.div>

          <Separator className="mb-8 bg-wedding-gold/20" />

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-wedding-gold" />
              <p className="mt-4 text-muted-foreground">Loading guest list...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
              <p className="mt-4 text-red-500">{error}</p>
              <Button variant="outline" onClick={fetchGuests} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No guests yet</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="overflow-x-auto"
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-wedding-gold/10">
                    <th className="text-left p-3 font-semibold text-foreground">Name</th>
                    <th className="text-left p-3 font-semibold text-foreground">WhatsApp</th>
                    <th className="text-center p-3 font-semibold text-foreground">Invitation Sent</th>
                    <th className="text-center p-3 font-semibold text-foreground">Attendance</th>
                    <th className="text-center p-3 font-semibold text-foreground">Sent</th>
                    <th className="text-center p-3 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest, index) => (
                    <motion.tr
                      key={guest.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-wedding-gold/10 hover:bg-wedding-gold/5 cursor-pointer"
                      onClick={() => (window.location.href = `/guest-list/${guest.slug}`)}
                    >
                      <td className="p-3">
                        <div className="font-medium text-foreground">
                          {guest.title ? `${guest.title} ` : ""}{guest.name}
                        </div>
                        <div className="text-xs text-muted-foreground">/{guest.slug}</div>
                      </td>
                      <td className="p-3">{guest.whatsapp}</td>
                      <td className="p-3 text-center">
                        {guest.invited ? "Yes" : "No"}
                      </td>
                      <td className="p-3 text-center">{guest.rsvpStatus}</td>
                      <td className="p-3 text-center">
                        {guest.messageSent ? "Yes" : "No"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsApp(guest);
                            }}
                            className="h-8 px-2"
                            title="Send WhatsApp"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            WA
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyMessage(guest);
                            }}
                            className="h-8 w-8 p-0"
                            title="Copy Message"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMessageSent(guest.id, !guest.messageSent);
                            }}
                            className="h-8 w-8 p-0"
                            title="Toggle Sent"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSingle(guest.id, guest.name);
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

