"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, Loader2, Server } from "lucide-react";
import { healthApi } from "@/lib/api";

type Status = "checking" | "online" | "offline";

export default function ServerStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const [retryCount, setRetryCount] = useState(0);

  const check = async () => {
    setStatus("checking");
    try {
      await healthApi.check();
      setStatus("online");
    } catch {
      setStatus("offline");
      // Retry every 8 seconds when offline
      setTimeout(() => setRetryCount((c) => c + 1), 8000);
    }
  };

  useEffect(() => {
    check();
  }, [retryCount]);

  if (status === "online") return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {status === "checking" && (
        <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>
            <strong>Connecting to server</strong> — this may take a moment on first load (free tier
            spin-up).
          </span>
        </div>
      )}
      {status === "offline" && (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <WifiOff className="w-4 h-4" />
          <span>
            <strong>Backend server initializing</strong> — the app may take up to 60 seconds to
            wake up on free hosting. Retrying automatically…
          </span>
          <button
            onClick={check}
            className="ml-2 underline font-semibold hover:no-underline"
          >
            Retry now
          </button>
        </div>
      )}
    </div>
  );
}

export function ServerStatusBadge() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    healthApi
      .check()
      .then(() => setStatus("online"))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Server className="w-3.5 h-3.5 text-slate-400" />
      {status === "checking" && (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
          <span className="text-slate-500">Connecting…</span>
        </>
      )}
      {status === "online" && (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-600 font-medium">API Online</span>
        </>
      )}
      {status === "offline" && (
        <>
          <WifiOff className="w-3 h-3 text-amber-500" />
          <span className="text-amber-600 font-medium">Server starting…</span>
        </>
      )}
    </div>
  );
}
