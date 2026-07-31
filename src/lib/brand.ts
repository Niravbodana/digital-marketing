export const BRAND = {
  name: "Bodana",
  product: "Creation Machine",
  tagline: "Type one sentence. Get anything. In minutes.",
  subtagline: "One platform. Every workflow. Zero duct tape.",
  description:
    "Autonomous AI creation platform — movies, music, websites, ads, documents, code, and 94 more capabilities from a single prompt.",
} as const;

export const ROTATING_DELIVERABLES = [
  "a movie trailer",
  "a business book",
  "a mobile app",
  "a hit song",
  "a website",
  "a PowerPoint",
  "an audiobook",
  "a TV show pilot",
  "a promo video",
  "a UGC ad",
  "a commercial",
  "a novel",
  "anything",
];

export const AGENT_PHASES = [
  { id: "understand", label: "Understand", desc: "Analyzing your request and intent" },
  { id: "gather", label: "Gather", desc: "Research and context when needed" },
  { id: "create", label: "Create", desc: "Building your asset with the right tools" },
  { id: "deliver", label: "Deliver", desc: "Finalizing output ready to download" },
] as const;
