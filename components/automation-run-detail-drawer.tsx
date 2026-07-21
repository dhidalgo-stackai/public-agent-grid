"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  XIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HashIcon,
  MessageSquareIcon,
  CalendarIcon,
  ClockIcon,
  BotIcon,
  UserIcon,
  CoinsIcon,
  ArrowRightToLineIcon,
  ArrowLeftFromLineIcon,
  AlertCircleIcon,
  CopyIcon,
  Maximize2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AutomationRunDetail {
  id: string;
  runId: string;
  status: string;
  statusLabel: string;
  statusStyle: { container: string; dot: string };
  conversationId?: string;
  date: string;
  duration: string;
  aiModel?: string;
  userId?: string;
  usedTokens?: number;
  input?: unknown;
  output?: unknown;
  errors?: { node: string; nodeId: string; message: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  run: AutomationRunDetail | null;
}

function Row({
  icon,
  label,
  value,
  mono,
  bold,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/60">
      <div className="flex items-center gap-2 text-foreground shrink-0">
        <span className="[&_svg]:size-3.5 text-muted-foreground">{icon}</span>
        <span className="text-[13px]">{label}</span>
      </div>
      <div
        className={cn(
          "text-[13px] text-foreground text-right min-w-0 truncate",
          mono && "font-mono text-xs",
          bold && "font-semibold"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function CollapsibleRow({
  icon,
  label,
  right,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 py-3 text-left"
      >
        <div className="flex items-center gap-2 text-foreground">
          <span className="[&_svg]:size-3.5 text-muted-foreground">{icon}</span>
          <span className="text-[13px]">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              !open && "-rotate-90"
            )}
          />
        </div>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function JsonValue({ value }: { value: unknown }) {
  if (typeof value === "string")
    return <span className="text-[#c2410c]">&quot;{value}&quot;</span>;
  if (typeof value === "number")
    return <span className="text-emerald-700">{value}</span>;
  if (typeof value === "boolean")
    return <span className="text-blue-700">{String(value)}</span>;
  if (value === null) return <span className="text-muted-foreground">null</span>;
  return null;
}

function JsonTree({ value }: { value: unknown }) {
  const [open, setOpen] = useState(true);

  if (Array.isArray(value)) {
    const count = value.length;
    return (
      <div className="text-neutral-800">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-0.5 align-baseline"
        >
          {open ? (
            <ChevronDownIcon className="size-3 text-neutral-500" />
          ) : (
            <ChevronRightIcon className="size-3 text-neutral-500" />
          )}
          <span>[</span>
          <span className="ml-1 italic text-neutral-400">
            {count} {count === 1 ? "item" : "items"}
          </span>
        </button>
        {open && (
          <div className="pl-4">
            {value.map((v, i) => (
              <div key={i}>
                {typeof v === "object" && v !== null ? (
                  <JsonTree value={v} />
                ) : (
                  <JsonValue value={v} />
                )}
                {i < value.length - 1 && <span>,</span>}
              </div>
            ))}
          </div>
        )}
        <span>]</span>
      </div>
    );
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const count = entries.length;
    return (
      <div className="text-neutral-800">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-0.5 align-baseline"
        >
          {open ? (
            <ChevronDownIcon className="size-3 text-neutral-500" />
          ) : (
            <ChevronRightIcon className="size-3 text-neutral-500" />
          )}
          <span>{"{"}</span>
          <span className="ml-1 italic text-neutral-400">
            {count} {count === 1 ? "item" : "items"}
          </span>
        </button>
        {open && (
          <div className="pl-4">
            {entries.map(([k, v], i) => {
              const isEmpty =
                (Array.isArray(v) && v.length === 0) ||
                (v && typeof v === "object" && Object.keys(v).length === 0);
              return (
                <div key={k}>
                  <span className="text-neutral-800">
                    &quot;{k}&quot;
                  </span>
                  <span className="text-neutral-500">: </span>
                  {typeof v === "object" && v !== null && !isEmpty ? (
                    <JsonTree value={v} />
                  ) : isEmpty && Array.isArray(v) ? (
                    <>
                      <span>[]</span>
                      <span className="ml-1 italic text-neutral-400">
                        0 items
                      </span>
                    </>
                  ) : (
                    <JsonValue value={v} />
                  )}
                  {i < entries.length - 1 && <span>,</span>}
                </div>
              );
            })}
          </div>
        )}
        <span>{"}"}</span>
      </div>
    );
  }

  return <JsonValue value={value} />;
}

function JsonBlock({ value }: { value: unknown }) {
  const [mode, setMode] = useState<"formatted" | "text">("formatted");
  const text = useMemo(
    () =>
      typeof value === "string" ? value : JSON.stringify(value, null, 2),
    [value]
  );

  return (
    <div className="rounded-lg border border-border/70 bg-background">
      <div className="flex items-center gap-2 border-b border-border/60 px-2.5 py-2">
        <div className="inline-flex items-center rounded-md border border-border bg-muted/60 p-0.5">
          <button
            onClick={() => setMode("formatted")}
            className={cn(
              "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
              mode === "formatted"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Formatted
          </button>
          <button
            onClick={() => setMode("text")}
            className={cn(
              "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
              mode === "text"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Text
          </button>
        </div>
        <div className="ml-auto flex items-center gap-1 text-muted-foreground">
          <button
            className="flex size-6 items-center justify-center rounded border border-border hover:bg-muted"
            title="Expand"
          >
            <Maximize2Icon className="size-3" />
          </button>
          <button
            className="flex size-6 items-center justify-center rounded border border-border hover:bg-muted"
            title="Copy"
            onClick={() => {
              void navigator.clipboard?.writeText(text);
            }}
          >
            <CopyIcon className="size-3" />
          </button>
        </div>
      </div>
      <div className="max-h-[320px] overflow-auto px-3 py-2.5 font-mono text-[12px] leading-relaxed">
        {mode === "formatted" ? (
          <JsonTree value={value} />
        ) : (
          <pre className="whitespace-pre text-neutral-800">{text}</pre>
        )}
      </div>
    </div>
  );
}

export function AutomationRunDetailDrawer({ open, onClose, run }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-screen w-full max-w-[520px] border-l border-border bg-background shadow-xl",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {run && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  General
                </span>
                <span
                  className={cn(
                    "inline-flex h-5 items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2 text-[11px] font-medium",
                    run.statusStyle.container
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      run.statusStyle.dot
                    )}
                  />
                  {run.statusLabel}
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              <Row
                icon={<HashIcon />}
                label="Run ID"
                value={run.runId}
                mono
                bold
              />
              <Row
                icon={<MessageSquareIcon />}
                label="Conversation ID"
                value={
                  run.conversationId ?? (
                    <span className="text-muted-foreground">-</span>
                  )
                }
                mono={!!run.conversationId}
                bold={!!run.conversationId}
              />
              <Row
                icon={<CalendarIcon />}
                label="Date"
                value={run.date}
                bold
              />
              <Row
                icon={<ClockIcon />}
                label="Duration"
                value={run.duration}
                bold
              />
              <Row
                icon={<BotIcon />}
                label="AI Model"
                value={
                  run.aiModel ?? (
                    <span className="text-muted-foreground">-</span>
                  )
                }
                bold={!!run.aiModel}
              />
              <Row
                icon={<UserIcon />}
                label="User ID"
                value={
                  run.userId ?? (
                    <span className="text-muted-foreground">-</span>
                  )
                }
                bold={!!run.userId}
              />

              <CollapsibleRow
                icon={<CoinsIcon />}
                label="Used Tokens"
                right={
                  <span className="text-[13px] text-foreground font-semibold">
                    {run.usedTokens ?? 0}
                  </span>
                }
              >
                <p className="text-[13px] text-muted-foreground">
                  {run.usedTokens && run.usedTokens > 0
                    ? `${run.usedTokens.toLocaleString()} tokens consumed across all nodes.`
                    : "N/A"}
                </p>
              </CollapsibleRow>

              <CollapsibleRow
                icon={<ArrowRightToLineIcon />}
                label="Input"
                defaultOpen
              >
                {run.input !== undefined ? (
                  <>
                    <p className="mb-2 text-[13px] text-foreground">Input</p>
                    <JsonBlock value={run.input} />
                  </>
                ) : (
                  <p className="text-[13px] text-muted-foreground">N/A</p>
                )}
              </CollapsibleRow>

              <CollapsibleRow
                icon={<ArrowLeftFromLineIcon />}
                label="Output"
                right={
                  run.output === undefined ? (
                    <span className="text-[13px] text-muted-foreground">
                      N/A
                    </span>
                  ) : undefined
                }
                defaultOpen={run.output !== undefined}
              >
                {run.output !== undefined ? (
                  <JsonBlock value={run.output} />
                ) : (
                  <p className="text-[13px] text-muted-foreground">
                    No output was produced for this run.
                  </p>
                )}
              </CollapsibleRow>

              {run.errors && run.errors.length > 0 && (
                <CollapsibleRow
                  icon={<AlertCircleIcon className="text-red-500" />}
                  label="Errors"
                  defaultOpen
                >
                  <div className="flex flex-col gap-2">
                    {run.errors.map((err, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
                      >
                        Error in Node{" "}
                        <span className="font-semibold">{err.node}</span> (
                        <span className="font-mono text-[12px]">
                          `{err.nodeId}`
                        </span>
                        ): {err.message}
                      </div>
                    ))}
                  </div>
                </CollapsibleRow>
              )}

              <div className="h-6" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
