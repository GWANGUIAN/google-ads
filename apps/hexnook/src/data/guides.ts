export interface GuideInfo {
  slug: string;
  title: string;
  excerpt: string;
  relatedTool: string;
}

export const GUIDES: GuideInfo[] = [
  {
    slug: "/guides/json-validation",
    title: "How JSON validation actually works",
    excerpt: "What makes JSON valid or invalid, the most common mistakes, and how to read a parser's error message.",
    relatedTool: "/json",
  },
  {
    slug: "/guides/what-is-base64",
    title: "What is Base64, and when should you use it?",
    excerpt: "Base64 turns binary data into text-safe characters — here's why that's useful, and what it isn't for.",
    relatedTool: "/base64",
  },
  {
    slug: "/guides/md5-vs-sha256",
    title: "MD5 vs. SHA-256: which hash should you use?",
    excerpt: "A practical comparison of the common hash algorithms and when each one is (and isn't) appropriate.",
    relatedTool: "/hash",
  },
  {
    slug: "/guides/regex-cheatsheet",
    title: "Regex cheat sheet: the patterns you'll actually use",
    excerpt: "A quick-reference for the regex syntax that comes up constantly — anchors, classes, quantifiers, groups.",
    relatedTool: "/regex",
  },
  {
    slug: "/guides/jwt-explained",
    title: "JWTs explained: what's actually inside a token",
    excerpt: "Why a JWT isn't encrypted, what the three parts mean, and how signature verification actually works.",
    relatedTool: "/jwt",
  },
];
