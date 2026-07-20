export interface AutomationStep {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  nodeKind?: "outlook-trigger" | "if-else" | "anthropic-agent" | "excel-append" | "outlook-category";
  model?: string;
  versionLabel?: string;
  prompt?: string;
  elseBranch?: AutomationStep;
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
  triggerType?: "schedule" | "slack" | "email";
  status: "active" | "paused";
  lastRun: string;
  nextRun: string;
  runsCount: number;
  integrations: string[];
  labels: string[];
  description?: string;
  steps?: AutomationStep[];
  tools?: AutomationTool[];
  personalizedBy?: string;
  governanceNote?: string;
  permissions?: string[];
  setupTitle?: string;
  setupDescription?: string;
}

export const myAutomations: Automation[] = [
  {
    id: "auto-fedex-exception-log",
    name: "Log FedEx Exception Emails",
    agentName: "Exception Intake Agent",
    authorName: "Priya Patel",
    agentId: "6",
    schedule: "When a new email arrives in Outlook",
    triggerType: "email",
    status: "active",
    lastRun: "8 min ago",
    nextRun: "On next email",
    runsCount: 214,
    integrations: ["outlook", "excel"],
    labels: ["Operations", "Intake"],
    description:
      "Captures FedEx shipment exception and delay emails from Outlook, extracts the key fields with an LLM, and appends a row to an Excel table on SharePoint.",
    permissions: [
      "Read new Outlook emails from the monitored folder",
      "Extract structured fields with Anthropic Claude",
      "Append rows to the ExceptionsTable in the SharePoint workbook",
    ],
    steps: [
      { id: "s1", label: "New Exception Email", icon: "mail", nodeKind: "outlook-trigger", description: "Trigger a workflow execution every time an email is received in the selected folder." },
      { id: "s2", label: "Is Exception?", icon: "filter", nodeKind: "if-else", description: "Route the input query using if-else logic.", elseBranch: { id: "s2b", label: "Set Email Category", icon: "mail", nodeKind: "outlook-category", description: "Set a category on an Outlook email message", versionLabel: "v1.0.0" } },
      { id: "s3", label: "Extract Exception Fields", icon: "sparkles", nodeKind: "anthropic-agent", description: "Anthropic Agent with tool calling", model: "Claude 4.6 Opus", prompt: "You are an intake analyst for FedEx shipment exceptions. Read the email body and extract the following fields as JSON: tracking_number, service_type, origin, destination, exception_code, exception_reason, event_timestamp (ISO 8601), and shipper_account.\n\nRules:\n- Return valid JSON only, no prose or markdown.\n- If a field is not present, use null. Do not guess.\n- Normalize timestamps to UTC.\n- exception_code must match one of: DELAY, DAMAGE, MISROUTE, HELD_CUSTOMS, DELIVERY_ATTEMPT_FAILED, OTHER." },
      { id: "s4", label: "Append Exception to Excel", icon: "database", nodeKind: "excel-append", description: "Add data to a table in an Excel sheet.", versionLabel: "Unset version" },
    ],
    tools: [
      { id: "t1", name: "Outlook", description: "Watches the monitored inbox folder and exposes subject, body, and sender on every new email.", icon: "mail" },
      { id: "t2", name: "Anthropic Claude (claude-opus-4-6)", description: "Converts unstructured email text into a structured JSON row. Temperature 0, seed 42, no markdown.", icon: "sparkles" },
      { id: "t3", name: "Excel on SharePoint", description: "Appends the extracted row to Sheet 'Exceptions' · Table 'ExceptionsTable'.", icon: "database" },
    ],
  },
  {
    id: "auto-1-hidden",
    name: "My Morning Exception Brief",
    agentName: "Exception Prioritization Agent",
    authorName: "Enterprise Automation Team",
    personalizedBy: "Jordan Lee",
    governanceNote: "Approved workflow · Core logic locked",
    agentId: "6",
    schedule: "Every weekday at 7:00 AM",
    triggerType: "schedule",
    status: "active",
    lastRun: "Today, 7:00 AM",
    nextRun: "Tomorrow, 7:00 AM",
    runsCount: 42,
    integrations: ["shipment-visibility", "teams", "outlook"],
    labels: ["Operations", "Daily"],
    description:
      "Reviews priority shipment exceptions for my selected station, ranks them by delivery risk, and sends me a morning action brief.",
    permissions: [
      "Read shipment exception data",
      "Read approved operating procedures",
      "Send private employee notifications",
      "Cannot change shipment records",
      "Cannot contact customers automatically",
    ],
    steps: [
      { id: "s1", label: "Every weekday at 7:00 AM", icon: "zap", description: "Starts the scheduled workflow" },
      { id: "s2", label: "Pull Assigned Exceptions", icon: "database", description: "Retrieves exceptions for my station" },
      { id: "s3", label: "Apply My Preferences", icon: "filter", description: "Filters by region, service, and severity" },
      { id: "s4", label: "Rank Delivery Risk", icon: "bar-chart", description: "Prioritizes shipments requiring attention" },
      { id: "s5", label: "Summarize Recommended Actions", icon: "sparkles", description: "Creates an evidence-based action brief" },
      { id: "s6", label: "Send to Microsoft Teams", icon: "teams", description: "Posts the private morning summary" },
      { id: "s7", label: "Email My Digest", icon: "mail", description: "Sends a copy to my inbox" },
    ],
    tools: [
      { id: "t1", name: "Shipment Visibility Connector", description: "Retrieves synthetic shipment status, scan history, delivery commitment, and exception events.", icon: "globe" },
      { id: "t2", name: "Exception Prioritization Agent", description: "Ranks exceptions using delivery risk, elapsed time, service level, and operational urgency.", icon: "bar-chart" },
      { id: "t3", name: "Operations Procedure Assistant", description: "Finds approved response procedures and includes source references.", icon: "list-checks" },
      { id: "t4", name: "Microsoft Teams", description: "Delivers the employee's private morning brief.", icon: "teams" },
      { id: "t5", name: "Outlook", description: "Emails the digest to the employee's selected account.", icon: "mail" },
    ],
  },
  {
    id: "auto-2",
    name: "My Shipment Watchlist",
    agentName: "Shipment Watch Agent",
    authorName: "Enterprise Automation Team",
    personalizedBy: "Jordan Lee",
    governanceNote: "Approved workflow · Core logic locked",
    agentId: "7",
    schedule: "When a tracked shipment changes",
    triggerType: "schedule",
    status: "active",
    lastRun: "12 min ago",
    nextRun: "On next change",
    runsCount: 128,
    integrations: ["shipment-visibility", "teams"],
    labels: ["Tracking", "Alerts"],
    description:
      "Monitors shipments and customer accounts I follow, then alerts me about delays, missed scans, customs holds, and ETA changes.",
    steps: [
      { id: "s1", label: "When a tracked shipment changes", icon: "zap", description: "Triggered by watched shipment events" },
      { id: "s2", label: "Load My Watchlist", icon: "database", description: "Pulls the accounts and shipments I follow" },
      { id: "s3", label: "Detect Change Type", icon: "filter", description: "Classifies delay, missed scan, hold, or ETA change" },
      { id: "s4", label: "Assess Impact", icon: "bar-chart", description: "Estimates delivery risk for the update" },
      { id: "s5", label: "Compose Alert", icon: "sparkles", description: "Writes a short, contextual notification" },
      { id: "s6", label: "Send to Microsoft Teams", icon: "teams", description: "Posts the alert to my private thread" },
    ],
    tools: [
      { id: "t1", name: "Shipment Visibility Connector", description: "Retrieves synthetic shipment updates and scan history for tracked items.", icon: "globe" },
      { id: "t2", name: "Watchlist Alert Agent", description: "Classifies the change and drafts a personal notification.", icon: "bar-chart" },
      { id: "t3", name: "Microsoft Teams", description: "Delivers alerts to the employee's private thread.", icon: "teams" },
    ],
  },
  {
    id: "auto-3",
    name: "Customer Update Drafter",
    agentName: "Customer Update Agent",
    authorName: "Enterprise Automation Team",
    personalizedBy: "Jordan Lee",
    governanceNote: "Approved workflow · Core logic locked",
    agentId: "1",
    schedule: "On demand",
    triggerType: "schedule",
    status: "paused",
    lastRun: "3 days ago",
    nextRun: "On demand",
    runsCount: 17,
    integrations: ["shipment-visibility", "outlook"],
    labels: ["Customer Support", "Approval Required"],
    description:
      "Drafts a plain-language shipment status update I can review, edit, and send to a customer from my Outlook account.",
    steps: [
      { id: "s1", label: "On demand", icon: "zap", description: "Runs when I request an update" },
      { id: "s2", label: "Pull Shipment Context", icon: "database", description: "Reads status, scans, and delivery commitment" },
      { id: "s3", label: "Summarize Situation", icon: "sparkles", description: "Writes a plain-language explanation" },
      { id: "s4", label: "Draft Customer Email", icon: "file-text", description: "Prepares a message for my review" },
      { id: "s5", label: "Hold for My Approval", icon: "list-checks", description: "Waits until I approve before sending" },
      { id: "s6", label: "Send from Outlook", icon: "mail", description: "Sends the message from my Outlook account" },
    ],
    tools: [
      { id: "t1", name: "Shipment Visibility Connector", description: "Retrieves synthetic shipment context for the selected tracking number.", icon: "globe" },
      { id: "t2", name: "Customer Update Agent", description: "Drafts a plain-language customer update for employee review.", icon: "sparkles" },
      { id: "t3", name: "Outlook", description: "Sends the approved message from the employee's account.", icon: "mail" },
    ],
  },
  {
    id: "auto-4",
    name: "End-of-Shift Handoff",
    agentName: "Handoff Summary Agent",
    authorName: "Enterprise Automation Team",
    personalizedBy: "Jordan Lee",
    governanceNote: "Approved workflow · Core logic locked",
    agentId: "8",
    schedule: "Every weekday at 4:30 PM",
    triggerType: "schedule",
    status: "active",
    lastRun: "Yesterday, 4:30 PM",
    nextRun: "Today, 4:30 PM",
    runsCount: 63,
    integrations: ["case-management", "teams", "outlook"],
    labels: ["Operations", "Handoff"],
    description:
      "Summarizes open cases and unresolved exceptions at end of shift and shares a handoff note with the next shift lead.",
    steps: [
      { id: "s1", label: "Every weekday at 4:30 PM", icon: "zap", description: "Runs at end of shift" },
      { id: "s2", label: "Pull Open Cases", icon: "database", description: "Loads unresolved cases from Case Management" },
      { id: "s3", label: "Group by Priority", icon: "filter", description: "Organizes by severity and age" },
      { id: "s4", label: "Draft Handoff Note", icon: "sparkles", description: "Summarizes what still needs attention" },
      { id: "s5", label: "Send to Microsoft Teams", icon: "teams", description: "Posts to the next shift lead's channel" },
      { id: "s6", label: "Email My Digest", icon: "mail", description: "Sends a copy to my inbox" },
    ],
    tools: [
      { id: "t1", name: "Case Management Connector", description: "Retrieves synthetic open cases and unresolved exceptions.", icon: "list-checks" },
      { id: "t2", name: "Handoff Summary Agent", description: "Writes a concise end-of-shift handoff note.", icon: "sparkles" },
      { id: "t3", name: "Microsoft Teams", description: "Delivers the handoff note to the next shift lead.", icon: "teams" },
      { id: "t4", name: "Outlook", description: "Emails the digest to the employee's inbox.", icon: "mail" },
    ],
  },
];
