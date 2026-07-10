"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ZapIcon } from "lucide-react";
import { AgentSidebar } from "@/components/agent-sidebar";
import { AutomationCard } from "@/components/automation-card";
import { AutomationRunsList } from "@/components/automation-runs-list";
import { myAutomations } from "@/lib/automations-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  PageHeader,
  pageContainerClass,
  pageContentInnerClass,
} from "@/components/page-layout";

interface AutomationRun {
  id: string;
  automationId: string;
  title: string;
  status: "success" | "failed" | "running";
  startedAt: string;
  duration: string;
  steps: number;
}

const MOCK_RUNS: AutomationRun[] = [
  { id: "r1",  automationId: "auto-2", title: "Lead enrichment in progress",   status: "running", startedAt: "Just now",    duration: "—",      steps: 4 },
  { id: "r2",  automationId: "auto-1", title: "Weekly digest generated",        status: "success", startedAt: "2 days ago",  duration: "1m 42s", steps: 7 },
  { id: "r3",  automationId: "auto-2", title: "Lead profiles enriched",         status: "success", startedAt: "4 hours ago", duration: "3m 08s", steps: 7 },
  { id: "r4",  automationId: "auto-4", title: "SEO audit completed",            status: "success", startedAt: "6 days ago",  duration: "5m 21s", steps: 7 },
  { id: "r5",  automationId: "auto-2", title: "Lead enrichment failed",         status: "failed",  startedAt: "1 day ago",   duration: "0m 54s", steps: 3 },
  { id: "r6",  automationId: "auto-1", title: "Weekly digest generated",        status: "success", startedAt: "9 days ago",  duration: "1m 55s", steps: 7 },
  { id: "r7",  automationId: "auto-3", title: "Compliance report generated",    status: "success", startedAt: "9 days ago",  duration: "4m 12s", steps: 7 },
  { id: "r8",  automationId: "auto-4", title: "SEO audit completed",            status: "success", startedAt: "13 days ago", duration: "5m 03s", steps: 7 },
  { id: "r9",  automationId: "auto-2", title: "Lead profiles enriched",         status: "success", startedAt: "2 days ago",  duration: "2m 47s", steps: 7 },
  { id: "r10", automationId: "auto-1", title: "Weekly digest failed",           status: "failed",  startedAt: "16 days ago", duration: "0m 31s", steps: 2 },
];

function AutomationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "runs" ? "runs" : "list";
  const [automations, setAutomations] = useState(myAutomations);

  const runItems = useMemo(
    () =>
      MOCK_RUNS.map((run) => {
        const automation = myAutomations.find((a) => a.id === run.automationId);
        return {
          id: run.id,
          title: run.title,
          status: run.status,
          time: run.startedAt,
          duration: run.duration,
          steps: run.steps,
          agentId: automation?.agentId,
          automationId: run.automationId,
          automationName: automation?.name,
          triggerType: automation?.triggerType,
        };
      }),
    []
  );

  const handleToggle = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "active" ? "paused" : "active" }
          : a
      )
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted">
      <AgentSidebar
        selectedCategory=""
        onCategoryChange={(cat) => {
          router.push(cat === "all" ? "/agents" : `/agents?category=${cat}`);
        }}
        categories={[
          { id: "work", label: "Engineering" },
          { id: "marketing", label: "Growth" },
          { id: "sales", label: "Revenue" },
        ]}
        organisationName="Acme"
        userName="David Hidalgo"
        onNewChat={() => router.push("/agent/new")}
        activeSection="automations"
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <Tabs value={activeTab} onValueChange={(v) => router.push(v === "runs" ? "/automations?tab=runs" : "/automations")} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <PageHeader
            subRow={
              <TabsList>
                <TabsTrigger value="list">Overview</TabsTrigger>
                <TabsTrigger value="runs">Run History</TabsTrigger>
              </TabsList>
            }
          >
            <h1 className="text-base font-semibold">My Automations</h1>
            <button
              onClick={() => router.push("/agents?category=automations")}
              className="flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted/50 transition-colors"
            >
              Explore automations
            </button>
          </PageHeader>

          <TabsContent value="list" className="flex-1 overflow-y-auto py-4 mt-0">
            <div className={pageContentInnerClass}>
              {automations.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {automations.map((automation) => (
                    <AutomationCard
                      key={automation.id}
                      automation={automation}
                      onToggle={handleToggle}
                      onClick={(a) => router.push(`/automations/${a.id}`)}
                    />
                  ))}
                </div>
              )}
              {automations.length === 0 && (
                <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ZapIcon className="size-8 opacity-30" />
                  <p className="text-sm font-medium">No automations yet</p>
                  <p className="text-sm">Set up an automation from any agent on the All Agents page.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="runs" className="flex-1 overflow-y-auto py-4 mt-0">
            <div className={pageContainerClass}>
              <AutomationRunsList
                runs={runItems}
                showIcons
                onRunClick={(run) => {
                  if (run.automationId) router.push(`/automations/${run.automationId}`);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AutomationsPage() {
  return (
    <Suspense>
      <AutomationsContent />
    </Suspense>
  );
}
