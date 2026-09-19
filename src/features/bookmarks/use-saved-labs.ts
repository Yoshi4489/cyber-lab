"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

const key = "cyber-range:saved-labs:v1";
const event = "cyber-range:saved-labs-changed";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(event, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(event, callback);
  };
}
function getSnapshot() {
  try {
    return window.localStorage.getItem(key) ?? "[]";
  } catch {
    return "[]";
  }
}
const getServerSnapshot = () => "[]";

export function useSavedLabs() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [error, setError] = useState<string | null>(null);
  const saved = useMemo<string[]>(() => {
    try {
      const data: unknown = JSON.parse(raw);
      return Array.isArray(data)
        ? data.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }, [raw]);
  function toggle(slug: string) {
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify(
          saved.includes(slug)
            ? saved.filter((id) => id !== slug)
            : [...saved, slug],
        ),
      );
      window.dispatchEvent(new Event(event));
      setError(null);
    } catch {
      setError(
        "Your browser could not save this lab. Allow local storage and try again.",
      );
    }
  }
  return { saved, toggle, error };
}
