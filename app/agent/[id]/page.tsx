"use client";

import React, { useState, useRef, useEffect, useCallback, cloneElement } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  SidebarIcon,
  SearchIcon,
  SquarePenIcon,
  XIcon,
  PlusIcon,
  ArrowUpIcon,
  LayoutGrid,
  FolderArchiveIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ImageIcon,
  CameraIcon,
  FolderPlusIcon,
  ZapIcon,
  PlugIcon,
  SearchIcon as SearchIconAlias,
  GlobeIcon,
  PaletteIcon,
  BookOpenIcon,
  PaperclipIcon,
  AtSignIcon,
  MicIcon,
  UploadIcon,
  DatabaseIcon,
  WrenchIcon,
  FlaskConicalIcon,
  FileTextIcon,
  LineChartIcon,
  MoreHorizontalIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
  CheckIcon,
  SparklesIcon,
  StarIcon,
  ListPlusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getChatMessages,
  addRecentChat,
  getChatLabel,
  MOCK_RECENT_CHATS,
  RECENT_CHATS_EVENT,
  getExtraRecentChats,
  type ChatItem,
} from "@/lib/chats-data";
import { getAgentIcon } from "@/lib/agent-icons";
import { AGENT_DIRECTORY, getAgentApps, getAppLabel } from "@/lib/agents-data";
import { integrationIcons } from "@/lib/integration-icons";
import { ALL_WORKFLOWS, type Workflow } from "@/lib/workflows-data";
import { AgentSidebar } from "@/components/agent-sidebar";
import { AgentCard } from "@/components/agent-card";
import { MoreAppsDialog } from "@/components/more-apps-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DEFAULT_DESCRIPTION =
  "What does your application do? How does it behave? How should the user interact with it?";

const MOCK_CONVERSATIONS = [
  { id: "conv1", title: "Summarize the Q2 report", time: "2h ago" },
  { id: "conv2", title: "Draft a customer onboarding email", time: "Yesterday" },
  { id: "conv3", title: "Analyze sales pipeline data", time: "2d ago" },
  { id: "conv4", title: "Explain our pricing tiers", time: "3d ago" },
  { id: "conv5", title: "Compare competitor features", time: "Last week" },
];

const MOCK_SUGGESTIONS = [
  "How can I get started with this agent?",
  "What are the main capabilities available?",
  "Show me an example of what you can do",
];

const HOME_PROMPT_EXAMPLES: { icon: React.ReactNode; text: string; app?: string; badge?: number; agentId?: string }[] = [
  { icon: integrationIcons.notion, text: "Analyze our Notion documentation", app: "notion" },
  { icon: integrationIcons.dropbox, text: "Analyze the pitch deck in my Dropbox", app: "dropbox" },
  { icon: <LineChartIcon className="size-4 text-muted-foreground" />, text: "Create a financial analysis and plot data in graphs", agentId: "wf-3" },
  { icon: <GlobeIcon className="size-4 text-muted-foreground" />, text: "Browse the web and write a newsletter" },
  { icon: integrationIcons.outlook, text: "Reply to an email in my Outlook", app: "outlook", badge: 31 },
];

const toolbarBtn =
  "flex shrink-0 items-center justify-center rounded-lg size-8 p-0 text-muted-foreground hover:bg-muted-foreground/15 hover:text-foreground transition-colors";
const toolbarIcon = "size-4 shrink-0";

type ToolToggles = {
  webSearch: boolean;
  imageCreation: boolean;
  artifacts: boolean;
  deepResearch: boolean;
};

const TOOL_TOGGLE_ITEMS: { key: keyof ToolToggles; label: string; icon: React.ElementType }[] = [
  { key: "webSearch", label: "Web Search", icon: GlobeIcon },
  { key: "imageCreation", label: "Image Creation", icon: ImageIcon },
  { key: "artifacts", label: "Canvas", icon: LayoutGrid },
  { key: "deepResearch", label: "Deep Research", icon: FlaskConicalIcon },
];

const CONNECTOR_ITEMS = [
  { id: "slack", label: "Slack" },
  { id: "notion", label: "Notion" },
  { id: "dropbox", label: "Dropbox" },
  { id: "gdrive", label: "Google Drive" },
  { id: "outlook", label: "Outlook" },
];

function ToolsMenu({
  toggles,
  onToggle,
  connectedConnectors,
  onConnectorChange,
  onOpenMoreApps,
  side = "bottom",
  agentApps,
}: {
  toggles: ToolToggles;
  onToggle: (key: keyof ToolToggles) => void;
  connectedConnectors: string[];
  onConnectorChange: (ids: string[]) => void;
  onOpenMoreApps: () => void;
  side?: "top" | "bottom";
  /**
   * When provided, the menu is scoped to a single agent's workflow: it shows
   * only these apps and hides the generic tool toggles, "Create document" and
   * "More apps" entries.
   */
  agentApps?: string[];
}) {
  const isAgentScoped = agentApps != null;
  const connectorItems = isAgentScoped
    ? agentApps.map((id) => ({ id, label: getAppLabel(id) }))
    : CONNECTOR_ITEMS;
  const connected = connectorItems.filter((c) => connectedConnectors.includes(c.id));

  const toggleConnector = (id: string) => {
    onConnectorChange(
      connectedConnectors.includes(id)
        ? connectedConnectors.filter((existing) => existing !== id)
        : [...connectedConnectors, id]
    );
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted-foreground/15 hover:text-foreground transition-colors" title={connected.length ? connected.map((c) => c.label).join(", ") : "Tools"}>
          {connected.length ? (
            connected.map((c) => (
              <span key={c.id} className="flex size-4 shrink-0 items-center justify-center">
                {cloneElement(integrationIcons[c.id] as React.ReactElement<{ className?: string }>, { className: toolbarIcon })}
              </span>
            ))
          ) : (
            <WrenchIcon className={toolbarIcon} />
          )}
          {!connected.length && "Tools"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="start" className="w-64 p-1">
        {!isAgentScoped && (
          <>
            {TOOL_TOGGLE_ITEMS.map(({ key, label, icon: Icon }) => (
              <DropdownMenuItem
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                onSelect={(e) => e.preventDefault()}
                onClick={() => onToggle(key)}
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">{label}</span>
                <Checkbox checked={toggles[key]} className="ml-auto" onClick={(e) => e.stopPropagation()} onCheckedChange={() => onToggle(key)} />
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5">
              <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-sm">Create document</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {connectorItems.map((c) => {
          const isConnected = connectedConnectors.includes(c.id);
          return (
            <DropdownMenuItem
              key={c.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
              onSelect={(e) => e.preventDefault()}
              onClick={() => toggleConnector(c.id)}
              title={c.label}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">{integrationIcons[c.id]}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{c.label}</span>
              {isConnected ? (
                <CheckIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
              ) : (
                <span className="ml-auto text-xs text-muted-foreground">Connect</span>
              )}
            </DropdownMenuItem>
          );
        })}
        {!isAgentScoped && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground"
              onSelect={(e) => e.preventDefault()}
              onClick={() => onOpenMoreApps()}
            >
              <PlusIcon className="size-4 shrink-0" />
              <span className="text-sm">More apps</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}

const CONNECTED_APPS = [
  { id: "slack", name: "Slack" },
  { id: "notion", name: "Notion" },
  { id: "figma", name: "Figma" },
  { id: "gmail", name: "Gmail" },
];

const KNOWLEDGE_BASES = [
  { id: "kb1", name: "Company Docs", iconType: "drive" },
  { id: "kb2", name: "Product Wiki", iconType: "database" },
  { id: "kb3", name: "Sales Playbook", iconType: "gmail" },
  { id: "kb4", name: "Engineering Runbooks", iconType: "database" },
];

function AttachMenu({ uploadOnly = false }: { uploadOnly?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={toolbarBtn} title="Add">
          <PaperclipIcon className={toolbarIcon} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="w-64">
        <DropdownMenuItem className="gap-2">
          <UploadIcon className="size-4" />
          Upload file
        </DropdownMenuItem>
        {!uploadOnly && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <BookOpenIcon className="size-4" />
                Add Knowledge Base
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                {KNOWLEDGE_BASES.map((kb) => (
                  <DropdownMenuItem key={kb.id} className="gap-2">
                    {kb.iconType === "drive" ? (
                      <svg className="size-4 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                        <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                        <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                        <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                        <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                        <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                      </svg>
                    ) : kb.iconType === "gmail" ? (
                      <svg className="size-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.364l-6.545-4.636v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.273l8.073-5.782C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/>
                        <path d="M0 5.457v13.909c0 .904.732 1.636 1.636 1.636h3.819V11.73L12 16.364V9.273L3.927 3.493C2.309 2.28 0 3.434 0 5.457z" fill="#34A853"/>
                        <path d="M18.545 20.998h3.819c.904 0 1.636-.732 1.636-1.636V11.73l-5.455 3.817z" fill="#4285F4"/>
                        <path d="M5.455 20.998H1.636A1.636 1.636 0 0 1 0 19.362V11.73l5.455 3.817z" fill="#FBBC05"/>
                      </svg>
                    ) : (
                      <DatabaseIcon className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    {kb.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <PlusIcon className="size-4" />
                  Create new
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <PlugIcon className="size-4" />
                Search Connected Apps
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                {CONNECTED_APPS.map((app) => (
                  <DropdownMenuItem key={app.id} className="gap-2">
                    {integrationIcons[app.id]}
                    {app.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <PlugIcon className="size-4" />
                  Connect more apps
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const SAVED_PROMPTS: { id: string; title: string; text: string }[] = [
  {
    id: "p1",
    title: "Summarize a document",
    text: "Summarize the attached document in 5 concise bullet points, highlighting key decisions and action items.",
  },
  {
    id: "p2",
    title: "Draft a follow-up email",
    text: "Draft a professional follow-up email to a customer thanking them for the meeting and outlining the next steps.",
  },
  {
    id: "p3",
    title: "Analyze data trends",
    text: "Analyze the data and describe the top three trends, then plot the most important one as a chart.",
  },
  {
    id: "p4",
    title: "Brainstorm ideas",
    text: "Brainstorm 10 creative ideas for improving our onboarding experience, ranked by potential impact.",
  },
  {
    id: "p5",
    title: "Review and improve writing",
    text: "Review the following text for clarity, tone, and grammar, then rewrite it to be more concise and engaging:",
  },
];

function PromptsMenu({
  onSelect,
  side = "bottom",
}: {
  onSelect: (text: string) => void;
  side?: "top" | "bottom";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground transition-colors" title="Saved prompts">
          <ListPlusIcon className={toolbarIcon} />
          Prompts
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="start" className="w-72 p-1">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Saved prompts</div>
        {SAVED_PROMPTS.map((prompt) => (
          <DropdownMenuItem
            key={prompt.id}
            className="flex cursor-pointer items-center rounded-lg px-2 py-1.5"
            onClick={() => onSelect(prompt.text)}
          >
            <span className="text-sm font-medium">{prompt.title}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const MENTION_ANCHOR_ATTR = "data-mention-anchor";

function createMentionChip(workflow: Workflow, onRemove: () => void): HTMLSpanElement {
  const chip = document.createElement("span");
  chip.contentEditable = "false";
  chip.setAttribute("data-mention-chip", workflow.id);
  chip.title = `@${workflow.name}`;
  // inline-block (not flex) so the browser's innerText serialization doesn't
  // inject line breaks around the chip's content or its children.
  chip.className =
    "mx-0.5 inline-block max-w-[240px] rounded-md align-middle bg-gray-500/10 py-0.5 pl-1.5 pr-1 text-[13px] leading-[18px] font-medium text-gray-700 dark:bg-gray-400/10 dark:text-gray-300";

  const label = document.createElement("span");
  label.className = "inline-block max-w-[190px] truncate align-middle leading-[18px]";
  label.textContent = `@ ${workflow.name}`;
  chip.appendChild(label);

  const removeBtn = document.createElement("span");
  removeBtn.setAttribute("data-mention-remove", "true");
  removeBtn.setAttribute("role", "button");
  removeBtn.setAttribute("aria-label", `Remove @${workflow.name}`);
  // No <svg>/child nodes here: an embedded <svg> forces an extra line break in
  // the browser's innerText serialization. The "x" glyph is drawn with a
  // CSS-only ::before/::after pseudo-element instead (see .mention-remove-icon).
  removeBtn.className =
    "mention-remove-icon ml-1 inline-block cursor-pointer align-middle text-gray-700/50 hover:text-gray-700 dark:text-gray-300/50 dark:hover:text-gray-300";
  removeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  });
  chip.appendChild(removeBtn);

  return chip;
}

function AgentInfoTooltip({ workflow }: { workflow: Workflow }) {
  const Icon = workflow.icon;
  return (
    <TooltipContent
      side="right"
      align="start"
      sideOffset={10}
      className="w-72 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug text-foreground">
            {workflow.name}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {workflow.description}
      </p>
      {(workflow.apps.length > 0 || workflow.tags.length > 0) && (
        <div className="my-3 h-px bg-border" />
      )}
      {workflow.apps.length > 0 && (
        <div className="flex items-center gap-1.5">
          {workflow.apps.map((appId) => {
            const appIcon = integrationIcons[appId];
            if (!appIcon) return null;
            return (
              <span
                key={appId}
                title={getAppLabel(appId)}
                className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background"
              >
                {cloneElement(
                  appIcon as React.ReactElement<{ className?: string }>,
                  { className: "size-3.5" }
                )}
              </span>
            );
          })}
        </div>
      )}
      {workflow.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {workflow.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </TooltipContent>
  );
}

function WorkflowMentionMenu({
  search,
  onSearchChange,
  tab,
  onTabChange,
  selectedIds,
  onSelect,
  onTrigger,
  autoSelect,
  onAutoSelectChange,
  side = "bottom",
  open,
  onOpenChange,
  anchor,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  tab: "recent" | "all" | "favorites";
  onTabChange: (value: "recent" | "all" | "favorites") => void;
  selectedIds: string[];
  onSelect: (workflow: Workflow) => void;
  onTrigger: () => void;
  autoSelect: boolean;
  onAutoSelectChange: (value: boolean) => void;
  side?: "top" | "bottom";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Viewport coordinates of the inserted "@" character. The dropdown is
   * anchored here so it opens right next to the mention, not under the button.
   */
  anchor?: { left: number; top: number } | null;
}) {
  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        if (!next) onSearchChange("");
        onOpenChange?.(next);
      }}
    >
      {/* Visible toolbar button — opens the menu at the "@" position. */}
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground transition-colors"
        title="Agents"
        onClick={onTrigger}
      >
        <AtSignIcon className={toolbarIcon} />
        {autoSelect ? "Auto" : "Agents"}
      </button>
      {/* Invisible anchor positioned at the "@" character in the composer. */}
      <DropdownMenuTrigger asChild>
        <span
          aria-hidden
          className="pointer-events-none fixed h-0 w-0"
          style={{ left: anchor?.left ?? 0, top: anchor?.top ?? 0 }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="start" sideOffset={4} className="w-72 p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
        {/* Search */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Search agents…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {/* Tabs */}
        <div className="px-3 pt-2 pb-1">
          <Tabs value={tab} onValueChange={(v) => onTabChange(v as "recent" | "all" | "favorites")}>
            <TabsList className="w-full">
              <TabsTrigger value="recent" className="flex-1 text-xs">
                Recent
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1 text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1 text-xs">
                Favourite
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* List */}
        <div className="max-h-56 overflow-y-auto py-1">
          {ALL_WORKFLOWS
            .filter((w) => (tab === "favorites" ? w.favorite : tab === "recent" ? w.recent : true))
            .filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
            .map((workflow) => {
              const isSelected = selectedIds.includes(workflow.id);
              return (
                <Tooltip key={workflow.id} delayDuration={250}>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem
                      className={cn("mx-1 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2")}
                      onSelect={() => {
                        if (!isSelected) onSelect(workflow);
                      }}
                    >
                      <span className="flex-1 truncate text-sm">{workflow.name}</span>
                      {isSelected && <CheckIcon className="size-3.5 text-muted-foreground shrink-0" />}
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <AgentInfoTooltip workflow={workflow} />
                </Tooltip>
              );
            })}
        </div>
        <DropdownMenuSeparator />
        {/* Footer */}
        <div className="p-1">
          <DropdownMenuItem
            className="gap-2"
            onSelect={(e) => { e.preventDefault(); onAutoSelectChange(!autoSelect); }}
          >
            <SparklesIcon className="size-4" />
            <span className="flex-1">Auto-select agent</span>
            {autoSelect && <CheckIcon className="size-3.5 text-muted-foreground shrink-0" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2" asChild>
            <Link href="/agents">
              <ExternalLinkIcon className="size-4" />
              Browse agents
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ChatThread({
  chatId,
  agentName,
}: {
  chatId: string;
  agentName: string;
}) {
  const messages = getChatMessages(chatId, agentName);
  return (
    <div className="mx-auto flex w-full max-w-[48rem] flex-col gap-4">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
            msg.role === "user"
              ? "self-end bg-primary text-primary-foreground"
              : "self-start bg-muted text-foreground"
          )}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
}

export default function AgentChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const name = searchParams.get("name") ?? "";
  const chatId = searchParams.get("chat");
  const description = searchParams.get("description") ?? DEFAULT_DESCRIPTION;
  const isNewChat = !name || id === "new";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedWorkflows, setSelectedWorkflows] = useState<{id: string; name: string}[]>([]);
  const [autoSelectWorkflow, setAutoSelectWorkflow] = useState(false);
  const [workflowSearch, setWorkflowSearch] = useState("");
  const [workflowTab, setWorkflowTab] = useState<"recent" | "all" | "favorites">("recent");
  const [mentionMenuOpen, setMentionMenuOpen] = useState(false);
  const [mentionAnchor, setMentionAnchor] = useState<{ left: number; top: number } | null>(null);
  const [newChatKey, setNewChatKey] = useState(0);
  const [extraRecentChats, setExtraRecentChats] = useState<ChatItem[]>([]);
  // Named-agent chats open with the agent's workflow apps already connected;
  // the blank landing composer starts empty so it can prompt the user to
  // connect tools.
  const [connectedConnectors, setConnectedConnectors] = useState<string[]>(() =>
    isNewChat ? [] : getAgentApps(id)
  );
  const [moreAppsOpen, setMoreAppsOpen] = useState(false);
  const [toolToggles, setToolToggles] = useState({
    webSearch: true,
    imageCreation: true,
    artifacts: false,
    deepResearch: false,
  });
  const searchRef = useRef<HTMLInputElement>(null);
  const pendingChatIdRef = useRef<string | null>(null);
  const mentionTextareaRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const saveSelection = useCallback(() => {
    const el = mentionTextareaRef.current;
    const sel = window.getSelection();
    if (el && sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const getWorkingRange = useCallback((el: HTMLDivElement) => {
    if (savedRangeRef.current && el.contains(savedRangeRef.current.startContainer)) {
      return savedRangeRef.current.cloneRange();
    }
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    return range;
  }, []);

  const applyPrompt = useCallback((text: string) => {
    setMessage(text);
    const el = mentionTextareaRef.current;
    if (el) {
      el.textContent = text;
      el.focus();
      // place caret at the end of the inserted text
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, []);

  const insertMentionTrigger = useCallback(() => {
    const el = mentionTextareaRef.current;
    if (!el) return null;

    const range = getWorkingRange(el);
    range.deleteContents();
    const anchor = document.createElement("span");
    anchor.setAttribute(MENTION_ANCHOR_ATTR, "true");
    anchor.textContent = "@";
    range.insertNode(anchor);

    const after = document.createRange();
    after.setStartAfter(anchor);
    after.collapse(true);
    savedRangeRef.current = after.cloneRange();
    setMessage(el.innerText);

    requestAnimationFrame(() => {
      el.focus();
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(after);
    });

    return anchor;
  }, [getWorkingRange]);

  // Opens the agent-mention menu anchored to the just-inserted "@" character
  // (used by both the toolbar "Agents" button and typing "@" in the composer).
  const openMentionMenu = useCallback(() => {
    const anchor = insertMentionTrigger();
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      setMentionAnchor({ left: rect.left, top: rect.bottom });
    }
    setMentionMenuOpen(true);
  }, [insertMentionTrigger]);

  const removeMentionChip = useCallback((chip: HTMLElement, workflowId: string) => {
    const el = mentionTextareaRef.current;
    if (!el) return;
    const next = chip.nextSibling;
    if (next && next.nodeType === Node.TEXT_NODE && next.textContent === " ") {
      next.remove();
    }
    chip.remove();
    setSelectedWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    setMessage(el.innerText);
  }, []);

  const handleSelectWorkflow = useCallback((workflow: Workflow) => {
    setAutoSelectWorkflow(false);
    setSelectedWorkflows((prev) =>
      prev.some((w) => w.id === workflow.id) ? prev : [...prev, { id: workflow.id, name: workflow.name }]
    );

    const el = mentionTextareaRef.current;
    if (!el) return;

    const chip = createMentionChip(workflow, () => removeMentionChip(chip, workflow.id));
    const anchor = el.querySelector(`[${MENTION_ANCHOR_ATTR}]`);
    if (anchor) {
      anchor.replaceWith(chip);
    } else {
      el.appendChild(chip);
    }
    const space = document.createTextNode(" ");
    chip.after(space);

    const after = document.createRange();
    after.setStartAfter(space);
    after.collapse(true);
    savedRangeRef.current = after.cloneRange();
    setMessage(el.innerText);

    requestAnimationFrame(() => {
      el.focus();
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(after);
    });
  }, []);

  useEffect(() => {
    const refresh = () => setExtraRecentChats(getExtraRecentChats());
    refresh();
    window.addEventListener(RECENT_CHATS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(RECENT_CHATS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    if (!chatId) {
      setActiveConv((prev) => (prev?.startsWith("new-") ? prev : null));
    }
  }, [chatId]);

  const conversationId = chatId ?? activeConv;
  const showChat = Boolean(conversationId);

  const beginConversation = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      // Reuse a pending chat ID (pre-created by handleNewChat) so it gets renamed instead of duplicated
      const convId = pendingChatIdRef.current ?? `new-${Date.now()}`;
      pendingChatIdRef.current = null;
      addRecentChat({
        id: convId,
        label: trimmed.slice(0, 60),
        timestamp: "Just now",
        ...(isNewChat
          ? {}
          : { agentId: id, agentName: name }),
      });
      setActiveConv(convId);
      setMessage("");
      if (!isNewChat && id && name) {
        router.replace(
          `/agent/${id}?chat=${convId}&name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`
        );
      } else if (isNewChat) {
        router.replace(`/agent/new?chat=${convId}`);
      }
    },
    [description, id, isNewChat, name, router]
  );

  const handleComposerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "@") {
        e.preventDefault();
        openMentionMenu();
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        beginConversation(mentionTextareaRef.current?.innerText ?? message);
      }
    },
    [openMentionMenu, beginConversation, message]
  );

  const arrivedViaChat = searchParams.get("from") === "chat";

  const handleNewChat = useCallback(() => {
    setActiveConv(null);
    setMessage("");
    setSelectedWorkflows([]);
    setWorkflowSearch("");
    if (mentionTextareaRef.current) mentionTextareaRef.current.textContent = "";
    savedRangeRef.current = null;
    if (id !== "new") {
      // No `chat` param → showChat stays false so the empty composer shows
      // instead of the conversation bubbles. beginConversation mints the id
      // once the first message is sent.
      pendingChatIdRef.current = null;
      router.push(`/agent/${id}?name=${encodeURIComponent(name || "")}&from=chat`);
    } else {
      router.replace("/agent/new");
    }
    setNewChatKey((k) => k + 1);
  }, [id, name, router]);

  const conversationTitle = conversationId
    ? getChatLabel(conversationId)
    : "New conversation";

  // On the new-chat flow there is no agent in the URL, so the "active" agent is
  // whatever the user @-mentioned in the composer. Its name titles the header
  // and its apps scope the tools menu.
  const newChatWorkflows = isNewChat
    ? selectedWorkflows
        .map((sw) => ALL_WORKFLOWS.find((w) => w.id === sw.id))
        .filter((w): w is Workflow => Boolean(w))
    : [];
  const newChatAgentApps = newChatWorkflows.length
    ? Array.from(new Set(newChatWorkflows.flatMap((w) => w.apps)))
    : undefined;

  const currentAgentName =
    id === "new"
      ? newChatWorkflows.length === 1
        ? newChatWorkflows[0].name
        : newChatWorkflows.length > 1
          ? `${newChatWorkflows[0].name} +${newChatWorkflows.length - 1}`
          : "New conversation"
      : name || "Select an agent";
  const otherAgents = AGENT_DIRECTORY.filter((agent) => agent.id !== id);

  const renderChatHeader = () => (
    <header className="flex h-12 shrink-0 items-center gap-1 px-3">
      <Link
        href={isNewChat ? "/agent/new" : "/agents"}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground"
        title={isNewChat ? "New chat" : "Back to agents"}
      >
        <ChevronLeftIcon className="size-4 shrink-0" />
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            <span className="min-w-0 truncate">{currentAgentName}</span>
            <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <div className="max-h-72 overflow-y-auto py-1">
            {otherAgents.map((agent) => (
              <DropdownMenuItem
                key={agent.id}
                onClick={() =>
                  router.push(`/agent/${agent.id}?name=${encodeURIComponent(agent.name)}`)
                }
                className="flex items-center gap-2"
              >
                {getAgentIcon(agent.id, "size-4 shrink-0 text-muted-foreground")}
                <span className="truncate">{agent.name}</span>
                {agent.favorite && (
                  <StarIcon className="ml-auto size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/agents")} className="flex items-center gap-2">
            <span>Browse more agents</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );

  const filtered = MOCK_CONVERSATIONS.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chatComposer = (centered: boolean) => (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", centered && "justify-center items-center px-4 pb-4")}>
      <div className={cn("flex w-full flex-col gap-6", centered ? "max-w-[48rem] items-center text-center" : "")}>
        {centered && (
          <h2 className="text-2xl font-medium leading-none">
            Hey David, how can I help?
          </h2>
        )}
        <div className={cn("w-full", centered ? "" : "px-4 pb-4 pt-2")}>
          <div className={cn(
            "flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/30",
            !centered && "mx-auto max-w-[48rem]"
          )}>
            <button type="button" className={cn(toolbarBtn, "mb-0.5")} title="Attach file">
              <PaperclipIcon className={toolbarIcon} />
            </button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message…"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  beginConversation(message);
                }
              }}
              className="min-h-[32px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={() => beginConversation(message)}
              className={cn(
                "mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                message.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground"
              )}
              title="Send"
            >
              <ArrowUpIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const recentChats = [...extraRecentChats, ...MOCK_RECENT_CHATS];

  const FAVOURITE_CHAT_AGENTS = [
    { id: "5", name: "Campaign Writer", description: "Creates compelling marketing copy tailored to your audience.", labels: ["Marketing", "Content"], integrations: ["slack", "figma"], runsCount: 1532 },
    { id: "9", name: "Sales Forecaster", description: "Evaluates opportunities and provides win probability scores.", labels: ["Analytics", "Sales"], integrations: ["gmail", "figma", "notion"], runsCount: 1024 },
    { id: "11", name: "Customer Support Bot", description: "Handles inquiries and provides instant, accurate responses.", labels: ["Support", "Chat"], integrations: ["slack", "connector", "notion"], runsCount: 1893 },
  ];

  /* ── New Chat ── */
  if (isNewChat) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-muted" key={id}>
        <AgentSidebar
          selectedCategory="all"
          onCategoryChange={() => router.push("/agents")}
          categories={[
            { id: "work", label: "Engineering" },
            { id: "marketing", label: "Growth" },
            { id: "sales", label: "Revenue" },
          ]}
          organisationName="StackAI Internal"
          userName="David Hidalgo"
          onNewChat={handleNewChat}
          activeChatId={conversationId}
        />
        <div
          key={newChatKey}
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background"
        >
          {showChat ? (
            /* ── After first message: chat view ── */
            <>
              <div className="relative z-10">{renderChatHeader()}</div>
              <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
                <ChatThread chatId={conversationId!} agentName="Assistant" />
              </div>
              <div className="shrink-0 px-4 pb-4 pt-2">
                <div className="mx-auto max-w-[48rem] flex flex-col rounded-xl border border-border bg-background px-3 pt-3 pb-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a message…"
                    rows={3}
                    className="min-h-[72px] w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center gap-1 pt-2">
                    <AttachMenu uploadOnly={newChatAgentApps != null} />
                    <ToolsMenu toggles={toolToggles} onToggle={(key) => setToolToggles((prev) => ({ ...prev, [key]: !prev[key] }))} connectedConnectors={connectedConnectors} onConnectorChange={setConnectedConnectors} onOpenMoreApps={() => setMoreAppsOpen(true)} side="top" agentApps={newChatAgentApps} />
                    <PromptsMenu onSelect={applyPrompt} side="top" />
                    <div className="ml-auto flex items-center gap-0.5">
                      <button type="button" className={toolbarBtn} title="Voice input">
                        <MicIcon className={toolbarIcon} />
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          message.trim()
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted text-muted-foreground"
                        )}
                        title="Send"
                      >
                        <ArrowUpIcon className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── Before first message: scrollable landing ── */
            <>
              <div
                aria-hidden
                className="dotted-backdrop pointer-events-none absolute inset-0"
              />
              <div className="relative flex flex-1 flex-col overflow-y-auto gap-6">
              {/* Greeting + composer */}
              <div className="flex w-full shrink-0 flex-col items-center px-4 pt-[24vh] pb-10">
                <div className="mx-auto w-full max-w-[48rem] flex flex-col items-center gap-10 text-center">
                  <div className="flex flex-col gap-1.5">
                    <h1 className="text-[2rem] font-bold tracking-tight leading-none text-foreground">
                      Hey David, what can I help with?
                    </h1>
                  </div>
                  <div className="w-full">
                    <div
                      className="relative z-10 flex flex-col rounded-2xl border border-black/10 bg-background transition-shadow"
                      style={{
                        boxShadow:
                          "0 4px 24px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div className="px-4 pt-4 pb-3">
                        <div
                          ref={mentionTextareaRef}
                          contentEditable
                          suppressContentEditableWarning
                          role="textbox"
                          aria-multiline="true"
                          data-placeholder="Ask, create, explore — use @ to mention agents and people"
                          onInput={(e) => setMessage(e.currentTarget.innerText)}
                          onKeyUp={saveSelection}
                          onMouseUp={saveSelection}
                          onKeyDown={handleComposerKeyDown}
                          className="composer-editable min-h-[72px] w-full whitespace-pre-wrap break-words bg-transparent text-left text-sm outline-none leading-relaxed"
                        />
                        <div className="flex items-center gap-1 pt-1">
                          {/* Left toolbar */}
                          <div className="flex items-center gap-0.5">
                            <AttachMenu />
                            <ToolsMenu toggles={toolToggles} onToggle={(key) => setToolToggles((prev) => ({ ...prev, [key]: !prev[key] }))} connectedConnectors={connectedConnectors} onConnectorChange={setConnectedConnectors} onOpenMoreApps={() => setMoreAppsOpen(true)} side="bottom" />
                            <WorkflowMentionMenu
                              search={workflowSearch}
                              onSearchChange={setWorkflowSearch}
                              tab={workflowTab}
                              onTabChange={setWorkflowTab}
                              selectedIds={selectedWorkflows.map((w) => w.id)}
                              onSelect={handleSelectWorkflow}
                              onTrigger={openMentionMenu}
                              autoSelect={autoSelectWorkflow}
                              onAutoSelectChange={setAutoSelectWorkflow}
                              side="bottom"
                              open={mentionMenuOpen}
                              onOpenChange={setMentionMenuOpen}
                              anchor={mentionAnchor}
                            />
                            <PromptsMenu onSelect={applyPrompt} side="bottom" />
                          </div>
                          {/* Right toolbar */}
                          <div className="ml-auto flex items-center gap-0.5">
                            <button type="button" className={toolbarBtn} title="Voice input">
                              <MicIcon className={toolbarIcon} />
                            </button>
                            <button
                              type="button"
                              onClick={() => beginConversation(mentionTextareaRef.current?.innerText ?? message)}
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                                message.trim()
                                  ? "bg-foreground text-background hover:bg-foreground/90"
                                  : "bg-muted text-muted-foreground"
                              )}
                              title="Send"
                            >
                              <ArrowUpIcon className="size-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Unlock tools banner */}
                    <div className="-mt-3 flex cursor-pointer items-center gap-3 rounded-b-xl border-x border-b border-black/5 bg-muted/40 px-4 pb-2.5 pt-5 hover:bg-muted/60 transition-colors" onClick={() => setMoreAppsOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setMoreAppsOpen(true)}>
                      <span className="text-xs text-muted-foreground shrink-0">Unlock more by connecting your tools</span>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <div className="size-6 rounded-md border bg-background flex items-center justify-center overflow-hidden" title="Google Drive">
                          <svg viewBox="0 0 87.3 78" className="size-3.5"><path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="M43.65 25 29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H60l5.85 11.65z" fill="#ea4335"/><path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.1.45-4.5 1.2z" fill="#00832d"/><path d="M60.1 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.1-.45 4.5-1.2z" fill="#2684fc"/><path d="M73.4 26.5l-12.6-21.8c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.45 28H87.3c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/></svg>
                        </div>
                        <div className="size-6 rounded-md border bg-background flex items-center justify-center overflow-hidden" title="Slack">
                          <svg viewBox="0 0 124 124" className="size-3.5"><path d="M26.3 78.9c0 7.2-5.8 13-13 13S.3 86.1.3 78.9s5.8-13 13-13h13v13z" fill="#e01e5a"/><path d="M32.8 78.9c0-7.2 5.8-13 13-13s13 5.8 13 13v32.5c0 7.2-5.8 13-13 13s-13-5.8-13-13V78.9z" fill="#e01e5a"/><path d="M45.8 26.4c-7.2 0-13-5.8-13-13s5.8-13 13-13 13 5.8 13 13v13h-13z" fill="#36c5f0"/><path d="M45.8 32.9c7.2 0 13 5.8 13 13s-5.8 13-13 13H13.3c-7.2 0-13-5.8-13-13s5.8-13 13-13h32.5z" fill="#36c5f0"/><path d="M98.3 45.9c0-7.2 5.8-13 13-13s13 5.8 13 13-5.8 13-13 13h-13v-13z" fill="#2eb67d"/><path d="M91.8 45.9c0 7.2-5.8 13-13 13s-13-5.8-13-13V13.4c0-7.2 5.8-13 13-13s13 5.8 13 13v32.5z" fill="#2eb67d"/><path d="M78.8 98.4c7.2 0 13 5.8 13 13s-5.8 13-13 13-13-5.8-13-13v-13h13z" fill="#ecb22e"/><path d="M78.8 91.9c-7.2 0-13-5.8-13-13s5.8-13 13-13h32.5c7.2 0 13 5.8 13 13s-5.8 13-13 13H78.8z" fill="#ecb22e"/></svg>
                        </div>
                        <div className="size-6 rounded-md border bg-background flex items-center justify-center overflow-hidden" title="Notion">
                          {integrationIcons.notion}
                        </div>
                        <button type="button" className="ml-1 text-muted-foreground/50 hover:text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>
                          <XIcon className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Prompt examples */}
                  <div className="mt-6 w-full">
                    {HOME_PROMPT_EXAMPLES.map((example, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setMessage(example.text);
                          if (mentionTextareaRef.current) {
                            mentionTextareaRef.current.textContent = example.text;
                            mentionTextareaRef.current.focus();
                          }
                          if (example.app) {
                            setConnectedConnectors([example.app]);
                          }
                          if (example.agentId) {
                            const workflow = ALL_WORKFLOWS.find((w) => w.id === example.agentId);
                            if (workflow) handleSelectWorkflow(workflow);
                          }
                        }}
                        className="flex w-full items-center gap-3 border-t border-border/60 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                      >
                        <span className="flex size-4 shrink-0 items-center justify-center">{example.icon}</span>
                        <span className="truncate">{example.text}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => router.push("/agents")}
                      className="flex w-full items-center gap-3 border-t border-border/60 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                    >
                      <MoreHorizontalIcon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">Connect your apps for better answers</span>
                      <ArrowRightIcon className="size-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent chats + favorites — part of the same scroll */}
              <div className="mx-auto w-full max-w-[48rem] pb-12 space-y-10">

                {/* Favourite agents */}
                <div className="space-y-6">
                  <header className="flex items-center gap-2">
                    <ChevronDownIcon className="size-4 text-muted-foreground" />
                    <h2 className="font-medium">Favourite agents</h2>
                    <span className="text-xs text-muted-foreground">({FAVOURITE_CHAT_AGENTS.length})</span>
                  </header>
                  <div className="grid grid-cols-2 gap-6">
                    {FAVOURITE_CHAT_AGENTS.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        name={agent.name}
                        description={agent.description}
                        interfaceType="Chat"
                        labels={agent.labels}
                        integrations={agent.integrations}
                        runsCount={agent.runsCount}
                        hideFavorite
                        className="bg-transparent"
                        onStart={() =>
                          router.push(
                            `/agent/${agent.id}?name=${encodeURIComponent(agent.name)}&description=${encodeURIComponent(agent.description)}`
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* All agents link */}
                <div className="flex justify-center pb-4">
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Browse all agents
                  </Link>
                </div>

              </div>
              </div>
            </>
          )}
        </div>
        <MoreAppsDialog
          open={moreAppsOpen}
          onOpenChange={setMoreAppsOpen}
          connectedConnectors={connectedConnectors}
          onConnectorChange={setConnectedConnectors}
        />
      </div>
    );
  }

  /* ── Named agent chat page ── */
  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted" key={id}>
      <AgentSidebar
        selectedCategory="all"
        onCategoryChange={() => router.push("/agents")}
        categories={[
          { id: "work", label: "Engineering" },
          { id: "marketing", label: "Growth" },
          { id: "sales", label: "Revenue" },
        ]}
        organisationName="StackAI Internal"
        userName="David Hidalgo"
        onNewChat={handleNewChat}
        activeChatId={conversationId}
        filterAgentId={id}
      />

      {/* Chat panel */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {!showChat && (
          <div
            aria-hidden
            className="dotted-backdrop pointer-events-none absolute inset-0"
          />
        )}
        <div className="relative z-10">{renderChatHeader()}</div>

        {/* Chat area */}
        <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
          {showChat ? (
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
              <ChatThread chatId={conversationId!} agentName={name} />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-4 pb-4">
              <div className="relative flex w-full max-w-[48rem] flex-col items-center gap-6 text-center">
                <div className="flex size-14 items-center justify-center rounded-xl border border-border bg-muted/60">
                  {getAgentIcon(id, "size-7 text-muted-foreground")}
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-medium leading-none">{name}</h2>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>

                <div className="w-full">
                  <div className="flex flex-col rounded-2xl border border-border bg-background px-4 pt-4 pb-3 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-shadow focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.06)]">
                    <div
                      ref={mentionTextareaRef}
                      contentEditable
                      suppressContentEditableWarning
                      role="textbox"
                      aria-multiline="true"
                      data-placeholder="Ask, create, explore — use @ to mention agents and people"
                      onInput={(e) => setMessage(e.currentTarget.innerText)}
                      onKeyUp={saveSelection}
                      onMouseUp={saveSelection}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          beginConversation(mentionTextareaRef.current?.innerText ?? message);
                        }
                      }}
                      className="composer-editable min-h-[72px] w-full whitespace-pre-wrap break-words bg-transparent text-left text-sm outline-none leading-relaxed"
                    />
                    <div className="flex items-center gap-1 pt-1">
                      <AttachMenu uploadOnly />
                      <ToolsMenu toggles={toolToggles} onToggle={(key) => setToolToggles((prev) => ({ ...prev, [key]: !prev[key] }))} connectedConnectors={connectedConnectors} onConnectorChange={setConnectedConnectors} onOpenMoreApps={() => setMoreAppsOpen(true)} side="bottom" agentApps={getAgentApps(id)} />
                      <PromptsMenu onSelect={applyPrompt} side="bottom" />
                      <div className="ml-auto flex items-center gap-0.5">
                        <button type="button" className={toolbarBtn} title="Voice input">
                          <MicIcon className={toolbarIcon} />
                        </button>
                        <button
                          type="button"
                          onClick={() => beginConversation(mentionTextareaRef.current?.innerText ?? message)}
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                            message.trim()
                              ? "bg-foreground text-background hover:bg-foreground/90"
                              : "bg-muted text-muted-foreground"
                          )}
                          title="Send"
                        >
                          <ArrowUpIcon className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2">
                  {MOCK_SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setMessage(suggestion);
                        if (mentionTextareaRef.current) {
                          mentionTextareaRef.current.textContent = suggestion;
                          mentionTextareaRef.current.focus();
                        }
                      }}
                      className="flex w-full items-start gap-2 rounded-xl border border-border/60 px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                    >
                      <ArrowUpIcon className="mt-0.5 size-4 shrink-0" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showChat && (
            <div className="shrink-0 px-4 pb-4 pt-2">
              <div className="mx-auto max-w-[48rem] flex flex-col rounded-xl border border-border bg-background px-3 pt-3 pb-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message…"
                  rows={3}
                  className="min-h-[72px] w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <div className="flex items-center gap-1 pt-2">
                  <AttachMenu uploadOnly />
                  <ToolsMenu toggles={toolToggles} onToggle={(key) => setToolToggles((prev) => ({ ...prev, [key]: !prev[key] }))} connectedConnectors={connectedConnectors} onConnectorChange={setConnectedConnectors} onOpenMoreApps={() => setMoreAppsOpen(true)} side="top" agentApps={getAgentApps(id)} />
                  <PromptsMenu onSelect={applyPrompt} side="top" />
                  <div className="ml-auto flex items-center gap-0.5">
                    <button type="button" className={toolbarBtn} title="Voice input">
                      <MicIcon className={toolbarIcon} />
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        message.trim()
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground"
                      )}
                      title="Send"
                    >
                      <ArrowUpIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <MoreAppsDialog
        open={moreAppsOpen}
        onOpenChange={setMoreAppsOpen}
        connectedConnectors={connectedConnectors}
        onConnectorChange={setConnectedConnectors}
      />
    </div>
  );
}
