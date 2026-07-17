export type ChatChip =
  | { kind: "integration"; iconId: string; label: string }
  | { kind: "knowledge"; iconId: string; label: string }
  | { kind: "prompt"; label: string };

export type ChatPart = { type: "text"; text: string } | { type: "chip"; chip: ChatChip };

export type StatTile = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
};

export type TableBlock = {
  headers: string[];
  rows: string[][];
};

export type ToolFileBlock = {
  iconId: string;
  fileName: string;
  subtitle?: string;
  action?: "read" | "search" | "write";
};

export type AssistantBlock =
  | { type: "text"; text: string }
  | { type: "tool-file"; data: ToolFileBlock }
  | { type: "stat-grid"; title?: string; tiles: StatTile[] }
  | { type: "table"; caption?: string; data: TableBlock }
  | { type: "bar-chart"; title?: string; unit?: string; bars: { label: string; value: number; hint?: string }[] };

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  parts?: ChatPart[];
  blocks?: AssistantBlock[];
};

export type ChatItem = {
  id: string;
  label: string;
  timestamp?: string;
  agentId?: string;
  agentName?: string;
};

export const MOCK_RECENT_CHATS: ChatItem[] = [
  { id: "c1", label: "Summarize Q2 volume report", timestamp: "2h ago", agentId: "9", agentName: "Volume Forecaster" },
  { id: "c2", label: "Draft delay notification email", timestamp: "Yesterday", agentId: "11", agentName: "Delivery Support Bot" },
  { id: "c3", label: "Analyze at-risk shipper accounts", timestamp: "2d ago", agentId: "14", agentName: "Contract Renewal Assistant" },
  { id: "c4", label: "Route audit — MEM ground routes", timestamp: "3d ago", agentId: "7", agentName: "Route Efficiency Analyzer" },
  { id: "c5", label: "Exception clustering — last 7 days", timestamp: "4d ago", agentId: "7", agentName: "Route Efficiency Analyzer" },
  { id: "c6", label: "Shipper enrichment — new e-commerce signups", timestamp: "5d ago", agentId: "8", agentName: "Shipper Account Enricher" },
];

const EXTRA_CHATS_KEY = "extra-recent-chats";
export const RECENT_CHATS_EVENT = "recent-chats-updated";

export function getExtraRecentChats(): ChatItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EXTRA_CHATS_KEY);
    return raw ? (JSON.parse(raw) as ChatItem[]) : [];
  } catch {
    return [];
  }
}

export function getChatById(chatId: string): ChatItem | undefined {
  const all = [...getExtraRecentChats(), ...MOCK_RECENT_CHATS];
  return all.find((c) => c.id === chatId);
}

export function getChatLabel(chatId: string): string {
  return getChatById(chatId)?.label ?? "New conversation";
}

export function addRecentChat(chat: ChatItem): void {
  if (typeof window === "undefined") return;
  const existing = getExtraRecentChats().filter((c) => c.id !== chat.id);
  const next = [chat, ...existing];
  window.localStorage.setItem(EXTRA_CHATS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(RECENT_CHATS_EVENT));
}

export const MOCK_CHAT_HISTORY: Record<string, ChatMessage[]> = {
  c1: [
    {
      role: "user",
      content: "Can you summarize our Q2 shipping volume report from Google Drive? I need the highlights for the ops standup.",
      parts: [
        { type: "text", text: "Can you summarize our " },
        { type: "chip", chip: { kind: "knowledge", iconId: "gdrive", label: "Q2 Volume Report" } },
        { type: "text", text: " using " },
        { type: "chip", chip: { kind: "integration", iconId: "notion", label: "Notion" } },
        { type: "text", text: "? I need the highlights for the ops standup." },
      ],
    },
    {
      role: "assistant",
      content:
        "Here's a concise Q2 summary:\n\n• **Total volume**: 412M packages (+9% YoY), driven by e-commerce peak\n• **Ground**: 268M (+11%), Express: 128M (+5%), Freight: 16M (+2%)\n• **On-time**: 96.8% network-wide, best in Ground (97.4%)\n• **Risk**: MEM hub throughput dipped 3 pts in late June (weather + staffing)\n\nWant me to format this as slides or a one-pager?",
    },
    { role: "user", content: "Yes — bullet points only, under 6 lines for the slide." },
    {
      role: "assistant",
      content:
        "• Q2 volume 412M packages (+9% YoY)\n• Ground led growth at 268M (+11%)\n• Network on-time 96.8%, Ground strongest at 97.4%\n• E-commerce peak was the main driver\n• MEM hub dipped 3 pts in late June — flag for review\n• Recommend adding surge capacity at MEM for Q3 peak",
    },
    {
      role: "user",
      content: "Can you dig into the MEM dip? Pull the hub throughput data and show me the daily trend.",
      parts: [
        { type: "text", text: "Can you dig into the MEM dip? Pull the hub throughput from " },
        { type: "chip", chip: { kind: "knowledge", iconId: "gdrive", label: "Hub Ops Metrics" } },
        { type: "text", text: " and show me the daily trend." },
      ],
    },
    {
      role: "assistant",
      content: "",
      blocks: [
        {
          type: "tool-file",
          data: {
            iconId: "gdrive",
            fileName: "hub_ops_metrics_2025_Q2.xlsx",
            subtitle: "Read 3 sheets · MEM tab · 91 rows",
            action: "read",
          },
        },
        {
          type: "text",
          text: "Pulled MEM daily throughput for Jun 16 – Jun 30. Baseline is 4.2M packages/day; the hub ran at or above that until Jun 22, then dropped through the end of the month.",
        },
        {
          type: "bar-chart",
          title: "MEM hub daily throughput — late June",
          unit: "M pkgs",
          bars: [
            { label: "Jun 16", value: 4.3 },
            { label: "Jun 17", value: 4.2 },
            { label: "Jun 18", value: 4.4 },
            { label: "Jun 19", value: 4.3 },
            { label: "Jun 20", value: 4.1 },
            { label: "Jun 21", value: 4.0 },
            { label: "Jun 22", value: 3.7, hint: "storm system" },
            { label: "Jun 23", value: 3.5 },
            { label: "Jun 24", value: 3.4, hint: "staffing gap" },
            { label: "Jun 25", value: 3.6 },
            { label: "Jun 26", value: 3.8 },
            { label: "Jun 27", value: 3.9 },
            { label: "Jun 28", value: 4.0 },
            { label: "Jun 29", value: 4.1 },
            { label: "Jun 30", value: 4.2 },
          ],
        },
        {
          type: "stat-grid",
          tiles: [
            { label: "Avg pre-dip", value: "4.24M/day", trend: "flat" },
            { label: "Avg during dip", value: "3.68M/day", delta: "-13%", trend: "down" },
            { label: "Lost throughput", value: "~4.2M pkgs", trend: "down" },
            { label: "Recovery day", value: "Jun 30", trend: "up" },
          ],
        },
        {
          type: "text",
          text: "Two overlapping causes in the ops log: a severe-weather advisory on Jun 22 that grounded 4 feeder flights, and a staffing shortfall on the sort belts Jun 23–25 (holiday call-outs). Want me to break this down by shift or by lane?",
        },
      ],
    },
    {
      role: "user",
      content: "Break it down by shift, and list the top affected destinations.",
    },
    {
      role: "assistant",
      content: "",
      blocks: [
        {
          type: "text",
          text: "Throughput loss by shift (Jun 22–26 vs. Jun 15–19 baseline):",
        },
        {
          type: "table",
          data: {
            headers: ["Shift", "Baseline", "Actual", "Delta", "Root cause"],
            rows: [
              ["Twilight (5p–10p)", "1.42M", "1.35M", "−5%", "Weather"],
              ["Night (10p–3a)", "1.68M", "1.32M", "−21%", "Staffing + weather"],
              ["Sunrise (3a–8a)", "1.14M", "1.01M", "−11%", "Backlog spillover"],
            ],
          },
        },
        {
          type: "text",
          text: "Top destinations impacted (by delayed volume):",
        },
        {
          type: "table",
          data: {
            headers: ["Destination hub", "Delayed pkgs", "Avg delay", "SLA breach"],
            rows: [
              ["EWR — Newark", "612K", "+18 hrs", "8.4%"],
              ["ONT — Ontario CA", "488K", "+22 hrs", "11.1%"],
              ["ATL — Atlanta", "421K", "+14 hrs", "5.9%"],
              ["DFW — Dallas", "395K", "+16 hrs", "7.2%"],
              ["IND — Indianapolis", "302K", "+12 hrs", "4.8%"],
            ],
          },
        },
        {
          type: "text",
          text: "Night shift is where the bulk of the loss concentrates — worth pairing with HR on a Q3 staffing plan before peak. Want me to draft a one-pager for the ops standup with these charts included?",
        },
      ],
    },
  ],
  c2: [
    {
      role: "user",
      content: "Draft a proactive delay notification for shippers with packages stuck at MEM and send via Gmail.",
      parts: [
        { type: "chip", chip: { kind: "prompt", label: "Draft delay notice" } },
        { type: "text", text: " for shippers stuck at MEM — pull recipients from " },
        { type: "chip", chip: { kind: "integration", iconId: "salesforce", label: "Salesforce" } },
        { type: "text", text: " and send via " },
        { type: "chip", chip: { kind: "integration", iconId: "gmail", label: "Gmail" } },
        { type: "text", text: "." },
      ],
    },
    {
      role: "assistant",
      content:
        "Subject: Update on your FedEx shipment — revised delivery estimate\n\nHi {{first_name}},\n\nYour shipment ({{tracking_number}}) is currently held at our Memphis hub due to weather-related delays. Revised estimated delivery: **{{new_eta}}**. No action needed — we'll notify you as soon as it moves.\n\n— The FedEx team",
    },
    { role: "user", content: "Make it warmer and shorter — under 80 words." },
    {
      role: "assistant",
      content:
        "Subject: Quick update on your FedEx shipment\n\nHi {{first_name}},\n\nWe're holding your package ({{tracking_number}}) at our Memphis hub due to weather. New ETA: **{{new_eta}}**. We'll ping you the moment it's back on the road — no action needed on your end.\n\nThanks for your patience,\nFedEx",
    },
  ],
  c3: [
    {
      role: "user",
      content: "Analyze our enterprise shippers with renewals closing this month using HubSpot and the Sales Playbook.",
      parts: [
        { type: "text", text: "Analyze enterprise shippers with renewals closing this month from " },
        { type: "chip", chip: { kind: "integration", iconId: "hubspot", label: "HubSpot" } },
        { type: "text", text: ", using " },
        { type: "chip", chip: { kind: "knowledge", iconId: "gmail", label: "Sales Playbook" } },
        { type: "text", text: " as reference." },
      ],
    },
    {
      role: "assistant",
      content:
        "March renewal snapshot (from CRM):\n\n• **Commit**: 7 accounts, $1.1M ARR (high confidence)\n• **Best case**: 4 accounts, $620K ARR (needs pricing/legal)\n• **At risk**: 3 accounts with volume down >20% QoQ\n\nBiggest blocker: Shopify enterprise renewal ($240K) — pricing objection on Ground rates. I can draft a follow-up for that account.",
    },
    { role: "user", content: "What's the weighted forecast?" },
    {
      role: "assistant",
      content:
        "Weighted March renewal forecast: **$1.34M ARR** (commit 100%, best case 60%, at-risk 20%). vs. quota $1.5M → **89% attainment** if nothing slips. Saving Shopify + Nova would close the gap.",
    },
  ],
};

export function getChatMessages(chatId: string, agentName: string): ChatMessage[] {
  if (MOCK_CHAT_HISTORY[chatId]) return MOCK_CHAT_HISTORY[chatId];
  return [
    { role: "user", content: "Hello! What can you help me with?" },
    {
      role: "assistant",
      content: `Hi! I'm ${agentName}. How can I assist you today?`,
    },
  ];
}
