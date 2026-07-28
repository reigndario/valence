import { spawn } from "node:child_process";
import type { LogSink } from "./types.js";

export interface ContainerMount {
  source: string;
  target: string;
  mode: "ro" | "rw";
}

export interface RunContainerOptions {
  name: string;
  image: string;
  entrypoint: string;
  args: string[];
  network: "bridge" | "none";
  user: string;
  workdir?: string;
  mounts: ContainerMount[];
  tmpfs?: Array<{ target: string; sizeMb: number }>;
  memory: string;
  cpus: string;
  timeoutMs: number;
  seccompProfilePath: string;
  onLog?: LogSink;
}

export interface RunContainerResult {
  exitCode: number | null;
  timedOut: boolean;
}

function makeLineForwarder(streamName: "stdout" | "stderr", onLog?: LogSink) {
  let buffer = "";
  return {
    push(chunk: Buffer) {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.length > 0) onLog?.(line, streamName);
      }
    },
    flush() {
      if (buffer.length > 0) onLog?.(buffer, streamName);
      buffer = "";
    },
  };
}

// Runs a single hardened, single-purpose container invocation: read-only rootfs,
// dropped capabilities, no-new-privileges, an explicit seccomp profile, memory/CPU caps,
// and a hard wall-clock kill. Callers decide network mode and mounts per phase (dependency
// fetch runs with network on; the actual build runs with --network none).
export async function runHardenedContainer(opts: RunContainerOptions): Promise<RunContainerResult> {
  const dockerArgs = [
    "run",
    "--rm",
    "--name",
    opts.name,
    "--read-only",
    "--cap-drop=ALL",
    "--security-opt",
    "no-new-privileges",
    "--security-opt",
    `seccomp=${opts.seccompProfilePath}`,
    "--network",
    opts.network,
    "--memory",
    opts.memory,
    "--cpus",
    opts.cpus,
    "--user",
    opts.user,
  ];

  for (const mount of opts.mounts) {
    dockerArgs.push("-v", `${mount.source}:${mount.target}:${mount.mode}`);
  }
  for (const tmpfs of opts.tmpfs ?? []) {
    dockerArgs.push("--tmpfs", `${tmpfs.target}:rw,exec,size=${tmpfs.sizeMb}m`);
  }
  if (opts.workdir) {
    dockerArgs.push("-w", opts.workdir);
  }
  dockerArgs.push("--entrypoint", opts.entrypoint, opts.image, ...opts.args);

  return new Promise((resolve, reject) => {
    const child = spawn("docker", dockerArgs);
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      spawn("docker", ["kill", opts.name]);
    }, opts.timeoutMs);

    const stdout = makeLineForwarder("stdout", opts.onLog);
    const stderr = makeLineForwarder("stderr", opts.onLog);

    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      stdout.flush();
      stderr.flush();
      resolve({ exitCode: code, timedOut });
    });
  });
}

export async function runDockerCommand(args: string[]): Promise<{ exitCode: number | null; stdout: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", args);
    let stdout = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ exitCode: code, stdout }));
  });
}
