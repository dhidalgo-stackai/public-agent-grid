export interface AgentDirectoryEntry {
  id: string;
  name: string;
  favorite?: boolean;
}

export const AGENT_DIRECTORY: AgentDirectoryEntry[] = [
  { id: "1", name: "Compliance Checker" },
  { id: "2", name: "Document Verifier" },
  { id: "3", name: "Memo Generator" },
  { id: "4", name: "File Scanner" },
  { id: "5", name: "Campaign Writer", favorite: true },
  { id: "6", name: "Blog Generator" },
  { id: "7", name: "SEO Analyzer" },
  { id: "8", name: "LinkedIn Scraper" },
  { id: "9", name: "Sales Forecaster", favorite: true },
  { id: "10", name: "Proposal Builder" },
  { id: "11", name: "Customer Support Bot", favorite: true },
  { id: "12", name: "Ticket Router" },
  { id: "13", name: "Ad Copy Optimizer" },
  { id: "14", name: "Deal Closer" },
];
