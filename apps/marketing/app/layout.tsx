import type { ReactNode } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./globals.css";

export const metadata = {
  title: "Valence — Formal Verification and Security Audits",
  description:
    "Valence secures smart contracts with Warden (formal verification), Scout (an AI review agent), Foil (mutation testing), and expert security audits.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
