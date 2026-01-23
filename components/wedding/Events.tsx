"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatTime, generateGoogleCalendarUrl } from "@/lib/utils";
import type { Event, WeddingData } from "@/types/wedding";

interface EventsProps {
  data: WeddingData;
}

const EventCard = ({ event, index }: { event: Event; index: number }) => {
  const isAkad = event.name.toLowerCase().includes("akad");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      <Card className="overflow-hidden border-wedding-gold/20 hover:border-wedding-gold/50 transition-colors">
        <div
          className={`h-2 ${
            isAkad ? "bg-wedding-gold" : "bg-wedding-rose"
          }`}
        />
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`p-3 rounded-full ${
                isAkad
                  ? "bg-wedding-gold/10 text-wedding-gold"
                  : "bg-wedding-rose/10 text-wedding-rose-dark"
              }`}
            >
              {isAkad ? (
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-serif font-semibold text-foreground">
                {event.name}
              </h3>
              {event.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {event.description}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-foreground">
              <Calendar className="w-5 h-5 text-wedding-gold" />
              <span>{formatDate(event.date)}</span>
            </div>

            <div className="flex items-center gap-3 text-foreground">
              <Clock className="w-5 h-5 text-wedding-gold" />
              <span>
                {formatTime(event.time)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </span>
            </div>

            <div className="flex items-start gap-3 text-foreground">
              <MapPin className="w-5 h-5 text-wedding-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{event.venue}</p>
                <p className="text-sm text-muted-foreground">{event.address}</p>
              </div>
            </div>
          </div>

          {/* <Button
            variant="wedding-outline"
            className="w-full mt-6"
            asChild
          >
            <a
              href={event.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Open in Maps
            </a>
          </Button> */}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function Events({ data }: EventsProps) {
  const handleAddToCalendar = () => {
    // Use the first event (main wedding event) for the calendar
    const mainEvent = data.events[0];
    if (!mainEvent) return;

    const calendarUrl = generateGoogleCalendarUrl({
      title: `Wedding of ${data.couple.groom.name} & ${data.couple.bride.name} - ${mainEvent.name}`,
      description: `You are invited to the wedding celebration!\n\n${mainEvent.description || ""}\n\nVenue: ${mainEvent.venue}\nAddress: ${mainEvent.address}`,
      location: `${mainEvent.venue}, ${mainEvent.address}`,
      startDate: mainEvent.date,
      startTime: mainEvent.time,
      endDate: mainEvent.date,
      endTime: mainEvent.endTime || mainEvent.time,
    });

    window.open(calendarUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="events"
      className="section-padding bg-wedding-cream"
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
            Save The Date
          </p>
          <h2 className="font-script text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            Wedding Events
          </h2>
          <Separator className="w-24 mx-auto bg-wedding-gold h-0.5" />
        </motion.div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {data.events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>

        {/* Add to Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Don&apos;t forget to mark your calendar!
          </p>
          <Button variant="wedding" size="xl" onClick={handleAddToCalendar}>
            <Calendar className="w-5 h-5 mr-2" />
            Add to Calendar
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
