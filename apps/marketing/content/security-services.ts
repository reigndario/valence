import type { StubContent } from "./types";

export const securityServicesIndex: StubContent = {
  eyebrow: "Security Services",
  title: "Human review, backed by the same engine.",
  lede: "Security Audits and Enterprise coverage are staffed by Valence engineers using Artemis, Scout, and Foil as their tooling, not as a replacement for a human reviewer.",
  links: [
    { label: "Security Audits", href: "/security-services/audits" },
    { label: "Enterprise", href: "/security-services/enterprise" },
    { label: "Pricing", href: "/security-services/pricing" },
  ],
  note: "Full detail pages for each are coming soon.",
};

export const auditsContent: StubContent = {
  eyebrow: "Security Services / Audits",
  title: "Security audits.",
  lede: "A dedicated audit team, formal verification experts, a detailed report, and an interactive process with the people who wrote it. A pre-audit is a readiness review, not a substitute for this.",
  note: "Full audits page is coming soon.",
};

export const enterpriseContent: StubContent = {
  eyebrow: "Security Services / Enterprise",
  title: "Enterprise.",
  lede: "Ongoing coverage across a portfolio of contracts, for teams shipping changes faster than a one-off audit can track.",
  note: "Full enterprise page is coming soon.",
};

export const pricingContent: StubContent = {
  eyebrow: "Security Services / Pricing",
  title: "Pricing.",
  lede: "Pricing depends on scope: lines of code, contract complexity, and whether you need Artemis coverage, a full audit, or both.",
  note: "Full pricing page is coming soon. Contact us for a quote in the meantime.",
};
