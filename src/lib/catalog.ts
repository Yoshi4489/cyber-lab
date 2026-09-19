export const categories = [
  "All labs",
  "Web security",
  "Cryptography",
  "Forensics",
  "Networks",
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

// Editorial fixtures for the frontend preview. These are not published, runnable labs.
export const labs: Lab[] = [
  {
    slug: "cookie-monster",
    code: "WEB / 001",
    title: "Cookie Monster",
    category: "Web security",
    difficulty: "Easy",
    minutes: 25,
    points: 100,
    description:
      "A little trust. A lot of cookies. Find out what this application is hiding.",
    story:
      "Crumb & Co. has launched a members-only recipe vault. The developers say their new cookie-based login keeps the secret recipes safe. Your assignment is to examine that assumption and find the protected recipe without an administrator account.",
    objectives: [
      "Understand how the browser stores session cookies",
      "Identify the boundary between client input and server trust",
      "Explain why authorization must be checked on the server",
    ],
    prerequisites: [
      "Basic HTTP requests and responses",
      "Browser developer tools",
    ],
    tags: ["Cookies", "Authentication"],
    artwork: "cookie",
    accent: "mint",
  },
  {
    slug: "ghost-in-the-shell",
    code: "WEB / 002",
    title: "Ghost in the Shell",
    category: "Web security",
    difficulty: "Medium",
    minutes: 45,
    points: 250,
    description:
      "An innocent diagnostic tool. An unexpected way into the system.",
    story:
      "A small hosting company built a network diagnostic page for its support team. A recent audit found unusual processes on the server. Trace the path from the web interface to the operating system and document the input handling mistake.",
    objectives: [
      "Trace input through a web application",
      "Recognize unsafe command construction",
      "Describe a safer approach to invoking system tools",
    ],
    prerequisites: ["Basic Linux commands", "HTTP query parameters"],
    tags: ["Command injection", "Linux"],
    artwork: "terminal",
    accent: "violet",
  },
  {
    slug: "cipher-zero",
    code: "CRYPTO / 001",
    title: "Cipher Zero",
    category: "Cryptography",
    difficulty: "Easy",
    minutes: 20,
    points: 100,
    description:
      "Every secret has a pattern. This intercepted message is no exception.",
    story:
      "An archived radio transmission contains a short encrypted message and a clue from its author: the alphabet has taken a small step sideways. Study the text, form a hypothesis, and work back to the original message.",
    objectives: [
      "Distinguish encoding from encryption",
      "Recognize a classical substitution cipher",
      "Use frequency patterns to test a hypothesis",
    ],
    prerequisites: ["Curiosity and a text editor"],
    tags: ["Classical ciphers", "Patterns"],
    artwork: "cipher",
    accent: "amber",
  },
  {
    slug: "packet-trail",
    code: "NET / 001",
    title: "Packet Trail",
    category: "Networks",
    difficulty: "Medium",
    minutes: 40,
    points: 200,
    description:
      "Follow the conversation. The evidence is somewhere on the wire.",
    story:
      "An incident responder captured traffic just before an internal service went offline. Reconstruct the sequence of requests and identify the exchange that explains what happened. Every observation should be backed by a packet.",
    objectives: [
      "Read a packet capture",
      "Filter traffic by protocol and endpoint",
      "Reconstruct an application conversation",
    ],
    prerequisites: ["TCP/IP fundamentals", "Familiarity with Wireshark"],
    tags: ["Wireshark", "Traffic analysis"],
    artwork: "network",
    accent: "blue",
  },
  {
    slug: "hidden-in-plain-sight",
    code: "FORENSICS / 001",
    title: "Hidden in Plain Sight",
    category: "Forensics",
    difficulty: "Easy",
    minutes: 30,
    points: 150,
    description: "An ordinary image with an extraordinary amount left unsaid.",
    story:
      "A photograph was recovered from an abandoned workstation. It looks unremarkable, but its file size and metadata tell a different story. Preserve the original, inspect a copy, and document what the image is carrying.",
    objectives: [
      "Identify file types independently of their extensions",
      "Inspect metadata and embedded content",
      "Keep a reproducible record of forensic findings",
    ],
    prerequisites: ["Basic file handling", "A terminal or hex viewer"],
    tags: ["Metadata", "Steganography"],
    artwork: "fingerprint",
    accent: "violet",
  },
  {
    slug: "access-denied",
    code: "WEB / 003",
    title: "Access Denied",
    category: "Web security",
    difficulty: "Hard",
    minutes: 60,
    points: 400,
    description:
      "The door is locked. But who decided which key belongs to you?",
    story:
      "A document portal has passed its login tests, yet confidential reports still appear in the wrong accounts. Review how the application connects a signed-in user to a requested document and identify where that relationship breaks down.",
    objectives: [
      "Separate authentication from authorization",
      "Map object access across different user roles",
      "Propose ownership checks for every protected operation",
    ],
    prerequisites: [
      "HTTP APIs",
      "Session authentication",
      "Experience with an intercepting proxy",
    ],
    tags: ["Access control", "IDOR"],
    artwork: "lock",
    accent: "mint",
  },
];

export function getLab(slug: string) {
  return labs.find((lab) => lab.slug === slug);
}

export const learningPaths = [
  {
    slug: "web-security",
    title: "Web security foundations",
    label: "START HERE",
    description:
      "Go beyond the login screen. Learn how trust, sessions, and access control can go wrong.",
    icon: "web",
    labSlugs: ["cookie-monster", "ghost-in-the-shell", "access-denied"],
  },
  {
    slug: "digital-detective",
    title: "The digital detective",
    label: "FOLLOW THE EVIDENCE",
    description:
      "Turn files and network traffic into a story. Build a repeatable investigation workflow.",
    icon: "search",
    labSlugs: ["hidden-in-plain-sight", "packet-trail"],
  },
  {
    slug: "code-breaker",
    title: "Think like a codebreaker",
    label: "FIND THE PATTERN",
    description:
      "Start with classical ciphers and learn to ask better questions about a secret message.",
    icon: "key",
    labSlugs: ["cipher-zero"],
  },
] as const;
