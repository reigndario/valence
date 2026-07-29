export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  label: string;
  links: NavLink[];
};

// The 3 product tabs are prominent, always-visible top-level links — not grouped
// under a dropdown. Order matters: rendered left to right in this order.
export const productLinks: NavLink[] = [
  { label: "Artemis", href: "/products/artemis", description: "Formal verification for your invariants." },
  { label: "Scout", href: "/products/scout", description: "An AI agent that infers intent and hunts bugs." },
  { label: "Foil", href: "/products/foil", description: "Mutation testing for your test suite." },
];

// Everything else lives behind the hamburger menu, at every screen size —
// there is no separate desktop mega-menu anymore.
export const menuGroups: NavGroup[] = [
  {
    label: "Company",
    links: [
      { label: "About", href: "/about", description: "Who we are and why we started Valence." },
      { label: "Security Services", href: "/security-services", description: "Audits, Enterprise coverage, and pricing." },
    ],
  },
];

export const docsLink: NavLink = { label: "Docs", href: "/docs" };

export const dollarLink: NavLink = { label: "$0.99", href: "/0.99" };

export const primaryCta: NavLink = { label: "Get started free", href: "/contact" };

export type SocialLink = {
  label: string;
  href: string;
  icon: "github" | "twitter" | "linkedin";
};

// No real Valence social accounts exist yet. Do not add placeholder URLs here —
// they can resolve to an unrelated third party's real account. Populate once
// real accounts exist.
export const socialLinks: SocialLink[] = [];

export const legalLinks: NavLink[] = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];
