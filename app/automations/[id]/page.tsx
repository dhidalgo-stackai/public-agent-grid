"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AutomationSetupModal } from "@/components/automation-setup-modal";
import { AgentSidebar } from "@/components/agent-sidebar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AutomationRunsList } from "@/components/automation-runs-list";
import { getAgentIcon } from "@/lib/agent-icons";
import { myAutomations } from "@/lib/automations-data";
import {
  ChevronLeftIcon,
  ZapIcon,
  GlobeIcon,
  SparklesIcon,
  SendIcon,
  DatabaseIcon,
  FolderIcon,
  ShieldIcon,
  BellIcon,
  BarChartIcon,
  DownloadIcon,
  MailIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  PlusIcon,
  MinusIcon,
  MaximizeIcon,
  FilterIcon,
  ListChecksIcon,
  ChevronDownIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PageHeader,
  pageContainerClass,
} from "@/components/page-layout";
import type { AutomationStep, AutomationTool } from "@/lib/automations-data";
import { IntegrationIcon, TriggerIcon } from "@/lib/integration-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap: Record<string, React.ReactNode> = {
  zap: <ZapIcon className="size-4" />,
  globe: <GlobeIcon className="size-4" />,
  sparkles: <SparklesIcon className="size-4" />,
  send: <SendIcon className="size-4" />,
  database: <DatabaseIcon className="size-4" />,
  folder: <FolderIcon className="size-4" />,
  shield: <ShieldIcon className="size-4" />,
  bell: <BellIcon className="size-4" />,
  "bar-chart": <BarChartIcon className="size-4" />,
  download: <DownloadIcon className="size-4" />,
  mail: <MailIcon className="size-4" />,
  "file-text": <FileTextIcon className="size-4" />,
  "file-spreadsheet": <FileSpreadsheetIcon className="size-4" />,
  filter: <FilterIcon className="size-4" />,
  "list-checks": <ListChecksIcon className="size-4" />,
  slack: (
    <svg className="size-4" viewBox="0 0 24 24" fill="none">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#36C5F0"/>
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#2EB67D"/>
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#ECB22E"/>
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
    </svg>
  ),
  linkedin: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
};

function NodeIcon({ icon }: { icon?: string }) {
  return (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200/80 [&_svg]:size-3">
      {icon ? iconMap[icon] ?? <ZapIcon className="size-3" /> : <ZapIcon className="size-3" />}
    </div>
  );
}

const MIN_SCALE = 0.4;
const MAX_SCALE = 2;

function getTriggerStepLabel(
  triggerType: "schedule" | "slack",
  schedule?: string
) {
  if (triggerType === "slack") return "Message received";
  return schedule ?? "Scheduled";
}

function WorkflowCanvas({
  steps,
  tools,
  triggerType,
  schedule,
}: {
  steps: AutomationStep[];
  tools?: AutomationTool[];
  triggerType?: "schedule" | "slack";
  schedule?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const centerView = () => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const ww = content.offsetWidth;
    const wh = content.offsetHeight;
    setTransform({ scale: 1, x: (cw - ww) / 2, y: (ch - wh) / 2 });
  };

  useEffect(() => {
    centerView();
    const onResize = () => centerView();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = -e.deltaY * 0.0015;
      setTransform((t) => {
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, t.scale * (1 + delta)));
        const ratio = newScale / t.scale;
        return {
          scale: newScale,
          x: mouseX - (mouseX - t.x) * ratio,
          y: mouseY - (mouseY - t.y) * ratio,
        };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
  };

  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e: MouseEvent) => {
      setTransform((t) => ({
        ...t,
        x: panStart.current.tx + (e.clientX - panStart.current.x),
        y: panStart.current.ty + (e.clientY - panStart.current.y),
      }));
    };
    const onUp = () => setIsPanning(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isPanning]);

  const zoomBy = (factor: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTransform((t) => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, t.scale * factor));
      const ratio = newScale / t.scale;
      return {
        scale: newScale,
        x: cx - (cx - t.x) * ratio,
        y: cy - (cy - t.y) * ratio,
      };
    });
  };

  const resetView = () => centerView();

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className="relative w-full overflow-hidden rounded-xl border border-border select-none overscroll-contain"
      style={{
        background: "#fafafa",
        backgroundImage: "radial-gradient(circle, #e5e5e5 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        backgroundPosition: `${transform.x % 22}px ${transform.y % 22}px`,
        height: 280,
        cursor: isPanning ? "grabbing" : "grab",
        touchAction: "none",
      }}
    >
      <div
        ref={contentRef}
        className="absolute top-0 left-0 origin-top-left"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        <div className="flex items-center px-8 py-6" style={{ gap: 0 }}>
          {steps.map((step, i) => {
            const tool = tools?.find(
              (t) =>
                t.name.toLowerCase().includes(step.label.toLowerCase()) ||
                step.label.toLowerCase().includes(t.name.toLowerCase())
            );
            const isTriggerStep = i === 0;
            const stepLabel =
              isTriggerStep && triggerType
                ? getTriggerStepLabel(triggerType, schedule)
                : step.label;
            const description =
              tool?.description ??
              (isTriggerStep && triggerType === "schedule"
                ? "Starts the workflow on this schedule"
                : isTriggerStep && triggerType === "slack"
                ? "When a message is posted in Slack"
                : isTriggerStep
                ? "Triggers the workflow automatically"
                : i === steps.length - 1
                ? "Outputs the result of this workflow"
                : "Processes data using AI");

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className="bg-white rounded-lg px-2.5 py-2"
                  style={{
                    width: 150,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.07)",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {isTriggerStep && triggerType ? (
                      <TriggerIcon triggerType={triggerType} />
                    ) : (
                      <NodeIcon icon={step.icon} />
                    )}
                    <p className="text-[11px] font-semibold text-neutral-800 leading-tight truncate">
                      {stepLabel}
                    </p>
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-snug line-clamp-2">
                    {description}
                  </p>
                </div>

                {i < steps.length - 1 && (
                  <div className="h-px bg-neutral-300" style={{ width: 20 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-1"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => zoomBy(1 / 1.2)}
          className="flex items-center justify-center size-7 text-neutral-500 hover:text-neutral-800 transition-colors"
          title="Zoom out"
        >
          <MinusIcon className="size-3.5" />
        </button>
        <div className="text-[10px] tabular-nums text-neutral-500 px-1 min-w-[34px] text-center">
          {Math.round(transform.scale * 100)}%
        </div>
        <button
          onClick={() => zoomBy(1.2)}
          className="flex items-center justify-center size-7 text-neutral-500 hover:text-neutral-800 transition-colors"
          title="Zoom in"
        >
          <PlusIcon className="size-3.5" />
        </button>
        <button
          onClick={resetView}
          className="flex items-center justify-center size-7 text-neutral-500 hover:text-neutral-800 transition-colors"
          title="Reset view"
        >
          <MaximizeIcon className="size-3" />
        </button>
      </div>
    </div>
  );
}

function MetadataRow({
  createdBy,
  labels = [],
  triggerType,
  schedule,
  integrations,
}: {
  createdBy: string;
  labels?: string[];
  triggerType?: "schedule" | "slack";
  schedule?: string;
  integrations: string[];
}) {
  return (
    <div className="flex items-start gap-12">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">Created by</span>
        <span className="text-sm font-normal text-foreground">{createdBy}</span>
      </div>

      {labels.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Labels</span>
          <div className="flex items-center gap-1.5">
            {labels.slice(0, 2).map((label) => (
              <span
                key={label}
                className="inline-flex min-w-0 max-w-24 shrink-0 items-center rounded-md bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground"
              >
                <span className="truncate">{label}</span>
              </span>
            ))}
            {labels.length > 2 && (
              <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                +{labels.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {triggerType && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Trigger</span>
          <div className="flex w-fit items-center gap-1.5">
            <TriggerIcon triggerType={triggerType} />
            <span className="text-xs font-medium text-foreground">
              {triggerType === "slack"
                ? "Message received"
                : schedule || "Scheduled"}
            </span>
          </div>
        </div>
      )}

      {integrations.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Integrations</span>
          <div className="flex items-center -space-x-1.5">
            {integrations.slice(0, 5).map((integration) => (
              <TooltipProvider key={integration}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-default">
                      <IntegrationIcon name={integration} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="border border-border bg-background px-2 py-1 shadow-md"
                  >
                    <span className="text-xs font-medium text-foreground capitalize">
                      {integration}
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_RUNS = [
  { id: "r1", title: "Weekly digest generated", time: "6h ago" },
  { id: "r2", title: "Content summarized and formatted", time: "yesterday" },
  { id: "r3", title: "Weekly digest generated", time: "2d ago" },
  { id: "r4", title: "Articles fetched and filtered", time: "3d ago" },
  { id: "r5", title: "Digest posted to Slack", time: "4d ago" },
  { id: "r6", title: "Subscriber emails sent", time: "5d ago" },
  { id: "r7", title: "Weekly digest generated", time: "6d ago" },
  { id: "r8", title: "Content summarized and formatted", time: "7d ago" },
  { id: "r9", title: "Weekly digest generated", time: "8d ago" },
  { id: "r10", title: "Digest review completed", time: "9d ago" },
];

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border transition-colors group-hover:bg-muted-foreground/15">
        <ChevronLeftIcon className="size-4 shrink-0" />
      </span>
      My automations
    </button>
  );
}

function AutomationTitleRow({
  name,
  icon,
  description,
}: {
  name: string;
  icon: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted to-muted/30 text-muted-foreground [&_svg]:size-6">
        {icon}
      </div>
      <div className="flex flex-col pt-1">
        <h1 className="text-lg font-semibold leading-tight">{name}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function RunsPanel() {
  const runs = MOCK_RUNS.map((run) => ({
    id: run.id,
    title: run.title,
    status: "success" as const,
    time: run.time,
    duration: "—",
    steps: 0,
  }));

  return <AutomationRunsList runs={runs} />;
}

function AgentCard({
  name,
  logo,
  description,
}: {
  name: string;
  logo: React.ReactNode;
  description: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) setIsClamped(el.scrollHeight > el.clientHeight);
  }, []);

  const isExpandable = isClamped || isExpanded;

  return (
    <div
      role={isExpandable ? "button" : undefined}
      tabIndex={isExpandable ? 0 : undefined}
      onClick={isExpandable ? () => setIsExpanded((v) => !v) : undefined}
      onKeyDown={
        isExpandable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsExpanded((v) => !v);
              }
            }
          : undefined
      }
      className={cn(
        "group flex flex-col gap-1 rounded-lg bg-black/[0.02] px-3 py-2.5",
        "shadow-[inset_0_0_0_0.75px_rgba(0,0,0,0.07)]",
        isExpandable && "cursor-pointer transition-colors duration-150 hover:bg-black/[0.05]"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="size-4 shrink-0 flex items-center justify-center [&_svg]:size-4 text-foreground">
          {logo}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
          {name}
        </span>
        {isExpandable && (
          <ChevronDownIcon
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground opacity-0 transition-[opacity,transform] duration-200 group-hover:opacity-100",
              isExpanded && "rotate-180 opacity-100"
            )}
          />
        )}
      </div>
      <p
        ref={textRef}
        className={cn("text-xs leading-4 text-muted-foreground", !isExpanded && "line-clamp-3")}
      >

        {description}
      </p>
    </div>
  );
}

function AgentsSection({
  agents,
}: {
  agents: { id: string; name: string; logo: React.ReactNode; description: string }[];
}) {
  if (agents.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">AI Agents in this Workflow</p>
      <div className="grid grid-cols-2 gap-2">
        {agents.map((agent) => (
          <AgentCard key={agent.id} {...agent} />
        ))}
      </div>
    </div>
  );
}

const sectionDividerClass = "mt-4 border-t border-border/30 pt-4";

function OverviewPanel({
  automation,
}: {
  automation: (typeof myAutomations)[number];
}) {
  return (
    <div>
      <section>
        <MetadataRow
          createdBy={automation.authorName}
          labels={automation.labels}
          triggerType={automation.triggerType}
          schedule={automation.schedule}
          integrations={automation.integrations}
        />
      </section>

      {automation.steps && automation.steps.length > 0 && (
        <section className={sectionDividerClass}>
          <h2 className="text-sm font-semibold mb-2">Process</h2>
          <WorkflowCanvas
            steps={automation.steps}
            tools={automation.tools}
            triggerType={automation.triggerType}
            schedule={automation.schedule}
          />
        </section>
      )}

      {automation.tools && automation.tools.length > 0 && (
        <section className={sectionDividerClass}>
          <AgentsSection
            agents={automation.tools.map((tool) => ({
              id: tool.id,
              name: tool.name,
              logo: iconMap[tool.icon] ?? <ZapIcon className="size-4" />,
              description: tool.description,
            }))}
          />
        </section>
      )}
    </div>
  );
}

function AutomationDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const automation = myAutomations.find((a) => a.id === id);
  const justActivated = searchParams.get("activated") === "1";
  const [isActive, setIsActive] = useState(
    justActivated || automation?.status === "active"
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (justActivated) setIsActive(true);
  }, [justActivated]);

  const fallbackName = searchParams.get("name") ?? "Automation";
  const fallbackDescription = searchParams.get("description") ?? "";
  const fallbackAuthorName = searchParams.get("authorName") ?? "David Hidalgo";
  const fallbackLabels = searchParams.get("labels")?.split(",").filter(Boolean) ?? [];
  const fallbackTriggerType = (searchParams.get("triggerType") as "slack" | "schedule" | null) ?? "schedule";

  const sidebar = (
    <AgentSidebar
      selectedCategory={automation ? "" : "all"}
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
      activeSection={automation ? "automations" : undefined}
    />
  );

  if (!automation) {
    const fallbackAutomation = {
      id: id || "unknown",
      name: fallbackName,
      agentName: fallbackName,
      authorName: fallbackAuthorName,
      agentId: "",
      schedule: "",
      triggerType: fallbackTriggerType as "schedule" | "slack",
      status: "paused" as const,
      lastRun: "",
      nextRun: "",
      runsCount: 0,
      integrations: ["google-calendar", "outlook"],
      labels: fallbackLabels,
      description: fallbackDescription,
    };

    return (
      <div className="flex h-screen w-full overflow-hidden bg-muted">
        {sidebar}
        <AutomationSetupModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          automation={fallbackAutomation}
          isSetup
          onSave={() => router.push(`/automations/${id}?activated=1`)}
        />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          <PageHeader titleRowClassName="flex items-center gap-3">
            <BackButton onClick={() => router.back()} />
            <div className="flex-1" />
            {justActivated ? (
              <>
                <div className="flex items-center gap-2 mr-1">
                  <span className="text-xs font-medium text-foreground transition-colors">
                    Active
                  </span>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="rounded-lg px-4 py-2 text-sm font-medium border border-border bg-background hover:bg-muted/60 transition-colors"
                >
                  Edit
                </button>
              </>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="rounded-lg px-4 py-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/85 transition-colors"
              >
                Set up automation
              </button>
            )}
          </PageHeader>

          <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto py-4">
            <div className={cn(pageContainerClass, "space-y-6 pb-8")}>
              <AutomationTitleRow
                name={fallbackName}
                icon={<ZapIcon className="size-6" />}
                description={fallbackDescription || undefined}
              />

              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="runs">Run history</TabsTrigger>
              </TabsList>

              <TabsContent value="runs" className="mt-0">
                <RunsPanel />
              </TabsContent>

              <TabsContent value="overview" className="mt-0">
                <div className="flex flex-col gap-4">
                  <MetadataRow
                    createdBy={fallbackAuthorName}
                    labels={fallbackLabels}
                    triggerType={fallbackTriggerType}
                    schedule={searchParams.get("schedule") ?? undefined}
                    integrations={["gmail", "slack"]}
                  />

                  <section className={sectionDividerClass}>
                    <h2 className="text-sm font-semibold mb-4">Workflow</h2>
                    <WorkflowCanvas
                      steps={[
                        { id: "s1", label: "Trigger", icon: "zap" },
                        { id: "s2", label: "Extract Data", icon: "database" },
                        { id: "s3", label: "Validate", icon: "list-checks" },
                        { id: "s4", label: "AI Agent", icon: "sparkles" },
                        { id: "s5", label: "Format Output", icon: "file-text" },
                        { id: "s6", label: "Send Email", icon: "mail" },
                        { id: "s7", label: "Notify Slack", icon: "slack" },
                      ]}
                      triggerType={fallbackTriggerType}
                      schedule={searchParams.get("schedule") ?? undefined}
                    />
                  </section>

                  <div className={sectionDividerClass}>
                    <AgentsSection
                      agents={[
                        {
                          id: "a1",
                          name: "OpenAI",
                          logo: (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                              <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                            </svg>
                          ),
                          description: "You review emails to check for compliance. You will receive a set of guidelines on how to review it and a user message with the email. You can only output a JSON...",
                        },
                        {
                          id: "a2",
                          name: "Document Writer",
                          logo: <FileTextIcon className="size-4" />,
                          description: "Generates polished investment memos and term sheets from structured borrower data using customizable templates.",
                        },
                        {
                          id: "a3",
                          name: "Data Extractor",
                          logo: <DatabaseIcon className="size-4" />,
                          description: "Extracts and normalizes key financial fields from raw borrower inputs such as DSCR, LTV, loan amount, and property type.",
                        },
                      ]}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
            </div>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted">
      {sidebar}
      <AutomationSetupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        automation={automation}
        onSave={() => { setIsActive(true); }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
          <PageHeader titleRowClassName="flex items-center gap-3">
            <BackButton onClick={() => router.back()} />
            <div className="flex-1" />

            <div className="flex items-center gap-2 mr-1">
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {isActive ? "Active" : "Paused"}
              </span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/85 transition-colors"
            >
              Edit
            </button>
          </PageHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <div className={cn(pageContainerClass, "space-y-6 pb-8")}>
            <AutomationTitleRow
              name={automation.name}
              icon={
                <span className="flex size-6 items-center justify-center">
                  {getAgentIcon(automation.agentId, "size-6 text-muted-foreground")}
                </span>
              }
              description={automation.description}
            />
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="runs">Run history</TabsTrigger>
            </TabsList>
            <TabsContent value="runs" className="mt-0">
              <RunsPanel />
            </TabsContent>

            <TabsContent value="overview" className="mt-0">
              <OverviewPanel automation={automation} />
            </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default function AutomationDetailPage() {
  return (
    <Suspense>
      <AutomationDetailPageContent />
    </Suspense>
  );
}
