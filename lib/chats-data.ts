export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatItem = {
  id: string;
  label: string;
  timestamp?: string;
  agentId?: string;
  agentName?: string;
};

export const MOCK_RECENT_CHATS: ChatItem[] = [
  { id: "c1", label: "Summarize Q2 report", timestamp: "2h ago", agentId: "9", agentName: "Sales Forecaster" },
  { id: "c2", label: "Draft customer email", timestamp: "Yesterday", agentId: "11", agentName: "Customer Support Bot" },
  { id: "c3", label: "Analyze sales data", timestamp: "2d ago", agentId: "14", agentName: "Deal Closer" },
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
    { role: "user", content: "Can you summarize our Q2 sales report? I need the highlights for the leadership standup." },
    {
      role: "assistant",
      content:
        "Here's a concise Q2 summary:\n\n• **Revenue**: $4.2M (+18% QoQ), driven by enterprise upsells\n• **Pipeline**: $12.8M qualified, win rate improved to 34%\n• **Top segment**: Mid-market SaaS (+26%)\n• **Risk**: Two large deals slipped to Q3 ($890K combined)\n\nWant me to format this as slides or a one-pager?",
    },
    { role: "user", content: "Yes — bullet points only, under 6 lines for the slide." },
    {
      role: "assistant",
      content:
        "• Q2 revenue $4.2M (+18% QoQ)\n• Qualified pipeline $12.8M, 34% win rate\n• Mid-market SaaS led growth (+26%)\n• Enterprise upsells were the main driver\n• $890K slipped to Q3 — flag in forecast\n• Recommend raising Q3 target by 5% on pipeline strength",
    },
  ],
  c2: [
    { role: "user", content: "Draft a welcome email for new customers who just completed onboarding." },
    {
      role: "assistant",
      content:
        "Subject: You're all set — here's how to get the most from Acme\n\nHi {{first_name}},\n\nWelcome aboard! Your workspace is ready. Start with **Quick Start** in the sidebar, or reply to this email if you'd like a 15-minute walkthrough.\n\n— The Acme team",
    },
    { role: "user", content: "Make it warmer and shorter — under 80 words." },
    {
      role: "assistant",
      content:
        "Subject: Welcome to Acme 🎉\n\nHi {{first_name}},\n\nYou're in! Open your workspace and try **New Chat** — pick any agent and ask anything. Questions? Just reply here.\n\nHappy building,\nAcme",
    },
  ],
  c3: [
    { role: "user", content: "Analyze our sales pipeline for deals closing this month." },
    {
      role: "assistant",
      content:
        "March close forecast (from CRM snapshot):\n\n• **Commit**: 7 deals, $1.1M (high confidence)\n• **Best case**: 4 deals, $620K (needs legal/security)\n• **At risk**: 3 deals stalled >14 days in negotiation\n\nBiggest blocker: security review on Acme Corp ($240K). I can draft a follow-up for that account.",
    },
    { role: "user", content: "What's the weighted forecast?" },
    {
      role: "assistant",
      content:
        "Weighted March forecast: **$1.34M** (commit 100%, best case 60%, at-risk 20%). vs. quota $1.5M → **89% attainment** if nothing slips. Pushing Acme + Nova would close the gap.",
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
