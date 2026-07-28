import { config } from "../config.js";
import { runDockerCommand } from "./docker.js";

// Named Docker volumes are created root-owned by default; every hardened container we run
// uses the Foundry image's fixed non-root "foundry" user (uid 1000), so any volume it needs
// to write into has to be chowned once up front.
export async function ensureWritableVolume(name: string): Promise<void> {
  await runDockerCommand(["volume", "create", name]);
  await runDockerCommand([
    "run",
    "--rm",
    "-v",
    `${name}:/mnt/target`,
    "--user",
    "root",
    "--entrypoint",
    "sh",
    config.foundryImage,
    "-c",
    "chown -R 1000:1000 /mnt/target",
  ]);
}
