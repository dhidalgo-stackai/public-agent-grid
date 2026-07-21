"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  MoreHorizontalIcon,
  PlayIcon,
  SaveIcon,
  SettingsIcon,
  EyeOffIcon,
  SearchIcon,
  HomeIcon,
  DatabaseIcon,
  WrenchIcon,
  SparklesIcon,
  GlobeIcon,
  GitBranchIcon,
  BarChart3Icon,
  ZapIcon,
  BellIcon,
  HelpCircleIcon,
  ActivityIcon,
  PanelLeftIcon,
  PlusIcon,
  MinusIcon,
  MaximizeIcon,
  MousePointer2Icon,
  FileTextIcon,
  FilePlusIcon,
  GitCompareIcon,
  BotIcon,
  InfoIcon,
  LayoutGridIcon,
  MapIcon,
  CameraIcon,
  UndoIcon,
  RedoIcon,
  ListChecksIcon,
  ChevronLeftIcon,
} from "lucide-react";
import { myAutomations, type AutomationStep } from "@/lib/automations-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { integrationIcons } from "@/lib/integration-icons";
import { cn } from "@/lib/utils";

// -------------------- Node building blocks --------------------

const NODE_WIDTH = 300;
const NODE_HGAP = 100;

function NodeHandle({ side, top }: { side: "left" | "right"; top?: number }) {
  return (
    <div
      className="absolute size-3 rounded-[3px] bg-white border border-neutral-300"
      style={{
        [side]: -6,
        top: top ?? "50%",
        transform: top === undefined ? "translateY(-50%)" : undefined,
      } as React.CSSProperties}
    />
  );
}

function NodeIconBadge({ kind }: { kind?: AutomationStep["nodeKind"] }) {
  if (kind === "outlook-trigger" || kind === "outlook-category") {
    return (
      <div className="flex size-6 shrink-0 items-center justify-center [&_svg]:size-5">
        {integrationIcons.outlook}
      </div>
    );
  }
  if (kind === "excel-append") {
    return (
      <div className="flex size-6 shrink-0 items-center justify-center [&_svg]:size-5">
        {integrationIcons.excel}
      </div>
    );
  }
  if (kind === "anthropic-agent") {
    return (
      <div className="flex size-6 shrink-0 items-center justify-center text-[#181818]">
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
          <path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541zM6.696 3.541 0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.745L10.539 3.541H6.696zm-.36 10.223L8.63 7.82l2.294 5.945H6.336z" />
        </svg>
      </div>
    );
  }
  if (kind === "if-else") {
    return (
      <div className="flex size-6 shrink-0 items-center justify-center text-neutral-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-5">
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

function NodeShell({
  children,
  width = NODE_WIDTH,
}: {
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <div
      className="relative rounded-2xl bg-white"
      style={{
        width,
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.04), 0 6px 20px -8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function ViewResults({ duration = "0.00 sec", version }: { duration?: string; version?: string }) {
  return (
    <div className="mx-3 mb-3 mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5">
      <button className="flex items-center gap-1 text-[11.5px] text-neutral-500 hover:text-neutral-800">
        <ChevronDownIcon className="size-3" />
        View Results
      </button>
      <div className="flex items-center gap-2 text-[11px] text-neutral-400 tabular-nums">
        <span>{duration}</span>
        {version && <span>{version}</span>}
      </div>
    </div>
  );
}

function NodeHeader({
  kind,
  label,
  description,
  runBadge,
}: {
  kind?: AutomationStep["nodeKind"];
  label: string;
  description?: string;
  runBadge?: boolean;
}) {
  return (
    <div className="px-3.5 pt-3.5">
      {runBadge && (
        <div className="mb-2 flex">
          <div className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-medium text-neutral-700">
            <PlayIcon className="size-3 fill-current" />
            Run
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <NodeIconBadge kind={kind} />
        <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-neutral-900">
          {label}
        </p>
      </div>
      {description && (
        <p className="mt-2 text-[12.5px] leading-snug text-neutral-500">{description}</p>
      )}
    </div>
  );
}

function FieldRow({ label }: { label: string }) {
  return (
    <div className="flex h-9 items-center justify-end rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 text-[12px] font-medium text-neutral-500">
      {label}
    </div>
  );
}

function AddButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white text-[12.5px] font-medium text-neutral-600 hover:bg-neutral-50">
      <span className="[&_svg]:size-3.5 text-neutral-500">{icon}</span>
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 mb-1.5 text-[11px] font-medium text-neutral-500">{children}</p>
  );
}

// -------------------- Individual node cards --------------------

function OutlookTriggerNode({ step }: { step: AutomationStep }) {
  return (
    <NodeShell>
      <NodeHandle side="right" />
      <div className="absolute -top-8 left-2">
        <div className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 shadow-sm">
          <PlayIcon className="size-3 fill-current" />
          Run
        </div>
      </div>
      <NodeHeader kind={step.nodeKind} label={step.label} description={step.description} />
      <ViewResults />
    </NodeShell>
  );
}

function IfElseNode({ step }: { step: AutomationStep }) {
  return (
    <NodeShell>
      <NodeHandle side="left" />
      {/* Two right-side handles for IF and ELSE outputs */}
      <div
        className="absolute size-3 rounded-[3px] bg-white border border-neutral-300"
        style={{ right: -6, top: 118 }}
      />
      <div
        className="absolute size-3 rounded-[3px] bg-white border border-neutral-300"
        style={{ right: -6, top: 158 }}
      />

      <NodeHeader kind={step.nodeKind} label={step.label} description={step.description} />

      <div className="px-3.5 pt-3 space-y-1.5">
        <FieldRow label="IF" />
        <FieldRow label="ELSE" />
      </div>
      <ViewResults />
    </NodeShell>
  );
}

function AnthropicAgentNode({ step }: { step: AutomationStep }) {
  return (
    <NodeShell width={340}>
      <NodeHandle side="left" />
      <NodeHandle side="right" />
      <NodeHeader
        kind={step.nodeKind}
        label={step.label}
        description={step.description ?? "Anthropic Agent with tool calling"}
      />

      <div className="px-3.5 pt-2 pb-1">
        <button className="flex h-9 w-full items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 text-[13px] font-medium text-neutral-800 hover:bg-neutral-50">
          <span className="flex size-5 items-center justify-center text-[#181818]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              <path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541zM6.696 3.541 0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.745L10.539 3.541H6.696zm-.36 10.223L8.63 7.82l2.294 5.945H6.336z" />
            </svg>
          </span>
          <span className="flex-1 text-left">{step.model ?? "Claude 4.6 Opus"}</span>
        </button>

        <SectionLabel>Knowledge Sources</SectionLabel>
        <AddButton icon={<DatabaseIcon />} label="Add Knowledge Sources" />

        <SectionLabel>Tools</SectionLabel>
        <AddButton icon={<WrenchIcon />} label="Add Tools" />

        <SectionLabel>MCP</SectionLabel>
        <AddButton icon={<GlobeIcon />} label="Add MCP" />

        <SectionLabel>Subflow Tools</SectionLabel>
        <button className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white text-[12.5px] font-medium text-neutral-700 hover:bg-neutral-50">
          <WrenchIcon className="size-3.5 text-neutral-500" />
          Subflow Tool 1
        </button>
      </div>

      <ViewResults />
    </NodeShell>
  );
}

function ExcelAppendNode({ step }: { step: AutomationStep }) {
  return (
    <NodeShell>
      <NodeHandle side="left" />
      <NodeHandle side="right" />
      <NodeHeader kind={step.nodeKind} label={step.label} description={step.description} />
      <ViewResults version="Unset version" />
    </NodeShell>
  );
}

function OutlookCategoryNode({ step }: { step: AutomationStep }) {
  return (
    <NodeShell>
      <NodeHandle side="left" />
      <NodeHandle side="right" />
      <NodeHeader kind={step.nodeKind} label={`${step.label} 1`} description={step.description} />
      <ViewResults version="v1.0.0" />
    </NodeShell>
  );
}

function RenderNode({ step }: { step: AutomationStep }) {
  switch (step.nodeKind) {
    case "outlook-trigger":
      return <OutlookTriggerNode step={step} />;
    case "if-else":
      return <IfElseNode step={step} />;
    case "anthropic-agent":
      return <AnthropicAgentNode step={step} />;
    case "excel-append":
      return <ExcelAppendNode step={step} />;
    case "outlook-category":
      return <OutlookCategoryNode step={step} />;
    default:
      return (
        <NodeShell>
          <NodeHeader label={step.label} description={step.description} />
          <ViewResults />
        </NodeShell>
      );
  }
}

// -------------------- Canvas --------------------

const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;

interface PlacedNode {
  step: AutomationStep;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Edge {
  fromId: string;
  toId: string;
  fromSide?: { xOffset: number; yOffset: number };
  toSide?: { xOffset: number; yOffset: number };
}

function BuilderCanvas({ steps }: { steps: AutomationStep[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // Layout: main chain horizontally; if-else branch drops below.
  const mainStep1 = steps[0]; // outlook trigger
  const mainStep2 = steps[1]; // if-else
  const mainStep3 = steps[2]; // anthropic
  const mainStep4 = steps[3]; // excel
  const elseStep = mainStep2?.elseBranch; // outlook-category

  const y0 = 200;
  const positions: Record<string, PlacedNode> = {};
  const cursorX = { v: 100 };
  const AGENT_W = 340;

  const push = (step: AutomationStep, width: number, height: number, y: number) => {
    positions[step.id] = { step, x: cursorX.v, y, width, height };
    cursorX.v += width + NODE_HGAP;
  };

  if (mainStep1) push(mainStep1, NODE_WIDTH, 150, y0);
  if (mainStep2) push(mainStep2, NODE_WIDTH, 240, y0 - 25);
  if (mainStep3) push(mainStep3, AGENT_W, 560, y0 - 70);
  if (mainStep4) push(mainStep4, NODE_WIDTH, 150, y0);

  // Else branch: place below if-else node
  let elsePlaced: PlacedNode | undefined;
  if (elseStep && positions[mainStep2.id]) {
    const ifElse = positions[mainStep2.id];
    elsePlaced = {
      step: elseStep,
      x: ifElse.x + ifElse.width + NODE_HGAP,
      y: ifElse.y + 300,
      width: NODE_WIDTH,
      height: 150,
    };
    positions[elseStep.id] = elsePlaced;
  }

  const edges: { fromId: string; toId: string; fromY?: number; toY?: number }[] = [];
  if (mainStep1 && mainStep2) edges.push({ fromId: mainStep1.id, toId: mainStep2.id, fromY: 75, toY: 120 });
  if (mainStep2 && mainStep3) edges.push({ fromId: mainStep2.id, toId: mainStep3.id, fromY: 118, toY: 280 });
  if (mainStep3 && mainStep4) edges.push({ fromId: mainStep3.id, toId: mainStep4.id, fromY: 280, toY: 75 });
  if (mainStep2 && elseStep) edges.push({ fromId: mainStep2.id, toId: elseStep.id, fromY: 158, toY: 75 });

  const centerView = () => {
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    // Content span
    const maxX = Math.max(
      ...Object.values(positions).map((p) => p.x + p.width),
      cursorX.v
    );
    const minX = Math.min(...Object.values(positions).map((p) => p.x), 0);
    const contentW = maxX - minX;
    const contentH = 700;
    setTransform({
      scale: 1,
      x: (cw - contentW) / 2 - minX,
      y: (ch - contentH) / 2,
    });
  };

  useEffect(() => {
    centerView();
    const onResize = () => centerView();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
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
    const target = e.target as HTMLElement;
    if (target.closest("[data-node]") || target.closest("[data-toolbar]")) return;
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

  // Compute edge SVG bounds
  const allX = Object.values(positions).flatMap((p) => [p.x, p.x + p.width]);
  const allY = Object.values(positions).flatMap((p) => [p.y, p.y + p.height]);
  const minX = Math.min(...allX, 0) - 40;
  const minY = Math.min(...allY, 0) - 40;
  const maxX = Math.max(...allX, 0) + 40;
  const maxY = Math.max(...allY, 0) + 40;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className="relative h-full w-full overflow-hidden select-none"
      style={{
        background: "#f4f4f5",
        backgroundImage: "radial-gradient(circle, #d4d4d8 1px, transparent 1px)",
        backgroundSize: `${22 * transform.scale}px ${22 * transform.scale}px`,
        backgroundPosition: `${transform.x}px ${transform.y}px`,
        cursor: isPanning ? "grabbing" : "grab",
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        {/* Edges */}
        <svg
          className="pointer-events-none absolute"
          style={{
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY,
            overflow: "visible",
          }}
        >
          {edges.map((edge, idx) => {
            const from = positions[edge.fromId];
            const to = positions[edge.toId];
            if (!from || !to) return null;
            const fx = from.x + from.width - minX;
            const fy = from.y + (edge.fromY ?? from.height / 2) - minY;
            const tx = to.x - minX;
            const ty = to.y + (edge.toY ?? to.height / 2) - minY;
            const dx = Math.max(40, (tx - fx) / 2);
            const d = `M ${fx} ${fy} C ${fx + dx} ${fy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
            return (
              <path
                key={idx}
                d={d}
                stroke="#c4c4c8"
                strokeWidth="1.5"
                fill="none"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {Object.values(positions).map((placed) => (
          <div
            key={placed.step.id}
            data-node
            className="absolute"
            style={{ left: placed.x, top: placed.y }}
          >
            <RenderNode step={placed.step} />
          </div>
        ))}
      </div>

      {/* Bottom toolbar */}
      <div
        data-toolbar
        className="pointer-events-none absolute inset-x-0 bottom-4 flex items-end justify-between px-4"
      >
        <div className="pointer-events-auto flex items-center gap-2 text-[12px] text-neutral-500">
          <span className="size-2 rounded-full bg-emerald-500" />
          Auto-saved draft <span className="text-neutral-700 font-medium">1 second ago</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur px-2 py-1.5 shadow-lg border border-neutral-200">
          <button className="flex items-center gap-1.5 rounded-lg bg-white border border-neutral-200 px-2.5 h-8 text-[12px] font-medium text-neutral-800 hover:bg-neutral-50">
            <SparklesIcon className="size-3.5 text-neutral-700" />
            Ask AI
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-2.5 h-8 text-[12px] font-medium hover:bg-neutral-800">
            <PlusIcon className="size-3.5" />
            Add
          </button>
          <div className="mx-1 h-5 w-px bg-neutral-200" />
          <ToolbarIcon><UndoIcon className="size-4" /></ToolbarIcon>
          <ToolbarIcon><RedoIcon className="size-4" /></ToolbarIcon>
          <div className="mx-1 h-5 w-px bg-neutral-200" />
          <ToolbarIcon onClick={() => zoomBy(1.2)}><PlusIcon className="size-4" /></ToolbarIcon>
          <ToolbarIcon onClick={() => zoomBy(1 / 1.2)}><MinusIcon className="size-4" /></ToolbarIcon>
          <div className="mx-1 h-5 w-px bg-neutral-200" />
          <ToolbarIcon><MousePointer2Icon className="size-4" /></ToolbarIcon>
          <ToolbarIcon onClick={centerView}><MaximizeIcon className="size-4" /></ToolbarIcon>
          <ToolbarIcon><FileTextIcon className="size-4" /></ToolbarIcon>
          <ToolbarIcon><LayoutGridIcon className="size-4" /></ToolbarIcon>
          <ToolbarIcon><MapIcon className="size-4" /></ToolbarIcon>
          <ToolbarIcon><CameraIcon className="size-4" /></ToolbarIcon>
        </div>

        <button className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white border border-neutral-200 px-3 h-8 text-[12px] font-medium text-neutral-800 hover:bg-neutral-50 shadow-sm relative">
          <ListChecksIcon className="size-3.5" />
          Checklist
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amber-400 border border-white" />
        </button>
      </div>
    </div>
  );
}

function ToolbarIcon({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
    >
      {children}
    </button>
  );
}

// -------------------- Left rail --------------------

function LeftRail() {
  const items = [
    { icon: HomeIcon, active: false },
    { icon: DatabaseIcon, active: false },
    { icon: WrenchIcon, active: false },
    { icon: ZapIcon, active: true },
    { icon: GlobeIcon, active: false },
    { icon: GitBranchIcon, active: false },
    { icon: BarChart3Icon, active: false },
    { icon: SparklesIcon, active: false },
  ];
  return (
    <div className="flex w-12 flex-col items-center border-r border-neutral-200 bg-white py-2">
      <div className="mb-1 flex size-9 items-center justify-center">
        <div className="flex size-6 items-center justify-center rounded-md bg-neutral-900 text-white text-[10px] font-bold">
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" opacity=".7"/>
          </svg>
        </div>
      </div>
      <button className="flex size-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
        <SearchIcon className="size-4" />
      </button>
      <div className="my-1 h-px w-6 bg-neutral-200" />
      <div className="flex flex-col gap-0.5">
        {items.map((Item, i) => (
          <button
            key={i}
            className={cn(
              "flex size-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100",
              Item.active && "text-neutral-900 bg-neutral-100"
            )}
          >
            <Item.icon className="size-4" />
          </button>
        ))}
      </div>
      <div className="flex-1" />
      <div className="flex flex-col gap-0.5 pb-1">
        <button className="flex size-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
          <PanelLeftIcon className="size-4" />
        </button>
        <button className="relative flex size-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
          <BellIcon className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-blue-500" />
        </button>
        <button className="flex size-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
          <HelpCircleIcon className="size-4" />
        </button>
        <button className="flex size-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
          <ActivityIcon className="size-4" />
        </button>
        <div className="flex size-9 items-center justify-center">
          <div className="flex size-6 items-center justify-center rounded-md bg-neutral-200 text-neutral-700 text-[11px] font-semibold">
            D
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- Top bar --------------------

function PublishPopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [orgOnly, setOrgOnly] = useState(false);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] rounded-xl border border-neutral-200 bg-white p-2 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)]"
    >
      <div className="px-2.5 pb-2 pt-1.5 text-[12px] text-neutral-500">
        Last Published Version <span className="text-neutral-700">1 hour ago</span>
      </div>
      <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-neutral-800 hover:bg-neutral-100">
        <FilePlusIcon className="size-4 text-neutral-600" />
        Add description
      </button>
      <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-neutral-800 hover:bg-neutral-100">
        <GitCompareIcon className="size-4 text-neutral-600" />
        Review changes
      </button>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOrgOnly((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOrgOnly((v) => !v);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-neutral-800 hover:bg-neutral-100"
      >
        <BotIcon className="size-4 text-neutral-600" />
        <span className="whitespace-nowrap">Publish to Grid only</span>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex size-4 items-center justify-center text-neutral-400 hover:text-neutral-600"
                aria-label="What is this?"
              >
                <InfoIcon className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              className="max-w-[240px] border border-border bg-background px-3 py-2 text-left shadow-md"
            >
              <p className="text-[12px] font-medium text-foreground mb-1">
                Publish to Grid only
              </p>
              <p className="text-[11.5px] leading-snug text-muted-foreground">
                Publishes this version to the public Agent Grid without adding it to your personal workflows.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex-1" />
        <Switch
          checked={orgOnly}
          onCheckedChange={setOrgOnly}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-7 [&>span]:size-3 [&>span]:data-[state=checked]:translate-x-3"
        />
      </div>
      <button
        onClick={onClose}
        className="mt-1 flex h-9 w-full items-center justify-center rounded-lg bg-neutral-900 text-[13px] font-medium text-white hover:bg-neutral-800"
      >
        Publish Version
      </button>
    </div>
  );
}

type BuilderTab = "workflow" | "interface" | "analytics" | "manager" | "evaluator";

function TopBar({
  automationName,
  onBack,
  tab,
  onTabChange,
}: {
  automationName: string;
  onBack: () => void;
  tab: BuilderTab;
  onTabChange: (t: BuilderTab) => void;
}) {
  const [publishOpen, setPublishOpen] = useState(false);
  const tabs = ["Workflow", "Interface", "Analytics", "Manager", "Evaluator"] as const;

  return (
    <div className="flex h-12 items-center gap-3 border-b border-neutral-200 bg-white px-3">
      {/* Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-neutral-500 hover:bg-neutral-100"
      >
        <ChevronLeftIcon className="size-3.5" />
      </button>
      <div className="flex items-center gap-1.5 text-[12.5px]">
        <div className="flex size-4 items-center justify-center text-neutral-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
        </div>
        <span className="text-neutral-600">dhidalgo@stack-ai.com Personal Folder</span>
        <span className="text-neutral-300">/</span>
        <span className="font-medium text-neutral-900 truncate max-w-[220px]">
          {automationName}
        </span>
      </div>

      <div className="flex-1" />

      {/* Tabs */}
      <div className="flex items-center gap-4 text-[13px]">
        {tabs.map((t) => {
          const key = t.toLowerCase() as BuilderTab;
          const active = tab === key;
          return (
            <button
              key={t}
              onClick={() => onTabChange(key)}
              className={cn(
                "relative py-3 font-medium transition-colors",
                active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              {t}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-neutral-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-[12px] text-neutral-700">
          <span className="size-1.5 rounded-full bg-neutral-900" />
          Draft
        </div>
        <button className="flex size-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
          <EyeOffIcon className="size-4" />
        </button>
        <button className="flex size-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
          <SettingsIcon className="size-4" />
        </button>
        <button className="flex size-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
          <SaveIcon className="size-4" />
        </button>
        <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 h-8 text-[12.5px] font-medium text-neutral-800 hover:bg-neutral-50">
          <PlayIcon className="size-3.5 fill-current" />
          Run
        </button>
        <div className="relative">
          <button
            onClick={() => setPublishOpen((v) => !v)}
            className="relative flex items-center gap-1 rounded-lg bg-neutral-900 text-white px-3 h-8 text-[12.5px] font-medium hover:bg-neutral-800"
          >
            Publish
            <ChevronDownIcon className="size-3.5" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-blue-500 border border-white" />
          </button>
          {publishOpen && <PublishPopover onClose={() => setPublishOpen(false)} />}
        </div>
        <button className="flex size-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
          <MoreHorizontalIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

// -------------------- Interface tab --------------------

function InterfaceTypeCard({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border bg-white p-4 transition-all",
        active
          ? "border-neutral-900 shadow-[0_0_0_1px_rgba(23,23,23,0.9)]"
          : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
      )}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-md text-neutral-500",
          active ? "text-neutral-800" : "text-neutral-400 group-hover:text-neutral-600"
        )}
      >
        {icon}
      </div>
      <span className="text-[13px] font-medium text-neutral-800">{label}</span>
    </button>
  );
}

const formIcon = (
  <svg viewBox="0 0 40 40" fill="none" className="size-10">
    <rect x="4" y="4" width="32" height="32" rx="6" fill="#f4f4f5" />
    <rect x="10" y="12" width="20" height="3" rx="1.5" fill="#d4d4d8" />
    <rect x="10" y="19" width="14" height="3" rx="1.5" fill="#e4e4e7" />
    <rect x="10" y="26" width="20" height="3" rx="1.5" fill="#e4e4e7" />
  </svg>
);
const chatIcon = (
  <svg viewBox="0 0 40 40" fill="none" className="size-10">
    <rect x="4" y="4" width="32" height="32" rx="6" fill="#f4f4f5" />
    <circle cx="14" cy="20" r="2.5" fill="#d4d4d8" />
    <rect x="19" y="18" width="12" height="3" rx="1.5" fill="#d4d4d8" />
    <rect x="10" y="26" width="12" height="3" rx="1.5" fill="#e4e4e7" />
  </svg>
);
const chatbotIcon = (
  <svg viewBox="0 0 40 40" fill="none" className="size-10">
    <rect x="4" y="4" width="32" height="32" rx="6" fill="#f4f4f5" />
    <circle cx="12" cy="14" r="1.5" fill="#a3a3a3" />
    <circle cx="18" cy="14" r="1.5" fill="#a3a3a3" />
    <circle cx="24" cy="14" r="1.5" fill="#a3a3a3" />
    <rect x="10" y="19" width="16" height="3" rx="1.5" fill="#d4d4d8" />
    <circle cx="14" cy="27" r="1.6" fill="#171717" />
    <rect x="18" y="26" width="12" height="2.5" rx="1.25" fill="#e4e4e7" />
  </svg>
);
const batchIcon = (
  <svg viewBox="0 0 40 40" fill="none" className="size-10">
    <rect x="4" y="4" width="32" height="32" rx="6" fill="#f4f4f5" />
    <circle cx="12" cy="14" r="1.6" fill="#171717" />
    <rect x="16" y="13" width="14" height="2.5" rx="1.25" fill="#d4d4d8" />
    <circle cx="12" cy="20" r="1.6" fill="#171717" />
    <rect x="16" y="19" width="10" height="2.5" rx="1.25" fill="#d4d4d8" />
    <circle cx="12" cy="26" r="1.6" fill="#171717" />
    <rect x="16" y="25" width="12" height="2.5" rx="1.25" fill="#d4d4d8" />
  </svg>
);
const apiIcon = (
  <svg viewBox="0 0 40 40" fill="none" className="size-10">
    <rect x="4" y="4" width="32" height="32" rx="6" fill="#f4f4f5" />
    <path d="M14 15l-4 5 4 5" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M26 15l4 5-4 5" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 14l-4 12" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const automationIcon = (
  <svg viewBox="0 0 40 40" fill="none" className="size-10">
    <rect x="4" y="4" width="32" height="32" rx="6" fill="#f4f4f5" />
    <path d="M22 10l-9 12h6l-1 8 9-12h-6l1-8z" fill="#171717" strokeLinejoin="round" />
  </svg>
);
const slackIcon = (
  <svg viewBox="0 0 40 40" fill="none" className="size-10">
    <rect x="4" y="4" width="32" height="32" rx="6" fill="#f4f4f5" />
    <g transform="translate(11 11)">
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#36C5F0"/>
        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#2EB67D"/>
        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#ECB22E"/>
        <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
      </svg>
    </g>
  </svg>
);
const teamsIcon = (
  <svg viewBox="0 0 40 40" fill="none" className="size-10">
    <rect x="4" y="4" width="32" height="32" rx="6" fill="#f4f4f5" />
    <g transform="translate(11 12)">
      <span></span>
    </g>
    <g transform="translate(10 10) scale(0.83)">
      <g>{integrationIcons.teams}</g>
    </g>
  </svg>
);

function InterfaceSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[12px] text-neutral-500">{children}</p>
  );
}

function buildAutomationPreviewUrl(automationId: string): string {
  const automation = myAutomations.find((a) => a.id === automationId);
  if (!automation) return `/automations/${automationId}?setup=1`;
  const params = new URLSearchParams();
  params.set("name", automation.name);
  if (automation.description) params.set("description", automation.description);
  params.set("authorName", automation.authorName);
  if (automation.labels?.length) params.set("labels", automation.labels.join(","));
  params.set("setup", "1");
  params.set("preview", "1");
  return `/automations/${automationId}?${params.toString()}`;
}

const interfaceLabels: Record<string, string> = {
  form: "Form",
  chat: "Chat Assistant",
  chatbot: "Website Chatbot",
  batch: "Batch",
  automation: "Automation",
  api: "API",
  slack: "Slack App",
  teams: "Microsoft Teams",
};

const interfaceDescriptions: Record<string, string> = {
  form: "A form that collects structured input from users",
  chat: "A conversational chat experience for end users",
  chatbot: "A chatbot that can be embedded on your website",
  batch: "Process a batch of inputs in a single run",
  automation: "A workflow that runs automatically on a schedule or trigger event",
  api: "Call this workflow from your own code over HTTP",
  slack: "Deploy this workflow as a Slack app",
  teams: "Deploy this workflow to Microsoft Teams",
};

const interfaceHeaderIcons: Record<string, React.ReactNode> = {
  form: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 10h8M8 14h5" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  ),
  chatbot: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  ),
  batch: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <rect x="3" y="4" width="18" height="4" rx="1" /><rect x="3" y="10" width="18" height="4" rx="1" /><rect x="3" y="16" width="18" height="4" rx="1" />
    </svg>
  ),
  automation: <ZapIcon className="size-4" />,
  api: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M8 8l-4 4 4 4M16 8l4 4-4 4" />
    </svg>
  ),
  slack: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M5 15a2 2 0 1 1-2-2h2v2zM6 15a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0v-5zM9 5a2 2 0 1 1-2-2h2v2zM9 6a2 2 0 1 1 0 4H4a2 2 0 1 1 0-4h5zM19 9a2 2 0 1 1 2 2h-2V9zM18 9a2 2 0 1 1-4 0V4a2 2 0 1 1 4 0v5zM15 19a2 2 0 1 1 2 2h-2v-2zM15 18a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4h-5z" />
    </svg>
  ),
  teams: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <rect x="2" y="6" width="12" height="12" rx="1.5" />
      <text x="8" y="15" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">T</text>
    </svg>
  ),
};

function InterfaceConfigurator({
  interfaceKey,
  automationId,
  onChangeInterface,
}: {
  interfaceKey: string;
  automationId: string;
  onChangeInterface: () => void;
}) {
  const [general, setGeneral] = useState(true);
  const [fields, setFields] = useState(true);
  const [style, setStyle] = useState(true);
  const label = interfaceLabels[interfaceKey] ?? "Website Chatbot";

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {/* Left: draft preview */}
      <div className="relative flex min-h-0 flex-1 flex-col bg-neutral-50">
        <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-6 py-3">
          <span className="flex size-5 items-center justify-center text-neutral-600">
            {interfaceHeaderIcons[interfaceKey]}
          </span>
          <span className="text-[13.5px] font-semibold text-neutral-900">
            {interfaceLabels[interfaceKey] ?? label}
          </span>
          <span className="text-[12.5px] text-neutral-500">
            {interfaceDescriptions[interfaceKey]}
          </span>
        </div>
        <div className="px-6 pt-4">
          <p className="mb-1.5 text-[12px] font-medium text-neutral-600">Published Interface</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={`https://www.stackai.com/${
                interfaceKey === "chatbot" || interfaceKey === "chat"
                  ? "chat"
                  : interfaceKey === "form"
                  ? "form"
                  : "app"
              }/${automationId.replace(/-/g, "")}-3HRj1gDyeJsJqJe2M9NhJc`}
              className="flex-1 rounded-md border border-neutral-200 bg-white px-3 h-9 text-[12.5px] text-neutral-500 focus:outline-none"
            />
            <button
              className="flex size-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
              onClick={() => {
                const el = document.activeElement as HTMLInputElement | null;
                if (el && el.tagName === "INPUT") el.select();
              }}
              title="Copy link"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center px-6 pt-3">
          <span className="text-[12.5px] font-medium text-neutral-500">Draft Preview</span>
        </div>
        <div className="mx-6 mb-6 flex-1 rounded-xl border border-neutral-200 bg-white relative overflow-hidden">
          <iframe
            src={buildAutomationPreviewUrl(automationId)}
            className="h-full w-full border-0"
            title="Automation overview preview"
          />
        </div>
      </div>

      {/* Right: config panel */}
      <div className="flex w-[440px] flex-col border-l border-neutral-200 bg-white">
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4">
            <button
              onClick={onChangeInterface}
              className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 h-11 text-[13px] font-medium text-neutral-800 hover:bg-neutral-50"
            >
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-neutral-700">
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </svg>
                {label}
              </span>
              <ChevronDownIcon className="size-4 text-neutral-500" />
            </button>
          </div>

          <ConfigSection title="General" open={general} onToggle={() => setGeneral((v) => !v)}>
            <ConfigLabel required tooltip>Name</ConfigLabel>
            <ConfigInput defaultValue="Application Name" />

            <ConfigLabel tooltip>Description</ConfigLabel>
            <ConfigTextarea defaultValue="Add a description here so users understand what your agent does." />

            <ConfigLabel tooltip>Disclaimer Message</ConfigLabel>
            <ConfigInput defaultValue="AI assistants might make mistakes. Check important information." />

            <ConfigLabel tooltip>Input Placeholder</ConfigLabel>
            <ConfigInput defaultValue="Write a message..." />
          </ConfigSection>

          <ConfigSection title="Fields" open={fields} onToggle={() => setFields((v) => !v)}>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-700 mb-2">
              Inputs
              <InfoIcon className="size-3 text-neutral-400" />
            </div>
            <div className="rounded-md border border-neutral-200 overflow-hidden">
              <div className="grid grid-cols-3 bg-neutral-50 px-3 py-2 text-[11px] font-medium text-neutral-500">
                <span>Node ID</span>
                <span>Alias (optional)</span>
                <span className="text-right">Required</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-neutral-700 mb-2">
              Outputs
              <InfoIcon className="size-3 text-neutral-400" />
            </div>
            <div className="rounded-md border border-neutral-200 overflow-hidden">
              <div className="grid grid-cols-2 bg-neutral-50 px-3 py-2 text-[11px] font-medium text-neutral-500">
                <span>Node ID</span>
                <span>Alias (optional)</span>
              </div>
            </div>
          </ConfigSection>

          <ConfigSection title="Style" open={style} onToggle={() => setStyle((v) => !v)}>
            <p className="text-[12px] font-medium text-neutral-700 mb-2">Avatar</p>
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-md bg-neutral-900 text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-7">
                  <path d="M12 2l9 4.5v11L12 22 3 17.5v-11L12 2z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-1.5">
                  <button className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 h-7 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Change
                  </button>
                  <button className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 h-7 text-[12px] font-medium text-red-600 hover:bg-red-50">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14" />
                    </svg>
                    Remove
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500">Suggested size is 64 × 64</p>
              </div>
            </div>
          </ConfigSection>
        </div>
      </div>
    </div>
  );
}

function ConfigSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-neutral-200 mt-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <span className="text-[13px] font-semibold text-neutral-900">{title}</span>
        <ChevronDownIcon
          className={cn("size-4 text-neutral-500 transition-transform", !open && "-rotate-90")}
        />
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

function ConfigLabel({
  children,
  tooltip,
  required,
}: {
  children: React.ReactNode;
  tooltip?: boolean;
  required?: boolean;
}) {
  return (
    <div className="mt-3 mb-1.5 flex items-center gap-1 text-[12px] font-medium text-neutral-700">
      {children}
      {required && <span className="text-red-500">*</span>}
      {tooltip && <InfoIcon className="size-3 text-neutral-400" />}
    </div>
  );
}

function ConfigInput({ defaultValue }: { defaultValue: string }) {
  return (
    <input
      defaultValue={defaultValue}
      className="w-full rounded-md border border-neutral-200 bg-white px-3 h-9 text-[13px] text-neutral-800 focus:outline-none focus:border-neutral-400"
    />
  );
}

function ConfigTextarea({ defaultValue }: { defaultValue: string }) {
  return (
    <textarea
      defaultValue={defaultValue}
      rows={3}
      className="w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-800 focus:outline-none focus:border-neutral-400"
    />
  );
}

function InterfacePanel({ automationId }: { automationId: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [configured, setConfigured] = useState<string | null>(null);

  if (configured) {
    return (
      <InterfaceConfigurator
        interfaceKey={configured}
        automationId={automationId}
        onChangeInterface={() => {
          setConfigured(null);
          setSelected(configured);
        }}
      />
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {/* Left: empty state or preview */}
      {selected ? (
        <div className="flex min-h-0 flex-1 flex-col bg-neutral-50">
          <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-6 py-3">
            <span className="flex size-5 items-center justify-center text-neutral-600">
              {interfaceHeaderIcons[selected]}
            </span>
            <span className="text-[13.5px] font-semibold text-neutral-900">
              {interfaceLabels[selected]}
            </span>
            <span className="text-[12.5px] text-neutral-500">
              {interfaceDescriptions[selected]}
            </span>
          </div>
          <div className="flex-1 p-6">
            <div className="relative h-full rounded-xl border border-neutral-200 bg-white overflow-hidden">
              {selected === "chatbot" ? (
                <div className="absolute bottom-6 right-6">
                  <div className="relative">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-white border-2 border-blue-500 shadow-md">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 text-neutral-900">
                        <path d="M12 2l9 4.5v11L12 22 3 17.5v-11L12 2zM12 4.24L5 7.5v9L12 19.76 19 16.5v-9L12 4.24z"/>
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10.5px] font-semibold text-white border border-white">
                      1
                    </span>
                  </div>
                </div>
              ) : selected === "automation" ? (
                <iframe src={buildAutomationPreviewUrl(automationId)} className="h-full w-full border-0" title="Automation preview" />
              ) : (
                <div className="flex h-full items-center justify-center text-[13px] text-neutral-400">
                  Preview
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {/* Concentric circles */}
        <svg
          className="pointer-events-none absolute inset-0 m-auto"
          width="960"
          height="960"
          viewBox="0 0 960 960"
          fill="none"
        >
          {[100, 200, 300, 400, 480].map((r) => (
            <circle
              key={r}
              cx="480"
              cy="480"
              r={r}
              stroke="#e5e5e5"
              strokeWidth="1"
              fill="none"
            />
          ))}
        </svg>

        <div className="relative flex flex-col items-center gap-6 text-center">
          {/* Scattered cards illustration */}
          <div className="relative h-[180px] w-[280px]">
            <div className="absolute left-2 top-8 h-16 w-24 -rotate-12 rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="p-2">
                <div className="mb-1.5 size-3 rounded-full border-2 border-red-400" />
                <div className="mb-1 h-1 w-14 rounded-full bg-neutral-200" />
                <div className="h-1 w-10 rounded-full bg-neutral-200" />
              </div>
            </div>
            <div className="absolute right-4 top-2 h-16 w-24 rotate-12 rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="flex h-full items-center justify-center text-neutral-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6">
                  <path d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                </svg>
              </div>
            </div>
            <div className="absolute left-16 top-16 h-20 w-32 rotate-3 rounded-lg border border-neutral-300 bg-white shadow-md">
              <div className="p-2.5">
                <div className="mb-1.5 h-1.5 w-20 rounded-full bg-neutral-300" />
                <div className="mb-1.5 h-1.5 w-16 rounded-full bg-neutral-200" />
                <div className="h-1.5 w-24 rounded-full bg-neutral-200" />
              </div>
            </div>
            <div className="absolute right-1 top-24 h-14 w-20 -rotate-6 rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="p-2">
                <div className="mb-1 size-2 rounded-full bg-neutral-800" />
                <div className="h-1 w-12 rounded-full bg-neutral-200" />
              </div>
            </div>
            <div className="absolute left-4 top-28 h-12 w-16 rotate-6 rounded-lg border border-neutral-200 bg-white shadow-sm" />
          </div>
          <p className="text-[15px] font-semibold text-neutral-900">
            You haven&apos;t chosen an interface yet.
          </p>
        </div>
      </div>
      )}

      {/* Right: selector panel */}
      <div className="flex w-[420px] flex-col border-l border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="mx-auto h-1 w-8 rounded-full bg-neutral-200" />
          </div>
          <h2 className="mt-2 text-[13.5px] font-semibold text-neutral-900">
            Select an interface type
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <InterfaceSectionLabel>User Interfaces</InterfaceSectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <InterfaceTypeCard
              icon={formIcon}
              label="Form"
              active={selected === "form"}
              onClick={() => setSelected("form")}
            />
            <InterfaceTypeCard
              icon={chatIcon}
              label="Chat Assistant"
              active={selected === "chat"}
              onClick={() => setSelected("chat")}
            />
            <InterfaceTypeCard
              icon={chatbotIcon}
              label="Website Chatbot"
              active={selected === "chatbot"}
              onClick={() => setSelected("chatbot")}
            />
            <InterfaceTypeCard
              icon={batchIcon}
              label="Batch"
              active={selected === "batch"}
              onClick={() => setSelected("batch")}
            />
          </div>

          <div className="mt-5">
            <InterfaceSectionLabel>Automation</InterfaceSectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <InterfaceTypeCard
                icon={automationIcon}
                label="Automation"
                active={selected === "automation"}
                onClick={() => setSelected("automation")}
              />
            </div>
          </div>

          <div className="mt-5">
            <InterfaceSectionLabel>API Connections</InterfaceSectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <InterfaceTypeCard
                icon={apiIcon}
                label="API"
                active={selected === "api"}
                onClick={() => setSelected("api")}
              />
            </div>
          </div>

          <div className="mt-5">
            <InterfaceSectionLabel>Deprecated Interfaces</InterfaceSectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <InterfaceTypeCard
                icon={slackIcon}
                label="Slack App"
                active={selected === "slack"}
                onClick={() => setSelected("slack")}
              />
              <InterfaceTypeCard
                icon={teamsIcon}
                label="Microsoft Teams"
                active={selected === "teams"}
                onClick={() => setSelected("teams")}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 p-4">
          <button
            disabled={!selected}
            onClick={() => selected && setConfigured(selected)}
            className={cn(
              "flex h-10 w-full items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium transition-colors",
              selected
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="M5 12l5 5L20 7" />
            </svg>
            Use this interface
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- Page --------------------

function BuilderPageContent() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const [tab, setTab] = useState<BuilderTab>("workflow");

  const automation =
    myAutomations.find((a) => a.id === id) ??
    myAutomations.find((a) => a.id === "auto-fedex-exception-log")!;

  const steps: AutomationStep[] = automation.steps ?? [];

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <TopBar
        automationName="automation"
        onBack={() => router.push(`/automations/${automation.id}`)}
        tab={tab}
        onTabChange={setTab}
      />
      <div className="flex min-h-0 flex-1">
        <LeftRail />
        <div className="relative min-h-0 flex-1">
          {tab === "workflow" && <BuilderCanvas steps={steps} />}
          {tab === "interface" && <InterfacePanel automationId={automation.id} />}
          {tab !== "workflow" && tab !== "interface" && (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
              {tab.charAt(0).toUpperCase() + tab.slice(1)} coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense>
      <BuilderPageContent />
    </Suspense>
  );
}
