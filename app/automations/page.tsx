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
  status: "success" | "failed" | "running" | "warning";
  startedAt: string;
  duration: string;
  steps: number;
}

const MOCK_RUNS: AutomationRun[] = [
  { id: "r1",  automationId: "auto-1", title: "18 exceptions reviewed · 5 priority actions identified", status: "success", startedAt: "Today, 7:00 AM",     duration: "0m 48s", steps: 7 },
  { id: "r2",  automationId: "auto-2", title: "ETA change detected on watched shipment",                status: "success", startedAt: "22 min ago",         duration: "0m 12s", steps: 6 },
  { id: "r3",  automationId: "auto-4", title: "Handoff summary posted to incoming team",                status: "success", startedAt: "Yesterday, 5:30 PM", duration: "1m 04s", steps: 7 },
  { id: "r4",  automationId: "auto-1", title: "12 exceptions reviewed · 3 priority actions identified", status: "success", startedAt: "Yesterday, 7:00 AM", duration: "0m 41s", steps: 7 },
  { id: "r5",  automationId: "auto-2", title: "Customs hold detected on watched shipment",              status: "success", startedAt: "3 hours ago",        duration: "0m 09s", steps: 6 },
  { id: "r6",  automationId: "auto-3", title: "Draft delay update prepared for my review",              status: "success", startedAt: "2 days ago",         duration: "0m 22s", steps: 7 },
  { id: "r7",  automationId: "auto-1", title: "Outlook unavailable · Brief delivered to Teams",         status: "warning", startedAt: "July 15, 7:00 AM",   duration: "1m 12s", steps: 7 },
  { id: "r8",  automationId: "auto-4", title: "Handoff summary posted to incoming team",                status: "success", startedAt: "2 days ago",         duration: "1m 02s", steps: 7 },
  { id: "r9",  automationId: "auto-2", title: "Missed scan alert sent",                                 status: "success", startedAt: "5 hours ago",        duration: "0m 11s", steps: 6 },
  { id: "r10", automationId: "auto-1", title: "Brief delivery failed · retry scheduled",                status: "failed",  startedAt: "July 10, 7:00 AM",   duration: "0m 08s", steps: 3 },
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

  const handleUpdateSchedule = (id: string, schedule: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, schedule } : a))
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
          { id: "work", label: "Hub Ops" },
          { id: "marketing", label: "Customer Service" },
          { id: "sales", label: "Enterprise Sales" },
        ]}
        organisationName="FedEx"
        userName="Fred Smith"
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
                      onUpdateSchedule={handleUpdateSchedule}
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
