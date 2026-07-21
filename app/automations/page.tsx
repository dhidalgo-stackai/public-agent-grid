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
  runId: string;
  title: string;
  input: string;
  status: "success" | "failed" | "running" | "warning";
  startedAt: string;
  duration: string;
}

const FEDEX_AUTOMATION_ID = "auto-fedex-exception-log";

const MOCK_RUNS: AutomationRun[] = [
  { id: "r1", automationId: FEDEX_AUTOMATION_ID, runId: "8f21ac04-1d7b-4e93-b0aa-5cd91a1927c2", title: "Exception row appended · DELAY (MEM → SDF)",       input: "[Exception] Tracking 794512338891 delayed at MEM hub",           status: "success", startedAt: "Today, 7:00 AM",     duration: "12.4s" },
  { id: "r2", automationId: FEDEX_AUTOMATION_ID, runId: "2a90fe17-83c2-4b45-9de8-11ab7c440d19", title: "Exception row appended · HELD_CUSTOMS (HKG → LAX)", input: "[Exception] Tracking 812004557723 held at customs (HKG)",         status: "success", startedAt: "Yesterday, 7:00 AM", duration: "9.1s" },
  { id: "r3", automationId: FEDEX_AUTOMATION_ID, runId: "3b623ee3-b364-554d-9fbb-3cd91a1927c2", title: "",                                                  input: "[Exception] Tracking 733819224011 delivery attempt failed",       status: "warning", startedAt: "July 15, 7:00 AM",   duration: "0.06s" },
];

function AutomationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "runs" ? "runs" : "list";
  const [automations, setAutomations] = useState(
    myAutomations.filter((a) => a.id === "auto-fedex-exception-log")
  );

  const runItems = useMemo(
    () =>
      MOCK_RUNS.map((run) => {
        const automation = myAutomations.find((a) => a.id === run.automationId);
        return {
          id: run.id,
          runId: run.runId,
          title: run.title,
          status: run.status,
          time: run.startedAt,
          duration: run.duration,
          input: run.input,
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
