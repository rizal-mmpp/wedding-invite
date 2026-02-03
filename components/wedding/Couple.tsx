"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Couple as CoupleType, WeddingData } from "@/types/wedding";

interface CoupleProps {
  data: WeddingData;
  lang: "id" | "en";
}

const PersonCard = ({
  person,
  side,
  delay,
  lang,
}: {
  person: CoupleType["groom"] | CoupleType["bride"];
  side: "left" | "right";
  delay: number;
  lang: "id" | "en";
}) => {
  const isEn = lang === "en";
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="flex flex-col items-center text-center"
    >
      <div className="relative w-48 h-48 md:w-64 md:h-64 mb-6 rounded-full overflow-hidden border-4 border-wedding-gold shadow-xl">
        <Image
          src={person.photo}
          alt={person.fullName}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="font-script text-3xl md:text-4xl text-wedding-gold mb-2">
        {person.fullName}
      </h3>
      {/* <p className="text-lg font-medium text-foreground mb-2">
        {person.fullName}
      </p>
      <p className="text-muted-foreground text-sm mb-1">{person.childOrder}</p> */}
      <p className="text-muted-foreground text-sm">
        {side === "left"
          ? isEn
            ? "Son of"
            : "Putra dari"
          : isEn
          ? "Daughter of"
          : "Putri dari"} {person.fatherName} & {person.motherName}
      </p>
      {person.instagram && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 text-wedding-gold hover:text-wedding-gold/80"
          asChild
        >
          <a
            href={`https://instagram.com/${person.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram className="w-4 h-4 mr-2" />
            {person.instagram}
          </a>
        </Button>
      )}
    </motion.div>
  );
};

export function Couple({ data, lang }: CoupleProps) {
  const isEn = lang === "en";
  return (
    <section
      id="couple"
      className="section-padding bg-gradient-to-b from-background to-wedding-cream"
    >
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
            {isEn ? "We Are Getting Married" : "Kami Akan Menikah"}
          </p>
          <h2 className="font-script text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            {isEn ? "The Happy Couple" : "Mempelai"}
          </h2>
          <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
        </motion.div>

        {/* Couple Cards */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-8 lg:gap-16 items-center max-w-5xl mx-auto">
          <PersonCard person={data.couple.groom} side="left" delay={0.2} lang={lang} />

          {/* Heart Divider - visible on md and up */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-wedding-gold rounded-full p-4"
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </motion.div>
          </div>

          <PersonCard person={data.couple.bride} side="right" delay={0.4} lang={lang} />
        </div>

        {/* Mobile Heart Divider */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex md:hidden justify-center my-8"
        >
          <div className="bg-wedding-gold rounded-full p-3">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16 max-w-2xl mx-auto"
        >
          <p className="text-lg md:text-xl italic text-muted-foreground leading-relaxed">
            &ldquo;{data.quote.text}&rdquo;
          </p>
          <p className="text-sm mt-4 text-wedding-gold font-medium">
            — {data.quote.source}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
