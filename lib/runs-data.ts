export type RunItem = {
  id: string;
  label: string;
  timestamp?: string;
  agentId: string;
  agentName: string;
};

export const MOCK_FORM_RUNS: RunItem[] = [
  { id: "fr1", label: "Blog post about AI trends", timestamp: "2h ago", agentId: "6", agentName: "Blog Generator" },
  { id: "fr2", label: "Proposal — Acme Corp renewal", timestamp: "Yesterday", agentId: "10", agentName: "Proposal Builder" },
  { id: "fr3", label: "LinkedIn outreach — fintech leads", timestamp: "2d ago", agentId: "8", agentName: "LinkedIn Scraper" },
];

export const MOCK_BATCH_RUNS: RunItem[] = [
  { id: "br1", label: "SEO audit — marketing site", timestamp: "6h ago", agentId: "7", agentName: "SEO Analyzer" },
  { id: "br2", label: "SEO audit — blog archive", timestamp: "Yesterday", agentId: "7", agentName: "SEO Analyzer" },
  { id: "br3", label: "Keyword gap analysis — competitors", timestamp: "2d ago", agentId: "7", agentName: "SEO Analyzer" },
];
