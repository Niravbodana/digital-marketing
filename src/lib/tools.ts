export type AgentTool = {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  prompt: string;
};

export const AGENT_TOOLS: AgentTool[] = [
  // Content (10)
  { id: "caption", name: "Caption Writer", icon: "✍️", category: "Content", description: "Write engaging captions", prompt: "Write an engaging Instagram caption for:" },
  { id: "hashtags", name: "Hashtag Generator", icon: "#️⃣", category: "Content", description: "Generate trending hashtags", prompt: "Generate 20 hashtags for:" },
  { id: "blog", name: "Blog Writer", icon: "📝", category: "Content", description: "Long-form blog posts", prompt: "Write a blog post about:" },
  { id: "headline", name: "Headline Maker", icon: "📰", category: "Content", description: "Catchy headlines", prompt: "Create 5 catchy headlines for:" },
  { id: "cta", name: "CTA Generator", icon: "🎯", category: "Content", description: "Call-to-action copy", prompt: "Write a strong CTA for:" },
  { id: "bio", name: "Bio Writer", icon: "👤", category: "Content", description: "Social media bios", prompt: "Write Instagram bio for:" },
  { id: "thread", name: "Thread Writer", icon: "🧵", category: "Content", description: "Twitter/X threads", prompt: "Write a viral thread about:" },
  { id: "email", name: "Email Copy", icon: "📧", category: "Content", description: "Marketing emails", prompt: "Write marketing email for:" },
  { id: "adcopy", name: "Ad Copy", icon: "📢", category: "Content", description: "Paid ad copy", prompt: "Write Facebook ad copy for:" },
  { id: "rewrite", name: "Content Rewriter", icon: "🔄", category: "Content", description: "Rewrite & improve", prompt: "Rewrite and improve:" },

  // Image (10)
  { id: "img-prompt", name: "Image Prompt", icon: "🖼️", category: "Image", description: "AI image prompts", prompt: "Create detailed image generation prompt for:" },
  { id: "img-caption", name: "Image Caption", icon: "🌅", category: "Image", description: "Caption for images", prompt: "Write caption for this image topic:" },
  { id: "carousel", name: "Carousel Ideas", icon: "📱", category: "Image", description: "Carousel slide ideas", prompt: "Create 5 carousel slide ideas for:" },
  { id: "infographic", name: "Infographic Plan", icon: "📊", category: "Image", description: "Infographic structure", prompt: "Plan an infographic about:" },
  { id: "logo-brief", name: "Logo Brief", icon: "🎨", category: "Image", description: "Logo design brief", prompt: "Create logo design brief for:" },
  { id: "color-palette", name: "Color Palette", icon: "🎭", category: "Image", description: "Brand color schemes", prompt: "Suggest color palette for brand:" },
  { id: "thumbnail", name: "Thumbnail Ideas", icon: "🖥️", category: "Image", description: "YouTube thumbnails", prompt: "YouTube thumbnail ideas for:" },
  { id: "meme", name: "Meme Ideas", icon: "😂", category: "Image", description: "Viral meme concepts", prompt: "Create meme ideas for:" },
  { id: "story", name: "Story Design", icon: "📲", category: "Image", description: "Instagram story layout", prompt: "Design Instagram story sequence for:" },
  { id: "banner", name: "Banner Copy", icon: "🏷️", category: "Image", description: "Web banner text", prompt: "Write banner copy for:" },

  // Video (10)
  { id: "reel-script", name: "Reel Script", icon: "🎬", category: "Video", description: "Instagram Reel scripts", prompt: "Write Instagram Reel script for:" },
  { id: "video-hook", name: "Video Hook", icon: "🪝", category: "Video", description: "First 3 second hooks", prompt: "Write viral video hook for:" },
  { id: "youtube-script", name: "YouTube Script", icon: "▶️", category: "Video", description: "YouTube video scripts", prompt: "Write YouTube video script for:" },
  { id: "subtitle", name: "Subtitles", icon: "💬", category: "Video", description: "Video subtitles", prompt: "Write subtitles for video about:" },
  { id: "edit-plan", name: "Edit Plan", icon: "✂️", category: "Video", description: "Video editing plan", prompt: "Create video editing plan for:" },
  { id: "broll", name: "B-Roll Ideas", icon: "🎥", category: "Video", description: "B-roll shot list", prompt: "Suggest B-roll shots for:" },
  { id: "tiktok", name: "TikTok Script", icon: "🎵", category: "Video", description: "TikTok video scripts", prompt: "Write TikTok script for:" },
  { id: "shorts", name: "Shorts Ideas", icon: "⚡", category: "Video", description: "YouTube Shorts ideas", prompt: "YouTube Shorts ideas for:" },
  { id: "voiceover", name: "Voiceover Script", icon: "🎙️", category: "Video", description: "Voiceover narration", prompt: "Write voiceover script for:" },
  { id: "transition", name: "Transition Ideas", icon: "🔀", category: "Video", description: "Video transitions", prompt: "Suggest video transitions for:" },

  // SEO (8)
  { id: "keywords", name: "Keyword Research", icon: "🔍", category: "SEO", description: "SEO keywords", prompt: "Research SEO keywords for:" },
  { id: "meta", name: "Meta Tags", icon: "🏷️", category: "SEO", description: "Meta title & description", prompt: "Write meta tags for:" },
  { id: "schema", name: "Schema Markup", icon: "📋", category: "SEO", description: "Structured data", prompt: "Suggest schema markup for:" },
  { id: "local-seo", name: "Local SEO", icon: "📍", category: "SEO", description: "Local business SEO", prompt: "Local SEO strategy for:" },
  { id: "backlinks", name: "Backlink Ideas", icon: "🔗", category: "SEO", description: "Link building", prompt: "Backlink strategy for:" },
  { id: "audit", name: "SEO Audit", icon: "🔎", category: "SEO", description: "Site audit checklist", prompt: "SEO audit checklist for:" },
  { id: "sitemap", name: "Sitemap Plan", icon: "🗺️", category: "SEO", description: "Site structure", prompt: "Sitemap structure for:" },
  { id: "competitor-seo", name: "Competitor SEO", icon: "⚔️", category: "SEO", description: "Competitor analysis", prompt: "SEO competitor analysis for:" },

  // Code (7)
  { id: "html", name: "HTML Generator", icon: "🌐", category: "Code", description: "HTML snippets", prompt: "Generate HTML for:" },
  { id: "css", name: "CSS Styling", icon: "💅", category: "Code", description: "CSS styles", prompt: "Write CSS for:" },
  { id: "react", name: "React Component", icon: "⚛️", category: "Code", description: "React components", prompt: "Create React component for:" },
  { id: "api", name: "API Design", icon: "🔌", category: "Code", description: "REST API endpoints", prompt: "Design API endpoints for:" },
  { id: "sql", name: "SQL Query", icon: "🗄️", category: "Code", description: "Database queries", prompt: "Write SQL query for:" },
  { id: "regex", name: "Regex Builder", icon: "🔤", category: "Code", description: "Regular expressions", prompt: "Create regex for:" },
  { id: "debug", name: "Code Debug", icon: "🐛", category: "Code", description: "Debug code issues", prompt: "Debug this code issue:" },

  // Strategy (5)
  { id: "strategy", name: "Marketing Strategy", icon: "📈", category: "Strategy", description: "Full marketing plan", prompt: "Create marketing strategy for:" },
  { id: "calendar", name: "Content Calendar", icon: "📅", category: "Strategy", description: "30-day calendar", prompt: "30-day content calendar for:" },
  { id: "competitor", name: "Competitor Analysis", icon: "🎯", category: "Strategy", description: "Competitor research", prompt: "Competitor analysis for:" },
  { id: "persona", name: "Buyer Persona", icon: "👥", category: "Strategy", description: "Target audience", prompt: "Create buyer persona for:" },
  { id: "funnel", name: "Sales Funnel", icon: "🔽", category: "Strategy", description: "Conversion funnel", prompt: "Design sales funnel for:" },
];

export const TOOL_CATEGORIES = [...new Set(AGENT_TOOLS.map((t) => t.category))];
