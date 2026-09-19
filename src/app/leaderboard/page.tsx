import type { Metadata } from "next";
import { Leaderboard } from "@/features/leaderboard/leaderboard";
export const metadata: Metadata = { title: "Leaderboard" };
export default function LeaderboardPage() { return <Leaderboard />; }
