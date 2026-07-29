import type { ReactNode } from "react";
import { Instrument_Serif, IBM_Plex_Mono, Space_Grotesk, Fraunces } from "next/font/google";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

// One distinct font per product tab, so each reads as its own identity rather
// than three items in a uniform list.
const artemisFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-artemis",
});

const scoutFont = Space_Grotesk({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-scout",
});

const foilFont = Fraunces({
  subsets: ["latin"],
  weight: "600",
  style: "italic",
  variable: "--font-foil",
});

export const metadata = {
  title: "Valence — Formal Verification and Security Audits",
  description:
    "Valence secures smart contracts with Artemis (formal verification), Scout (an AI review agent), Foil (mutation testing), and expert security audits.",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${artemisFont.variable} ${scoutFont.variable} ${foilFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
