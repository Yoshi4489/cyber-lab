import type { Metadata } from "next";
import { Catalog } from "@/features/catalog/catalog";
import { labs } from "@/features/catalog/data";

export const metadata: Metadata = { title: "Explore labs" };

export default function LabsPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</p>
          <h1>Find your next discovery.</h1>
          <p>
            Explore 12 sample labs, at your own pace. Every session is a demo.
          </p>
        </div>
      </div>
      <Catalog labs={labs} />
    </>
  );
}
