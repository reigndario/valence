export type DollarContent = {
  eyebrow: string;
  title: string;
  price: string;
  priceUnit: string;
  lede: string;
  features: string[];
  note: string;
  ctaLabel: string;
  ctaHref: string;
};

export const dollarContent: DollarContent = {
  eyebrow: "$0.99",
  title: "The $0.99 audit.",
  price: "$0.99",
  priceUnit: "per contract",
  lede: "One automated pass over your contract, run by the same Warden and Scout engine behind every Valence engagement, delivered as a written report.",
  features: [
    "Warden runs a bounded formal check across your core invariants",
    "Scout reads the contract, infers intent, and hunts for deviations from it",
    "Every finding is labeled PROVED, VIOLATED, UNKNOWN, or ERROR, never a plain pass",
    "Report delivered by email, typically within minutes of submission",
  ],
  note: "This is an automated pass, not a dedicated audit team. A bounded check is labeled bounded, not proved, and nothing here replaces a human reviewer. For contracts holding real value, pair it with a full Security Audit or Enterprise coverage.",
  ctaLabel: "Get the $0.99 audit",
  ctaHref: "/contact",
};
