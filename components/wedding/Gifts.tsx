"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Copy, Check, CreditCard, Wallet, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { copyToClipboard } from "@/lib/utils";
import type { WeddingData, Gift as GiftType } from "@/types/wedding";

interface GiftsProps {
  data: WeddingData;
  lang: "id" | "en";
}

const GiftCard = ({ gift, lang }: { gift: GiftType; lang: "id" | "en" }) => {
  const [copied, setCopied] = useState(false);
  const isEn = lang === "en";

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getIcon = () => {
    switch (gift.type) {
      case "bank":
        return <CreditCard className="w-6 h-6" />;
      case "ewallet":
        return <Wallet className="w-6 h-6" />;
      case "address":
        return <MapPin className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  return (
    <Card className="border-wedding-gold/20 hover:border-wedding-gold/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-full bg-wedding-gold/10 text-wedding-gold">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{gift.name}</h3>
            {gift.accountHolder && (
              <p className="text-sm text-muted-foreground">
                {isEn ? "Account name:" : "a.n."} {gift.accountHolder}
              </p>
            )}
          </div>
        </div>

        {gift.accountNumber && (
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
            <span className="font-mono text-lg">{gift.accountNumber}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(gift.accountNumber!)}
              className="text-wedding-gold hover:text-wedding-gold/80"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}

        {gift.address && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-foreground">{gift.address}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(gift.address!)}
              className="mt-2 text-wedding-gold hover:text-wedding-gold/80"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {isEn ? "Copied!" : "Tersalin!"}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  {isEn ? "Copy Address" : "Salin Alamat"}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function Gifts({ data, lang }: GiftsProps) {
  const isEn = lang === "en";
  const [isGiftSheetOpen, setIsGiftSheetOpen] = useState(false);
  return (
    <section id="gifts" className="section-padding bg-wedding-cream">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4"
        >
          <p className="text-wedding-gold uppercase tracking-widest text-sm mb-4">
            {isEn ? "Wedding Gift" : "Hadiah Pernikahan"}
          </p>
          <h2 className="font-script text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            {isEn ? "Gift Registry" : "Daftar Hadiah"}
          </h2>
          <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto">
            {isEn
              ? "Your presence at our wedding is the greatest gift of all. However, if you wish to honor us with a gift, we have provided the following options."
              : "Kehadiran Anda adalah hadiah terindah bagi kami. Namun, jika Anda ingin memberikan hadiah, kami menyediakan opsi berikut."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <Button
            type="button"
            variant="wedding"
            size="xl"
            onClick={() => setIsGiftSheetOpen(true)}
          >
            <Gift className="w-5 h-5 mr-2" />
            {isEn ? "Send Gift" : "Kirim Hadiah"}
          </Button>
        </motion.div>

        {/* Thank you note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 text-wedding-gold">
            <Gift className="w-5 h-5" />
            <span className="font-script text-2xl">
              {isEn ? "Thank you for your generosity" : "Terima kasih atas kebaikan Anda"}
            </span>
            <Gift className="w-5 h-5" />
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {isGiftSheetOpen && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-end justify-center bg-black/60"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-3xl rounded-t-3xl bg-background p-6 shadow-2xl"
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
                  onClick={() => setIsGiftSheetOpen(false)}
                  aria-label={isEn ? "Close" : "Tutup"}
                >
                  {isEn ? "Close" : "Tutup"}
                </button>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-4 text-center">
                {isEn ? "Gift Details" : "Detail Hadiah"}
              </h4>
              <div className="grid gap-6 md:grid-cols-2 max-h-[70vh] overflow-y-auto pr-1">
                {data.gifts.map((gift) => (
                  <GiftCard key={`sheet-${gift.id}`} gift={gift} lang={lang} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
