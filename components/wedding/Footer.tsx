"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, Instagram, Mail, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { WeddingData } from "@/types/wedding";

interface FooterProps {
  data: WeddingData;
}

export function Footer({ data }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-wedding-charcoal text-white py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Names */}
          <h2 className="font-script text-4xl md:text-5xl mb-4">
            {data.couple.groom.name} & {data.couple.bride.name}
          </h2>

          {/* Thank you message */}
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Thank you for being part of our special day. Your presence and
            blessings mean the world to us.
          </p>

          {/* Social links */}
          <div className="flex justify-center gap-4 mb-8">
            {data.couple.groom.instagram && (
              <a
                href={`https://instagram.com/${data.couple.groom.instagram.replace(
                  "@",
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-white/10 hover:bg-wedding-gold transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {data.couple.bride.instagram && (
              <a
                href={`https://instagram.com/${data.couple.bride.instagram.replace(
                  "@",
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-white/10 hover:bg-wedding-gold transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
          </div>

          <Separator className="w-24 mx-auto bg-wedding-gold/50 h-0.5 mb-8" />

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            {[
              { href: "#hero", label: "Home" },
              { href: "#couple", label: "Couple" },
              { href: "#events", label: "Events" },
              { href: "#gallery", label: "Gallery" },
              { href: "#story", label: "Our Story" },
              { href: "#rsvp", label: "RSVP" },
              { href: "#gifts", label: "Gifts" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-wedding-gold transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Heart animation */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-flex items-center gap-2 text-wedding-gold mb-8"
          >
            <Heart className="w-5 h-5 fill-current" />
          </motion.div>

          {/* Copyright */}
          <p className="text-white/50 text-sm">
            © {currentYear} {data.couple.groom.name} & {data.couple.bride.name}.
            Made with{" "}
            <Heart className="w-4 h-4 inline-block text-wedding-rose fill-current" />{" "}
            for our special day.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
