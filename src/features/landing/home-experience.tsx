"use client";
import { Dashboard } from "@/features/dashboard/dashboard";
import { useLearner } from "@/features/learner/store";
import { Landing } from "./landing";

export function HomeExperience() {
  const { learner } = useLearner();
  return learner.signedIn ? <Dashboard /> : <Landing />;
}
