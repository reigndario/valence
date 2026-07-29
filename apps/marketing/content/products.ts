import type { StubContent } from "./types";

export const artemisContent: StubContent = {
  eyebrow: "Artemis",
  title: "Artemis — formal verification.",
  lede: "Artemis proves your invariants hold across every reachable contract state, not just the ones your tests happen to cover.",
  note: "Full product page is coming soon. See the code and rule panel on the home page for a sense of the workflow.",
};

export const scoutContent: StubContent = {
  eyebrow: "Scout",
  title: "Scout — an AI agent for intent and bugs.",
  lede: "Scout reads your contracts, infers the intent behind them, writes rules for that intent, and separately hunts for bugs. Every proposal needs a real file and line span before it counts as a finding.",
  note: "Full product page is coming soon.",
};

export const foilContent: StubContent = {
  eyebrow: "Foil",
  title: "Foil — mutation testing.",
  lede: "Foil mutates your contracts and checks whether your test suite actually catches the change. A passing suite that misses every mutant is not a passing suite.",
  note: "Full product page is coming soon.",
};
