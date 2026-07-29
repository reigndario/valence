"use client";

import { useEffect, useRef, useState } from "react";

interface LogLine {
  line: string;
  stream: "stdout" | "stderr";
  ts: number;
}

export function LogViewer({ engagementId, apiUrl }: { engagementId: string; apiUrl: string }) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const source = new EventSource(`${apiUrl}/engagements/${engagementId}/logs`);

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = (event) => {
      try {
        setLines((prev) => [...prev, JSON.parse(event.data) as LogLine]);
      } catch {
        // heartbeat/comment lines (": connected") never reach onmessage; ignore anything
        // that isn't valid JSON rather than crashing the viewer on it.
      }
    };

    return () => source.close();
  }, [apiUrl, engagementId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  return (
    <div>
      <p>Live log stream — {connected ? "connected" : "disconnected"}</p>
      <div
        style={{
          background: "#111",
          color: "#0f0",
          padding: "1rem",
          height: "20rem",
          overflowY: "auto",
          fontSize: "0.85rem",
        }}
      >
        {lines.length === 0 ? (
          <p style={{ color: "#888" }}>No log lines yet.</p>
        ) : (
          lines.map((l, i) => (
            <div key={i} style={{ color: l.stream === "stderr" ? "#f66" : "#0f0" }}>
              {l.line}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
