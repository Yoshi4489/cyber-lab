import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLab, labs } from "@/features/catalog/data";
import { SessionPanel } from "@/features/session/session-panel";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return labs.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lab = getLab((await params).slug);
  return { title: lab ? `${lab.title} · Demo session` : "Lab not found" };
}
export default async function SessionPage({ params }: Props) {
  const lab = getLab((await params).slug);
  if (!lab) notFound();
  return <SessionPanel lab={lab} />;
}
