"use client";

import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function GuestListImportPage() {
  const router = useRouter();
  const [csvContent, setCsvContent] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCSVFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsvContent(String(reader.result || ""));
      setCsvFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleImportCSV = async () => {
    if (!csvContent.trim()) {
      setError("Paste CSV content first.");
      return;
    }
    try {
      setIsSubmitting(true);
      setError("");
      const response = await fetch("/api/guest-list/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvContent }),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.error || "Failed to import CSV");
        return;
      }
      setResultMessage(
        `Imported ${result.data.imported}, skipped ${result.data.skipped}`
      );
      setCsvContent("");
      setCsvFileName("");
    } catch (err) {
      setError("Failed to import CSV");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Import Guests - Guest List</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-wedding-cream to-white py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-script text-4xl text-foreground mb-2">Import Guests</h1>
            <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
          </motion.div>

          <Card className="border-wedding-gold/20">
            <CardHeader>
              <CardTitle>CSV Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Upload CSV file</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleCSVFile(e.target.files?.[0] || null)}
                />
                {csvFileName && (
                  <p className="text-xs text-muted-foreground">Loaded: {csvFileName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="csv">Or paste CSV content</Label>
                <Textarea
                  id="csv"
                  placeholder="name,title,whatsapp,country,invited,is_group,rsvp_status,language"
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  rows={6}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {resultMessage && (
                <p className="text-green-600 text-sm">{resultMessage}</p>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleImportCSV} disabled={isSubmitting}>
                  <Download className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Importing..." : "Import CSV"}
                </Button>
                <Button variant="ghost" onClick={() => router.push("/guest-list")}>Back to Guest List</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
