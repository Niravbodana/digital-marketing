export type Studio = {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
};

export const STUDIOS: Studio[] = [
  { id: "creator", name: "Creator Studio", icon: "🎨", description: "Images & videos with best AI models", color: "from-orange-500 to-pink-500" },
  { id: "marketing", name: "Marketing Studio", icon: "📣", description: "UGC ads, viral shorts, social packs", color: "from-violet-500 to-purple-600" },
  { id: "documents", name: "Document Studio", icon: "📄", description: "Word, PDF, PowerPoint, Excel", color: "from-blue-500 to-cyan-500" },
  { id: "audio", name: "Audio Studio", icon: "🎵", description: "Music, voice, sound effects", color: "from-emerald-500 to-teal-500" },
  { id: "video", name: "Video Studio", icon: "🎬", description: "Clips, reels, cinematic shorts", color: "from-red-500 to-orange-500" },
  { id: "code", name: "Code Studio", icon: "💻", description: "Scripts, automation, apps", color: "from-green-500 to-emerald-500" },
  { id: "research", name: "Research Studio", icon: "🔬", description: "Web research, analysis, reports", color: "from-indigo-500 to-blue-500" },
  { id: "social", name: "Social Studio", icon: "📱", description: "Instagram, TikTok, LinkedIn", color: "from-pink-500 to-rose-500" },
  { id: "maker", name: "Make Anything", icon: "⚡", description: "Movies, books, apps, songs — one prompt", color: "from-yellow-500 to-orange-600" },
];

export type VideoTemplate = {
  id: string;
  name: string;
  tag: string;
  description: string;
  popular?: boolean;
};

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  { id: "cinematic", name: "Cinematic Story", tag: "Popular", description: "Photoreal cinematic shorts with dramatic lighting", popular: true },
  { id: "narrated", name: "Narrated Tale", tag: "Story", description: "Voice-led storytelling with stylised visuals" },
  { id: "ugc", name: "UGC Ad", tag: "Marketing", description: "Scroll-stopping user-generated style ads" },
  { id: "anime", name: "Viral Anime", tag: "Trending", description: "Anime episode style — shonen, romance, isekai" },
  { id: "reel", name: "Instagram Reel", tag: "Social", description: "9:16 vertical with hooks under 1 second" },
  { id: "testimonial", name: "Talking Head", tag: "Ads", description: "Testimonial-style talking head videos" },
  { id: "product", name: "Product Demo", tag: "E-commerce", description: "Product showcase with lifestyle shots" },
  { id: "commercial", name: "Commercial Spot", tag: "Ads", description: "30-second agency-quality commercial" },
  { id: "audiobook", name: "Audiobook", tag: "Audio", description: "Narrated chapter with voice generation" },
  { id: "movie", name: "Movie Trailer", tag: "Cinema", description: "Cinematic trailer with score and edit", popular: true },
];

export const FORMAT_PILLS = [
  "Movie trailers", "Business books", "Mobile apps", "Hit songs", "Websites",
  "PowerPoint decks", "Audiobooks", "TV pilots", "Commercials", "Novels",
  "Word docs", "Music tracks", "Videos", "AI images", "Voice narration",
  "UGC ads", "Pitch decks", "Instagram posts", "Graphic ads", "Family movies",
];
