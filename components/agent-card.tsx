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
  figma: (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none">
      <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83"/>
      <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF"/>
      <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E"/>
      <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262"/>
      <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE"/>
    </svg>
  ),
  connector: (
    <svg className="size-3.5" viewBox="0 0 107 109" fill="currentColor">
      <path d="M102.92 57.26L81.48 44.39C80.98 44.09 80.68 43.55 80.68 42.97V17.91C80.68 16.17 79.77 14.55 78.27 13.66L57.56 1.24C56.2 0.43 54.65 0 53.07 0C51.49 0 49.93 0.43 48.58 1.24L27.87 13.67C26.38 14.57 25.46 16.18 25.46 17.92V43C25.46 43.58 25.15 44.12 24.66 44.42L3.21 57.26C1.22 58.45 0 60.61 0 62.93V87.16C0 90.49 1.66 93.57 4.34 95.19L24.18 107.25C26.29 108.53 28.93 108.53 31.04 107.25L52.31 94.43C52.83 94.12 53.48 94.13 54 94.44L75.94 107.77C77.52 108.73 79.51 108.73 81.09 107.77L101.79 95.19C104.47 93.56 106.13 90.49 106.13 87.16V62.93C106.13 60.61 104.91 58.46 102.92 57.26ZM50.76 87.16C50.76 88.94 49.91 90.56 48.57 91.38L31.88 101.52C30.51 102.35 28.87 101.19 28.87 99.39V79.63C28.87 77.85 29.72 76.23 31.06 75.41L47.75 65.27C49.12 64.44 50.76 65.6 50.76 67.4V87.16ZM76.22 43.09C76.22 44.87 75.37 46.49 74.03 47.31L57.34 57.45C55.97 58.28 54.33 57.12 54.33 55.32V35.56C54.33 33.78 55.18 32.16 56.52 31.34L73.21 21.2C74.58 20.37 76.22 21.53 76.22 23.33V43.09ZM101.67 87.16C101.67 88.94 100.82 90.56 99.48 91.38L82.79 101.52C81.42 102.35 79.78 101.19 79.78 99.39V79.63C79.78 77.85 80.63 76.23 81.97 75.41L98.66 65.27C100.03 64.44 101.67 65.6 101.67 67.4V87.16Z"/>
    </svg>
  ),
  notion: (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.14-1.4.14L4.46 4.208zM2.864 5.456v13.97c0 .7.42 1.12 1.12 1.12h.14l13.31-.98c.7-.047 1.12-.42 1.12-1.12V4.208L2.864 5.456z"/>
    </svg>
  ),
  excel: (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8 17v-2h4v2H8zm0-4v-2h8v2H8zm0-4v-2h8v2H8z"/>
    </svg>
  ),
};

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
  const isSlackTriggered = isAutomation && integrations.includes("slack");
  const footerIntegrations = isSlackTriggered
    ? integrations.filter((i) => i !== "slack")
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
                        ? isSlackTriggered
                          ? integrationIcons.slack
                          : <ClockIcon className="size-3.5 text-muted-foreground" />
                        : interfaceType === "Batch"
                        ? <FileText className="size-3.5 text-muted-foreground" />
                        : <LayoutGrid className="size-3.5 text-muted-foreground" />}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="border border-border bg-background px-2 py-1 shadow-md">
                    <span className="text-xs font-medium text-foreground">
                      {isAutomation
                        ? isSlackTriggered
                          ? "Slack trigger"
                          : "Scheduled"
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
