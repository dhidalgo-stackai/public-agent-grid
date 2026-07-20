"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAgentIcon } from "@/lib/agent-icons";
import { cn } from "@/lib/utils";
import { CalendarIcon, SlackIcon, MailIcon } from "lucide-react";

export interface AutomationRunItem {
  id: string;
  runId?: string;
  title: string;
  status: "success" | "failed" | "running" | "pending" | "cancelled" | "warning" | string;
  time: string;
  duration: string;
  input?: string;
  agentId?: string;
  automationId?: string;
  automationName?: string;
  triggerType?: "schedule" | "slack" | "email";
}

interface AutomationRunsListProps {
  runs: AutomationRunItem[];
  showIcons?: boolean;
  onRunClick?: (run: AutomationRunItem) => void;
}

const statusStyles: Record<string, { label: string; container: string; dot: string }> = {
  success:   { label: "Completed",              container: "border border-border text-muted-foreground",                                dot: "bg-emerald-500" },
  warning:   { label: "Completed with warning", container: "border border-border text-muted-foreground",                                dot: "bg-amber-500" },
  failed:    { label: "Failed",                 container: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",             dot: "bg-red-500" },
  running:   { label: "Running",                container: "border border-border text-muted-foreground",                                dot: "bg-blue-500" },
  pending:   { label: "Pending",                container: "bg-muted text-muted-foreground",                                            dot: "bg-muted-foreground/50" },
  cancelled: { label: "Cancelled",              container: "bg-muted text-muted-foreground",                                            dot: "bg-muted-foreground/40" },
};
const fallbackStatus = { label: "Unknown", container: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/40" };

const triggerConfig: Record<string, { label: string; Icon: React.ElementType }> = {
  slack:    { label: "Slack",    Icon: SlackIcon },
  email:    { label: "Email",    Icon: MailIcon },
  schedule: { label: "Schedule", Icon: CalendarIcon },
};

export function AutomationRunsList({
  runs,
  showIcons = false,
  onRunClick,
}: AutomationRunsListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/60 hover:bg-transparent">
          <TableHead className="pl-0 text-xs font-normal text-muted-foreground">Run ID</TableHead>
          <TableHead className="text-xs font-normal text-muted-foreground">Run</TableHead>
          <TableHead className="text-xs font-normal text-muted-foreground">Status</TableHead>
          <TableHead className="text-xs font-normal text-muted-foreground">Inputs</TableHead>
          <TableHead className="text-xs font-normal text-muted-foreground">Outputs</TableHead>
          <TableHead className="text-xs font-normal text-muted-foreground">Trigger</TableHead>
          <TableHead className="text-xs font-normal text-muted-foreground">Duration</TableHead>
          <TableHead className="text-right text-xs font-normal text-muted-foreground">Started</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((run) => {
          const status = statusStyles[run.status] ?? fallbackStatus;
          const trigger = triggerConfig[run.triggerType ?? "schedule"] ?? triggerConfig.schedule;
          const TriggerIcon = trigger.Icon;
          return (
            <TableRow
              key={run.id}
              className={cn("border-border/60", onRunClick && "cursor-pointer")}
              onClick={() => onRunClick?.(run)}
            >
              <TableCell className="pl-0 align-top">
                <span className="font-mono text-xs text-muted-foreground">{run.runId ?? run.id}</span>
              </TableCell>

              <TableCell className="align-top">
                <div className="flex items-center gap-3">
                  {showIcons && (
                    <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background text-muted-foreground">
                      <span className="flex size-4 items-center justify-center">
                        {getAgentIcon(run.agentId, "size-4 text-muted-foreground")}
                      </span>
                    </div>
                  )}
                  <p className="text-sm font-medium text-foreground">{run.automationName ?? "—"}</p>
                </div>
              </TableCell>

              <TableCell className="align-top">
                <div
                  className={cn(
                    "isolate inline-flex h-6 w-fit items-center gap-2 rounded-full py-0.5 pl-1.5 pr-2.5 text-xs",
                    status.container,
                  )}
                >
                  <span className={cn("size-2 shrink-0 rounded-full", status.dot)} />
                  {status.label}
                </div>
              </TableCell>

              <TableCell className="align-top text-sm text-foreground/80">
                {run.input ?? <span className="text-muted-foreground">—</span>}
              </TableCell>

              <TableCell className="align-top text-sm text-foreground/80">
                {run.title}
              </TableCell>

              <TableCell className="align-top">
                <div className="inline-flex h-6 w-fit items-center gap-1.5 rounded-full border border-border px-2 text-xs text-muted-foreground">
                  <TriggerIcon className="size-3 shrink-0" />
                  {trigger.label}
                </div>
              </TableCell>

              <TableCell className="align-top text-xs text-muted-foreground tabular-nums">
                {run.duration}
              </TableCell>

              <TableCell className="align-top text-right text-xs text-muted-foreground tabular-nums">
                {run.time}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
