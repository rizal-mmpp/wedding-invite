"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCountdown, formatDate } from "@/lib/utils";
import type { WeddingData } from "@/types/wedding";

interface HeroProps {
  data: WeddingData;
}

export function Hero({ data }: HeroProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(data.weddingDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [data.weddingDate]);

  const scrollToContent = () => {
    const element = document.getElementById("couple");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={isDesktop ? data.desktopBackgroundImage : data.backgroundImage}
          alt="Wedding background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-lg md:text-xl font-light tracking-widest uppercase mb-4">
            The Wedding of
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-script text-5xl md:text-7xl lg:text-8xl mb-6"
        >
          {data.couple.groom.name} & {data.couple.bride.name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-xl md:text-2xl font-light">
            {formatDate(data.weddingDate)}
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-4 gap-4 md:gap-8 max-w-lg mx-auto mb-12"
        >
          {[
            { value: countdown.days, label: "Days" },
            { value: countdown.hours, label: "Hours" },
            { value: countdown.minutes, label: "Minutes" },
            { value: countdown.seconds, label: "Seconds" },
          ].map((item, index) => (
            <div
              key={item.label}
              className="glass-effect rounded-lg p-3 md:p-4"
            >
              <motion.span
                key={item.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="block text-2xl md:text-4xl font-bold text-wedding-gold"
              >
                {String(item.value).padStart(2, "0")}
              </motion.span>
              <span className="text-xs md:text-sm uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <p className="text-sm md:text-base italic opacity-90 leading-relaxed">
            &ldquo;{data.quote.text}&rdquo;
          </p>
          <p className="text-sm mt-2 opacity-75">— {data.quote.source}</p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollToContent}
            className="text-white hover:text-wedding-gold animate-bounce"
          >
            <ChevronDown className="h-8 w-8" />
          </Button>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute top-10 left-10 w-32 h-32 border border-wedding-gold/30 rounded-full"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2, delay: 1.2 }}
        className="absolute bottom-20 right-10 w-24 h-24 border border-wedding-gold/30 rounded-full"
      />
    </section>
  );
}
