export interface AutomationStep {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  nodeKind?:
    | "outlook-trigger"
    | "if-else"
    | "anthropic-agent"
    | "excel-append"
    | "outlook-category"
    | "schedule-trigger"
    | "sharepoint-read"
    | "weather-api"
    | "outlook-send";
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
  iconKey?: "mail" | "cloud-sun";
  status: "active" | "paused";
  version?: string;
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
    id: "auto-fedex-weather-route-brief",
    name: "Morning Weather Risk Route Brief",
    agentName: "Route Risk Advisor",
    authorName: "Enterprise Automation Team",
    personalizedBy: "Fred Smith",
    governanceNote: "Approved workflow · Core logic locked",
    agentId: "7",
    schedule: "Every weekday at 5:30 AM",
    triggerType: "schedule",
    iconKey: "cloud-sun",
    status: "paused",
    lastRun: "Today, 5:30 AM",
    nextRun: "Tomorrow, 5:30 AM",
    runsCount: 58,
    integrations: ["connector", "outlook", "sharepoint"],
    labels: ["Dispatch", "Daily"],
    description:
      "Pulls today's Ground and Express route plan for my hub, cross-checks the National Weather Service forecast along each lane, and posts a ranked risk brief to my inbox before dispatch.",
    permissions: [
      "Read today's route plan for the assigned hub",
      "Read weather forecast data from the NWS connector",
      "Send private employee notifications by email",
      "Cannot reassign drivers or change route records",
    ],
    steps: [
      {
        id: "s1",
        label: "Every weekday at 5:30 AM",
        nodeKind: "schedule-trigger",
        description: "Trigger a workflow execution on a recurring cron schedule (Mon–Fri, 05:30 America/Chicago).",
      },
      {
        id: "s2",
        label: "Pull Today's Route Plan",
        nodeKind: "sharepoint-read",
        description: "Read rows from the DispatchPlans list on SharePoint for the assigned hub and today's date.",
        versionLabel: "v2.1.0",
      },
      {
        id: "s3",
        label: "Fetch NWS Forecast",
        nodeKind: "weather-api",
        description: "GET api.weather.gov/points/{lat},{lon}/forecast/hourly for each stop along the lane.",
        versionLabel: "v1.4.0",
      },
      {
        id: "s4",
        label: "Score Route Risk",
        nodeKind: "anthropic-agent",
        description: "Anthropic Agent with tool calling",
        model: "Claude 4.6 Sonnet",
        prompt:
          "You are a dispatch risk analyst for a FedEx Ground and Express hub. For each route in the input, score delay risk from 0-100 using the hourly NWS forecast along the lane, the SLA commit time, and driver-hours remaining.\n\nRules:\n- Return valid JSON only, no prose.\n- Fields per route: route_id, service (GROUND|EXPRESS), risk_score (0-100), risk_band (LOW|MEDIUM|HIGH|SEVERE), primary_driver (WIND|SNOW|ICE|RAIN|FOG|HEAT|NONE), sla_exposure_minutes, recommended_action.\n- Recommended actions must come from: HOLD_FOR_UPDATE, RESEQUENCE, PRE_STAGE_RELAY, NOTIFY_CUSTOMER, PROCEED.\n- Only mark SEVERE when NWS advisory severity >= 'Moderate' overlaps the delivery window.",
      },
      {
        id: "s5",
        label: "Draft Dispatch Brief",
        nodeKind: "anthropic-agent",
        description: "Anthropic Agent with tool calling",
        model: "Claude 4.6 Opus",
        prompt:
          "You are drafting a morning risk brief for the hub dispatcher. Input is the JSON output of the risk scorer.\n\nWrite an Outlook email with:\n- Subject: 'Morning Route Risk Brief — {hub_code} — {date}'\n- Top summary line: count of HIGH+SEVERE routes and the primary weather driver.\n- A ranked table of the top 10 at-risk routes: route_id, service, band, primary driver, SLA exposure, recommended action.\n- A short 'Watch items' paragraph flagging any active NWS advisories on the lane corridors.\n\nTone: neutral, operational. No emoji. No speculation beyond what the scorer returned.",
      },
      {
        id: "s6",
        label: "Send Brief via Outlook",
        nodeKind: "outlook-send",
        description: "Send an email from the dispatcher's Outlook mailbox to the configured recipient list.",
        versionLabel: "v1.0.0",
      },
    ],
    tools: [
      {
        id: "t1",
        name: "SharePoint — DispatchPlans",
        description:
          "Reads today's row set from the DispatchPlans list on the hub's SharePoint site. Columns used: route_id, service, driver_id, lane_stops (JSON), sla_commit, tender_time.",
        icon: "database",
      },
      {
        id: "t2",
        name: "National Weather Service API",
        description:
          "Public api.weather.gov endpoints. Uses /points and /forecast/hourly for each lane stop; falls back to /alerts/active for advisory overlays. No API key required.",
        icon: "globe",
      },
      {
        id: "t3",
        name: "Anthropic Claude (claude-sonnet-4-6)",
        description:
          "Structured risk scoring. Temperature 0, seed 17, JSON-only output validated against the RouteRisk schema.",
        icon: "sparkles",
      },
      {
        id: "t4",
        name: "Anthropic Claude (claude-opus-4-6)",
        description:
          "Drafts the dispatcher email. Temperature 0.2, no markdown, output rendered as HTML for Outlook.",
        icon: "sparkles",
      },
      {
        id: "t5",
        name: "Outlook",
        description:
          "Sends the morning brief from the dispatcher's mailbox. Recipient list is read from the automation's SendTo setting.",
        icon: "mail",
      },
    ],
  },
  {
    id: "auto-fedex-exception-log",
    name: "Log FedEx Exception Emails",
    agentName: "Exception Intake Agent",
    authorName: "Priya Patel",
    agentId: "6",
    schedule: "When a new email arrives in Outlook",
    triggerType: "email",
    iconKey: "mail",
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
