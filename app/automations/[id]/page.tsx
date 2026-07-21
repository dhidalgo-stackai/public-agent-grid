"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AutomationSetupModal } from "@/components/automation-setup-modal";
import { AgentSidebar } from "@/components/agent-sidebar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AutomationRunsList } from "@/components/automation-runs-list";
import {
  AutomationRunDetailDrawer,
  type AutomationRunDetail,
} from "@/components/automation-run-detail-drawer";
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
import { IntegrationIcon, TriggerIcon, integrationIcons } from "@/lib/integration-icons";
import { integrationMeta } from "@/lib/integrations";
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
  teams: <span className="[&_svg]:size-4">{integrationIcons.teams}</span>,
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

const NODE_WIDTH = 260;
const NODE_GAP = 56;
const NODE_VPAD = 24;

function StackNodeIcon({ kind }: { kind?: AutomationStep["nodeKind"] }) {
  if (kind === "outlook-trigger") {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white border border-neutral-200 [&_svg]:size-5">
        {integrationIcons.outlook}
      </div>
    );
  }
  if (kind === "excel-append") {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white border border-neutral-200 [&_svg]:size-5">
        {integrationIcons.excel}
      </div>
    );
  }
  if (kind === "anthropic-agent") {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white border border-neutral-200 text-[#181818]">
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
          <path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541zM6.696 3.541 0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.745L10.539 3.541H6.696zm-.36 10.223L8.63 7.82l2.294 5.945H6.336z" />
        </svg>
      </div>
    );
  }
  if (kind === "outlook-category") {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white border border-neutral-200 [&_svg]:size-5">
        {integrationIcons.outlook}
      </div>
    );
  }
  if (kind === "if-else") {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white border border-neutral-200 text-neutral-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M4 20 20 4" />
          <path d="M14 4h6v6" />
          <path d="M4 4l6 6" />
          <path d="M14 20h6v-6" />
        </svg>
      </div>
    );
  }
  return null;
}

function NodeHandle({ side }: { side: "left" | "right" }) {
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 size-2.5 rounded-[3px] bg-white border border-neutral-300"
      style={{ [side]: -5 } as React.CSSProperties}
    />
  );
}

function StackNodeCard({
  step,
  triggerType,
  schedule,
}: {
  step: AutomationStep;
  triggerType?: "schedule" | "slack" | "email";
  schedule?: string;
}) {
  const kind = step.nodeKind;
  const showLeftHandle = kind !== "outlook-trigger";
  const showRightHandle = true;

  return (
    <div
      className="relative rounded-xl bg-white"
      style={{
        width: NODE_WIDTH,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.08)",
      }}
    >
      {showLeftHandle && <NodeHandle side="left" />}
      {showRightHandle && <NodeHandle side="right" />}

      {/* Header */}
      <div className="flex items-start gap-2.5 px-3 pt-3">
        <StackNodeIcon kind={kind} />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[13px] font-semibold text-neutral-900 leading-tight truncate">{step.label}</p>
        </div>
      </div>

      {/* Description */}
      {step.description && (
        <p className="px-3 pt-1.5 text-[11px] leading-snug text-neutral-500 line-clamp-2">
          {step.description}
        </p>
      )}

      {/* Body per kind */}
      {kind === "if-else" && (
        <div className="px-3 pt-2.5 space-y-1.5">
          <div className="flex items-center justify-end rounded-md border border-neutral-200 bg-neutral-50/60 px-2.5 h-7 text-[11px] font-medium text-neutral-500">IF</div>
          <div className="flex items-center justify-end rounded-md border border-neutral-200 bg-neutral-50/60 px-2.5 h-7 text-[11px] font-medium text-neutral-500">ELSE</div>
        </div>
      )}

      {kind === "anthropic-agent" && (
        <div className="px-3 pt-2.5 space-y-1.5">
          <div className="flex items-center justify-between rounded-md bg-neutral-50 border border-neutral-200/80 px-2 h-7">
            <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">Model</span>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5 text-[#181818]" aria-hidden="true">
                <path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541zM6.696 3.541 0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.745L10.539 3.541H6.696zm-.36 10.223L8.63 7.82l2.294 5.945H6.336z" />
              </svg>
              <span className="text-[11.5px] font-medium text-neutral-800">{step.model ?? "Claude 4.6 Opus"}</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md bg-neutral-50 border border-neutral-200/80 px-2 h-7">
            <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">Tools</span>
            <span className="text-[11.5px] font-medium text-neutral-800">3 connected</span>
          </div>
        </div>
      )}

      <div className="pb-3" />
    </div>
  );
}

function NodeConnector() {
  const w = NODE_GAP;
  const h = 40;
  return (
    <svg width={w} height={h} className="shrink-0" style={{ overflow: "visible" }}>
      <path
        d={`M0 ${h / 2} C ${w * 0.5} ${h / 2}, ${w * 0.5} ${h / 2}, ${w} ${h / 2}`}
        stroke="#d4d4d4"
        strokeWidth="1.25"
        fill="none"
      />
    </svg>
  );
}

const MIN_SCALE = 0.4;
const MAX_SCALE = 2;

function getTriggerStepLabel(
  triggerType: "schedule" | "slack" | "email",
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
  triggerType?: "schedule" | "slack" | "email";
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
        background: "#f4f4f5",
        backgroundImage: "radial-gradient(circle, #d4d4d8 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        backgroundPosition: `${transform.x % 22}px ${transform.y % 22}px`,
        height: 460,
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
        {steps.some((s) => s.nodeKind) ? (
          <div className="flex items-start px-10 py-10 pb-40">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-start">
                <div className="relative">
                  <StackNodeCard step={step} triggerType={triggerType} schedule={schedule} />
                  {step.elseBranch && (
                    <>
                      <div
                        className="absolute"
                        style={{ left: NODE_WIDTH + NODE_GAP, top: 210, width: NODE_WIDTH }}
                      >
                        <StackNodeCard step={step.elseBranch} />
                      </div>
                      <svg
                        className="absolute pointer-events-none"
                        style={{ left: 0, top: 0, width: NODE_WIDTH * 2 + NODE_GAP, height: 320, overflow: "visible" }}
                      >
                        <path
                          d={`M ${NODE_WIDTH} 140 C ${NODE_WIDTH + NODE_GAP} 140, ${NODE_WIDTH + NODE_GAP - 30} 245, ${NODE_WIDTH + NODE_GAP} 245`}
                          stroke="#d4d4d4"
                          strokeWidth="1.25"
                          fill="none"
                        />
                      </svg>
                    </>
                  )}
                </div>
                {i < steps.length - 1 && <NodeConnector />}
              </div>
            ))}
          </div>
        ) : (
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
                step.description ??
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
        )}
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
  personalizedBy,
  labels = [],
  triggerType,
  schedule,
  integrations,
}: {
  createdBy: string;
  personalizedBy?: string;
  labels?: string[];
  triggerType?: "schedule" | "slack" | "email";
  schedule?: string;
  integrations: string[];
}) {
  return (
    <div className="flex items-start gap-12">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">Created by</span>
        <span className="text-sm font-normal text-foreground">{createdBy}</span>
      </div>

      {personalizedBy && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Personalized by</span>
          <span className="text-sm font-normal text-foreground">{personalizedBy}</span>
        </div>
      )}

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
                : triggerType === "email"
                  ? "Email received"
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
                    <span className="text-xs font-medium text-foreground">
                      {integrationMeta[integration]?.label ?? integration}
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

interface MockRun {
  id: string;
  runId: string;
  title: string;
  time: string;
  status: "success" | "warning";
  date: string;
  duration: string;
  aiModel?: string;
  userId?: string;
  usedTokens?: number;
  input?: unknown;
  output?: unknown;
  errors?: { node: string; nodeId: string; message: string }[];
}

const MOCK_RUNS: MockRun[] = [
  {
    id: "r1",
    runId: "8f21ac04-1d7b-4e93-b0aa-5cd91a1927c2",
    title: "18 exceptions reviewed · 5 priority actions identified",
    time: "Today, 7:00 AM",
    status: "success",
    date: "07/21/26 7:00 AM",
    duration: "12.4s",
    aiModel: "Claude 4.6 Opus",
    userId: "scheduler:cron",
    usedTokens: 4820,
    input: {
      trigger: "schedule",
      window: "last_24h",
      folder: "Inbox/Exceptions",
      account: "ops@fedex.com",
    },
    output: {
      exceptions_reviewed: 18,
      priority_actions: 5,
      rows_appended: 18,
      workbook: "ExceptionsTable.xlsx",
    },
  },
  {
    id: "r2",
    runId: "2a90fe17-83c2-4b45-9de8-11ab7c440d19",
    title: "12 exceptions reviewed · 3 priority actions identified",
    time: "Yesterday, 7:00 AM",
    status: "success",
    date: "07/20/26 7:00 AM",
    duration: "9.1s",
    aiModel: "Claude 4.6 Opus",
    userId: "scheduler:cron",
    usedTokens: 3110,
    input: {
      trigger: "schedule",
      window: "last_24h",
      folder: "Inbox/Exceptions",
      account: "ops@fedex.com",
    },
    output: {
      exceptions_reviewed: 12,
      priority_actions: 3,
      rows_appended: 12,
      workbook: "ExceptionsTable.xlsx",
    },
  },
  {
    id: "r3",
    runId: "3b623ee3-b364-554d-9fbb-3cd91a1927c2",
    title: "Outlook unavailable · Brief delivered to Microsoft Teams",
    time: "July 15, 7:00 AM",
    status: "warning",
    date: "07/15/26 7:00 AM",
    duration: "0.06s",
    userId: "scheduler:cron",
    usedTokens: 0,
    input: {
      trigger: "schedule",
      window: "last_24h",
      folder: "Inbox/Exceptions",
      account: "ops@fedex.com",
    },
    errors: [
      {
        node: "Append to Excel",
        nodeId: "action-3",
        message:
          "Outlook connector timed out — falling back to Microsoft Teams delivery.",
      },
    ],
  },
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

const runStatusStyles: Record<
  string,
  { label: string; container: string; dot: string }
> = {
  success: {
    label: "Completed",
    container: "border border-border text-muted-foreground",
    dot: "bg-emerald-500",
  },
  warning: {
    label: "Failure",
    container:
      "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
};

function RunsPanel() {
  const [selected, setSelected] = useState<MockRun | null>(null);

  const runs = MOCK_RUNS.map((run) => ({
    id: run.id,
    runId: run.runId,
    title: run.title,
    status: run.status,
    time: run.time,
    duration: run.duration,
    input: "Scheduled trigger",
  }));

  const detail: AutomationRunDetail | null = selected
    ? {
        id: selected.id,
        runId: selected.runId,
        status: selected.status,
        statusLabel: runStatusStyles[selected.status].label,
        statusStyle: {
          container: runStatusStyles[selected.status].container,
          dot: runStatusStyles[selected.status].dot,
        },
        date: selected.date,
        duration: selected.duration,
        aiModel: selected.aiModel,
        userId: selected.userId,
        usedTokens: selected.usedTokens,
        input: selected.input,
        output: selected.output,
        errors: selected.errors,
      }
    : null;

  return (
    <>
      <AutomationRunsList
        runs={runs}
        onRunClick={(r) => {
          const match = MOCK_RUNS.find((m) => m.id === r.id);
          if (match) setSelected(match);
        }}
      />
      <AutomationRunDetailDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        run={detail}
      />
    </>
  );
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
      <p className="text-xs text-muted-foreground">Capabilities used in this automation</p>
      <div className="grid grid-cols-2 gap-2">
        {agents.map((agent) => (
          <AgentCard key={agent.id} {...agent} />
        ))}
      </div>
    </div>
  );
}

function AiAgentsSection({
  agents,
}: {
  agents: { id: string; name: string; model: string; prompt?: string }[];
}) {
  if (agents.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">AI Agents in this automation</p>
      <div className="flex flex-col gap-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-lg border border-border/80 bg-background p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-[#181818] border border-border">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
                    <path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541zM6.696 3.541 0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.745L10.539 3.541H6.696zm-.36 10.223L8.63 7.82l2.294 5.945H6.336z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.model}</p>
                </div>
              </div>
            </div>
            {agent.prompt && (
              <div className="mt-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">Prompt</p>
                <pre className="whitespace-pre-wrap break-words rounded-md bg-muted/40 border border-border/60 px-3 py-2 text-xs text-foreground/90 font-mono leading-relaxed">
{agent.prompt}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const sectionDividerClass = "mt-4 pt-4";

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
          personalizedBy={automation.personalizedBy}
          labels={automation.labels}
          triggerType={automation.triggerType}
          schedule={automation.schedule}
          integrations={automation.integrations}
        />
        {automation.governanceNote && (
          <p className="mt-3 text-xs text-muted-foreground">{automation.governanceNote}</p>
        )}
      </section>

      {automation.steps && automation.steps.length > 0 && (
        <section className={sectionDividerClass}>
          <h2 className="text-sm font-semibold mb-2">Workflow</h2>
          <WorkflowCanvas
            steps={automation.steps}
            tools={automation.tools}
            triggerType={automation.triggerType}
            schedule={automation.schedule}
          />
        </section>
      )}

      {automation.steps && automation.steps.some((s) => s.nodeKind === "anthropic-agent") && (
        <section className={sectionDividerClass}>
          <AiAgentsSection
            agents={automation.steps
              .filter((s) => s.nodeKind === "anthropic-agent")
              .map((s) => ({
                id: s.id,
                name: s.label,
                model: s.model ?? "Claude 4.6 Opus",
                prompt: s.prompt,
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
  const isSetupMode = searchParams.get("setup") === "1" && !justActivated;
  const [isActive, setIsActive] = useState(
    !isSetupMode && (justActivated || automation?.status === "active")
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (justActivated) setIsActive(true);
  }, [justActivated]);

  const fallbackName = searchParams.get("name") ?? "Automation";
  const fallbackDescription = searchParams.get("description") ?? "";
  const fallbackAuthorName = searchParams.get("authorName") ?? "Fred Smith";
  const fallbackLabels = searchParams.get("labels")?.split(",").filter(Boolean) ?? [];
  const fallbackTriggerType = (searchParams.get("triggerType") as "slack" | "schedule" | null) ?? "schedule";

  const sidebar = (
    <AgentSidebar
      selectedCategory={automation ? "" : "all"}
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
      activeSection={automation && !isSetupMode ? "automations" : "agents"}
    />
  );

  if (!automation) {
    const isFedexEmailLog = id.includes("auto-fedex-exception-log");
    const overrideIntegrations = isFedexEmailLog
      ? ["outlook", "excel"]
      : ["outlook", "slack"];
    const overrideScheduleLabel = isFedexEmailLog
      ? "When a new email arrives in Outlook"
      : searchParams.get("schedule") ?? undefined;
    const overrideSteps: AutomationStep[] = isFedexEmailLog
      ? [
          { id: "s1", label: "New Exception Email", icon: "mail", description: "Trigger a run for each new email in the monitored folder." },
          { id: "s2", label: "Is Exception?", icon: "list-checks", description: "Route the input using if-else logic." },
          { id: "s3", label: "Extract Exception Fields", icon: "sparkles", description: "Anthropic Claude returns a structured row." },
          { id: "s4", label: "Append to Excel", icon: "database", description: "Add the row to ExceptionsTable on SharePoint." },
        ]
      : [
          { id: "s1", label: "Trigger", icon: "zap" },
          { id: "s2", label: "Extract Data", icon: "database" },
          { id: "s3", label: "Validate", icon: "list-checks" },
          { id: "s4", label: "AI Agent", icon: "sparkles" },
          { id: "s5", label: "Format Output", icon: "file-text" },
          { id: "s6", label: "Send Email", icon: "mail" },
          { id: "s7", label: "Notify Slack", icon: "slack" },
        ];
    const fallbackAutomation = {
      id: id || "unknown",
      name: fallbackName,
      agentName: fallbackName,
      authorName: fallbackAuthorName,
      agentId: "",
      schedule: "",
      triggerType: fallbackTriggerType as "schedule" | "slack" | "email",
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
                  Edit preferences
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
            <div className="flex-1 overflow-y-auto py-4" style={{ scrollbarGutter: "stable" }}>
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
                    schedule={overrideScheduleLabel}
                    integrations={overrideIntegrations}
                  />

                  <section className={sectionDividerClass}>
                    <h2 className="text-sm font-semibold mb-4">Workflow</h2>
                    <WorkflowCanvas
                      steps={overrideSteps}
                      triggerType={fallbackTriggerType}
                      schedule={overrideScheduleLabel}
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
        isSetup={isSetupMode}
        onSave={() => {
          setIsActive(true);
          if (isSetupMode) router.replace(`/automations/${id}?activated=1`);
        }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <Tabs defaultValue="runs" className="flex min-h-0 flex-1 flex-col">
          <PageHeader titleRowClassName="flex items-center gap-3">
            <BackButton onClick={() => router.back()} />
            <div className="flex-1" />

            {isSetupMode ? (
              <button
                onClick={() => setModalOpen(true)}
                className="rounded-lg px-4 py-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/85 transition-colors"
              >
                Set up automation
              </button>
            ) : (
              <>
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
                  Edit preferences
                </button>
              </>
            )}
          </PageHeader>

          <div className="flex-1 overflow-y-auto py-4" style={{ scrollbarGutter: "stable" }}>
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
            {!isSetupMode && (
              <TabsList>
                <TabsTrigger value="runs">Run history</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>
            )}
            {!isSetupMode && (
              <TabsContent value="runs" className="mt-0">
                <RunsPanel />
              </TabsContent>
            )}

            <TabsContent value="overview" className="mt-0" forceMount={isSetupMode ? true : undefined}>
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
