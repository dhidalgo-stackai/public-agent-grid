export interface AgentDirectoryEntry {
  id: string;
  name: string;
  favorite?: boolean;
  /** App ids this agent's workflow is wired up to use. */
  apps?: string[];
}

export const AGENT_DIRECTORY: AgentDirectoryEntry[] = [
  { id: "1", name: "Customs Docs Checker", apps: ["sharepoint", "gdrive"] },
  { id: "2", name: "Bill of Lading Verifier", apps: ["gdrive", "dropbox"] },
  { id: "3", name: "Shipper Notice Generator", apps: ["sharepoint", "outlook"] },
  { id: "4", name: "Manifest Scanner", apps: ["dropbox", "gdrive"] },
  { id: "5", name: "Peak Season Comms Writer", favorite: true, apps: ["teams", "salesforce"] },
  { id: "6", name: "Service Alert Writer", apps: ["sharepoint", "gdrive"] },
  { id: "7", name: "Route Efficiency Analyzer", apps: ["gdrive", "teams"] },
  { id: "8", name: "Shipper Account Enricher", apps: ["connector", "gdrive"] },
  { id: "9", name: "Volume Forecaster", favorite: true, apps: ["outlook", "salesforce", "sharepoint"] },
  { id: "10", name: "Enterprise RFP Builder", apps: ["gdrive", "sharepoint"] },
  { id: "11", name: "Delivery Support Bot", favorite: true, apps: ["teams", "connector", "sharepoint"] },
  { id: "12", name: "Exception Router", apps: ["teams", "outlook"] },
  { id: "13", name: "Tracking Page Optimizer", apps: ["salesforce", "teams"] },
  { id: "14", name: "Contract Renewal Assistant", apps: ["outlook", "sharepoint"] },
];

const APP_LABELS: Record<string, string> = {
  slack: "Slack",
  notion: "Notion",
  teams: "Microsoft Teams",
  sharepoint: "SharePoint",
  dropbox: "Dropbox",
  gdrive: "Google Drive",
  outlook: "Outlook",
  gmail: "Gmail",
  figma: "Figma",
  github: "GitHub",
  linear: "Linear",
  asana: "Asana",
  snowflake: "Snowflake",
  jira: "Jira",
  hubspot: "HubSpot",
  salesforce: "Salesforce",
  airtable: "Airtable",
  confluence: "Confluence",
  intercom: "Intercom",
  connector: "Connector",
};

export function getAppLabel(id: string): string {
  return APP_LABELS[id] ?? id;
}

/** Returns the app ids wired up to a given agent's workflow. */
export function getAgentApps(id: string): string[] {
  return AGENT_DIRECTORY.find((a) => a.id === id)?.apps ?? [];
}
