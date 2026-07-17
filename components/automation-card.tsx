"use client";

import { useState } from "react";
import { ZapIcon, ClockIcon, SquareChevronRight, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AutomationSetupModal } from "@/components/automation-setup-modal";
import type { Automation } from "@/lib/automations-data";
import { integrationMeta } from "@/lib/integrations";

interface AutomationCardProps {
  automation: Automation;
  onToggle?: (id: string) => void;
  onClick?: (automation: Automation) => void;
  onUpdateSchedule?: (id: string, schedule: string) => void;
}

export function AutomationCard({ automation, onToggle, onClick, onUpdateSchedule }: AutomationCardProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const isActive = automation.status === "active";
  const isScheduled = automation.triggerType !== "slack";
  const isSlackTriggered = automation.triggerType === "slack";
  const footerIntegrations = isSlackTriggered
    ? automation.integrations.filter((i) => i !== "slack")
    : automation.integrations;

  return (
    <div className="group/card relative rounded-xl">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick?.(automation)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(automation); }
        }}
        className="relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border transition-all duration-150 will-change-transform group-hover/card:-translate-y-0.5 group-hover/card:border-foreground/30"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-0">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
            {isScheduled
              ? <ClockIcon className="size-5 text-muted-foreground" />
              : <ZapIcon className="size-5 text-muted-foreground" />
            }
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h3 className="truncate text-sm font-medium">{automation.name}</h3>
          </div>

          {/* Status toggle */}
          <Switch
            checked={isActive}
            onCheckedChange={() => onToggle?.(automation.id)}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Overflow menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground focus:outline-none"
                title="More options"
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                disabled={!isScheduled}
                onClick={(e) => {
                  e.stopPropagation();
                  setScheduleOpen(true);
                }}
              >
                <ClockIcon className="size-4" />
                Edit schedule
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(automation);
                }}
              >
                <SquareChevronRight className="size-4" />
                Open automation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {automation.description && (
          <p className="line-clamp-2 px-4 pt-2 text-xs text-muted-foreground">{automation.description}</p>
        )}

        {/* Footer */}
        <div
          className={cn(
            "mt-auto flex items-center gap-4 px-4 pb-4 pt-3",
            automation.labels.length > 0 ? "grid grid-cols-[auto_1fr]" : "justify-end",
          )}
        >
          {automation.labels.length > 0 && (
            <div className="flex items-center gap-1.5">
              {automation.labels.slice(0, 2).map((label) => (
                <span
                  key={label}
                  className="inline-flex min-w-0 max-w-24 shrink-0 items-center rounded-md bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground"
                >
                  <span className="truncate">{label}</span>
                </span>
              ))}
              {automation.labels.length > 2 && (
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                  +{automation.labels.length - 2}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-1.5">
            {/* Trigger icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex size-6 shrink-0 cursor-default items-center justify-center rounded-md border bg-background transition-transform hover:scale-105"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isSlackTriggered
                      ? integrationMeta.slack.icon
                      : <ClockIcon className="size-3.5 text-muted-foreground" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="border border-border bg-background px-2 py-1 shadow-md">
                  <span className="text-xs font-medium text-foreground">
                    {isSlackTriggered ? "Slack trigger" : automation.schedule}
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {footerIntegrations.length > 0 && (
                <>
                  {/* Divider */}
                  <div className="h-4 w-px bg-border" />

                  {/* Integration icons */}
                  <div className="flex items-center -space-x-1.5">
                    {footerIntegrations.slice(0, 3).map((integration, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="flex size-6 shrink-0 cursor-default items-center justify-center rounded-md border bg-background transition-transform hover:scale-105"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {integrationMeta[integration]?.icon ?? <SquareChevronRight className="size-3" />}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="border border-border bg-background px-2 py-1 shadow-md">
                            <span className="text-xs font-medium text-foreground">{integrationMeta[integration]?.label ?? integration}</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {footerIntegrations.length > 3 && (
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-muted text-[10px] font-medium text-muted-foreground">
                        +{footerIntegrations.length - 3}
                      </div>
                    )}
                  </div>
                </>
            )}
          </div>
        </div>
      </div>

      <AutomationSetupModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        automation={automation}
        onSave={(schedule) => {
          if (schedule) onUpdateSchedule?.(automation.id, schedule);
        }}
      />
    </div>
  );
}
