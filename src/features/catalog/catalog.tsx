"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpRight,
  Bookmark,
  SearchX,
  X,
} from "lucide-react";
import Link from "next/link";
import { categories, type Lab } from "@/features/catalog/data";
import { useSavedLabs } from "@/features/bookmarks/use-saved-labs";
import { LabCard } from "@/features/catalog/lab-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Catalog({
  labs,
  savedOnly = false,
}: {
  labs: Lab[];
  savedOnly?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All labs");
  const [difficulty, setDifficulty] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState("grid");
  const { saved } = useSavedLabs();
  const available = savedOnly
    ? labs.filter((lab) => saved.includes(lab.slug))
    : labs;
  const filtered = available
    .filter(
      (lab) =>
        (category === "All labs" || lab.category === category) &&
        (difficulty === "all" || lab.difficulty === difficulty) &&
        `${lab.title} ${lab.description} ${lab.tags.join(" ")} ${lab.category}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
    )
    .sort((a, b) =>
      sort === "shortest"
        ? a.minutes - b.minutes
        : sort === "points"
          ? b.points - a.points
          : 0,
    );
  const hasFilters =
    query !== "" || category !== "All labs" || difficulty !== "all";
  function clearFilters() {
    setQuery("");
    setCategory("All labs");
    setDifficulty("all");
  }

  return (
    <section
      className="catalog"
      id="lab-catalog"
      aria-label={savedOnly ? "Saved labs" : "Lab catalog"}
    >
      <div className="catalog-heading">
        <div>
          <h2>
            {savedOnly ? "Your collection" : "Explore the labs"}
            <span className="count-label">{available.length}</span>
          </h2>
          <p>
            {savedOnly
              ? "A little inspiration for your next session."
              : "Follow your curiosity. Find your next challenge."}
          </p>
        </div>
        {!savedOnly && (
          <Link href="/paths" className="text-link">
            Explore learning paths <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
      <div className="filter-row">
        <div className="search-field">
          <Search size={17} />
          <Input
            aria-label="Search labs"
            placeholder="Search labs, skills, or keywords…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </Button>
          )}
        </div>
        <label className="select-field">
          <SlidersHorizontal size={16} />
          <span className="sr-only">Difficulty</span>
          <select
            aria-label="Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="all">All difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </label>
      </div>
      <div className="catalog-controls">
        <div className="category-tabs" role="group" aria-label="Lab category">
          {categories.map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="sm"
              className={category === item ? "category-active" : ""}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </Button>
          ))}
        </div>
        <div className="view-controls" role="group" aria-label="Catalog layout">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List size={17} />
          </Button>
        </div>
      </div>
      <div className="results-row">
        <p aria-live="polite">
          Showing <strong>{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "lab" : "labs"}
          {hasFilters && (
            <button className="clear-filters" onClick={clearFilters}>
              Clear filters <X size={12} />
            </button>
          )}
        </p>
        <label>
          Sort by:{" "}
          <select
            aria-label="Sort labs"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="shortest">Shortest first</option>
            <option value="points">Highest points</option>
          </select>
        </label>
      </div>
      {filtered.length > 0 ? (
        <div className={`lab-grid ${view === "list" ? "lab-list" : ""}`}>
          {filtered.map((lab) => (
            <LabCard key={lab.slug} lab={lab} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {savedOnly && available.length === 0 ? (
            <>
              <Bookmark size={30} />
              <h3>Keep your next challenge close.</h3>
              <p>
                Save a lab using its bookmark button. Your collection stays in
                this browser.
              </p>
              <Button asChild>
                <Link href="/">
                  Explore labs <ArrowUpRight size={16} />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <SearchX size={32} />
              <h3>No labs found</h3>
              <p>
                Try a different keyword or give your filters a little more room.
              </p>
              <Button variant="secondary" onClick={clearFilters}>
                Reset filters
              </Button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
