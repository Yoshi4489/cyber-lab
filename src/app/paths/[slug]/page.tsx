import { notFound, redirect } from "next/navigation";

const previousPaths = ["web-security", "digital-detective", "code-breaker"];
export const dynamicParams = false;
export function generateStaticParams() {
  return previousPaths.map((slug) => ({ slug }));
}

export default async function PreviousPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!previousPaths.includes(slug)) notFound();
  redirect("/paths");
}
