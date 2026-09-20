"use client";
import { useLearner } from "./store";

export function DemoNotice() {
  const { temporary } = useLearner();
  return (
    <p role={temporary ? "status" : undefined}>
      {temporary
        ? "Your browser could not save changes. This demo still works in this tab; progress may be lost when you leave."
        : "Demo only. Your username and sample progress stay in this browser."}
    </p>
  );
}
