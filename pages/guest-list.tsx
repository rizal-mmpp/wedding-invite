"use client";

import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Users,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { copyToClipboard } from "@/lib/utils";

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
  id: (title: string | undefined, name: string, link: string) =>
    `Halo ${title ? `${title} ` : ""}${name}! 🎉\nKami dengan senang hati mengundang Anda ke pernikahan kami.\nKlik untuk RSVP: ${link}\nSampai jumpa di hari bahagia kami! 💍✨`,
  en: (title: string | undefined, name: string, link: string) =>
    `Hi ${title ? `${title} ` : ""}${name}! 🎉\nWe’re excited to invite you to our wedding.\nPlease RSVP here: ${link}\nCan’t wait to celebrate together! 💍✨`,
};

function getSiteUrl(): string {
  if (typeof window === "undefined") return "";
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}

function buildMessage(guest: GuestListItem): string {
  const link = `${getSiteUrl()}/rsvp/${guest.slug}`;
  return messageTemplates[guest.language](guest.title, guest.name, link);
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
  const [csvContent, setCsvContent] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [newGuest, setNewGuest] = useState({
    name: "",
    title: "",
    whatsapp: "",
    invited: false,
    rsvpStatus: "not_responded" as "attending" | "not_attending" | "not_responded",
    country: "Indonesia" as "Indonesia" | "Singapore" | "United States" | "Netherlands",
    language: "id" as "id" | "en",
  });

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

  const handleCopyMessage = async (guest: GuestListItem) => {
    const text = buildMessage(guest);
    const success = await copyToClipboard(text);
    if (success) {
      showNotification("success", `Copied message for ${guest.name}`);
    } else {
      showNotification("error", "Failed to copy message");
    }
  };

  const handleWhatsApp = async (guest: GuestListItem) => {
    const text = encodeURIComponent(buildMessage(guest));
    const link = `https://wa.me/${guest.whatsapp}?text=${text}`;
    window.open(link, "_blank");
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

  const updateLanguage = async (id: string, language: "id" | "en") => {
    try {
      const response = await fetch(`/api/guest-list?id=${id}` as string, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      const result = await response.json();
      if (result.success) {
        setGuests((prev) =>
          prev.map((g) => (g.id === id ? result.data : g))
        );
      } else {
        showNotification("error", result.error || "Failed to update language");
      }
    } catch (err) {
      showNotification("error", "Failed to update language");
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

  const handleImportCSV = async () => {
    if (!csvContent.trim()) {
      showNotification("error", "Paste CSV content first");
      return;
    }
    try {
      const response = await fetch("/api/guest-list/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvContent }),
      });
      const result = await response.json();
      if (result.success) {
        showNotification(
          "success",
          `Imported ${result.data.imported}, skipped ${result.data.skipped}`
        );
        setCsvContent("");
        fetchGuests();
      } else {
        showNotification("error", result.error || "Failed to import CSV");
      }
    } catch (err) {
      showNotification("error", "Failed to import CSV");
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.name.trim() || !newGuest.whatsapp.trim()) {
      showNotification("error", "Name and WhatsApp are required");
      return;
    }
    try {
      const response = await fetch("/api/guest-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGuest.name.trim(),
          title: newGuest.title.trim() || undefined,
          whatsapp: newGuest.whatsapp.trim(),
          invited: newGuest.invited,
          rsvpStatus: newGuest.rsvpStatus,
          country: newGuest.country,
          language: newGuest.language,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setGuests((prev) => [result.data, ...prev]);
        setNewGuest({
          name: "",
          title: "",
          whatsapp: "",
          invited: false,
          rsvpStatus: "not_responded",
          country: "Indonesia",
          language: "id",
        });
        showNotification("success", "Guest added");
      } else {
        showNotification("error", result.error || "Failed to add guest");
      }
    } catch (err) {
      showNotification("error", "Failed to add guest");
    }
  };

  const handleCSVFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsvContent(String(reader.result || ""));
      setCsvFileName(file.name);
    };
    reader.readAsText(file);
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
                <CardTitle>Add Guest</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddGuest} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Name *</Label>
                    <Input
                      id="new-name"
                      value={newGuest.name}
                      onChange={(e) =>
                        setNewGuest((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Guest name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-title">Title</Label>
                    <Input
                      id="new-title"
                      value={newGuest.title}
                      onChange={(e) =>
                        setNewGuest((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Mr/Bpk/Ibu/Sdr/Sdri"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-whatsapp">WhatsApp *</Label>
                    <Input
                      id="new-whatsapp"
                      value={newGuest.whatsapp}
                      onChange={(e) =>
                        setNewGuest((prev) => ({ ...prev, whatsapp: e.target.value }))
                      }
                      placeholder="082233999510"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-country">Country</Label>
                    <select
                      id="new-country"
                      className="w-full border rounded px-2 py-2"
                      value={newGuest.country}
                      onChange={(e) =>
                        setNewGuest((prev) => ({
                          ...prev,
                          country: e.target.value as
                            | "Indonesia"
                            | "Singapore"
                            | "United States"
                            | "Netherlands",
                          language: e.target.value === "Indonesia" ? "id" : "en",
                        }))
                      }
                    >
                      <option value="Indonesia">Indonesia</option>
                      <option value="Singapore">Singapore</option>
                      <option value="United States">United States</option>
                      <option value="Netherlands">Netherlands</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-language">Language</Label>
                    <select
                      id="new-language"
                      className="w-full border rounded px-2 py-2"
                      value={newGuest.language}
                      onChange={(e) =>
                        setNewGuest((prev) => ({
                          ...prev,
                          language: e.target.value as "id" | "en",
                        }))
                      }
                    >
                      <option value="id">ID</option>
                      <option value="en">EN</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-invited">Is Invitation Sent</Label>
                    <select
                      id="new-invited"
                      className="w-full border rounded px-2 py-2"
                      value={newGuest.invited ? "true" : "false"}
                      onChange={(e) =>
                        setNewGuest((prev) => ({
                          ...prev,
                          invited: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="true">Sent</option>
                      <option value="false">Not Sent</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-rsvp">RSVP Status</Label>
                    <select
                      id="new-rsvp"
                      className="w-full border rounded px-2 py-2"
                      value={newGuest.rsvpStatus}
                      onChange={(e) =>
                        setNewGuest((prev) => ({
                          ...prev,
                          rsvpStatus: e.target.value as
                            | "attending"
                            | "not_attending"
                            | "not_responded",
                        }))
                      }
                    >
                      <option value="not_responded">Not Responded</option>
                      <option value="attending">Attending</option>
                      <option value="not_attending">Not Attending</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" variant="outline">
                      Add Guest
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            <Card className="border-wedding-gold/20">
              <CardHeader>
                <CardTitle>Import CSV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Upload CSV file</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleCSVFile(e.target.files?.[0] || null)}
                  />
                  {csvFileName && (
                    <p className="text-xs text-muted-foreground">
                      Loaded: {csvFileName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="csv">Or paste CSV content</Label>
                  <Textarea
                    id="csv"
                    placeholder="name,title,whatsapp,country,invited,rsvp_status,language"
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button variant="outline" onClick={handleImportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Import CSV
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
                    <th className="text-center p-3 font-semibold text-foreground">RSVP</th>
                    <th className="text-center p-3 font-semibold text-foreground">Country</th>
                    <th className="text-center p-3 font-semibold text-foreground">Language</th>
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
                      className="border-b border-wedding-gold/10 hover:bg-wedding-gold/5"
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
                      <td className="p-3 text-center">{guest.country}</td>
                      <td className="p-3 text-center">
                        <select
                          className="border rounded px-2 py-1"
                          value={guest.language}
                          onChange={(e) =>
                            updateLanguage(guest.id, e.target.value as "id" | "en")
                          }
                        >
                          <option value="id">ID</option>
                          <option value="en">EN</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        {guest.messageSent ? "Yes" : "No"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWhatsApp(guest)}
                            className="h-8 px-2"
                            title="Send WhatsApp"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            WA
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyMessage(guest)}
                            className="h-8 w-8 p-0"
                            title="Copy Message"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateMessageSent(guest.id, !guest.messageSent)}
                            className="h-8 w-8 p-0"
                            title="Toggle Sent"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSingle(guest.id, guest.name)}
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

