export interface AutomationStep {
  id: string;
  label: string;
  icon?: string;
}

export interface AutomationTool {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Automation {
  id: string;
  name: string;
  agentName: string;
  authorName: string;
  agentId: string;
  schedule: string;
  triggerType?: "schedule" | "slack";
  status: "active" | "paused";
  lastRun: string;
  nextRun: string;
  runsCount: number;
  integrations: string[];
  labels: string[];
  description?: string;
  steps?: AutomationStep[];
  tools?: AutomationTool[];
}

export const myAutomations: Automation[] = [
  {
    id: "auto-1",
    name: "Weekly Digest",
    agentName: "Blog Generator",
    authorName: "Riley Walsh",
    agentId: "6",
    schedule: "Every Monday at 9:00 AM",
    triggerType: "schedule",
    status: "active",
    lastRun: "2 days ago",
    nextRun: "In 5 days",
    runsCount: 24,
    integrations: ["gmail", "slack"],
    labels: ["Content", "Weekly"],
    description:
      "Automatically collects top content from the web, summarizes it using AI, and sends a polished weekly digest to your Slack channel and Gmail subscribers every Monday morning.",
    steps: [
      { id: "s1", label: "Trigger", icon: "zap" },
      { id: "s2", label: "Fetch Content", icon: "globe" },
      { id: "s3", label: "Filter Articles", icon: "filter" },
      { id: "s4", label: "Summarize", icon: "sparkles" },
      { id: "s5", label: "Format Digest", icon: "file-text" },
      { id: "s6", label: "Post to Slack", icon: "slack" },
      { id: "s7", label: "Email Subscribers", icon: "mail" },
    ],
    tools: [
      { id: "t1", name: "Web Search", description: "Fetches top articles and trending content from across the web", icon: "globe" },
      { id: "t2", name: "Blog Generator", description: "Summarizes and formats content into a readable digest using GPT-4", icon: "file-text" },
      { id: "t3", name: "Gmail", description: "Sends the digest to a configured list of email subscribers", icon: "mail" },
      { id: "t4", name: "Slack", description: "Posts the digest summary to a designated Slack channel", icon: "slack" },
    ],
  },
  {
    id: "auto-2",
    name: "Lead Enrichment",
    agentName: "LinkedIn Scraper",
    authorName: "Jamie Foster",
    agentId: "8",
    schedule: "Daily at 8:00 AM",
    triggerType: "slack",
    status: "active",
    lastRun: "4 hours ago",
    nextRun: "Tomorrow",
    runsCount: 187,
    integrations: ["slack", "connector", "gmail"],
    labels: ["Sales", "Leads"],
    description:
      "Pulls new leads from your CRM, enriches them with LinkedIn profile data and company info, then notifies the sales team via Slack with a prioritized outreach list.",
    steps: [
      { id: "s1", label: "Trigger", icon: "zap" },
      { id: "s2", label: "Pull Leads", icon: "database" },
      { id: "s3", label: "Filter Leads", icon: "filter" },
      { id: "s4", label: "Enrich Profiles", icon: "linkedin" },
      { id: "s5", label: "Score Leads", icon: "bar-chart" },
      { id: "s6", label: "Notify Slack", icon: "slack" },
      { id: "s7", label: "Email Report", icon: "mail" },
    ],
    tools: [
      { id: "t1", name: "CRM Connector", description: "Reads new and updated leads from your connected CRM system", icon: "database" },
      { id: "t2", name: "LinkedIn Scraper", description: "Enriches lead profiles with LinkedIn data including job title and company size", icon: "linkedin" },
      { id: "t3", name: "Slack", description: "Sends a daily prioritized lead list to the #sales-leads Slack channel", icon: "slack" },
      { id: "t4", name: "Gmail", description: "Emails a detailed enrichment report to sales managers each morning", icon: "mail" },
    ],
  },
  {
    id: "auto-3",
    name: "Compliance Report",
    agentName: "Compliance Checker",
    authorName: "Alex Chen",
    agentId: "1",
    schedule: "Every Friday at 5:00 PM",
    triggerType: "schedule",
    status: "paused",
    lastRun: "9 days ago",
    nextRun: "Paused",
    runsCount: 52,
    integrations: ["slack", "gmail"],
    labels: ["Compliance", "Finance"],
    description:
      "Runs a full compliance audit every Friday, checking DSCR, LTV, and regulatory flags across all active deals. Generates a PDF report and sends it to the compliance team.",
    steps: [
      { id: "s1", label: "Trigger", icon: "zap" },
      { id: "s2", label: "Fetch Deals", icon: "folder" },
      { id: "s3", label: "DSCR Check", icon: "list-checks" },
      { id: "s4", label: "LTV Check", icon: "shield" },
      { id: "s5", label: "Generate PDF", icon: "file-text" },
      { id: "s6", label: "Email Report", icon: "mail" },
      { id: "s7", label: "Notify Slack", icon: "slack" },
    ],
    tools: [
      { id: "t1", name: "Deal Connector", description: "Fetches all active deals and their latest financial data from the database", icon: "database" },
      { id: "t2", name: "Compliance Checker", description: "Validates LTV, DSCR, and regulatory compliance rules for each deal", icon: "shield" },
      { id: "t3", name: "Gmail", description: "Sends the PDF compliance report to the finance and legal teams", icon: "mail" },
      { id: "t4", name: "Slack", description: "Posts a compliance summary with flagged items to #compliance channel", icon: "slack" },
    ],
  },
  {
    id: "auto-4",
    name: "SEO Audit",
    agentName: "SEO Analyzer",
    authorName: "Quinn Davis",
    agentId: "7",
    schedule: "Every Sunday at 10:00 AM",
    triggerType: "schedule",
    status: "active",
    lastRun: "6 days ago",
    nextRun: "Tomorrow",
    runsCount: 11,
    integrations: ["connector", "excel"],
    labels: ["SEO", "Analytics"],
    description:
      "Crawls your website weekly, identifies broken links, missing meta tags, and keyword gaps. Exports a prioritized action list to Excel for the marketing team.",
    steps: [
      { id: "s1", label: "Trigger", icon: "zap" },
      { id: "s2", label: "Crawl Site", icon: "globe" },
      { id: "s3", label: "Extract Metadata", icon: "file-text" },
      { id: "s4", label: "Analyze SEO", icon: "bar-chart" },
      { id: "s5", label: "Find Gaps", icon: "filter" },
      { id: "s6", label: "Generate Report", icon: "list-checks" },
      { id: "s7", label: "Export Excel", icon: "file-spreadsheet" },
    ],
    tools: [
      { id: "t1", name: "Web Crawler", description: "Crawls all pages on your domain to collect SEO metadata and link structure", icon: "globe" },
      { id: "t2", name: "SEO Analyzer", description: "Analyzes keyword gaps, missing tags, and technical SEO issues across pages", icon: "bar-chart" },
      { id: "t3", name: "Excel Export", description: "Exports the full SEO audit results as a formatted Excel spreadsheet", icon: "file-spreadsheet" },
    ],
  },
];
