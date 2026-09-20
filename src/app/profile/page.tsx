import type { Metadata } from "next";
import { ComingSoon } from "@/features/preview/coming-soon";
export const metadata: Metadata = { title: "Profile · Preview" };
export default function ProfilePage() { return <ComingSoon kind="profile" />; }
