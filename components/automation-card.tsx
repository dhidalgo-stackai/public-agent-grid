"use client";

import { useState } from "react";
import { ZapIcon, ClockIcon, MailIcon, CloudSun, SquareChevronRight, MoreVertical, InfoIcon, PencilIcon, ArchiveIcon } from "lucide-react";
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
  const isScheduled = automation.triggerType === "schedule" || automation.triggerType === undefined;
  const isSlackTriggered = automation.triggerType === "slack";
  const isEmailTriggered = automation.triggerType === "email";
  const triggerApp: string | null = isSlackTriggered
    ? "slack"
    : automation.integrations.includes("slack")
    ? "slack"
    : automation.integrations.includes("teams")
    ? "teams"
    : automation.integrations.includes("outlook")
    ? "outlook"
    : null;
  const footerIntegrations = triggerApp
    ? automation.integrations.filter((i) => i !== triggerApp)
    : automation.integrations;
  const bigIcon =
    automation.iconKey === "mail"
      ? <MailIcon className="size-5 text-muted-foreground" />
      : automation.iconKey === "cloud-sun"
      ? <CloudSun className="size-5 text-muted-foreground" />
      : <ZapIcon className="size-5 text-muted-foreground" />;

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
            {bigIcon}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-1.5">
              <h3 className="truncate text-sm font-medium">{automation.name}</h3>
              {automation.id !== "auto-fedex-weather-route-brief" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex size-4 shrink-0 cursor-default items-center justify-center rounded-full bg-blue-100 text-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InfoIcon className="size-2.5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-64 border border-border bg-background px-2.5 py-1.5 shadow-md">
                      <span className="text-xs text-foreground">
                        <span className="font-medium">{automation.authorName}</span> published an updated version. Open the automation to review.
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-hidden text-xs whitespace-nowrap text-muted-foreground">
              <ZapIcon className="size-3.5 shrink-0 opacity-60" />
              <span className="truncate">Automation</span>
            </div>
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
                onClick={(e) => {
                  e.stopPropagation();
                  setScheduleOpen(true);
                }}
              >
                <PencilIcon className="size-4" />
                Edit automation
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => e.stopPropagation()}
              >
                <ArchiveIcon className="size-4" />
                Archive
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
                    {triggerApp && integrationMeta[triggerApp]
                      ? integrationMeta[triggerApp].icon
                      : isEmailTriggered
                      ? <MailIcon className="size-3.5 text-muted-foreground" />
                      : <ClockIcon className="size-3.5 text-muted-foreground" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="border border-border bg-background px-2 py-1 shadow-md">
                  <span className="text-xs font-medium text-foreground">
                    {triggerApp === "slack"
                      ? "Triggered by Slack message"
                      : triggerApp === "teams"
                      ? "Triggered by Teams message"
                      : triggerApp === "outlook"
                      ? "Triggered by Outlook email"
                      : automation.schedule}
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
