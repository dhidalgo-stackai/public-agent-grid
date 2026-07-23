"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Plug2Icon,
  CheckCircle2Icon,
  XCircleIcon,
  PlusIcon,
  MoreHorizontalIcon,
  ZapIcon,
  ChevronRightIcon,
} from "lucide-react";
import { AgentSidebar } from "@/components/agent-sidebar";
import { MoreAppsDialog } from "@/components/more-apps-dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { PageHeader, pageContainerClass, pageContentScrollClass } from "@/components/page-layout";
import { myAutomations } from "@/lib/automations-data";
import { AGENT_DIRECTORY } from "@/lib/agents-data";
import { getAgentIcon } from "@/lib/agent-icons";
import { cn } from "@/lib/utils";
import { integrationIcons } from "@/lib/integration-icons";

type ConnectionStatus = "connected" | "error" | "disconnected";
type ConnectionUsageType = "agent" | "automation";

interface ConnectionUsageItem {
  id: string;
  name: string;
  type: ConnectionUsageType;
  icon: ReactNode;
  subtitle: string;
}

interface Connection {
  id: string;
  name: string;
  integration: string;
  account: string;
  connectedBy: string;
  connectedDate: string;
  status: ConnectionStatus;
}

const MOCK_CONNECTIONS: Connection[] = [
  {
    id: "1",
    integration: "slack",
    name: "Slack — FedEx Ops",
    account: "david@fedex.com",
    connectedBy: "Fred Smith",
    connectedDate: "Jan 10, 2025",
    status: "connected",
  },
  {
    id: "2",
    integration: "outlook",
    name: "Outlook — david@fedex.com",
    account: "david@fedex.com",
    connectedBy: "Fred Smith",
    connectedDate: "Jan 10, 2025",
    status: "connected",
  },
  {
    id: "3",
    integration: "notion",
    name: "Notion — Ops Playbooks",
    account: "david@fedex.com",
    connectedBy: "Fred Smith",
    connectedDate: "Dec 3, 2024",
    status: "connected",
  },
  {
    id: "4",
    integration: "gdrive",
    name: "Google Drive — FedEx Shared",
    account: "david@fedex.com",
    connectedBy: "Fred Smith",
    connectedDate: "Nov 20, 2024",
    status: "error",
  },
  {
    id: "5",
    integration: "salesforce",
    name: "Salesforce — FedEx Compass",
    account: "david@fedex.com",
    connectedBy: "Fred Smith",
    connectedDate: "Jan 15, 2025",
    status: "connected",
  },
  {
    id: "6",
    integration: "excel",
    name: "Excel Online — SLA & Volume Sheets",
    account: "david@fedex.com",
    connectedBy: "Fred Smith",
    connectedDate: "Jan 8, 2025",
    status: "connected",
  },
  {
    id: "7",
    integration: "outlook",
    name: "Outlook — Enterprise Sales Mailbox",
    account: "david@fedex.com",
    connectedBy: "Fred Smith",
    connectedDate: "Dec 18, 2024",
    status: "disconnected",
  },
];

const USAGE_TYPE_LABEL: Record<ConnectionUsageType, string> = {
  agent: "Agent",
  automation: "Automation",
};

function getConnectionUsage(integration: string): ConnectionUsageItem[] {
  const agents = AGENT_DIRECTORY.filter((agent) => agent.apps?.includes(integration)).map((agent) => ({
    id: `agent-${agent.id}`,
    name: agent.name,
    type: "agent" as const,
    icon: getAgentIcon(agent.id, "size-3.5 text-foreground/70"),
    subtitle: USAGE_TYPE_LABEL.agent,
  }));

  const automations = myAutomations
    .filter((automation) => automation.integrations.includes(integration))
    .map((automation) => ({
      id: `automation-${automation.id}`,
      name: automation.name,
      type: "automation" as const,
      icon: <ZapIcon className="size-3.5 text-foreground/70" />,
      subtitle: USAGE_TYPE_LABEL.automation,
    }));

  return [...agents, ...automations].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "agent" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

function UsageBadge({ integration }: { integration: string }) {
  const usage = getConnectionUsage(integration);

  if (usage.length === 0) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span>{usage.length} time{usage.length !== 1 ? "s" : ""}</span>
          <ChevronRightIcon className="size-3 text-muted-foreground" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-72 p-0">
        <div className="border-b px-3 py-2.5">
          <div className="text-sm font-medium text-foreground">Used by</div>
          <div className="text-xs text-muted-foreground">
            {usage.length} item{usage.length !== 1 ? "s" : ""} depend on this connection
          </div>
        </div>
        <div className="py-1.5">
          {usage.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-muted/50"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-background">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  if (status === "connected") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-emerald-600">
        <CheckCircle2Icon className="size-3.5" />
        Connected
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-red-500">
        <XCircleIcon className="size-3.5" />
        Auth error
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span className="size-3.5 rounded-full border-2 border-muted-foreground/40" />
      Disconnected
    </span>
  );
}

export default function ConnectionsPage() {
  const router = useRouter();
  const [connections] = useState(MOCK_CONNECTIONS);
  const [addConnectionOpen, setAddConnectionOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted">
      <AgentSidebar
        selectedCategory="all"
        onCategoryChange={() => {}}
        categories={[
          { id: "work", label: "Hub Ops" },
          { id: "marketing", label: "Customer Service" },
          { id: "sales", label: "Enterprise Sales" },
        ]}
        organisationName="FedEx"
        userName="Fred Smith"
        onNewChat={() => router.push("/agent/new")}
        activeSection="connections"
        favoriteAgents={[]}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <PageHeader>
          <h1 className="text-base font-semibold">Connections</h1>
          <button
            type="button"
            onClick={() => setAddConnectionOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
          >
            <PlusIcon className="size-4" />
            Add connection
          </button>
        </PageHeader>

        <div className={cn(pageContentScrollClass)}>
        <div className={cn(pageContainerClass, "py-4 pb-8")}>
          <div className="overflow-hidden rounded-xl border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Account
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Connected by
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Used by
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {connections.map((conn) => (
                  <tr
                    key={conn.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-background">
                          {integrationIcons[conn.integration] ?? (
                            <Plug2Icon className="size-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium text-foreground">
                          {conn.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {conn.account}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-foreground/80">{conn.connectedBy}</div>
                      <div className="text-xs text-muted-foreground">{conn.connectedDate}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={conn.status} />
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <UsageBadge integration={conn.integration} />
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
      <MoreAppsDialog
        open={addConnectionOpen}
        onOpenChange={setAddConnectionOpen}
      />
    </div>
  );
}
