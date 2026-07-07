"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAgentIcon } from "@/lib/agent-icons";
import { cn } from "@/lib/utils";
import { CalendarIcon, SlackIcon, ClockIcon, CheckCircle2Icon, XCircleIcon, LoaderCircleIcon, ListChecksIcon } from "lucide-react";

export interface AutomationRunItem {
  id: string;
  title: string;
  status: "success" | "failed" | "running" | "pending" | "cancelled" | string;
  time: string;
  duration: string;
  steps: number;
  agentId?: string;
  automationId?: string;
  automationName?: string;
  triggerType?: "schedule" | "slack";
}

interface AutomationRunsListProps {
  runs: AutomationRunItem[];
  showIcons?: boolean;
  onRunClick?: (run: AutomationRunItem) => void;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  success:   { label: "Completed", icon: CheckCircle2Icon,   className: "text-emerald-600" },
  failed:    { label: "Failed",    icon: XCircleIcon,        className: "text-red-500" },
  running:   { label: "Running",   icon: LoaderCircleIcon,   className: "text-blue-500" },
  pending:   { label: "Pending",   icon: ClockIcon,          className: "text-muted-foreground" },
  cancelled: { label: "Cancelled", icon: XCircleIcon,        className: "text-muted-foreground" },
};
const fallbackStatus = { label: "Unknown", icon: ClockIcon, className: "text-muted-foreground" };

export function AutomationRunsList({
  runs,
  showIcons = false,
  onRunClick,
}: AutomationRunsListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-0">Run</TableHead>
          <TableHead>Output</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Trigger</TableHead>
          <TableHead>Steps</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead className="text-right">Started</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((run) => {
          const { label, icon: StatusIcon, className: statusCn } = statusConfig[run.status] ?? fallbackStatus;
          return (
            <TableRow
              key={run.id}
              className={cn(onRunClick && "cursor-pointer")}
              onClick={() => onRunClick?.(run)}
            >
              <TableCell className="pl-0">
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

              <TableCell className="text-sm text-muted-foreground">
                {run.title}
              </TableCell>

              <TableCell>
                <span className={cn("flex items-center gap-1.5 text-sm font-medium", statusCn)}>
                  <StatusIcon className="size-3.5 shrink-0" />
                  {label}
                </span>
              </TableCell>

              <TableCell>
                {run.triggerType === "slack" ? (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <SlackIcon className="size-3.5 shrink-0" />
                    Slack
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarIcon className="size-3.5 shrink-0" />
                    Schedule
                  </span>
                )}
              </TableCell>

              <TableCell>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ListChecksIcon className="size-3.5 shrink-0" />
                  {run.steps}
                </span>
              </TableCell>

              <TableCell>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                  <ClockIcon className="size-3.5 shrink-0" />
                  {run.duration}
                </span>
              </TableCell>

              <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                {run.time}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
