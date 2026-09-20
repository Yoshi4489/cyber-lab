import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLab, labs } from "@/features/catalog/data";
import { LabBriefing } from "@/features/briefing/lab-briefing";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return labs.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lab = getLab((await params).slug);
  return {
    title: lab?.title ?? "Lab not found",
    description: lab?.description,
  };
}
export default async function LabPage({ params }: Props) {
  const lab = getLab((await params).slug);
  if (!lab) notFound();
  return <LabBriefing lab={lab} />;
}
