"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resetDemo } from "@/features/learner/store";

export function DemoControls() {
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);
  return (
    <div className="demo-reset">
      <h2>A fresh start, whenever you need it.</h2>
      <p>
        Reset this browser’s demo username, sample progress, and simulated
        sessions. Saved labs and your theme preference stay as they are.
      </p>
      {confirming ? (
        <div>
          <p>Clear your local demo progress?</p>
          <Button
            onClick={() => {
              resetDemo();
              setConfirming(false);
              setCleared(true);
            }}
          >
            Yes, reset demo
          </Button>
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            Keep my progress
          </Button>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            setCleared(false);
            setConfirming(true);
          }}
        >
          Reset demo progress
        </Button>
      )}
      {cleared && <p role="status">Your demo progress has been reset.</p>}
    </div>
  );
}
