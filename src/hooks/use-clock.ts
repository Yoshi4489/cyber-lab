"use client";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const timer = window.setInterval(callback, 1000);
  document.addEventListener("visibilitychange", callback);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", callback);
  };
}
const snapshot = () => Math.floor(Date.now() / 1000) * 1000;
const serverSnapshot = () => 0;
// Absolute time avoids granting extra time after refresh or a background tab.
export function useClock() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
