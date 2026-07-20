"use client";

import React, { useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayoutGrid, MessageSquare, FileText, Zap, Star, Info, SquareChevronRight, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { integrationIcons } from "@/lib/integration-icons";

interface AgentCardProps {
  name: string;
  description: string;
  onStart?: () => void;
  integrations?: string[];
  labels?: string[];
  interfaceType?: "Form" | "Batch" | "Chat" | "Automation";
  iconUrl?: string;
  icon?: React.ReactNode;
  authorName?: string;
  createdDate?: string;
  lastUpdatedDate?: string;
  runsCount?: number;
  runnersCount?: number;
  isFavorited?: boolean;
  onFavorite?: () => void;
  hideFavorite?: boolean;
  className?: string;
}

const interfaceIcons: Record<string, React.ReactNode> = {
  Form: <LayoutGrid className="size-3.5 shrink-0 opacity-60" />,
  Batch: <FileText className="size-3.5 shrink-0 opacity-60" />,
  Chat: <MessageSquare className="size-3.5 shrink-0 opacity-60" />,
  Automation: <Zap className="size-3.5 shrink-0 opacity-60" />,
};

const interfaceLabels: Record<string, string> = {
  Form: "Form",
  Batch: "Batch",
  Chat: "Chat Assistant",
  Automation: "Automation",
};

export function AgentCard({
  name,
  description,
  onStart,
  integrations = [],
  labels = [],
  interfaceType = "Form",
  iconUrl,
  icon,
  runsCount = 0,
  isFavorited = false,
  onFavorite,
  hideFavorite = false,
  className,
}: AgentCardProps) {
  const [imgError, setImgError] = useState(false);

  const FallbackIcon = interfaceType === "Chat"
    ? MessageSquare
    : interfaceType === "Batch"
    ? FileText
    : interfaceType === "Automation"
    ? Zap
    : LayoutGrid;

  const isAutomation = interfaceType === "Automation";
  const isChat = interfaceType === "Chat";
  const showTrigger = isAutomation;
  const chatTriggerApp = isAutomation
    ? integrations.includes("slack")
      ? "slack"
      : integrations.includes("teams")
      ? "teams"
      : integrations.includes("outlook")
      ? "outlook"
      : null
    : null;
  const footerIntegrations = chatTriggerApp
    ? integrations.filter((i) => i !== chatTriggerApp)
    : integrations;

  return (
    <div className="group/agent-card relative h-44 rounded-xl">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onStart?.()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onStart?.();
          }
        }}
        className={cn("relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-background transition-all duration-150 will-change-transform group-hover/agent-card:-translate-y-0.5 group-hover/agent-card:border-foreground/30", className)}
      >
        {/* Header: icon + title/subtitle + toolbar */}
        <div className="flex items-start gap-3 p-4 pb-0">
          {/* Icon */}
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background">
            {iconUrl && !imgError
              ? <img src={iconUrl} alt={name} className="size-10" onError={() => setImgError(true)} />
              : icon
              ? <span className="flex size-5 items-center justify-center">{icon}</span>
              : <FallbackIcon className="size-5" />}
          </div>

          {/* Title + subtitle */}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h3 className="truncate flex-1 text-sm font-medium">{name}</h3>
            <div className="flex items-center gap-1.5 overflow-hidden text-xs whitespace-nowrap text-muted-foreground">
              {interfaceIcons[interfaceType]}
              <span className="truncate">{interfaceLabels[interfaceType]}</span>
            </div>
          </div>

          {/* Toolbar: info (hover) + star */}
          <div className="relative flex shrink-0 items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Show details for ${name}`}
                    className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-muted group-hover/agent-card:opacity-100"
                  >
                    <Info className="size-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs border border-border bg-background p-3 shadow-lg">
                  <div className="flex flex-col gap-1 text-xs text-foreground">
                    <p className="font-semibold">{name}</p>
                    <p className="leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {!hideFavorite && <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onFavorite?.(); }}
                    aria-label={isFavorited ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
                    aria-pressed={isFavorited}
                    className={cn("shrink-0 rounded p-1 transition-colors hover:bg-muted", !isFavorited && "opacity-0 group-hover/agent-card:opacity-100")}
                  >
                    <Star className={cn("size-4 transition-colors", isFavorited ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-foreground")} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="border border-border bg-background px-2 py-1 shadow-md">
                  <span className="text-xs font-medium">{isFavorited ? "Remove from favorites" : "Add to favorites"}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>}
          </div>
        </div>

        {/* Description */}
        <div className="overflow-hidden px-4 pt-3">
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>

        {/* Footer: labels + trigger + integrations */}
        <div
          className={cn(
            "mt-auto flex items-center gap-4 px-4 pb-4 pt-3",
            labels.length > 0 ? "grid grid-cols-[auto_1fr]" : "justify-end",
          )}
        >
          {labels.length > 0 && (
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
          )}

          <div className="flex items-center justify-end gap-1.5">
            {showTrigger && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex size-6 shrink-0 cursor-default items-center justify-center rounded-md border bg-background transition-transform hover:scale-105"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isAutomation
                        ? chatTriggerApp
                          ? integrationIcons[chatTriggerApp]
                          : <ClockIcon className="size-3.5 text-muted-foreground" />
                        : interfaceType === "Batch"
                        ? <FileText className="size-3.5 text-muted-foreground" />
                        : <LayoutGrid className="size-3.5 text-muted-foreground" />}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="border border-border bg-background px-2 py-1 shadow-md">
                    <span className="text-xs font-medium text-foreground">
                      {isAutomation
                        ? chatTriggerApp === "slack"
                          ? "Triggered by Slack message"
                          : chatTriggerApp === "teams"
                          ? "Triggered by Teams message"
                          : chatTriggerApp === "outlook"
                          ? "Triggered by Outlook email"
                          : "Runs on a schedule"
                        : interfaceLabels[interfaceType]}
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {footerIntegrations.length > 0 && (
              <>
                {showTrigger && <div className="h-4 w-px bg-border" />}

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
    </div>
  );
}
