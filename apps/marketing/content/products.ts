import type { StubContent } from "./types";

export const productsIndex: StubContent = {
  eyebrow: "Products",
  title: "The engine layer behind every engagement.",
  lede: "Warden, Scout, and Foil are the automated tools Valence runs on your contracts, before and alongside a human review. Full detail on each is coming soon.",
  note: "This page is a placeholder. Product detail pages are linked from the nav above.",
};

export const wardenContent: StubContent = {
  eyebrow: "Products / Warden",
  title: "Warden — formal verification.",
  lede: "Warden proves your invariants hold across every reachable contract state, not just the ones your tests happen to cover.",
  note: "Full product page is coming soon. See the code and rule panel on the home page for a sense of the workflow.",
};

export const scoutContent: StubContent = {
  eyebrow: "Products / Scout",
  title: "Scout — an AI agent for intent and bugs.",
  lede: "Scout reads your contracts, infers the intent behind them, writes rules for that intent, and separately hunts for bugs. Every proposal needs a real file and line span before it counts as a finding.",
  note: "Full product page is coming soon.",
};

export const foilContent: StubContent = {
  eyebrow: "Products / Foil",
  title: "Foil — mutation testing.",
  lede: "Foil mutates your contracts and checks whether your test suite actually catches the change. A passing suite that misses every mutant is not a passing suite.",
  note: "Full product page is coming soon.",
};
