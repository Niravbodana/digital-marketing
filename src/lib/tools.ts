export type AgentTool = {
  id: string;
  name: string;
  icon: string;
  category: string;
  studio: string;
  description: string;
  outputType: "text" | "image" | "video" | "audio" | "document" | "code" | "spreadsheet";
  prompt: string;
};

function toolsForCategory(
  studio: string,
  category: string,
  items: Array<{ name: string; icon: string; desc: string; type: AgentTool["outputType"]; prompt: string }>
): AgentTool[] {
  return items.map((item, i) => ({
    id: `${studio}-${category}-${i}`.replace(/\s/g, "-").toLowerCase(),
    name: item.name,
    icon: item.icon,
    category,
    studio,
    description: item.desc,
    outputType: item.type,
    prompt: item.prompt,
  }));
}

const creatorTools = toolsForCategory("creator", "Images", [
  { name: "AI Image Generator", icon: "🖼️", desc: "Custom illustrations from text", type: "image", prompt: "Generate a detailed AI image prompt for:" },
  { name: "Logo Designer", icon: "🎯", desc: "Brand logos & marks", type: "image", prompt: "Design a logo concept for:" },
  { name: "Social Media Grid", icon: "📱", desc: "9-grid Instagram pack", type: "image", prompt: "Create 9-grid social media image concepts for:" },
  { name: "Product Photography", icon: "📸", desc: "Lifestyle product shots", type: "image", prompt: "Product photography brief for:" },
  { name: "Thumbnail Maker", icon: "🖥️", desc: "YouTube thumbnails", type: "image", prompt: "YouTube thumbnail design for:" },
  { name: "Banner Creator", icon: "🏷️", desc: "Web & ad banners", type: "image", prompt: "Web banner design for:" },
  { name: "Avatar Generator", icon: "👤", desc: "Profile avatars", type: "image", prompt: "Avatar design for:" },
  { name: "Infographic", icon: "📊", desc: "Data visualizations", type: "image", prompt: "Infographic layout for:" },
  { name: "Meme Creator", icon: "😂", desc: "Viral meme concepts", type: "image", prompt: "Meme concept for:" },
  { name: "Icon Pack", icon: "⚡", desc: "App & web icons", type: "image", prompt: "Icon set design for:" },
]);

const marketingTools = toolsForCategory("marketing", "Ads", [
  { name: "UGC Ad Generator", icon: "📣", desc: "Scroll-stopping UGC ads", type: "video", prompt: "Create UGC ad script for:" },
  { name: "Facebook Ad Copy", icon: "📘", desc: "Meta ads copy", type: "text", prompt: "Write Facebook ad copy for:" },
  { name: "Google Ad Copy", icon: "🔍", desc: "Search & display ads", type: "text", prompt: "Write Google ad copy for:" },
  { name: "TikTok Ad Hook", icon: "🎵", desc: "Viral ad hooks", type: "text", prompt: "Write TikTok ad hook for:" },
  { name: "Landing Page", icon: "🌐", desc: "High-converting pages", type: "document", prompt: "Create landing page copy for:" },
  { name: "A/B Variations", icon: "🔀", desc: "Ad variant testing", type: "text", prompt: "Create 5 A/B ad variations for:" },
  { name: "Email Campaign", icon: "📧", desc: "Email sequences", type: "document", prompt: "Write email campaign for:" },
  { name: "Sales Funnel", icon: "🔽", desc: "Conversion funnels", type: "document", prompt: "Design sales funnel for:" },
  { name: "Influencer Brief", icon: "⭐", desc: "Creator briefs", type: "document", prompt: "Influencer campaign brief for:" },
  { name: "ROI Calculator", icon: "💰", desc: "Ad spend analysis", type: "spreadsheet", prompt: "ROI analysis spreadsheet for:" },
]);

const documentTools = toolsForCategory("documents", "Documents", [
  { name: "Word Document", icon: "📝", desc: "Essays, reports, proposals", type: "document", prompt: "Write a professional Word document about:" },
  { name: "PDF Report", icon: "📕", desc: "Formatted PDF reports", type: "document", prompt: "Create PDF report on:" },
  { name: "PowerPoint Deck", icon: "📊", desc: "Presentations & pitch decks", type: "document", prompt: "Create 15-slide pitch deck for:" },
  { name: "Excel Spreadsheet", icon: "📈", desc: "Data with formulas", type: "spreadsheet", prompt: "Create Excel spreadsheet for:" },
  { name: "Business Proposal", icon: "💼", desc: "Client proposals", type: "document", prompt: "Write business proposal for:" },
  { name: "Research Paper", icon: "🎓", desc: "Academic papers with citations", type: "document", prompt: "Write research paper on:" },
  { name: "Executive Summary", icon: "📋", desc: "C-suite summaries", type: "document", prompt: "Executive summary for:" },
  { name: "Contract Draft", icon: "⚖️", desc: "Agreement templates", type: "document", prompt: "Draft contract for:" },
  { name: "SOP Document", icon: "📑", desc: "Standard procedures", type: "document", prompt: "Write SOP for:" },
  { name: "Meeting Notes", icon: "🗒️", desc: "Structured meeting notes", type: "document", prompt: "Format meeting notes for:" },
]);

const audioTools = toolsForCategory("audio", "Audio", [
  { name: "Music Track", icon: "🎵", desc: "Any genre, any length", type: "audio", prompt: "Compose music track concept for:" },
  { name: "Voice Narration", icon: "🎙️", desc: "AI voice generation script", type: "audio", prompt: "Write voice narration script for:" },
  { name: "Podcast Script", icon: "🎧", desc: "Podcast episodes", type: "audio", prompt: "Write podcast script for:" },
  { name: "Radio Ad", icon: "📻", desc: "60-second radio spots", type: "audio", prompt: "Write 60-second radio ad for:" },
  { name: "Sound Effects", icon: "🔊", desc: "SFX descriptions", type: "audio", prompt: "Sound effects list for:" },
  { name: "Jingle Creator", icon: "🎶", desc: "Brand jingles", type: "audio", prompt: "Brand jingle lyrics for:" },
  { name: "Audiobook Chapter", icon: "📚", desc: "Narrated chapters", type: "audio", prompt: "Audiobook chapter script for:" },
  { name: "Voiceover Ad", icon: "🗣️", desc: "Commercial voiceovers", type: "audio", prompt: "Voiceover script for:" },
]);

const videoTools = toolsForCategory("video", "Video", [
  { name: "Cinematic Short", icon: "🎬", desc: "Photoreal cinematic video", type: "video", prompt: "Cinematic short film script for:" },
  { name: "Instagram Reel", icon: "📲", desc: "Vertical reel script", type: "video", prompt: "Instagram Reel script for:" },
  { name: "YouTube Video", icon: "▶️", desc: "Long-form video script", type: "video", prompt: "YouTube video script for:" },
  { name: "TikTok Video", icon: "🎵", desc: "Viral TikTok script", type: "video", prompt: "TikTok video script for:" },
  { name: "Explainer Video", icon: "💡", desc: "Product explainers", type: "video", prompt: "Explainer video script for:" },
  { name: "Storyboard", icon: "🎞️", desc: "Scene-by-scene boards", type: "document", prompt: "Storyboard for video about:" },
  { name: "Subtitle File", icon: "💬", desc: "SRT subtitles", type: "text", prompt: "Generate subtitles for:" },
  { name: "B-Roll List", icon: "🎥", desc: "Shot lists", type: "document", prompt: "B-roll shot list for:" },
  { name: "Motion Graphics", icon: "✨", desc: "Animation briefs", type: "video", prompt: "Motion graphics brief for:" },
  { name: "Product Demo", icon: "📦", desc: "Demo videos", type: "video", prompt: "Product demo video script for:" },
]);

const codeTools = toolsForCategory("code", "Code", [
  { name: "Python Script", icon: "🐍", desc: "Automation & analysis", type: "code", prompt: "Write Python script for:" },
  { name: "JavaScript App", icon: "⚡", desc: "Web functionality", type: "code", prompt: "Write JavaScript code for:" },
  { name: "React Component", icon: "⚛️", desc: "UI components", type: "code", prompt: "Create React component for:" },
  { name: "API Endpoints", icon: "🔌", desc: "REST API design", type: "code", prompt: "Design REST API for:" },
  { name: "SQL Queries", icon: "🗄️", desc: "Database queries", type: "code", prompt: "Write SQL for:" },
  { name: "Shell Script", icon: "🖥️", desc: "Task automation", type: "code", prompt: "Write bash script for:" },
  { name: "HTML Page", icon: "🌐", desc: "Web pages", type: "code", prompt: "Create HTML page for:" },
  { name: "CSS Styles", icon: "💅", desc: "Styling", type: "code", prompt: "Write CSS for:" },
  { name: "Regex Pattern", icon: "🔤", desc: "Pattern matching", type: "code", prompt: "Create regex for:" },
  { name: "Debug Code", icon: "🐛", desc: "Fix bugs", type: "code", prompt: "Debug this code:" },
]);

const researchTools = toolsForCategory("research", "Research", [
  { name: "Market Research", icon: "📊", desc: "Industry analysis", type: "document", prompt: "Market research report on:" },
  { name: "Competitor Analysis", icon: "⚔️", desc: "Competitive intel", type: "document", prompt: "Competitor analysis for:" },
  { name: "Trend Report", icon: "📈", desc: "Industry trends", type: "document", prompt: "Trend report on:" },
  { name: "SWOT Analysis", icon: "🎯", desc: "Strategic analysis", type: "document", prompt: "SWOT analysis for:" },
  { name: "Survey Design", icon: "📋", desc: "Research surveys", type: "document", prompt: "Design survey for:" },
  { name: "Data Summary", icon: "🔢", desc: "Data synthesis", type: "document", prompt: "Summarize data on:" },
  { name: "Citation List", icon: "📚", desc: "Sourced references", type: "document", prompt: "Research citations for:" },
  { name: "Fact Check", icon: "✅", desc: "Verify claims", type: "text", prompt: "Fact-check:" },
]);

const socialTools = toolsForCategory("social", "Social", [
  { name: "Instagram Post", icon: "📸", desc: "Feed posts", type: "text", prompt: "Instagram post for:" },
  { name: "Instagram Caption", icon: "✍️", desc: "Engaging captions", type: "text", prompt: "Instagram caption for:" },
  { name: "Hashtag Pack", icon: "#️⃣", desc: "20 trending tags", type: "text", prompt: "Hashtags for:" },
  { name: "LinkedIn Post", icon: "💼", desc: "Professional posts", type: "text", prompt: "LinkedIn post for:" },
  { name: "Twitter Thread", icon: "🧵", desc: "Viral threads", type: "text", prompt: "Twitter thread about:" },
  { name: "Content Calendar", icon: "📅", desc: "30-day calendar", type: "spreadsheet", prompt: "30-day content calendar for:" },
  { name: "Bio Writer", icon: "👤", desc: "Profile bios", type: "text", prompt: "Social media bio for:" },
  { name: "Carousel Post", icon: "📱", desc: "Multi-slide posts", type: "document", prompt: "Carousel post slides for:" },
  { name: "Story Script", icon: "📲", desc: "IG story sequence", type: "text", prompt: "Instagram story script for:" },
  { name: "Engagement Reply", icon: "💬", desc: "Comment responses", type: "text", prompt: "Engagement replies for:" },
]);

export const AGENT_TOOLS: AgentTool[] = [
  ...creatorTools,
  ...marketingTools,
  ...documentTools,
  ...audioTools,
  ...videoTools,
  ...codeTools,
  ...researchTools,
  ...socialTools,
];

export const TOOL_CATEGORIES = [...new Set(AGENT_TOOLS.map((t) => t.category))];
export const TOOL_STUDIOS = [...new Set(AGENT_TOOLS.map((t) => t.studio))];

export function getToolsByStudio(studioId: string) {
  return AGENT_TOOLS.filter((t) => t.studio === studioId);
}
