import type { ReactNode } from "react";

type IconName = "idea" | "choice" | "why" | "options" | "calendar" | "arrow" | "plus" | "link";

const paths: Record<IconName, ReactNode> = {
  idea: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M8.5 14.5A7 7 0 1 1 15.5 14.5c-.9.7-1.2 1.4-1.3 2.5h-4.4c-.1-1.1-.4-1.8-1.3-2.5Z" /><path d="M12 4v2" /><path d="M5.6 6.6 7 8" /><path d="m18.4 6.6-1.4 1.4" /></>,
  choice: <><path d="m5 12 4 4L19 6" /><path d="M19 13v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2" /></>,
  why: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 1 1 4.5 1.5c-1.1 1.2-2.1 1.5-2.1 3" /><path d="M12 17.5h.01" /></>,
  options: <><path d="M5 6h14" /><path d="M5 12h9" /><path d="M5 18h14" /><circle cx="16" cy="12" r="2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></>,
  arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" /></>,
};

export function Icon({ name, size = 18, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
