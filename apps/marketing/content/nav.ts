export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  label: string;
  links: NavLink[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Products",
    links: [
      { label: "Warden", href: "/products/warden", description: "Formal verification for your invariants." },
      { label: "Scout", href: "/products/scout", description: "An AI agent that infers intent and hunts bugs." },
      { label: "Foil", href: "/products/foil", description: "Mutation testing for your test suite." },
    ],
  },
  {
    label: "Security Services",
    links: [
      { label: "Security Audits", href: "/security-services/audits", description: "A dedicated team for a full engagement." },
      { label: "Enterprise", href: "/security-services/enterprise", description: "Ongoing coverage across a portfolio of contracts." },
      { label: "Pricing", href: "/security-services/pricing" },
    ],
  },
  {
    label: "Community",
    links: [{ label: "Blog", href: "/blog", description: "Notes on formal verification and audit practice." }],
  },
  {
    label: "Company",
    links: [{ label: "About", href: "/about", description: "Who we are and why we started Valence." }],
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
