export type RunItem = {
  id: string;
  label: string;
  timestamp?: string;
  agentId: string;
  agentName: string;
};

export const MOCK_FORM_RUNS: RunItem[] = [
  { id: "fr1", label: "Service alert — MEM weather delay", timestamp: "2h ago", agentId: "6", agentName: "Service Alert Writer" },
  { id: "fr2", label: "RFP — Shopify enterprise renewal", timestamp: "Yesterday", agentId: "10", agentName: "Enterprise RFP Builder" },
  { id: "fr3", label: "Shipper enrichment — new e-commerce signups", timestamp: "2d ago", agentId: "8", agentName: "Shipper Account Enricher" },
];

export const MOCK_BATCH_RUNS: RunItem[] = [
  { id: "br1", label: "Route audit — MEM ground routes", timestamp: "6h ago", agentId: "7", agentName: "Route Efficiency Analyzer" },
  { id: "br2", label: "Route audit — LAX express lanes", timestamp: "Yesterday", agentId: "7", agentName: "Route Efficiency Analyzer" },
  { id: "br3", label: "Exception clustering — last 7 days", timestamp: "2d ago", agentId: "7", agentName: "Route Efficiency Analyzer" },
];
