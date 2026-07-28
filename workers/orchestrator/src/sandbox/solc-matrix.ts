import { readFile } from "node:fs/promises";
import path from "node:path";

interface SolidityFilesCache {
  files?: Record<string, { artifacts?: Record<string, Record<string, unknown>> }>;
}

// Foundry's own solidity-files-cache.json records, per compiled contract, which solc
// version actually compiled it — so the resolved matrix is exactly what Foundry decided it
// needed, not a version list we guess at from foundry.toml or source pragmas ourselves.
export async function resolveSolcMatrix(hostDir: string): Promise<string[]> {
  const cachePath = path.join(hostDir, "cache/solidity-files-cache.json");
  const raw = await readFile(cachePath, "utf8");
  const cache = JSON.parse(raw) as SolidityFilesCache;

  const versions = new Set<string>();
  for (const fileInfo of Object.values(cache.files ?? {})) {
    for (const perVersion of Object.values(fileInfo.artifacts ?? {})) {
      for (const version of Object.keys(perVersion)) {
        versions.add(version);
      }
    }
  }

  return [...versions].sort();
}
