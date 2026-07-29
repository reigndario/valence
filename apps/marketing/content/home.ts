export const hero = {
  headline: "Secure your smart contracts with formal verification and expert audits.",
  primaryCta: { label: "Get started free", href: "/contact" },
  secondaryCta: { label: "Request an audit", href: "/security-services/audits" },
};

// Real pipeline tools, not client logos — we have no named clients yet.
export const toolingStrip = {
  label: "Built on tools you already trust",
  tools: ["Foundry", "Slither", "Halmos", "Z3"],
};

export const codeRulePanel = {
  label: "Code and rule",
  code: {
    filename: "Token.sol",
    source: `function transferFrom(
    address from,
    address to,
    uint256 amount
) external returns (bool) {
    uint256 allowed = allowance[from][msg.sender];
    require(allowed >= amount, "insufficient allowance");

    if (allowed != type(uint256).max) {
        allowance[from][msg.sender] = allowed - amount;
    }

    balanceOf[from] -= amount;
    balanceOf[to] += amount;

    emit Transfer(from, to, amount);
    return true;
}`,
  },
  rule: {
    filename: "Token.wsl",
    source: `rule allowanceDecreasesAfterTransferFrom {
    env e;
    address from; address to; uint256 amount;

    uint256 allowanceBefore = allowance(from, e.msg.sender);

    transferFrom(e, from, to, amount);

    uint256 allowanceAfter = allowance(from, e.msg.sender);

    invariant allowanceBefore != max_uint256 =>
        allowanceAfter == allowanceBefore - amount;
}`,
  },
  learnMore: { label: "Learn about Warden", href: "/products/warden" },
};

export const featureCallouts = [
  {
    title: "Run on every commit",
    body: "Warden plugs into CI. Every push re-checks your invariants, not just the commit before an audit.",
  },
  {
    title: "Find more bugs",
    body: "Formal verification reaches states and execution paths that unit and fuzz tests never touch.",
  },
  {
    title: "Work with our team",
    body: "Valence engineers write the rules with you. You are not handed a tool and left to figure out the spec.",
  },
];

export const comparisonCards = [
  {
    title: "Warden",
    tagline: "Integrate into your process",
    bullets: [
      "Run on every commit",
      "Check every contract state",
      "Check every contract path",
      "Verify your contract properties",
    ],
    cta: { label: "Learn about Warden", href: "/products/warden" },
  },
  {
    title: "Security Audits",
    tagline: "Dedicated audit team",
    bullets: [
      "Dedicated auditors",
      "Formal verification experts",
      "Detailed report",
      "Interactive process with our team",
    ],
    cta: { label: "Explore Audits", href: "/security-services/audits" },
  },
];
