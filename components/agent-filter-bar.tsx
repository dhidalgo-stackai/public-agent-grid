"use client";

import { useState } from "react";
import { Search, ArrowDownIcon, SlidersHorizontal, GlobeIcon, XIcon, ChevronDownIcon, ChevronRightIcon, MessageSquareIcon, ZapIcon, FileTextIcon, LayersIcon, CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const ORG_TAGS = [
  { id: "chat-assistants", label: "Chat Assistants" },
  { id: "automation", label: "Automation" },
  { id: "engineering", label: "Engineering" },
  { id: "analytics", label: "Analytics" },
  { id: "customer-success", label: "Customer Success" },
] as const;

const SORT_OPTIONS = [
  { value: "most-runs", label: "Most Used" },
  { value: "last-updated", label: "Last Updated" },
  { value: "last-created", label: "Recently Created" },
  { value: "name", label: "Name" },
];

const INTERFACE_OPTIONS = [
  { value: "Chat", label: "Chat Assistant", icon: MessageSquareIcon },
  { value: "Automation", label: "Automation", icon: ZapIcon },
  { value: "Form", label: "Form", icon: FileTextIcon },
  { value: "Batch", label: "Batch", icon: LayersIcon },
];

interface AgentFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  selectedTagId?: string | null;
  onTagSelect?: (tagId: string | null) => void;
  integrationFilter?: string;
  onIntegrationFilterChange?: (filter: string) => void;
  interfaceFilter?: string;
  onInterfaceFilterChange?: (filter: string) => void;
  selectedCategory?: string;
  onClearFilters?: () => void;
}

export function AgentFilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  selectedTagId = null,
  onTagSelect,
  selectedCategory,
  interfaceFilter = "all",
  onInterfaceFilterChange,
  onClearFilters,
}: AgentFilterBarProps) {
  const [interfaceExpanded, setInterfaceExpanded] = useState(false);
  const currentSort = SORT_OPTIONS.find((o) => o.value === sortBy) ?? SORT_OPTIONS[0];
  const selectedCategoryFilter =
    selectedCategory === "automations" ? "Automation" : null;
  const activeInterfaceFilter = selectedCategoryFilter ?? interfaceFilter;
  const hasActiveFilter = activeInterfaceFilter !== "all";
  const activeFilterCount = hasActiveFilter ? 1 : 0;
  const clearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
      return;
    }
    onInterfaceFilterChange?.("all");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls row */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full border-border pl-9 shadow-sm"
          />
        </div>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm shadow-sm hover:bg-accent"
            >
              <span>{currentSort.label}</span>
              <ArrowDownIcon className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="flex items-center justify-between gap-4"
                onClick={() => onSortByChange(option.value)}
              >
                <span>{option.label}</span>
                {option.value === sortBy && <ArrowDownIcon className="size-3.5 text-muted-foreground" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter popover */}
        <Popover onOpenChange={(open) => { if (!open) setInterfaceExpanded(false); }}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "relative flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-sm shadow-sm hover:bg-accent",
                hasActiveFilter ? "border-foreground" : "border-border",
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Filter</span>
              {hasActiveFilter && (
                <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0 rounded-xl shadow-lg" align="end" sideOffset={6}>
            <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Filter by
            </p>

            {/* Interface section */}
            <button
              type="button"
              onClick={() => setInterfaceExpanded((v) => !v)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium hover:bg-muted/60 transition-colors"
            >
              <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-left">Interface</span>
              {interfaceExpanded
                ? <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                : <ChevronRightIcon className="size-3.5 text-muted-foreground" />}
            </button>

            {interfaceExpanded && (
              <div className="pb-1">
                {INTERFACE_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const isActive = activeInterfaceFilter === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        if (isActive) {
                          clearFilters();
                          return;
                        }
                        onInterfaceFilterChange?.(value);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 py-1.5 pl-9 pr-3 text-sm transition-colors",
                        isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                      )}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span className="flex-1 text-left">{label}</span>
                      {isActive && <CheckIcon className="size-3.5" />}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="border-t border-border mt-1">
              <button
                type="button"
                disabled={!hasActiveFilter}
                onClick={clearFilters}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors",
                  hasActiveFilter
                    ? "text-destructive hover:bg-destructive/5 cursor-pointer"
                    : "text-muted-foreground/40 cursor-not-allowed",
                )}
              >
                <XIcon className="size-3.5" />
                Clear all filters
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Label filter badges */}
      {selectedCategory === "all" && (
        <div className="flex flex-wrap items-center gap-2">
          {ORG_TAGS.map((tag) => {
            const isSelected = selectedTagId === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onTagSelect?.(isSelected ? null : tag.id)}
                className={cn(
                  "cursor-pointer select-none rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    : "bg-muted hover:bg-primary/10 hover:text-primary hover:shadow-sm",
                )}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
