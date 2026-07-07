"use client";

import { useState } from "react";
import React from "react";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { AgentCard } from "@/components/agent-card";
import { AgentFilterBar } from "@/components/agent-filter-bar";
import {
  PageHeader,
  pageContentInnerClass,
  pageContentScrollClass,
} from "@/components/page-layout";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string[];
  authorName?: string;
  createdDate?: string;
  lastUpdatedDate?: string;
  integrations?: string[];
  labels?: string[];
  interfaceType?: "Form" | "Batch" | "Chat" | "Automation";
  icon?: React.ReactNode;
  runsCount?: number;
  runnersCount?: number;
}

export interface AgentSection {
  id: string;
  title: string;
  agents: Agent[];
  showCount?: boolean;
  hideTitle?: boolean;
  initialOpen?: boolean;
}

interface AgentGridProps {
  sections: AgentSection[];
  toolSearchQuery: string;
  onToolSearchChange: (query: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  integrationFilter: string;
  onIntegrationFilterChange: (filter: string) => void;
  interfaceFilter: string;
  onInterfaceFilterChange: (filter: string) => void;
  onClearFilters?: () => void;
  selectedCategory: string;
  selectedTagId?: string | null;
  onTagSelect?: (tagId: string | null) => void;
  onAgentClick?: (agent: Agent) => void;
  onNewChat?: () => void;
  isScrolledDown?: boolean;
  favorites?: Set<string>;
  onToggleFavorite?: (id: string) => void;
  title?: string;
}

function GridSection({
  section,
  onAgentClick,
  favorites,
  onToggleFavorite,
}: {
  section: AgentSection;
  onAgentClick?: (agent: Agent) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (id: string) => void;
}) {
  const [open, setOpen] = useState(section.initialOpen !== false);
  const count = section.agents.length;

  return (
    <div className="space-y-6">
      {!section.hideTitle && (
        <header className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-2 [&[data-open=false]>svg]:rotate-[-90deg]"
            data-open={open}
          >
            {count > 0 && (
              <ChevronDownIcon className="size-4 text-muted-foreground transition-transform duration-200" />
            )}
            <h2 className="font-medium">{section.title}</h2>
            {section.showCount !== false && (
              <span className="text-xs text-muted-foreground">({count})</span>
            )}
          </button>
        </header>
      )}

      {open && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {count > 0
            ? section.agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  name={agent.name}
                  description={agent.description}
                  onStart={() => onAgentClick?.(agent)}
                  integrations={agent.integrations}
                  labels={agent.labels}
                  interfaceType={agent.interfaceType}
                  icon={agent.icon}
                  runsCount={agent.runsCount}
                  runnersCount={agent.runnersCount}
                  authorName={agent.authorName}
                  isFavorited={favorites?.has(agent.id)}
                  onFavorite={() => onToggleFavorite?.(agent.id)}
                />
              ))
            : (
              <div className="col-span-full flex flex-col items-center justify-center gap-1 p-12">
                <p className="text-sm font-medium text-muted-foreground">No agents found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export function AgentGrid({
  sections,
  toolSearchQuery,
  onToolSearchChange,
  sortBy,
  onSortByChange,
  integrationFilter,
  onIntegrationFilterChange,
  interfaceFilter,
  onInterfaceFilterChange,
  onClearFilters,
  selectedCategory,
  selectedTagId,
  onTagSelect,
  onAgentClick,
  onNewChat,
  isScrolledDown,
  favorites,
  onToggleFavorite,
  title = "All Agents",
}: AgentGridProps) {
  const filteredSections = sections
    .map((section) => ({
      ...section,
      agents: section.agents.filter((agent) => {
        const matchesSearch =
          agent.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
          agent.description.toLowerCase().includes(toolSearchQuery.toLowerCase());
        const matchesInterface =
          selectedCategory === "automations" ||
          interfaceFilter === "all" ||
          agent.interfaceType === interfaceFilter;
        return matchesSearch && matchesInterface;
      }),
    }))
    .filter((section) => section.agents.length > 0 || section.id === sections[0]?.id);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <PageHeader
        isScrolledDown={isScrolledDown}
        subRow={
          <AgentFilterBar
            searchQuery={toolSearchQuery}
            onSearchChange={onToolSearchChange}
            sortBy={sortBy}
            onSortByChange={onSortByChange}
            integrationFilter={integrationFilter}
            onIntegrationFilterChange={onIntegrationFilterChange}
            interfaceFilter={interfaceFilter}
            onInterfaceFilterChange={onInterfaceFilterChange}
            onClearFilters={onClearFilters}
            selectedCategory={selectedCategory}
            selectedTagId={selectedTagId}
            onTagSelect={onTagSelect}
          />
        }
      >
        <h1 className="text-base font-semibold">{title}</h1>
      </PageHeader>

      <div className={pageContentScrollClass}>
        <div className={pageContentInnerClass}>
          {filteredSections.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-1 text-muted-foreground">
              <p className="text-sm font-medium">No agents found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredSections.map((section) => (
              <GridSection
                key={section.id}
                section={section}
                onAgentClick={onAgentClick}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
