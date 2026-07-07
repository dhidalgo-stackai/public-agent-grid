import {
  ShieldCheck,
  ScanLine,
  ScrollText,
  FolderSearch,
  Megaphone,
  Newspaper,
  TrendingUp,
  UserSearch,
  BarChart2,
  Presentation,
  Headphones,
  GitBranch,
  Wand2,
  Handshake,
  BotIcon,
  type LucideIcon,
} from "lucide-react";

const AGENT_ICON_MAP: Record<string, LucideIcon> = {
  "1": ShieldCheck,
  "2": ScanLine,
  "3": ScrollText,
  "4": FolderSearch,
  "5": Megaphone,
  "6": Newspaper,
  "7": TrendingUp,
  "8": UserSearch,
  "9": BarChart2,
  "10": Presentation,
  "11": Headphones,
  "12": GitBranch,
  "13": Wand2,
  "14": Handshake,
};

const DEFAULT_SIDEBAR_CLASS = "size-3.5 shrink-0 text-foreground/60";

export function getAgentIcon(
  agentId?: string,
  className: string = DEFAULT_SIDEBAR_CLASS
): React.ReactNode {
  const Icon = (agentId && AGENT_ICON_MAP[agentId]) || BotIcon;
  return <Icon className={className} />;
}
