import type { Metadata } from "next";
import { ComingSoon } from "@/features/preview/coming-soon";
export const metadata: Metadata = { title: "Learning paths · Preview" };
export default function PathsPage() { return <ComingSoon kind="paths" />; }
