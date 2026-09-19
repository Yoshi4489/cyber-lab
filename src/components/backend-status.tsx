"use client";

import { useState } from "react";
import { RefreshCw, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

const messages = {
  "not-configured": "A live range is not connected to this preview yet.",
  reachable:
    "The backend API is reachable. Lab launching is still under development.",
  unavailable:
    "The backend API is unavailable. You can still explore the preview.",
};

export function BackendStatus() {
  const [status, setStatus] = useState<keyof typeof messages | null>(null);
  const [checking, setChecking] = useState(false);
  async function check() {
    setChecking(true);
    try {
      const response = await fetch("/api/backend-status", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Request failed");
      const data: unknown = await response.json();
      const value =
        data && typeof data === "object" && "status" in data
          ? data.status
          : null;
      setStatus(
        value === "reachable" || value === "not-configured"
          ? value
          : "unavailable",
      );
    } catch {
      setStatus("unavailable");
    } finally {
      setChecking(false);
    }
  }
  return (
    <div className="connection-panel">
      <Server size={21} />
      <div>
        <h3>Live range connection</h3>
        <p role="status">
          {checking
            ? "Checking the range connection…"
            : status
              ? messages[status]
              : "The catalog is a preview. Check whether a backend is connected."}
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={check} disabled={checking}>
        <RefreshCw size={14} className={checking ? "spin" : ""} />
        {checking ? "Checking…" : "Check connection"}
      </Button>
    </div>
  );
}
