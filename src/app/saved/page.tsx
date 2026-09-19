import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";
import { labs } from "@/lib/catalog";

export const metadata: Metadata = { title: "Saved labs" };

export default function SavedPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR NEXT ADVENTURE, BOOKMARKED.</p>
          <h1>
            Worth coming back to<span className="accent">.</span>
          </h1>
          <p>Saved on this device, ready when curiosity calls.</p>
        </div>
      </div>
      <Catalog labs={labs} savedOnly />
    </>
  );
}
