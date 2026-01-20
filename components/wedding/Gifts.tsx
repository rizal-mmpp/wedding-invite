"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Check, CreditCard, Wallet, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { copyToClipboard } from "@/lib/utils";
import type { WeddingData, Gift as GiftType } from "@/types/wedding";

interface GiftsProps {
  data: WeddingData;
}

const GiftCard = ({ gift }: { gift: GiftType }) => {
  const [copied, setCopied] = useState(false);

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
                a.n. {gift.accountHolder}
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
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function Gifts({ data }: GiftsProps) {
  return (
    <section id="gifts" className="section-padding bg-wedding-cream">
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
            Wedding Gift
          </p>
          <h2 className="font-script text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            Gift Registry
          </h2>
          <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto">
            Your presence at our wedding is the greatest gift of all. However, if
            you wish to honor us with a gift, we have provided the following
            options.
          </p>
        </motion.div>

        {/* Gift Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {data.gifts.map((gift, index) => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GiftCard gift={gift} />
            </motion.div>
          ))}
        </div>

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
            <span className="font-script text-2xl">Thank you for your generosity</span>
            <Gift className="w-5 h-5" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
