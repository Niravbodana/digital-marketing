type IconProps = { className?: string; size?: number };

export function IconAgent({ className = "", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconCredits({ className = "", size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v10M9 10h6M9 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconUsers({ className = "", size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 19c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5M14 19c0-1.8 1.5-3.2 3.5-3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconSettings({ className = "", size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconOutput({ className = "", size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconDownload({ className = "", size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 4v10M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 18h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconInstagram({ className = "", size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconSend({ className = "", size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 12h12M13 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TYPE_COLORS: Record<string, string> = {
  image: "text-pink-400",
  video: "text-red-400",
  audio: "text-emerald-400",
  document: "text-blue-400",
  code: "text-green-400",
  spreadsheet: "text-cyan-400",
  text: "text-violet-400",
};

export function TypeIcon({ type, className = "", size = 18 }: { type: string } & IconProps) {
  const color = TYPE_COLORS[type] || "text-neutral-400";
  const cls = `${color} ${className}`;

  switch (type) {
    case "image":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="10" r="1.5" fill="currentColor" />
          <path d="M3 16l5-4 4 3 4-5 5 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "video":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 10l5-3v10l-5-3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "audio":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path d="M9 18V6l10-2v12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="7" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "code":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path d="M8 8L4 12l4 4M16 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "spreadsheet":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 10h16M4 14h16M10 4v16" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "document":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path d="M8 4h8l4 4v12H8V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M16 4v4h4M10 12h6M10 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path d="M6 5h12v14H6z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

export function PhaseDot({ phase }: { phase: string }) {
  const colors: Record<string, string> = {
    thinking: "bg-violet-400",
    planning: "bg-blue-400",
    executing: "bg-amber-400",
    complete: "bg-emerald-400",
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[phase] || "bg-neutral-500"}`} />;
}
