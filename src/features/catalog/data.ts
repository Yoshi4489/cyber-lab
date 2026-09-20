export const categories = [
  "All labs",
  "Web security",
  "Linux",
  "Networking",
  "Cryptography",
  "Forensics",
] as const;
export type Category = Exclude<(typeof categories)[number], "All labs">;
export type Difficulty = "Easy" | "Medium" | "Hard";
export type Lab = {
  slug: string;
  code: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  minutes: number;
  points: number;
  description: string;
  story: string;
  objectives: string[];
  prerequisites: string[];
  tags: string[];
  artwork:
    "cookie" | "terminal" | "cipher" | "network" | "fingerprint" | "lock";
  accent: "mint" | "violet" | "amber" | "blue";
};

const topics: Record<
  Category,
  { artwork: Lab["artwork"]; accent: Lab["accent"]; skills: string[] }
> = {
  "Web security": {
    artwork: "cookie",
    accent: "mint",
    skills: ["Browser tools", "Web fundamentals"],
  },
  Linux: {
    artwork: "terminal",
    accent: "violet",
    skills: ["Command line", "Operating systems"],
  },
  Networking: {
    artwork: "network",
    accent: "blue",
    skills: ["Network concepts", "Communication"],
  },
  Cryptography: {
    artwork: "cipher",
    accent: "amber",
    skills: ["Patterns", "Data protection"],
  },
  Forensics: {
    artwork: "fingerprint",
    accent: "violet",
    skills: ["Observation", "Digital evidence"],
  },
};

// Editorial UI fixtures only. Durations and XP illustrate the interface;
// they are not a curriculum, production scoring policy, or runnable content.
function sample(
  slug: string,
  title: string,
  category: Category,
  difficulty: Difficulty,
  minutes: number,
  points: number,
): Lab {
  const topic = topics[category];
  return {
    slug,
    title,
    category,
    difficulty,
    minutes,
    points,
    code: category.toUpperCase(),
    description: `Build confidence with ${category.toLowerCase()}, one step at a time.`,
    story:
      "This sample shows where a lab introduction will appear. Learning material and real lab access will be added in a later phase.",
    objectives: [
      `Become more familiar with ${category.toLowerCase()} concepts.`,
      "Practice explaining what you observe in your own words.",
    ],
    prerequisites:
      difficulty === "Easy"
        ? ["No security experience needed for this preview."]
        : [`Some familiarity with ${category.toLowerCase()} concepts.`],
    tags: topic.skills,
    artwork: topic.artwork,
    accent: topic.accent,
  };
}

export const labs: Lab[] = [
  sample("cookie-monster", "Cookie Monster", "Web security", "Easy", 25, 100),
  sample(
    "ghost-in-the-shell",
    "Ghost in the Shell",
    "Web security",
    "Medium",
    45,
    250,
  ),
  sample("cipher-zero", "Cipher Zero", "Cryptography", "Easy", 20, 100),
  sample("packet-trail", "Packet Trail", "Networking", "Medium", 40, 200),
  sample(
    "hidden-in-plain-sight",
    "Hidden in Plain Sight",
    "Forensics",
    "Easy",
    30,
    150,
  ),
  sample("access-denied", "Access Denied", "Web security", "Hard", 60, 400),
  sample("first-steps", "First Steps in Linux", "Linux", "Easy", 15, 100),
  sample("shell-compass", "Shell Compass", "Linux", "Medium", 35, 200),
  sample(
    "network-neighborhood",
    "Network Neighborhood",
    "Networking",
    "Easy",
    25,
    100,
  ),
  sample("signal-map", "Signal Map", "Networking", "Hard", 50, 350),
  sample("pattern-library", "Pattern Library", "Cryptography", "Hard", 45, 300),
  sample(
    "digital-footprints",
    "Digital Footprints",
    "Forensics",
    "Medium",
    40,
    250,
  ),
];

export function getLab(slug: string) {
  return labs.find((lab) => lab.slug === slug);
}
