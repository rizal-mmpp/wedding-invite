import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale: string = "id-ID"): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(time: string, locale: string = "id-ID"): string {
  const [hours, minutes] = time.split(":");
  if (locale.startsWith("id")) {
    return `${hours}.${minutes} WIB`;
  }
  return `${hours}:${minutes}`;
}

export function formatDateTime(date: string | Date, locale: string = "id-ID"): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCountdown(targetDate: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function fallbackCopyTextToClipboard(text: string): boolean {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    document.body.removeChild(textArea);
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined' || !document) {
    return false;
  }
  if (navigator && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to execCommand
    }
  }
  // Fallback for older browsers or when clipboard API fails
  return fallbackCopyTextToClipboard(text);
}

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endDate?: string;  // YYYY-MM-DD format
  endTime?: string;  // HH:MM format
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const formatDateTime = (date: string, time: string): string => {
    // Convert to YYYYMMDDTHHMMSS format (local time)
    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");
    return `${year}${month}${day}T${hours}${minutes}00`;
  };

  const startDateTime = formatDateTime(event.startDate, event.startTime);
  const endDateTime = event.endDate && event.endTime 
    ? formatDateTime(event.endDate, event.endTime)
    : formatDateTime(event.startDate, event.endTime || event.startTime);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startDateTime}/${endDateTime}`,
    ctz: "Asia/Jakarta", // Indonesian timezone
  });

  if (event.description) {
    params.append("details", event.description);
  }

  if (event.location) {
    params.append("location", event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
