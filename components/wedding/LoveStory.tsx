"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import type { WeddingData } from "@/types/wedding";

interface LoveStoryProps {
  data: WeddingData;
}

export function LoveStory({ data }: LoveStoryProps) {
  return (
    <section id="story" className="section-padding bg-wedding-cream">
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
            How We Met
          </p>
          <h2 className="font-script text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            Our Love Story
          </h2>
          <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-wedding-gold/30 hidden md:block" />

          {data.loveStory.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative flex flex-col md:flex-row items-center gap-8 mb-16 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Content */}
              <div
                className={`flex-1 ${
                  index % 2 === 0 ? "md:text-right" : "md:text-left"
                }`}
              >
                <span className="text-wedding-gold text-sm font-medium">
                  {formatDate(story.date)}
                </span>
                <h3 className="text-2xl font-serif font-semibold text-foreground mt-2 mb-3">
                  {story.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {story.description}
                </p>
              </div>

              {/* Timeline dot */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-wedding-gold flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
              </div>

              {/* Image */}
              <div className="flex-1">
                {story.image && (
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Final heart */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-wedding-gold flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-6 font-script text-3xl text-wedding-gold"
          >
            And the journey continues...
          </motion.p>
        </div>
      </div>
    </section>
  );
}
