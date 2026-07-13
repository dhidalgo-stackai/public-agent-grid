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
import { AutomationScheduleDialog } from "@/components/automation-schedule-dialog";
import type { Automation } from "@/lib/automations-data";

const integrationIcons: Record<string, React.ReactNode> = {
  slack: (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#36C5F0"/>
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#2EB67D"/>
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#ECB22E"/>
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
    </svg>
  ),
  gmail: (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/>
      <path d="M1.636 21.002h3.819V11.73L0 6.82v12.546c0 .904.732 1.636 1.636 1.636z" fill="#34A853"/>
      <path d="M18.545 21.002h3.819c.904 0 1.636-.732 1.636-1.636V6.82l-5.455 4.91v9.272z" fill="#4285F4"/>
      <path d="M5.455 11.73V4.64L12 9.548l6.545-4.91v7.092L12 16.64l-6.545-4.91z" fill="#FBBC05"/>
    </svg>
  ),
  connector: (
    <svg className="size-3.5" viewBox="0 0 107 109" fill="currentColor">
      <path d="M102.92 57.26L81.48 44.39C80.98 44.09 80.68 43.55 80.68 42.97V17.91C80.68 16.17 79.77 14.55 78.27 13.66L57.56 1.24C56.2 0.43 54.65 0 53.07 0C51.49 0 49.93 0.43 48.58 1.24L27.87 13.67C26.38 14.57 25.46 16.18 25.46 17.92V43C25.46 43.58 25.15 44.12 24.66 44.42L3.21 57.26C1.22 58.45 0 60.61 0 62.93V87.16C0 90.49 1.66 93.57 4.34 95.19L24.18 107.25C26.29 108.53 28.93 108.53 31.04 107.25L52.31 94.43C52.83 94.12 53.48 94.13 54 94.44L75.94 107.77C77.52 108.73 79.51 108.73 81.09 107.77L101.79 95.19C104.47 93.56 106.13 90.49 106.13 87.16V62.93C106.13 60.61 104.91 58.46 102.92 57.26ZM50.76 87.16C50.76 88.94 49.91 90.56 48.57 91.38L31.88 101.52C30.51 102.35 28.87 101.19 28.87 99.39V79.63C28.87 77.85 29.72 76.23 31.06 75.41L47.75 65.27C49.12 64.44 50.76 65.6 50.76 67.4V87.16ZM76.22 43.09C76.22 44.87 75.37 46.49 74.03 47.31L57.34 57.45C55.97 58.28 54.33 57.12 54.33 55.32V35.56C54.33 33.78 55.18 32.16 56.52 31.34L73.21 21.2C74.58 20.37 76.22 21.53 76.22 23.33V43.09ZM101.67 87.16C101.67 88.94 100.82 90.56 99.48 91.38L82.79 101.52C81.42 102.35 79.78 101.19 79.78 99.39V79.63C79.78 77.85 80.63 76.23 81.97 75.41L98.66 65.27C100.03 64.44 101.67 65.6 101.67 67.4V87.16Z"/>
    </svg>
  ),
  excel: (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8 17v-2h4v2H8zm0-4v-2h8v2H8zm0-4v-2h8v2H8z"/>
    </svg>
  ),
};

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
                      ? integrationIcons.slack
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
                              {integrationIcons[integration] ?? <SquareChevronRight className="size-3" />}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="border border-border bg-background px-2 py-1 shadow-md">
                            <span className="text-xs font-medium text-foreground capitalize">{integration}</span>
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

      <AutomationScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        automationName={automation.name}
        schedule={automation.schedule}
        onSave={(schedule) => onUpdateSchedule?.(automation.id, schedule)}
      />
    </div>
  );
}
