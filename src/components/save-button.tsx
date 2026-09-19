"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedLabs } from "@/hooks/use-saved-labs";

export function SaveButton({
  slug,
  title,
  showLabel = false,
}: {
  slug: string;
  title: string;
  showLabel?: boolean;
}) {
  const { saved, toggle, error } = useSavedLabs();
  const isSaved = saved.includes(slug);
  return (
    <div className="save-control">
      <Button
        variant={showLabel ? "secondary" : "ghost"}
        size={showLabel ? "default" : "icon"}
        className={isSaved ? "is-saved" : ""}
        aria-label={`${isSaved ? "Unsave" : "Save"} ${title}`}
        aria-pressed={isSaved}
        onClick={() => toggle(slug)}
      >
        {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
        {showLabel && (isSaved ? "Saved to your collection" : "Save for later")}
      </Button>
      {error && (
        <span role="alert" className="save-error">
          {error}
        </span>
      )}
    </div>
  );
}
