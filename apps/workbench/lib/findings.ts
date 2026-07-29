// Placeholder severity levels only — the real severity model (Code4rena/Sherlock-style
// impact x likelihood matrix vs. custom) is an open decision blocking Phase 3, not decided here.
export type FindingSeverity = "low" | "medium" | "high" | "critical";
export type FindingStatus = "new" | "promoted" | "demoted" | "merged";

export interface Finding {
  id: string;
  title: string;
  severity: FindingSeverity;
  status: FindingStatus;
  tool: string;
  repoLabel: string;
  file: string;
  lineStart: number;
  lineEnd: number;
}

const SEVERITIES: FindingSeverity[] = ["low", "medium", "high", "critical"];
const TOOLS = ["slither", "artemis", "scout", "foil", "manual"];
const REPOS = ["acme/vault-v2", "acme/staking-pool", "acme/bridge-router", "acme/token-controller"];
const FILES = [
  "src/Vault.sol",
  "src/StakingPool.sol",
  "src/BridgeRouter.sol",
  "src/TokenController.sol",
  "src/Governance.sol",
];
const TITLES = [
  "Reentrancy in withdraw path",
  "Unchecked return value on external call",
  "Missing access control on admin function",
  "Integer overflow in reward calculation",
  "Front-runnable price update",
  "Unbounded loop over user-controlled array",
  "Signature replay across chains",
  "Storage collision in proxy upgrade",
  "Rounding error favors attacker",
  "Timestamp dependence in auction close",
];

// Fixed seed so the same 100 findings render on every load — needed for interaction testing
// and for the P2-15 timed-triage acceptance test to be repeatable across runs.
const FINDING_SEED = 42;

function mulberry32(seed: number): () => number {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateFindings(count: number): Finding[] {
  const random = mulberry32(FINDING_SEED);
  const findings: Finding[] = [];
  for (let i = 0; i < count; i++) {
    const lineStart = 10 + Math.floor(random() * 300);
    findings.push({
      id: `synthetic-${String(i + 1).padStart(3, "0")}`,
      title: TITLES[Math.floor(random() * TITLES.length)],
      severity: SEVERITIES[Math.floor(random() * SEVERITIES.length)],
      status: "new",
      tool: TOOLS[Math.floor(random() * TOOLS.length)],
      repoLabel: REPOS[Math.floor(random() * REPOS.length)],
      file: FILES[Math.floor(random() * FILES.length)],
      lineStart,
      lineEnd: lineStart + Math.floor(random() * 20),
    });
  }
  return findings;
}

const SYNTHETIC_FINDINGS = generateFindings(100);

export async function listFindings(): Promise<Finding[]> {
  return SYNTHETIC_FINDINGS;
}
