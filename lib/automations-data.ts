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
    name: "Weekly Hub Performance Digest",
    agentName: "Service Alert Writer",
    authorName: "Riley Walsh",
    agentId: "6",
    schedule: "Every Monday at 9:00 AM",
    triggerType: "schedule",
    status: "active",
    lastRun: "2 days ago",
    nextRun: "In 5 days",
    runsCount: 24,
    integrations: ["outlook", "slack"],
    labels: ["Operations", "Weekly"],
    description:
      "Aggregates last week's hub metrics — throughput, on-time delivery, exception counts by root cause — summarizes them, and posts a digest to the ops leadership channel and email list.",
    steps: [
      { id: "s1", label: "Trigger", icon: "zap" },
      { id: "s2", label: "Pull Hub Metrics", icon: "globe" },
      { id: "s3", label: "Filter by Region", icon: "filter" },
      { id: "s4", label: "Summarize", icon: "sparkles" },
      { id: "s5", label: "Format Digest", icon: "file-text" },
      { id: "s6", label: "Post to Slack", icon: "slack" },
      { id: "s7", label: "Email Leadership", icon: "mail" },
    ],
    tools: [
      { id: "t1", name: "TMS Connector", description: "Pulls hub throughput, on-time %, and exception counts from the transportation management system", icon: "globe" },
      { id: "t2", name: "Service Alert Writer", description: "Summarizes weekly hub metrics into a leadership-ready digest using GPT-4", icon: "file-text" },
      { id: "t3", name: "Outlook", description: "Sends the digest to hub directors and ops leadership", icon: "mail" },
      { id: "t4", name: "Slack", description: "Posts the digest summary to the #hub-leadership Slack channel", icon: "slack" },
    ],
  },
  {
    id: "auto-2",
    name: "New Shipper Onboarding Enrichment",
    agentName: "Shipper Account Enricher",
    authorName: "Jamie Foster",
    agentId: "8",
    schedule: "Daily at 8:00 AM",
    triggerType: "slack",
    status: "active",
    lastRun: "4 hours ago",
    nextRun: "Tomorrow",
    runsCount: 187,
    integrations: ["slack", "connector", "outlook"],
    labels: ["Sales", "Onboarding"],
    description:
      "Pulls new shipper signups from the CRM, enriches them with industry, size, and expected volume signals, then notifies the enterprise sales team via Slack with a prioritized outreach list.",
    steps: [
      { id: "s1", label: "Trigger", icon: "zap" },
      { id: "s2", label: "Pull New Shippers", icon: "database" },
      { id: "s3", label: "Filter by Tier", icon: "filter" },
      { id: "s4", label: "Enrich Profiles", icon: "linkedin" },
      { id: "s5", label: "Score Fit", icon: "bar-chart" },
      { id: "s6", label: "Notify Slack", icon: "slack" },
      { id: "s7", label: "Email Report", icon: "mail" },
    ],
    tools: [
      { id: "t1", name: "CRM Connector", description: "Reads new shipper signups from Salesforce (FedEx Compass)", icon: "database" },
      { id: "t2", name: "Shipper Account Enricher", description: "Enriches shipper profiles with industry, size, and expected shipping volume", icon: "linkedin" },
      { id: "t3", name: "Slack", description: "Sends a daily prioritized shipper list to the #enterprise-sales channel", icon: "slack" },
      { id: "t4", name: "Outlook", description: "Emails a detailed enrichment report to enterprise account managers each morning", icon: "mail" },
    ],
  },
  {
    id: "auto-3",
    name: "Dangerous Goods Compliance Report",
    agentName: "Customs Docs Checker",
    authorName: "Alex Chen",
    agentId: "1",
    schedule: "Every Friday at 5:00 PM",
    triggerType: "schedule",
    status: "paused",
    lastRun: "9 days ago",
    nextRun: "Paused",
    runsCount: 52,
    integrations: ["slack", "outlook"],
    labels: ["Compliance", "DG"],
    description:
      "Runs a weekly audit of dangerous goods shipments, validating HS codes, IATA/49 CFR classifications, and required paperwork. Generates a PDF report and sends it to the compliance and safety teams.",
    steps: [
      { id: "s1", label: "Trigger", icon: "zap" },
      { id: "s2", label: "Fetch DG Shipments", icon: "folder" },
      { id: "s3", label: "HS Code Check", icon: "list-checks" },
      { id: "s4", label: "IATA/49 CFR Check", icon: "shield" },
      { id: "s5", label: "Generate PDF", icon: "file-text" },
      { id: "s6", label: "Email Report", icon: "mail" },
      { id: "s7", label: "Notify Slack", icon: "slack" },
    ],
    tools: [
      { id: "t1", name: "Shipment Connector", description: "Fetches all dangerous goods shipments and their manifest data from the TMS", icon: "database" },
      { id: "t2", name: "Customs Docs Checker", description: "Validates HS codes, IATA, and 49 CFR classifications for each DG shipment", icon: "shield" },
      { id: "t3", name: "Outlook", description: "Sends the PDF compliance report to the safety and compliance teams", icon: "mail" },
      { id: "t4", name: "Slack", description: "Posts a compliance summary with flagged shipments to #dg-compliance channel", icon: "slack" },
    ],
  },
  {
    id: "auto-4",
    name: "Tracking Page UX Audit",
    agentName: "Route Efficiency Analyzer",
    authorName: "Quinn Davis",
    agentId: "7",
    schedule: "Every Sunday at 10:00 AM",
    triggerType: "schedule",
    status: "active",
    lastRun: "6 days ago",
    nextRun: "Tomorrow",
    runsCount: 11,
    integrations: ["connector", "excel"],
    labels: ["Digital", "Analytics"],
    description:
      "Crawls fedex.com tracking flows weekly, identifies broken states, missing status copy, and confusing exception messages. Exports a prioritized action list to Excel for the digital experience team.",
    steps: [
      { id: "s1", label: "Trigger", icon: "zap" },
      { id: "s2", label: "Crawl Tracking Pages", icon: "globe" },
      { id: "s3", label: "Extract States", icon: "file-text" },
      { id: "s4", label: "Analyze UX", icon: "bar-chart" },
      { id: "s5", label: "Find Gaps", icon: "filter" },
      { id: "s6", label: "Generate Report", icon: "list-checks" },
      { id: "s7", label: "Export Excel", icon: "file-spreadsheet" },
    ],
    tools: [
      { id: "t1", name: "Web Crawler", description: "Crawls tracking flows on fedex.com across shipment states and languages", icon: "globe" },
      { id: "t2", name: "Route Efficiency Analyzer", description: "Analyzes UX gaps, missing copy, and confusing exception states across tracking pages", icon: "bar-chart" },
      { id: "t3", name: "Excel Export", description: "Exports the full audit results as a formatted Excel spreadsheet", icon: "file-spreadsheet" },
    ],
  },
];
