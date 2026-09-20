"use client";
import { useSyncExternalStore } from "react";
import { SunMoon } from "lucide-react";

const key = "ciscoku:theme";
const event = "ciscoku:theme-change";
let temporary: string | null = null;
function subscribe(callback: () => void) {
  function synchronize() {
    const preference = snapshot();
    document.documentElement.dataset.theme = preference;
    callback();
  }
  window.addEventListener("storage", synchronize);
  window.addEventListener(event, synchronize);
  return () => {
    window.removeEventListener("storage", synchronize);
    window.removeEventListener(event, synchronize);
  };
}
function snapshot() {
  try {
    const saved = temporary ?? window.localStorage.getItem(key);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch { return temporary ?? "system"; }
}
const serverSnapshot = () => "system";

export function ThemeToggle() {
  const preference = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return <label className="theme-toggle">
    <SunMoon size={17} aria-hidden="true" /><span className="sr-only">Color theme</span>
    <select aria-label="Color theme" value={preference} onChange={event => {
      const value = event.target.value;
      try { window.localStorage.setItem(key, value); temporary = null; }
      catch { temporary = value; }
      document.documentElement.dataset.theme = value;
      window.dispatchEvent(new Event("ciscoku:theme-change"));
    }}>
      <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
    </select>
  </label>;
}
