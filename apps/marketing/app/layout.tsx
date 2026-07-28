import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Valence — Pre-Audit Readiness Reviews",
  description:
    "Valence runs pre-audit readiness reviews for Web3 protocols before a paid security audit — triaged findings, a named blocker list, an invariant inventory, and coverage gaps your auditor can act on.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
