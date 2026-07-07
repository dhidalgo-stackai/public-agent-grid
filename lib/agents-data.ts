export interface AgentDirectoryEntry {
  id: string;
  name: string;
  favorite?: boolean;
  /** App ids this agent's workflow is wired up to use. */
  apps?: string[];
}

export const AGENT_DIRECTORY: AgentDirectoryEntry[] = [
  { id: "1", name: "Compliance Checker", apps: ["notion", "gdrive"] },
  { id: "2", name: "Document Verifier", apps: ["gdrive", "dropbox"] },
  { id: "3", name: "Memo Generator", apps: ["notion", "gmail"] },
  { id: "4", name: "File Scanner", apps: ["dropbox", "gdrive"] },
  { id: "5", name: "Campaign Writer", favorite: true, apps: ["slack", "figma"] },
  { id: "6", name: "Blog Generator", apps: ["notion", "gdrive"] },
  { id: "7", name: "SEO Analyzer", apps: ["gdrive", "slack"] },
  { id: "8", name: "LinkedIn Scraper", apps: ["connector", "gdrive"] },
  { id: "9", name: "Sales Forecaster", favorite: true, apps: ["gmail", "figma", "notion"] },
  { id: "10", name: "Proposal Builder", apps: ["gdrive", "notion"] },
  { id: "11", name: "Customer Support Bot", favorite: true, apps: ["slack", "connector", "notion"] },
  { id: "12", name: "Ticket Router", apps: ["slack", "outlook"] },
  { id: "13", name: "Ad Copy Optimizer", apps: ["figma", "slack"] },
  { id: "14", name: "Deal Closer", apps: ["gmail", "notion"] },
];

const APP_LABELS: Record<string, string> = {
  slack: "Slack",
  notion: "Notion",
  dropbox: "Dropbox",
  gdrive: "Google Drive",
  outlook: "Outlook",
  gmail: "Gmail",
  figma: "Figma",
  connector: "Connector",
};

export function getAppLabel(id: string): string {
  return APP_LABELS[id] ?? id;
}

/** Returns the app ids wired up to a given agent's workflow. */
export function getAgentApps(id: string): string[] {
  return AGENT_DIRECTORY.find((a) => a.id === id)?.apps ?? [];
}
