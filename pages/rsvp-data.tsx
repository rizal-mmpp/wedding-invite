"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { copyToClipboard } from "@/lib/utils";

interface RSVPGuest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  attendance: "attending" | "not_attending" | "pending";
  numberOfGuests: number;
  message?: string;
  createdAt: string;
}

export default function RSVPDataPage() {
  const [guests, setGuests] = useState<RSVPGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchGuests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/submit-rsvp");
      const result = await response.json();
      if (result.success) {
        setGuests(result.data || []);
      } else {
        setError(result.error || "Failed to fetch RSVP data");
      }
    } catch (err) {
      setError("Failed to fetch RSVP data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopyAll = async () => {
    const text = guests
      .map(
        (g) =>
          `Name: ${g.name}\nEmail: ${g.email || "-"}\nPhone: ${g.phone || "-"}\nAttendance: ${g.attendance}\nGuests: ${g.numberOfGuests}\nMessage: ${g.message || "-"}\nDate: ${new Date(g.createdAt).toLocaleString()}\n`
      )
      .join("\n---\n\n");

    const success = await copyToClipboard(text);
    if (success) {
      showNotification("success", "All RSVP data copied to clipboard!");
    } else {
      showNotification("error", "Failed to copy data");
    }
  };

  const handleCopySingle = async (guest: RSVPGuest) => {
    const text = `Name: ${guest.name}\nEmail: ${guest.email || "-"}\nPhone: ${guest.phone || "-"}\nAttendance: ${guest.attendance}\nGuests: ${guest.numberOfGuests}\nMessage: ${guest.message || "-"}\nDate: ${new Date(guest.createdAt).toLocaleString()}`;

    const success = await copyToClipboard(text);
    if (success) {
      showNotification("success", `Copied ${guest.name}'s data!`);
    } else {
      showNotification("error", "Failed to copy data");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Attendance",
      "Number of Guests",
      "Message",
      "Created At",
    ];
    const csvContent = [
      headers.join(","),
      ...guests.map((g) =>
        [
          g.id,
          `"${g.name.replace(/"/g, '""')}"`,
          g.email || "",
          g.phone || "",
          g.attendance,
          g.numberOfGuests,
          `"${(g.message || "").replace(/"/g, '""')}"`,
          g.createdAt,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `rsvp-data-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("success", "CSV file downloaded!");
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(guests, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `rsvp-data-${new Date().toISOString().split("T")[0]}.json`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("success", "JSON file downloaded!");
  };

  const handleDeleteSingle = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}'s RSVP?`)) return;

    try {
      const response = await fetch(`/api/submit-rsvp?id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setGuests((prev) => prev.filter((g) => g.id !== id));
        showNotification("success", `Deleted ${name}'s RSVP`);
      } else {
        showNotification("error", result.error || "Failed to delete");
      }
    } catch (err) {
      showNotification("error", "Failed to delete RSVP");
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL RSVP data? This action cannot be undone."
      )
    )
      return;

    try {
      const response = await fetch("/api/submit-rsvp?deleteAll=true", {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setGuests([]);
        showNotification(
          "success",
          `Deleted ${result.data?.deleted || 0} RSVP(s)`
        );
      } else {
        showNotification("error", result.error || "Failed to delete");
      }
    } catch (err) {
      showNotification("error", "Failed to delete all RSVPs");
    }
  };

  const attendingCount = guests.filter(
    (g) => g.attendance === "attending"
  ).length;
  const notAttendingCount = guests.filter(
    (g) => g.attendance === "not_attending"
  ).length;
  const totalGuests = guests
    .filter((g) => g.attendance === "attending")
    .reduce((sum, g) => sum + g.numberOfGuests, 0);

  return (
    <>
      <Head>
        <title>RSVP Data - Wedding Invitation</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-wedding-cream to-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-script text-4xl md:text-5xl text-foreground mb-2">
              RSVP Data
            </h1>
            <p className="text-muted-foreground">
              Manage and export your wedding RSVP responses
            </p>
          </motion.div>

          {/* Notification */}
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

          {/* Stats Cards */}
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
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="p-4 text-center">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">
                  {attendingCount}
                </p>
                <p className="text-sm text-muted-foreground">Attending</p>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="p-4 text-center">
                <UserX className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold text-red-500">
                  {notAttendingCount}
                </p>
                <p className="text-sm text-muted-foreground">Not Attending</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">{totalGuests}</p>
                <p className="text-sm text-muted-foreground">Total Guests</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 mb-8 justify-center"
          >
            <Button
              variant="outline"
              onClick={fetchGuests}
              disabled={loading}
              className="border-wedding-gold/50 hover:bg-wedding-gold/10"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyAll}
              disabled={guests.length === 0}
              className="border-wedding-gold/50 hover:bg-wedding-gold/10"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={guests.length === 0}
              className="border-wedding-gold/50 hover:bg-wedding-gold/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleExportJSON}
              disabled={guests.length === 0}
              className="border-wedding-gold/50 hover:bg-wedding-gold/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={guests.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All
            </Button>
          </motion.div>

          <Separator className="mb-8 bg-wedding-gold/20" />

          {/* Data Table */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-wedding-gold" />
              <p className="mt-4 text-muted-foreground">Loading RSVP data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
              <p className="mt-4 text-red-500">{error}</p>
              <Button
                variant="outline"
                onClick={fetchGuests}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No RSVP responses yet
              </p>
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
                    <th className="text-left p-3 font-semibold text-foreground">
                      Name
                    </th>
                    <th className="text-left p-3 font-semibold text-foreground hidden md:table-cell">
                      Contact
                    </th>
                    <th className="text-center p-3 font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-center p-3 font-semibold text-foreground">
                      Guests
                    </th>
                    <th className="text-left p-3 font-semibold text-foreground hidden lg:table-cell">
                      Message
                    </th>
                    <th className="text-left p-3 font-semibold text-foreground hidden md:table-cell">
                      Date
                    </th>
                    <th className="text-center p-3 font-semibold text-foreground">
                      Actions
                    </th>
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
                          {guest.name}
                        </div>
                        <div className="text-sm text-muted-foreground md:hidden">
                          {guest.email || guest.phone || "-"}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <div className="text-sm text-foreground">
                          {guest.email || "-"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {guest.phone || "-"}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            guest.attendance === "attending"
                              ? "bg-green-100 text-green-800"
                              : guest.attendance === "not_attending"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {guest.attendance === "attending"
                            ? "Attending"
                            : guest.attendance === "not_attending"
                            ? "Not Attending"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="p-3 text-center font-medium">
                        {guest.numberOfGuests}
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {guest.message || "-"}
                        </p>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <p className="text-sm text-muted-foreground">
                          {new Date(guest.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopySingle(guest)}
                            className="h-8 w-8 p-0"
                            title="Copy"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteSingle(guest.id, guest.name)
                            }
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

          {/* Mobile Card View for Messages */}
          {!loading && !error && guests.length > 0 && (
            <div className="lg:hidden mt-8 space-y-4">
              <h3 className="font-semibold text-foreground">Messages</h3>
              {guests
                .filter((g) => g.message)
                .map((guest) => (
                  <Card key={`msg-${guest.id}`} className="border-wedding-gold/20">
                    <CardContent className="p-4">
                      <p className="font-medium text-foreground">{guest.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {guest.message}
                      </p>
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
