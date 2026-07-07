"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plug2Icon, CheckCircle2Icon, XCircleIcon, PlusIcon, MoreHorizontalIcon } from "lucide-react";
import { AgentSidebar } from "@/components/agent-sidebar";
import { MoreAppsDialog } from "@/components/more-apps-dialog";
import { PageHeader, pageContainerClass, pageContentScrollClass } from "@/components/page-layout";
import { cn } from "@/lib/utils";
import { integrationIcons } from "@/lib/integration-icons";

type ConnectionStatus = "connected" | "error" | "disconnected";

interface Connection {
  id: string;
  name: string;
  integration: string;
  account: string;
  connectedBy: string;
  connectedDate: string;
  status: ConnectionStatus;
  usedByAgents: number;
}

const MOCK_CONNECTIONS: Connection[] = [
  {
    id: "1",
    integration: "slack",
    name: "Slack — StackAI Workspace",
    account: "david@stackai.com",
    connectedBy: "David Hidalgo",
    connectedDate: "Jan 10, 2025",
    status: "connected",
    usedByAgents: 7,
  },
  {
    id: "2",
    integration: "gmail",
    name: "Gmail — david@stackai.com",
    account: "david@stackai.com",
    connectedBy: "David Hidalgo",
    connectedDate: "Jan 10, 2025",
    status: "connected",
    usedByAgents: 5,
  },
  {
    id: "3",
    integration: "notion",
    name: "Notion — Engineering Wiki",
    account: "david@stackai.com",
    connectedBy: "David Hidalgo",
    connectedDate: "Dec 3, 2024",
    status: "connected",
    usedByAgents: 3,
  },
  {
    id: "4",
    integration: "gdrive",
    name: "Google Drive — StackAI Shared",
    account: "david@stackai.com",
    connectedBy: "David Hidalgo",
    connectedDate: "Nov 20, 2024",
    status: "error",
    usedByAgents: 2,
  },
  {
    id: "5",
    integration: "figma",
    name: "Figma — Design System",
    account: "david@stackai.com",
    connectedBy: "David Hidalgo",
    connectedDate: "Jan 15, 2025",
    status: "connected",
    usedByAgents: 4,
  },
  {
    id: "6",
    integration: "excel",
    name: "Excel Online — Finance Sheets",
    account: "david@stackai.com",
    connectedBy: "David Hidalgo",
    connectedDate: "Jan 8, 2025",
    status: "connected",
    usedByAgents: 1,
  },
  {
    id: "7",
    integration: "outlook",
    name: "Outlook — Company Email",
    account: "david@stackai.com",
    connectedBy: "David Hidalgo",
    connectedDate: "Dec 18, 2024",
    status: "disconnected",
    usedByAgents: 0,
  },
];

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
          { id: "work", label: "Engineering" },
          { id: "marketing", label: "Growth" },
          { id: "sales", label: "Revenue" },
        ]}
        organisationName="StackAI Internal"
        userName="David Hidalgo"
        onNewChat={() => router.push("/agent/new")}
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
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-background">
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
                      {conn.usedByAgents > 0 ? (
                        <span>
                          {conn.usedByAgents} agent{conn.usedByAgents !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
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
