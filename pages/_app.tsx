import type { AppProps } from "next/app";
import { Inter, Playfair_Display, Great_Vibes } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main
      className={`${inter.variable} ${playfair.variable} ${greatVibes.variable} font-sans`}
    >
      <Component {...pageProps} />
    </main>
  );
}
