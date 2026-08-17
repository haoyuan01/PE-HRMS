"use client";

import { useEffect } from "react";

// When a JS chunk fails to load (ChunkLoadError) — usually a transient network
// failure or a stale HTML page pointing at chunk hashes that changed on a
// redeploy — the app can't render and the user sees a broken/blank screen.
// This reloads the page once to fetch fresh HTML + chunks, guarded against a
// reload loop.
const RELOAD_FLAG = "chunk-reload-at";
const RELOAD_WINDOW_MS = 10_000;

function isChunkLoadError(reason: unknown): boolean {
  const message =
    (reason instanceof Error ? `${reason.name} ${reason.message}` : "") +
    (typeof reason === "string" ? reason : "");
  return (
    /ChunkLoadError/i.test(message) ||
    /Loading (CSS )?chunk [\w-]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message)
  );
}

function reloadOnce() {
  const last = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0);
  // Don't reload again if we already did so very recently (avoids a loop when
  // the chunk is genuinely missing).
  if (Date.now() - last < RELOAD_WINDOW_MS) return;
  sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  window.location.reload();
}

export function ChunkErrorReloader() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error ?? event.message)) reloadOnce();
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) reloadOnce();
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
