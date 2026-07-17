export type RunItem = {
  id: string;
  label: string;
  timestamp?: string;
  agentId: string;
  agentName: string;
};

export const MOCK_FORM_RUNS: RunItem[] = [
  { id: "fr1", label: "Service alert — MEM weather delay", timestamp: "Yesterday", agentId: "6", agentName: "Service Alert Writer" },
  { id: "fr2", label: "RFP — Shopify enterprise renewal", timestamp: "3d ago", agentId: "10", agentName: "Enterprise RFP Builder" },
];

export const MOCK_BATCH_RUNS: RunItem[] = [];
