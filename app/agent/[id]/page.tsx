"use client";

import React, { useState, useRef, useEffect, useCallback, cloneElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
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
  WorkflowIcon,
  MicIcon,
  UploadIcon,
  DatabaseIcon,
  WrenchIcon,
  FlaskConicalIcon,
  FileTextIcon,
  LineChartIcon,
  ExternalLinkIcon,
  CheckIcon,
  SparklesIcon,
  PuzzleIcon,
  StarIcon,
  ListPlusIcon,
  InfoIcon,
  HexagonIcon,
  AsteriskIcon,
  GemIcon,
  InfinityIcon,
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
  type ChatMessage,
} from "@/lib/chats-data";
import { getAgentIcon } from "@/lib/agent-icons";
import { AGENT_DIRECTORY, getAgentApps, getAppLabel } from "@/lib/agents-data";
import { integrationIcons } from "@/lib/integration-icons";
import { ALL_WORKFLOWS, type Workflow } from "@/lib/workflows-data";
import { AgentSidebar } from "@/components/agent-sidebar";
import { AgentCard } from "@/components/agent-card";
import { ConnectionSetupModal } from "@/components/connection-setup-modal";
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
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DEFAULT_DESCRIPTION =
  "What does your application do? How does it behave? How should the user interact with it?";

const MOCK_CONVERSATIONS = [
  { id: "conv1", title: "Summarize the Q2 volume report", time: "2h ago" },
  { id: "conv2", title: "Draft a delivery delay notification", time: "Yesterday" },
  { id: "conv3", title: "Analyze at-risk shipper accounts", time: "2d ago" },
  { id: "conv4", title: "Explain our Ground vs. Express pricing", time: "3d ago" },
  { id: "conv5", title: "Compare carrier SLA performance", time: "Last week" },
];

const MOCK_SUGGESTIONS = [
  "How can I get started with this agent?",
  "What are the main capabilities available?",
  "Show me an example of what you can do",
];

const HOME_PROMPT_EXAMPLES: { icon: React.ReactNode; text: string; app?: string; badge?: number; agentId?: string }[] = [
  { icon: integrationIcons.sharepoint, text: "Summarize the Memphis hub SOPs in SharePoint", app: "sharepoint" },
  { icon: integrationIcons.salesforce, text: "Pull at-risk shipper accounts from Salesforce", app: "salesforce" },
  { icon: <LineChartIcon className="size-4 text-muted-foreground" />, text: "Forecast next week's package volume by lane", agentId: "wf-3" },
  { icon: integrationIcons.teams, text: "Draft a weekly service alert for the ops channel in Teams", app: "teams" },
  { icon: integrationIcons.outlook, text: "Reply to a shipper escalation in my Outlook", app: "outlook", badge: 31 },
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

const TOOL_TOGGLE_ITEMS: { key: keyof ToolToggles; label: string; icon: React.ElementType }[] = [];

const CONNECTOR_ITEMS = [
  { id: "slack", label: "Slack" },
  { id: "gmail", label: "Gmail" },
  { id: "notion", label: "Notion" },
  { id: "dropbox", label: "Dropbox" },
  { id: "gdrive", label: "Google Drive" },
  { id: "outlook", label: "Outlook" },
  { id: "github", label: "GitHub" },
  { id: "linear", label: "Linear" },
  { id: "asana", label: "Asana" },
  { id: "snowflake", label: "Snowflake" },
  { id: "excel", label: "Excel" },
  { id: "sharepoint", label: "SharePoint" },
  { id: "teams", label: "Microsoft Teams" },
  { id: "hubspot", label: "HubSpot" },
  { id: "salesforce", label: "Salesforce" },
  { id: "jira", label: "Jira" },
  { id: "airtable", label: "Airtable" },
  { id: "confluence", label: "Confluence" },
  { id: "intercom", label: "Intercom" },
  { id: "figma", label: "Figma" },
];

// Keyword aliases that make apps discoverable by what they do, not just their
// brand name — e.g. typing "email" surfaces both Gmail and Outlook. Folded into
// every connector search so it works in the "@" menu and inline app search.
const APP_SEARCH_ALIASES: Record<string, string> = {
  gmail: "email mail inbox message",
  outlook: "email mail inbox message",
  slack: "message chat dm",
  gdrive: "file files document storage google drive",
  dropbox: "file files document storage",
  notion: "docs notes wiki",
  github: "code repo repository pull request",
  linear: "issue ticket bug",
  asana: "task project",
  snowflake: "database sql warehouse",
  excel: "spreadsheet xlsx microsoft",
  sharepoint: "microsoft file files docs",
  teams: "microsoft chat message meeting",
  hubspot: "crm sales marketing",
  salesforce: "crm sales sfdc",
  jira: "issue ticket bug atlassian",
  airtable: "database spreadsheet base",
  confluence: "wiki docs atlassian",
  intercom: "support chat customer",
  figma: "design",
};

// The full searchable string for a connector: its label, id, and any aliases.
function connectorSearchText(item: { id: string; label: string }) {
  return `${item.label} ${item.id} ${APP_SEARCH_ALIASES[item.id] ?? ""}`;
}

// Standalone keywords the inline app search should trigger on even though they
// aren't an app name — each resolves to the alias-matched apps in the panel.
const APP_SEARCH_KEYWORDS = ["email", "mail", "inbox"];

const DROPDOWN_OPTION_SELECTOR =
  '[data-app-tool-suggestion], [data-slot="dropdown-menu-item"], [data-slot="dropdown-menu-sub-trigger"]';

function getFocusableDropdownOptions(root: ParentNode) {
  return Array.from(root.querySelectorAll<HTMLElement>(DROPDOWN_OPTION_SELECTOR))
    .filter((option) =>
      option.getAttribute("aria-disabled") !== "true" &&
      option.getAttribute("data-disabled") !== "true"
    );
}

function focusDropdownOption(root: ParentNode, direction: 1 | -1 = 1) {
  const options = getFocusableDropdownOptions(root);
  if (!options.length) return false;

  const activeIndex = options.indexOf(document.activeElement as HTMLElement);
  const nextIndex =
    activeIndex === -1
      ? direction === 1
        ? 0
        : options.length - 1
      : (activeIndex + direction + options.length) % options.length;

  options[nextIndex]?.focus();
  return true;
}

function kbIcon(iconType: string) {
  if (iconType === "drive") {
    return (
      <svg className="size-4 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
        <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
        <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
        <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
        <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
        <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
      </svg>
    );
  }
  if (iconType === "gmail") {
    return (
      <svg className="size-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.364l-6.545-4.636v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.273l8.073-5.782C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/>
        <path d="M0 5.457v13.909c0 .904.732 1.636 1.636 1.636h3.819V11.73L12 16.364V9.273L3.927 3.493C2.309 2.28 0 3.434 0 5.457z" fill="#34A853"/>
        <path d="M18.545 20.998h3.819c.904 0 1.636-.732 1.636-1.636V11.73l-5.455 3.817z" fill="#4285F4"/>
        <path d="M5.455 20.998H1.636A1.636 1.636 0 0 1 0 19.362V11.73l5.455 3.817z" fill="#FBBC05"/>
      </svg>
    );
  }
  return <DatabaseIcon className="size-4 shrink-0 text-muted-foreground" />;
}

function createKnowledgeBaseIconNode(iconType: string) {
  const icon = document.createElement("span");
  icon.className = "inline-flex size-3.5 shrink-0 items-center justify-center align-middle";

  if (iconType === "drive") {
    icon.innerHTML = `
      <svg class="size-3.5 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"></path>
        <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"></path>
        <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"></path>
        <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"></path>
        <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"></path>
        <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"></path>
      </svg>
    `;
    return icon;
  }

  if (iconType === "gmail") {
    icon.innerHTML = `
      <svg class="size-3.5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.364l-6.545-4.636v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.273l8.073-5.782C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"></path>
        <path d="M0 5.457v13.909c0 .904.732 1.636 1.636 1.636h3.819V11.73L12 16.364V9.273L3.927 3.493C2.309 2.28 0 3.434 0 5.457z" fill="#34A853"></path>
        <path d="M18.545 20.998h3.819c.904 0 1.636-.732 1.636-1.636V11.73l-5.455 3.817z" fill="#4285F4"></path>
        <path d="M5.455 20.998H1.636A1.636 1.636 0 0 1 0 19.362V11.73l5.455 3.817z" fill="#FBBC05"></path>
      </svg>
    `;
    return icon;
  }

  icon.innerHTML = `
    <svg class="size-3.5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"></path>
      <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"></path>
    </svg>
  `;
  return icon;
}

// Shared props for the "+" add-menu that consolidates Attach, Tools, Agents and
// Prompts. Sub-sections that used to be their own toolbar buttons are now
// submenus.
type AddMenuProps = {
  uploadOnly?: boolean;
  toggles: ToolToggles;
  onToggle: (key: keyof ToolToggles) => void;
  connectedConnectors: string[];
  onConnectorChange: (ids: string[]) => void;
  onActiveAppsChange?: (ids: string[]) => void;
  onRequestConnect?: (id: string) => void;
  onOpenMoreApps: () => void;
  side?: "top" | "bottom";
  /**
   * When provided, the Tools submenu is scoped to a single agent's workflow: it
   * shows only these apps and hides the generic tool toggles, "Create document"
   * and "More apps" entries.
   */
  agentApps?: string[];
  /** Apps loaded ad-hoc for this chat (e.g. from a suggested prompt). */
  activeApps?: string[];
  /** Knowledge bases currently added to the chat. */
  selectedKnowledgeBases?: string[];
  onKnowledgeBaseChange?: (ids: string[]) => void;
  onSelectPrompt: (text: string) => void;
  /** Fallback used by anchored/search flows to open the separate mention menu. */
  onAgentsClick?: (rect: DOMRect) => void;
  agentsAutoSelect?: boolean;
  workflowSearch?: string;
  onWorkflowSearchChange?: (value: string) => void;
  workflowTab?: "recent" | "all" | "favorites";
  onWorkflowTabChange?: (value: "recent" | "all" | "favorites") => void;
  selectedWorkflowIds?: string[];
  onSelectWorkflow?: (workflow: Workflow) => void;
  onAutoSelectWorkflowChange?: (value: boolean) => void;
  onSelectConnectorMention?: (id: string, label: string) => void;
  onSelectKnowledgeBaseMention?: (id: string) => void;
  searchValue?: string;
  hideSearchInput?: boolean;
  hideConnectedApps?: boolean;
  hideConnectorSelectedState?: boolean;
  closeOnAction?: boolean;
  onRequestClose?: () => void;
};

function hasAddMenuSearchResults({
  search,
  uploadOnly = false,
  agentApps,
  hideConnectedApps = false,
  hasAgentsEntry = false,
  hasAgentsPicker = false,
}: {
  search: string;
  uploadOnly?: boolean;
  agentApps?: string[];
  hideConnectedApps?: boolean;
  hasAgentsEntry?: boolean;
  hasAgentsPicker?: boolean;
}) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return true;

  const matchesSearch = (value: string) =>
    value.toLowerCase().includes(normalizedSearch);
  const connectorItems = agentApps
    ? agentApps.map((id) => ({ id, label: getAppLabel(id) }))
    : CONNECTOR_ITEMS;

  if (uploadOnly) return matchesSearch("upload file files knowledge");

  return (
    TOOL_TOGGLE_ITEMS.some((item) => matchesSearch(item.label)) ||
    connectorItems.some((item) => matchesSearch(connectorSearchText(item))) ||
    KNOWLEDGE_BASES.some((kb) => matchesSearch(kb.name)) ||
    (!hideConnectedApps &&
      CONNECTED_APPS.some((app) => matchesSearch(`${app.name} ${app.id}`))) ||
    SAVED_PROMPTS.some((prompt) => matchesSearch(`${prompt.title} ${prompt.text}`)) ||
    matchesSearch("upload file files knowledge") ||
    (hasAgentsPicker &&
      ALL_WORKFLOWS.some((workflow) =>
        matchesSearch(
          `${workflow.name} ${workflow.description} ${workflow.tags.join(" ")}`
        )
      )) ||
    ((hasAgentsEntry || hasAgentsPicker) && matchesSearch("agents"))
  );
}

// The menu body, reused by both the "+" toolbar button (AddMenu) and the
// caret-anchored "@" menu (AddMenuAnchored). getAgentsRect supplies the anchor
// used when opening the Agents mention menu.
function AddMenuContent({
  uploadOnly = false,
  toggles,
  onToggle,
  connectedConnectors,
  onConnectorChange,
  onActiveAppsChange,
  onRequestConnect,
  onOpenMoreApps,
  side = "bottom",
  agentApps,
  activeApps,
  onSelectPrompt,
  selectedKnowledgeBases = [],
  onKnowledgeBaseChange,
  onAgentsClick,
  agentsAutoSelect = false,
  workflowSearch = "",
  onWorkflowSearchChange,
  workflowTab = "recent",
  onWorkflowTabChange,
  selectedWorkflowIds = [],
  onSelectWorkflow,
  onAutoSelectWorkflowChange,
  onSelectConnectorMention,
  onSelectKnowledgeBaseMention,
  searchValue,
  hideSearchInput = false,
  hideConnectedApps = false,
  hideConnectorSelectedState = false,
  closeOnAction = false,
  onRequestClose,
  getAgentsRect,
}: AddMenuProps & { getAgentsRect: () => DOMRect | undefined }) {
  const [menuSearch, setMenuSearch] = useState("");
  const [autoSelectSkill, setAutoSelectSkill] = useState(false);
  const menuSearchRef = useRef<HTMLInputElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchValue !== undefined) {
      setMenuSearch(searchValue);
    }
  }, [searchValue]);

  // Only agent workflows scope the Tools submenu. Pending apps still show as
  // toolbar chips, but the user can keep adding other tools from the full list.
  const scopedApps = agentApps ?? null;
  const isAgentScoped = scopedApps != null;
  const connectorItems = isAgentScoped
    ? scopedApps.map((id) => ({ id, label: getAppLabel(id) }))
    : CONNECTOR_ITEMS;
  const normalizedSearch = menuSearch.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;
  const matchesSearch = (value: string) =>
    value.toLowerCase().includes(normalizedSearch);
  const searchedToolToggles = TOOL_TOGGLE_ITEMS.filter((item) =>
    matchesSearch(item.label)
  );
  const searchedConnectors = connectorItems.filter((item) =>
    matchesSearch(connectorSearchText(item))
  );
  const searchedKnowledgeBases = KNOWLEDGE_BASES.filter((kb) =>
    matchesSearch(kb.name)
  );
  const searchedConnectedApps = hideConnectedApps
    ? []
    : CONNECTED_APPS.filter((app) => matchesSearch(`${app.name} ${app.id}`));
  const searchedPrompts = SAVED_PROMPTS.filter((prompt) =>
    matchesSearch(`${prompt.title} ${prompt.text}`)
  );
  const hasUploadMatch = matchesSearch("upload file files knowledge");
  const hasAgentsPicker = Boolean(
    onSelectWorkflow &&
      onWorkflowSearchChange &&
      onWorkflowTabChange &&
      onAutoSelectWorkflowChange
  );
  const searchedWorkflows = hasAgentsPicker
    ? ALL_WORKFLOWS.filter((workflow) =>
        matchesSearch(
          `${workflow.name} ${workflow.description} ${workflow.tags.join(" ")}`
        )
      )
    : [];
  const hasSearchResults = uploadOnly
    ? hasUploadMatch
    : searchedToolToggles.length > 0 ||
      searchedConnectors.length > 0 ||
      searchedKnowledgeBases.length > 0 ||
      searchedConnectedApps.length > 0 ||
      searchedWorkflows.length > 0 ||
      searchedPrompts.length > 0 ||
      hasUploadMatch ||
      ((onAgentsClick || hasAgentsPicker) && matchesSearch("agents"));

  const toggleConnector = (id: string) => {
    if (!connectedConnectors.includes(id)) {
      if (onActiveAppsChange) {
        onActiveAppsChange(
          activeApps?.includes(id)
            ? activeApps.filter((existing) => existing !== id)
            : [...(activeApps ?? []), id]
        );
        return;
      }
      onRequestConnect?.(id);
      return;
    }
    onConnectorChange(
      connectedConnectors.filter((existing) => existing !== id)
    );
  };

  const selectConnector = (id: string, label: string) => {
    if (onSelectConnectorMention) {
      const alreadyActive =
        connectedConnectors.includes(id) || (activeApps?.includes(id) ?? false);
      if (!alreadyActive) {
        toggleConnector(id);
      }
      onSelectConnectorMention(id, label);
      return;
    }

    toggleConnector(id);
  };

  const toggleKnowledgeBase = (id: string) => {
    onKnowledgeBaseChange?.(
      selectedKnowledgeBases.includes(id)
        ? selectedKnowledgeBases.filter((existing) => existing !== id)
        : [...selectedKnowledgeBases, id]
    );
  };

  const selectKnowledgeBase = (id: string) => {
    if (onSelectKnowledgeBaseMention) {
      onSelectKnowledgeBaseMention(id);
      return;
    }

    toggleKnowledgeBase(id);
  };

  const closeAfterAction = () => {
    if (closeOnAction) {
      onRequestClose?.();
    }
  };

  const runAction = (action?: () => void) => {
    action?.();
    closeAfterAction();
  };

  return (
      <DropdownMenuContent
        ref={menuContentRef}
        data-add-menu-content
        side={side}
        align="start"
        className="w-72 p-1"
        onKeyDownCapture={(event) => {
          if (event.key !== "Tab") return;
          if (focusDropdownOption(menuContentRef.current ?? event.currentTarget, event.shiftKey ? -1 : 1)) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onCloseAutoFocus={(event) => {
          setMenuSearch("");
          if (hideSearchInput) event.preventDefault();
        }}
      >
        {!hideSearchInput && (
          <div className="sticky top-0 z-10 bg-popover">
            <div className="flex h-9 items-center gap-2 rounded-lg px-2 text-muted-foreground">
              <SearchIcon className="size-4 shrink-0" />
              <input
                ref={menuSearchRef}
                autoFocus
                value={menuSearch}
                onChange={(event) => setMenuSearch(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder="Search..."
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                autoComplete="off"
              />
              {menuSearch && (
                <button
                  type="button"
                  className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setMenuSearch("")}
                  aria-label="Clear search"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {isSearching ? (
          <div className="max-h-80 overflow-y-auto">
            {!hasSearchResults && (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No options found
              </div>
            )}

            {hasUploadMatch && (
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                onClick={() => closeAfterAction()}
              >
                <UploadIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm">Upload file</span>
                <span className="text-xs text-muted-foreground">Files</span>
              </DropdownMenuItem>
            )}

            {!uploadOnly && searchedKnowledgeBases.map((kb) => {
              const isSelected = selectedKnowledgeBases.includes(kb.id);
              return (
                <DropdownMenuItem
                  key={`kb-${kb.id}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => runAction(() => selectKnowledgeBase(kb.id))}
                >
                  {kbIcon(kb.iconType)}
                  <span className="min-w-0 flex-1 truncate text-sm">{kb.name}</span>
                  {isSelected ? (
                    <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Knowledge</span>
                  )}
                </DropdownMenuItem>
              );
            })}

            {!uploadOnly && searchedConnectedApps.map((app) => (
              <DropdownMenuItem
                key={`connected-app-${app.id}`}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                onClick={() => closeAfterAction()}
              >
                <span className="flex size-4 shrink-0 items-center justify-center">{integrationIcons[app.id]}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{app.name}</span>
                <span className="text-xs text-muted-foreground">Connected app</span>
              </DropdownMenuItem>
            ))}

            {!uploadOnly && !isAgentScoped &&
              searchedToolToggles.map(({ key, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={`tool-${key}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => runAction(() => onToggle(key))}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
                  <Checkbox
                    checked={toggles[key]}
                    className="ml-auto"
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => runAction(() => onToggle(key))}
                  />
                </DropdownMenuItem>
              ))}

            {!uploadOnly && searchedConnectors.map((c) => {
              const isSelected =
                !hideConnectorSelectedState &&
                (connectedConnectors.includes(c.id) ||
                  (activeApps?.includes(c.id) ?? false));
              return (
                <DropdownMenuItem
                  key={`connector-${c.id}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => runAction(() => selectConnector(c.id, c.label))}
                  title={c.label}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">{integrationIcons[c.id]}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{c.label}</span>
                  {isSelected ? (
                    <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Tool</span>
                  )}
                </DropdownMenuItem>
              );
            })}

            {!uploadOnly && (onAgentsClick || hasAgentsPicker) && matchesSearch("agents") && (
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                onClick={() => {
                  const rect = getAgentsRect();
                  if (rect && onAgentsClick) setTimeout(() => onAgentsClick(rect), 0);
                  closeAfterAction();
                }}
              >
                <WorkflowIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm">Agents{agentsAutoSelect ? " (Auto)" : ""}</span>
              </DropdownMenuItem>
            )}

            {!uploadOnly && searchedWorkflows.map((workflow) => {
              const isSelected = selectedWorkflowIds.includes(workflow.id);
              const Icon = workflow.icon;
              return (
                <Tooltip key={`workflow-${workflow.id}`} delayDuration={250}>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                      onSelect={(event) => {
                        event.preventDefault();
                        if (!isSelected) {
                          runAction(() => onSelectWorkflow?.(workflow));
                        }
                      }}
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-sm">{workflow.name}</span>
                      {isSelected ? (
                        <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <span className="text-xs text-muted-foreground">Agent</span>
                      )}
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <AgentInfoTooltip workflow={workflow} />
                </Tooltip>
              );
            })}

            {!uploadOnly && searchedPrompts.map((prompt) => (
              <DropdownMenuItem
                key={`prompt-${prompt.id}`}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                onClick={() => runAction(() => onSelectPrompt(prompt.text))}
              >
                <ListPlusIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm">{prompt.title}</span>
                <span className="text-xs text-muted-foreground">Prompt</span>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <>
        {/* ── Files & Knowledge ── */}
        {uploadOnly ? (
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
            onClick={() => closeAfterAction()}
          >
            <UploadIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">Upload file</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 rounded-lg px-2 py-1.5">
              <FolderPlusIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-sm">Files &amp; Knowledge</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64 p-1">
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                onClick={() => closeAfterAction()}
              >
                <UploadIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">Upload file</span>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 rounded-lg px-2 py-1.5">
                  <BookOpenIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm">Add Knowledge Base</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  {KNOWLEDGE_BASES.map((kb) => {
                    const isSelected = selectedKnowledgeBases.includes(kb.id);
                    return (
                      <DropdownMenuItem
                        key={kb.id}
                        className="gap-2"
                        onSelect={(e) => e.preventDefault()}
                        onClick={() => runAction(() => selectKnowledgeBase(kb.id))}
                      >
                        {kbIcon(kb.iconType)}
                        <span className="min-w-0 flex-1 truncate">{kb.name}</span>
                        {isSelected && (
                          <CheckIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2" onClick={() => closeAfterAction()}>
                    <PlusIcon className="size-4" />
                    Create new
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {!hideConnectedApps && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2 rounded-lg px-2 py-1.5">
                    <PlugIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm">Search Connected Apps</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56">
                    {CONNECTED_APPS.map((app) => (
                      <DropdownMenuItem
                        key={app.id}
                        className="gap-2"
                        onClick={() => closeAfterAction()}
                      >
                        {integrationIcons[app.id]}
                        {app.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2" onClick={() => closeAfterAction()}>
                      <PlugIcon className="size-4" />
                      Connect more apps
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {/* ── Tools ── */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-lg px-2 py-1.5">
            <WrenchIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">Tools</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64 p-1">
            {connectorItems.map((c) => {
              const isSelected =
                !hideConnectorSelectedState &&
                (connectedConnectors.includes(c.id) ||
                  (activeApps?.includes(c.id) ?? false));
              return (
                <DropdownMenuItem
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => runAction(() => selectConnector(c.id, c.label))}
                  title={c.label}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">{integrationIcons[c.id]}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{c.label}</span>
                  {isSelected ? (
                    <CheckIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
                  ) : null}
                </DropdownMenuItem>
              );
            })}
            {!isAgentScoped && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground"
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => runAction(() => onOpenMoreApps())}
                >
                  <PlusIcon className="size-4 shrink-0" />
                  <span className="text-sm">More apps</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* ── Skills ── */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-lg px-2 py-1.5">
            <PuzzleIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">Skills</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-72 p-1">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Skills</div>
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">No skills yet</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
              onSelect={(e) => e.preventDefault()}
              onClick={() => setAutoSelectSkill((v) => !v)}
            >
              <SparklesIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm">Auto select skill</span>
              <Checkbox
                checked={autoSelectSkill}
                className="ml-auto"
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => setAutoSelectSkill((v) => !v)}
              />
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* ── Agents ── */}
        {hasAgentsPicker && onWorkflowSearchChange && onWorkflowTabChange && onSelectWorkflow && onAutoSelectWorkflowChange ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 rounded-lg px-2 py-1.5">
              <WorkflowIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-sm">Agents{agentsAutoSelect ? " (Auto)" : ""}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-72 p-0">
              <AgentPickerContent
                search={workflowSearch}
                onSearchChange={onWorkflowSearchChange}
                tab={workflowTab}
                onTabChange={onWorkflowTabChange}
                selectedIds={selectedWorkflowIds}
                onSelect={onSelectWorkflow}
                autoSelect={agentsAutoSelect}
                onAutoSelectChange={onAutoSelectWorkflowChange}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : onAgentsClick ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 rounded-lg px-2 py-1.5">
              <WorkflowIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-sm">Agents{agentsAutoSelect ? " (Auto)" : ""}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-72 p-1">
              <DropdownMenuItem
                className="gap-2"
                onClick={() => {
                  const rect = getAgentsRect();
                  if (rect) setTimeout(() => onAgentsClick(rect), 0);
                  closeAfterAction();
                }}
              >
                <SearchIcon className="size-4" />
                Search agents
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : null}

        <DropdownMenuSeparator />

        {/* ── Saved prompts ── */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-lg px-2 py-1.5">
            <ListPlusIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">Saved prompts</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-72 p-1">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Saved prompts</div>
            {SAVED_PROMPTS.map((prompt) => (
              <DropdownMenuItem
                key={prompt.id}
                className="flex cursor-pointer items-center rounded-lg px-2 py-1.5"
                onClick={() => runAction(() => onSelectPrompt(prompt.text))}
              >
                <span className="text-sm font-medium">{prompt.title}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
          </>
        )}
      </DropdownMenuContent>
  );
}

// Paperclip button next to "+" — opens the OS file picker via a hidden input.
function FileAttachButton({ onFiles }: { onFiles?: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        className={toolbarBtn}
        title="Attach file"
        aria-label="Attach file"
        onClick={() => inputRef.current?.click()}
      >
        <PaperclipIcon className={toolbarIcon} />
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles?.(files);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
    </>
  );
}

type AttachedFile = { id: string; file: File; previewUrl?: string };

function AttachedFilesRow({
  files,
  onRemove,
}: {
  files: AttachedFile[];
  onRemove: (id: string) => void;
}) {
  if (!files.length) return null;
  return (
    <div className="flex flex-wrap gap-2 pb-2">
      {files.map((f) => {
        const isImage = f.file.type.startsWith("image/");
        if (isImage && f.previewUrl) {
          return (
            <div
              key={f.id}
              className="group relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
              title={f.file.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.previewUrl}
                alt={f.file.name}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(f.id)}
                className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-foreground/70 text-background hover:bg-foreground"
                aria-label={`Remove ${f.file.name}`}
              >
                <XIcon className="size-3" />
              </button>
            </div>
          );
        }
        return (
          <div
            key={f.id}
            className="group relative flex h-14 min-w-0 max-w-64 shrink-0 items-center gap-2 rounded-lg border border-border bg-background pl-2 pr-6"
            title={f.file.name}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-red-500 text-white">
              <FileTextIcon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{f.file.name}</span>
              <span className="text-xs uppercase text-muted-foreground">
                {(f.file.name.split(".").pop() || "file").slice(0, 4)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRemove(f.id)}
              className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-foreground/70 text-background hover:bg-foreground"
              aria-label={`Remove ${f.file.name}`}
            >
              <XIcon className="size-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// "+" toolbar button. Opens the add-menu anchored under the button.
function AddMenu(
  props: AddMenuProps & { open?: boolean; onOpenChange?: (open: boolean) => void }
) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <DropdownMenu open={props.open} onOpenChange={props.onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button ref={triggerRef} type="button" className={toolbarBtn} title="Add">
          <PlusIcon className={toolbarIcon} />
        </button>
      </DropdownMenuTrigger>
      <AddMenuContent {...props} getAgentsRect={() => triggerRef.current?.getBoundingClientRect() ?? undefined} />
    </DropdownMenu>
  );
}

// Same menu, but anchored to an arbitrary caret position — used when the user
// types "@" in the composer so the menu opens right next to the "@" character.
function AddMenuAnchored({
  open,
  onOpenChange,
  anchor,
  preserveFocus = true,
  ...props
}: AddMenuProps & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  anchor?: { left: number; top: number } | null;
  preserveFocus?: boolean;
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={!preserveFocus}>
      {/* Invisible anchor positioned at the "@" character. */}
      <DropdownMenuTrigger asChild>
        <span
          aria-hidden
          className="pointer-events-none fixed h-0 w-0"
          style={{ left: anchor?.left ?? 0, top: anchor?.top ?? 0 }}
        />
      </DropdownMenuTrigger>
      <AddMenuContent
        {...props}
        hideSearchInput
        hideConnectedApps
        hideConnectorSelectedState
        closeOnAction
        onRequestClose={() => onOpenChange?.(false)}
        getAgentsRect={() =>
          anchor ? new DOMRect(anchor.left, anchor.top, 0, 0) : undefined
        }
      />
    </DropdownMenu>
  );
}

function AppToolSuggestionPanel({
  anchor,
  searchValue,
  onSelect,
}: {
  anchor?: { left: number; top: number } | null;
  searchValue: string;
  onSelect: (id: string, label: string) => void;
}) {
  const normalizedSearch = searchValue.trim().toLowerCase();
  const matchesSearch = (value: string) =>
    value.toLowerCase().includes(normalizedSearch);
  const suggestions = CONNECTOR_ITEMS.filter((item) =>
    matchesSearch(connectorSearchText(item))
  );

  if (!anchor || suggestions.length === 0) return null;

  return (
    <div
      data-app-tool-suggestion-panel
      className="fixed z-50 max-h-80 w-72 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{ left: anchor.left, top: anchor.top + 4 }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {suggestions.map((item) => (
        <button
          key={item.id}
          type="button"
          data-app-tool-suggestion
          className="flex min-h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm outline-none hover:bg-black/[0.03] focus-visible:bg-black/[0.06] focus-visible:ring-2 focus-visible:ring-ring/30"
          onClick={() => onSelect(item.id, item.label)}
          title={item.label}
        >
          <span className="flex size-4 shrink-0 items-center justify-center">
            {integrationIcons[item.id]}
          </span>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <span className="text-xs text-muted-foreground">Tool</span>
        </button>
      ))}
    </div>
  );
}

// Row of icon chips shown right next to the "+" button for every connector the
// user has added to the chat. Connectors loaded ad-hoc (e.g. from a suggested
// prompt) that aren't connected yet get a pulsing dot. Connector chips open a
// small action menu instead of removing immediately.
function ComposerToolIcons({
  connectedConnectors,
  activeApps = [],
  selectedKnowledgeBases: _selectedKnowledgeBases = [],
  onConnectorChange,
  onActiveAppsChange,
  onEditConnection,
  showConnectionPulse = true,
}: {
  connectedConnectors: string[];
  activeApps?: string[];
  selectedKnowledgeBases?: string[];
  onConnectorChange: (ids: string[]) => void;
  onActiveAppsChange?: (ids: string[]) => void;
  onKnowledgeBaseChange?: (ids: string[]) => void;
  onEditConnection?: (id: string) => void;
  showConnectionPulse?: boolean;
}) {
  const connectorIds = Array.from(new Set([...connectedConnectors, ...activeApps]));

  if (!connectorIds.length) return null;

  // A connector may live in connectedConnectors, activeApps, or both — drop it
  // from wherever it appears.
  const removeConnector = (id: string) => {
    onConnectorChange(connectedConnectors.filter((c) => c !== id));
    onActiveAppsChange?.(activeApps.filter((c) => c !== id));
  };
  return (
    <div className="flex items-center gap-1">
      <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
      {/* Connector tools — tightly-packed icon buttons. */}
      {connectorIds.length > 0 && (
        <div className="flex items-center">
          {connectorIds.map((id) => {
            const icon = integrationIcons[id];
            if (!icon) return null;
            const needsConnection = showConnectionPulse && !connectedConnectors.includes(id);
            return (
              <DropdownMenu key={id}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground"
                    title={`${getAppLabel(id)}${needsConnection ? " (not connected)" : ""}`}
                    aria-label={`${getAppLabel(id)} options`}
                  >
                    <span className="relative flex size-4 shrink-0 items-center justify-center">
                      {cloneElement(
                        icon as React.ReactElement<{ className?: string }>,
                        { className: toolbarIcon }
                      )}
                      {needsConnection && (
                        <span className="absolute -right-1 -top-1 flex size-1.5">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                          <span className="relative inline-flex size-1.5 rounded-full bg-yellow-400" />
                        </span>
                      )}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={8}>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      setTimeout(() => onEditConnection?.(id), 0);
                    }}
                  >
                    Edit Connection
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => removeConnector(id)}
                  >
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </div>
      )}
    </div>
  );
}

const CONNECTED_APPS = [
  { id: "slack", name: "Slack" },
  { id: "notion", name: "Notion" },
  { id: "figma", name: "Figma" },
  { id: "gmail", name: "Gmail" },
  { id: "github", name: "GitHub" },
  { id: "linear", name: "Linear" },
  { id: "asana", name: "Asana" },
  { id: "snowflake", name: "Snowflake" },
];

const APP_SEARCH_TERMS = Array.from(
  new Map(
    [
      ...[...CONNECTOR_ITEMS, ...CONNECTED_APPS].flatMap((app) => {
        const label = "label" in app ? app.label : app.name;
        return [
          [app.id, label],
          [label, label],
        ];
      }),
      // Keywords like "email" resolve to their alias-matched apps in the panel.
      ...APP_SEARCH_KEYWORDS.map((keyword) => [keyword, keyword]),
    ]
      .map(([term, label]) => [term.toLowerCase(), { term, label }])
  ).values()
).sort((a, b) => b.term.length - a.term.length);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findSearchedApp(text: string) {
  const normalized = text.toLowerCase();
  return APP_SEARCH_TERMS.find(({ term }) =>
    new RegExp(`(^|\\s)${escapeRegExp(term.toLowerCase())}\\s*$`).test(normalized)
  );
}

function findLastTextNodeBeforeRange(range: Range): { node: Text; offset: number } | null {
  const container = range.startContainer;
  if (container.nodeType === Node.TEXT_NODE) {
    return { node: container as Text, offset: range.startOffset };
  }
  if (!(container instanceof HTMLElement)) return null;

  const child = container.childNodes[Math.max(0, range.startOffset - 1)];
  if (!child) return null;

  let node: Node = child;
  while (node.lastChild) node = node.lastChild;
  return node.nodeType === Node.TEXT_NODE
    ? { node: node as Text, offset: node.textContent?.length ?? 0 }
    : null;
}

function lastMentionTriggerIndex(text: string) {
  return Math.max(text.lastIndexOf("@"), text.lastIndexOf("/"));
}

function findMentionTriggerRange(el: HTMLElement, preferredRange: Range | null) {
  const createRangeFromTextNode = (node: Text, offset: number) => {
    const beforeCaret = (node.textContent ?? "").slice(0, offset);
    const atIndex = lastMentionTriggerIndex(beforeCaret);
    if (atIndex < 0 || /\s/.test(beforeCaret.slice(atIndex + 1))) return null;

    const range = document.createRange();
    range.setStart(node, atIndex);
    range.setEnd(node, offset);
    return range;
  };

  if (preferredRange) {
    const textNodeAtCaret = findLastTextNodeBeforeRange(preferredRange);
    if (textNodeAtCaret) {
      const range = createRangeFromTextNode(textNodeAtCaret.node, textNodeAtCaret.offset);
      if (range) return range;
    }
  }

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let fallback: Range | null = null;
  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
    const text = textNode.textContent ?? "";
    const atIndex = lastMentionTriggerIndex(text);
    if (atIndex >= 0 && !/\s/.test(text.slice(atIndex + 1))) {
      const range = document.createRange();
      range.setStart(textNode, atIndex);
      range.setEnd(textNode, text.length);
      fallback = range;
    }
    node = walker.nextNode();
  }

  return fallback;
}

function replaceSearchedAppTextWithChip(el: HTMLElement, chip: HTMLElement, savedRange: Range | null) {
  const selection = window.getSelection();
  const currentRange =
    selection && selection.rangeCount > 0 && el.contains(selection.anchorNode)
      ? selection.getRangeAt(0).cloneRange()
      : null;
  const fallbackRange =
    savedRange && el.contains(savedRange.startContainer)
      ? savedRange.cloneRange()
      : null;
  const insertionRange = currentRange ?? fallbackRange;
  if (!insertionRange) return false;

  const textNodeAtCaret = findLastTextNodeBeforeRange(insertionRange);
  if (!textNodeAtCaret) return false;

  const { node, offset } = textNodeAtCaret;
  const beforeCaret = (node.textContent ?? "").slice(0, offset);
  const normalizedBeforeCaret = beforeCaret.toLowerCase();
  let matchStart = -1;
  let matchEnd = -1;

  APP_SEARCH_TERMS.forEach(({ term }) => {
    const regex = new RegExp(
      `(^|\\s)${escapeRegExp(term.toLowerCase())}(?=$|\\s|[.,!?;:])`,
      "g"
    );
    let match: RegExpExecArray | null;
    while ((match = regex.exec(normalizedBeforeCaret)) !== null) {
      const start = match.index + match[1].length;
      const end = start + term.length;
      if (end > matchEnd) {
        matchStart = start;
        matchEnd = end;
      }
    }
  });

  if (matchStart < 0 || matchEnd < 0) return false;

  const replacementRange = document.createRange();
  replacementRange.setStart(node, matchStart);
  replacementRange.setEnd(node, matchEnd);
  replacementRange.deleteContents();
  replacementRange.insertNode(chip);
  return true;
}

function getPromptAnchoredMenuSearch(text: string) {
  const atIndex = lastMentionTriggerIndex(text);
  if (atIndex < 0) return "";
  return text.slice(atIndex + 1).trimStart();
}

function hasAddMenuSearchSuggestions(searchValue: string) {
  const normalizedSearch = searchValue.trim().toLowerCase();
  if (!normalizedSearch) return false;
  return (
    CONNECTOR_ITEMS.some((item) =>
      connectorSearchText(item).toLowerCase().includes(normalizedSearch)
    ) ||
    KNOWLEDGE_BASES.some((kb) =>
      kb.name.toLowerCase().includes(normalizedSearch)
    ) ||
    SAVED_PROMPTS.some((prompt) =>
      `${prompt.title} ${prompt.text}`.toLowerCase().includes(normalizedSearch)
    )
  );
}

const KNOWLEDGE_BASES = [
  { id: "kb1", name: "Company Docs", iconType: "drive" },
  { id: "kb2", name: "Product Wiki", iconType: "database" },
  { id: "kb3", name: "Sales Playbook", iconType: "gmail" },
  { id: "kb4", name: "Engineering Runbooks", iconType: "database" },
];

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

type ModelOption = {
  id: string;
  name: string;
  icon: React.ElementType;
  description?: string;
};

type EffortLevel = "low" | "medium" | "high" | "max";
const EFFORT_LABELS: Record<EffortLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  max: "Max",
};

function OpenAILogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.783-2.759a4.5 4.5 0 0 1 6.68 4.66zM8.309 12.863l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.141.08L8.706 5.46a.795.795 0 0 0-.392.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function AnthropicLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541zM6.696 3.541 0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.745L10.539 3.541H6.696zm-.36 10.223L8.63 7.82l2.294 5.945H6.336z" />
    </svg>
  );
}

function GeminiLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c.3 4.55 1.95 6.2 6.5 6.5 0 0 3.5.2 3.5.5s-3.5.5-3.5.5C13.95 9.8 12.3 11.45 12 16c0 0-.2 6-.5 6s-.5-6-.5-6c-.3-4.55-1.95-6.2-6.5-6.5 0 0-3.5-.2-3.5-.5s3.5-.5 3.5-.5C9.05 8.2 10.7 6.55 11 2c0 0 .2-.5.5-.5s.5.5.5.5z" />
    </svg>
  );
}

function MetaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.3 4.5c2.02 0 3.72 1.16 5.7 3.87 1.98-2.71 3.68-3.87 5.7-3.87 3.2 0 5.8 2.83 5.8 7.24 0 4.15-2.44 7.76-5.4 7.76-1.83 0-3.13-.95-5.05-4.03l-1.05-1.72-1.05 1.72c-1.92 3.08-3.22 4.03-5.05 4.03-2.96 0-5.4-3.6-5.4-7.76 0-4.41 2.6-7.24 5.8-7.24zm-.05 2.35c-1.87 0-3.35 1.8-3.35 4.85 0 2.85 1.28 5.05 3.15 5.05 1.02 0 1.85-.5 3.25-2.75l-.7-1.1c-1.25-1.98-2.15-2.85-3.05-2.85-.53 0-.95.25-1.3.7zm11.5 0c-.9 0-1.8.87-3.05 2.85l-.7 1.1c1.4 2.25 2.23 2.75 3.25 2.75 1.87 0 3.15-2.2 3.15-5.05 0-3.05-1.48-4.85-3.35-4.85-.53 0-.95.25-1.3.7z" />
    </svg>
  );
}

// Model picker options. "Auto" lets the platform route to the best model.
const AUTO_MODEL: ModelOption = { id: "auto", name: "Auto", icon: SparklesIcon };
const MODEL_OPTIONS: ModelOption[] = [
  { id: "claude-opus", name: "Opus 4.8", icon: AnthropicLogo, description: "For complex tasks" },
  { id: "claude-sonnet", name: "Sonnet 5", icon: AnthropicLogo, description: "Most efficient for everyday tasks" },
  { id: "claude-haiku", name: "Haiku 4.5", icon: AnthropicLogo, description: "Fastest for quick answers" },
  { id: "gpt-5-1", name: "GPT-5.1", icon: OpenAILogo, description: "OpenAI's most capable model" },
];
const ALL_MODELS = [AUTO_MODEL, ...MODEL_OPTIONS];

function ModelMenu({
  selectedId,
  onSelect,
  effort,
  onEffortChange,
  thinking,
  onThinkingChange,
  side = "top",
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  effort: EffortLevel;
  onEffortChange: (e: EffortLevel) => void;
  thinking: boolean;
  onThinkingChange: (v: boolean) => void;
  side?: "top" | "bottom";
}) {
  const selected = ALL_MODELS.find((m) => m.id === selectedId) ?? AUTO_MODEL;
  const SelectedIcon = selected.icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground"
          title="Model"
        >
          <SelectedIcon className="size-4 shrink-0" />
          <span className="min-w-0 truncate">{selected.name}</span>
          <span className="text-sm text-muted-foreground/70">{EFFORT_LABELS[effort]}</span>
          <ChevronDownIcon className="size-3.5 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="start" className="w-72 p-1">
        <ModelMenuItem model={AUTO_MODEL} selected={selectedId === AUTO_MODEL.id} onSelect={onSelect} />
        <DropdownMenuSeparator />
        {MODEL_OPTIONS.map((model) => (
          <ModelMenuItem
            key={model.id}
            model={model}
            selected={selectedId === model.id}
            onSelect={onSelect}
          />
        ))}
        <DropdownMenuSeparator />
        <EffortSubMenu effort={effort} onEffortChange={onEffortChange} thinking={thinking} onThinkingChange={onThinkingChange} />
        <DropdownMenuItem className="cursor-pointer rounded-lg px-2 py-1.5">
          <span className="text-sm">More models</span>
          <ChevronRightIcon className="ml-auto size-3.5 text-muted-foreground" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ModelMenuItem({
  model,
  selected,
  onSelect,
}: {
  model: ModelOption;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = model.icon;
  return (
    <DropdownMenuItem
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5",
        selected && "bg-muted"
      )}
      onClick={() => onSelect(model.id)}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm">{model.name}</span>
        {model.description && (
          <span className="truncate text-xs text-muted-foreground">{model.description}</span>
        )}
      </div>
      {selected && <CheckIcon className="size-3.5 shrink-0 text-muted-foreground" />}
    </DropdownMenuItem>
  );
}

function EffortSubMenu({
  effort,
  onEffortChange,
  thinking,
  onThinkingChange,
}: {
  effort: EffortLevel;
  onEffortChange: (e: EffortLevel) => void;
  thinking: boolean;
  onThinkingChange: (v: boolean) => void;
}) {
  const levels: EffortLevel[] = ["low", "medium", "high", "max"];
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2 rounded-lg px-2 py-1.5">
        <span className="flex-1 text-sm">Effort</span>
        <span className="text-xs text-muted-foreground">{EFFORT_LABELS[effort]}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-72 p-1">
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Higher effort means more thorough responses, but takes longer and uses your limits faster.
        </div>
        {levels.map((level) => (
          <DropdownMenuItem
            key={level}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
            onClick={() => onEffortChange(level)}
          >
            <span className="text-sm">{EFFORT_LABELS[level]}</span>
            {level === "low" && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Default</span>
            )}
            {level === "max" && <InfoIcon className="size-3.5 text-muted-foreground" />}
            <span className="ml-auto">
              {effort === level && <CheckIcon className="size-3.5 text-primary" />}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div
          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
          onClick={(e) => {
            e.preventDefault();
            onThinkingChange(!thinking);
          }}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm">Thinking</span>
            <span className="text-xs text-muted-foreground">Can think for more complex tasks</span>
          </div>
          <Switch checked={thinking} onCheckedChange={onThinkingChange} />
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

const MENTION_ANCHOR_ATTR = "data-mention-anchor";
const KNOWLEDGE_BASE_CHIP_ATTR = "data-kb-chip";
const MENTION_CHIP_ATTR = "data-mention-chip";
const TOOL_MENTION_CHIP_ATTR = "data-tool-mention-chip";
const SVG_TAGS = new Set([
  "svg",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "g",
  "defs",
  "clipPath",
  "linearGradient",
  "radialGradient",
  "stop",
]);

function toDomAttributeName(name: string) {
  if (name === "className") return "class";
  if (name === "htmlFor") return "for";
  if (name === "viewBox") return "viewBox";
  return name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function appendReactNodeAsDom(parent: Node, node: React.ReactNode) {
  if (node == null || typeof node === "boolean") return;

  if (typeof node === "string" || typeof node === "number") {
    parent.appendChild(document.createTextNode(String(node)));
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((child) => appendReactNodeAsDom(parent, child));
    return;
  }

  if (!React.isValidElement(node) || typeof node.type !== "string") return;

  const tagName = node.type;
  const element = SVG_TAGS.has(tagName)
    ? document.createElementNS("http://www.w3.org/2000/svg", tagName)
    : document.createElement(tagName);
  const props = node.props as Record<string, unknown>;

  for (const [key, value] of Object.entries(props)) {
    if (
      key === "children" ||
      key === "key" ||
      key === "ref" ||
      value == null ||
      value === false ||
      typeof value === "function"
    ) {
      continue;
    }

    element.setAttribute(toDomAttributeName(key), value === true ? "" : String(value));
  }

  appendReactNodeAsDom(element, props.children as React.ReactNode);
  parent.appendChild(element);
}

function createIntegrationIconNode(id: string) {
  const icon = integrationIcons[id];
  if (!icon) return null;

  const wrapper = document.createElement("span");
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.className = "mr-1 inline-flex size-3.5 shrink-0 items-center justify-center align-middle";
  appendReactNodeAsDom(wrapper, icon);
  return wrapper;
}

function createWorkflowIconNode(workflow: Workflow) {
  const Icon = workflow.icon;
  const wrapper = document.createElement("span");
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.className = "mr-1 inline-flex size-3.5 shrink-0 items-center justify-center align-middle";
  wrapper.innerHTML = renderToStaticMarkup(
    <Icon className="size-3.5 text-gray-700/70 dark:text-gray-300/70" />
  );
  return wrapper;
}

function getComposerText(el: HTMLElement): string {
  const text = el.innerText;
  const hasInlineTokens = Boolean(
    el.querySelector(
      `[${MENTION_CHIP_ATTR}], [${KNOWLEDGE_BASE_CHIP_ATTR}], [${TOOL_MENTION_CHIP_ATTR}]`
    )
  );

  if (!hasInlineTokens && text.replace(/[\s\u00A0\u200B]/g, "") === "") {
    el.replaceChildren();
    return "";
  }

  return text;
}

function appendSavedPromptText(currentText: string, promptText: string): string {
  if (!currentText.trim()) return promptText;
  const separator = /[\s\u00A0]$/.test(currentText) ? "" : " ";
  return `${currentText}${separator}${promptText}`;
}

function createMentionChip(workflow: Workflow, onRemove: () => void): HTMLSpanElement {
  const chip = document.createElement("span");
  chip.contentEditable = "false";
  chip.setAttribute(MENTION_CHIP_ATTR, workflow.id);
  chip.title = `@${workflow.name}`;
  // inline-block (not flex) so the browser's innerText serialization doesn't
  // inject line breaks around the chip's content or its children.
  chip.className =
    "mx-0.5 inline-block max-w-[240px] rounded-md align-baseline bg-gray-500/10 py-0.5 pl-1.5 pr-1 text-[13px] leading-[18px] font-medium text-gray-700 dark:bg-gray-400/10 dark:text-gray-300";

  chip.appendChild(createWorkflowIconNode(workflow));

  const label = document.createElement("span");
  label.className = "inline-block max-w-[170px] truncate align-middle leading-[18px]";
  label.textContent = workflow.name;
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

function createToolMentionChip(
  id: string,
  labelText: string,
  onRemove: () => void
): HTMLSpanElement {
  const chip = document.createElement("span");
  chip.contentEditable = "false";
  chip.setAttribute(TOOL_MENTION_CHIP_ATTR, id);
  chip.title = labelText;
  chip.className =
    "group mx-0.5 inline-block max-w-[240px] rounded-md border border-border bg-white py-0.5 pl-1.5 pr-1 align-baseline text-[13px] leading-[18px] font-medium text-foreground dark:bg-background";

  const icon = createIntegrationIconNode(id);
  if (icon) {
    chip.appendChild(icon);
  }

  const label = document.createElement("span");
  label.className = "inline-block max-w-[170px] truncate align-middle leading-[18px]";
  label.textContent = labelText;
  chip.appendChild(label);

  const removeBtn = document.createElement("span");
  removeBtn.setAttribute("data-tool-mention-remove", "true");
  removeBtn.setAttribute("role", "button");
  removeBtn.setAttribute("aria-label", `Remove ${labelText}`);
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

function createKnowledgeBaseChip(
  knowledgeBase: (typeof KNOWLEDGE_BASES)[number],
  onRemove: () => void
): HTMLSpanElement {
  const chip = document.createElement("span");
  chip.contentEditable = "false";
  chip.setAttribute(KNOWLEDGE_BASE_CHIP_ATTR, knowledgeBase.id);
  chip.title = knowledgeBase.name;
  chip.className =
    "group mx-0.5 inline-block max-w-[240px] rounded-full border border-border bg-muted/50 py-0.5 pl-2 pr-1.5 align-baseline text-[13px] leading-[18px] font-medium text-foreground";

  const icon = createKnowledgeBaseIconNode(knowledgeBase.iconType);
  chip.appendChild(icon);

  const label = document.createElement("span");
  label.className = "ml-1 inline-block max-w-[170px] truncate align-middle leading-[18px]";
  label.textContent = knowledgeBase.name;
  chip.appendChild(label);

  const removeBtn = document.createElement("span");
  removeBtn.setAttribute("data-kb-remove", "true");
  removeBtn.setAttribute("role", "button");
  removeBtn.setAttribute("aria-label", `Remove ${knowledgeBase.name}`);
  removeBtn.className =
    "mention-remove-icon ml-1 inline-block cursor-pointer align-middle text-muted-foreground/60 transition-colors group-hover:text-foreground";
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

function AgentPickerContent({
  search,
  onSearchChange,
  tab,
  onTabChange,
  selectedIds,
  onSelect,
  autoSelect,
  onAutoSelectChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  tab: "recent" | "all" | "favorites";
  onTabChange: (value: "recent" | "all" | "favorites") => void;
  selectedIds: string[];
  onSelect: (workflow: Workflow) => void;
  autoSelect: boolean;
  onAutoSelectChange: (value: boolean) => void;
}) {
  return (
    <>
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
      <div className="p-1">
        <DropdownMenuItem
          className="gap-2"
          onSelect={(e) => { e.preventDefault(); onAutoSelectChange(!autoSelect); }}
        >
          <SparklesIcon className="size-4" />
          <span className="flex-1">Auto-select agent</span>
          {autoSelect && <CheckIcon className="size-3.5 text-muted-foreground shrink-0" />}
        </DropdownMenuItem>
      </div>
      <DropdownMenuSeparator />
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
                    className="mx-1 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2"
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
      <div className="p-1">
        <DropdownMenuItem className="gap-2" asChild>
          <Link href="/agents">
            <ExternalLinkIcon className="size-4" />
            Browse agents
          </Link>
        </DropdownMenuItem>
      </div>
    </>
  );
}

function WorkflowMentionMenu({
  search,
  onSearchChange,
  tab,
  onTabChange,
  selectedIds,
  onSelect,
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
      {/* Invisible anchor positioned at the "@" character (or the "+" button). */}
      <DropdownMenuTrigger asChild>
        <span
          aria-hidden
          className="pointer-events-none fixed h-0 w-0"
          style={{ left: anchor?.left ?? 0, top: anchor?.top ?? 0 }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="start" sideOffset={4} className="w-72 p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
        <AgentPickerContent
          search={search}
          onSearchChange={onSearchChange}
          tab={tab}
          onTabChange={onTabChange}
          selectedIds={selectedIds}
          onSelect={onSelect}
          autoSelect={autoSelect}
          onAutoSelectChange={onAutoSelectChange}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ChatChipInline({ chip }: { chip: import("@/lib/chats-data").ChatChip }) {
  const icon = chip.kind === "prompt" ? null : integrationIcons[chip.iconId];
  const base =
    "mx-0.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[13px] leading-[18px] font-medium align-middle";
  const variant =
    chip.kind === "integration"
      ? "bg-gray-500/10 text-gray-700 dark:bg-gray-400/10 dark:text-gray-300"
      : chip.kind === "knowledge"
      ? "bg-gray-500/10 text-gray-700 dark:bg-gray-400/10 dark:text-gray-300"
      : "bg-primary/10 text-primary";
  return (
    <span className={cn(base, variant)}>
      {icon && <span className="inline-flex size-3.5 shrink-0 items-center justify-center">{icon}</span>}
      <span className="max-w-[200px] truncate">{chip.label}</span>
    </span>
  );
}

function ToolFileCard({ data }: { data: import("@/lib/chats-data").ToolFileBlock }) {
  const icon = integrationIcons[data.iconId];
  const actionLabel =
    data.action === "search" ? "Searching" : data.action === "write" ? "Writing" : "Reading";
  return (
    <div className="my-1 inline-flex max-w-full items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
      <div className="relative flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-white dark:bg-background">
        {icon && <span className="inline-flex size-4 items-center justify-center">{icon}</span>}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-medium leading-tight">{data.fileName}</span>
        <span className="truncate text-[11px] text-muted-foreground">
          {actionLabel}
          {data.subtitle ? ` · ${data.subtitle}` : ""}
        </span>
      </div>
    </div>
  );
}

function StatGrid({ tiles }: { tiles: import("@/lib/chats-data").StatTile[] }) {
  return (
    <div className="my-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {tiles.map((t, i) => (
        <div key={i} className="rounded-xl border border-border bg-background px-3 py-2.5">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.label}</div>
          <div className="mt-0.5 text-base font-semibold leading-tight">{t.value}</div>
          {t.delta && (
            <div
              className={cn(
                "mt-0.5 text-[11px] font-medium",
                t.trend === "down"
                  ? "text-red-600 dark:text-red-400"
                  : t.trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              )}
            >
              {t.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BarChart({
  title,
  unit,
  bars,
}: {
  title?: string;
  unit?: string;
  bars: { label: string; value: number; hint?: string }[];
}) {
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div className="my-2 rounded-xl border border-border bg-background p-3">
      {title && (
        <div className="mb-2 flex items-baseline justify-between">
          <div className="text-[13px] font-medium">{title}</div>
          {unit && <div className="text-[11px] text-muted-foreground">{unit}</div>}
        </div>
      )}
      <div className="flex h-32 items-end gap-1">
        {bars.map((b, i) => {
          const h = Math.max(4, Math.round((b.value / max) * 100));
          const isDip = b.value < max * 0.9;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1" title={b.hint}>
              <div className="w-full text-center text-[10px] text-muted-foreground">
                {b.value.toFixed(1)}
              </div>
              <div
                className={cn(
                  "w-full rounded-t-sm",
                  isDip ? "bg-red-500/70" : "bg-primary/70"
                )}
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 truncate text-center text-[10px] text-muted-foreground">
            {b.label.replace("Jun ", "")}
          </div>
        ))}
      </div>
    </div>
  );
}

function DataTable({ data }: { data: import("@/lib/chats-data").TableBlock }) {
  return (
    <div className="my-2 overflow-hidden rounded-xl border border-border bg-background">
      <table className="w-full text-[13px]">
        <thead className="bg-muted/40">
          <tr>
            {data.headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 tabular-nums">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssistantBlocks({ blocks }: { blocks: import("@/lib/chats-data").AssistantBlock[] }) {
  return (
    <div className="flex flex-col gap-1">
      {blocks.map((block, i) => {
        if (block.type === "text") {
          return (
            <div key={i} className="whitespace-pre-wrap text-sm">
              {block.text}
            </div>
          );
        }
        if (block.type === "tool-file") return <ToolFileCard key={i} data={block.data} />;
        if (block.type === "stat-grid") return <StatGrid key={i} tiles={block.tiles} />;
        if (block.type === "bar-chart")
          return <BarChart key={i} title={block.title} unit={block.unit} bars={block.bars} />;
        if (block.type === "table") return <DataTable key={i} data={block.data} />;
        return null;
      })}
    </div>
  );
}

function messageTextPreview(msg: ChatMessage): string {
  if (msg.parts) {
    return msg.parts
      .map((p) => (p.type === "text" ? p.text : `@${p.chip?.label ?? ""}`))
      .join("")
      .trim();
  }
  return msg.content.trim();
}

function MessageNavigator({
  userMessages,
  chatId,
}: {
  userMessages: { index: number; text: string }[];
  chatId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(
    userMessages[0]?.index ?? null
  );
  useEffect(() => {
    if (userMessages.length < 2) return;
    const els = userMessages
      .map((m) => document.getElementById(`msg-${chatId}-${m.index}`))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const update = () => {
      const anchor = window.innerHeight * 0.3;
      let best = els[0];
      for (const el of els) {
        if (el.getBoundingClientRect().top <= anchor) best = el;
      }
      const idx = Number(best.id.split("-").pop());
      setActiveIdx(idx);
    };
    update();
    const scroller =
      els[0].closest<HTMLElement>(".overflow-y-auto") ?? window;
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [userMessages, chatId]);
  if (userMessages.length < 2) return null;
  const scrollTo = (i: number) => {
    const el = document.getElementById(`msg-${chatId}-${i}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div
      className="pointer-events-none fixed right-6 top-1/2 z-20 -translate-y-1/2"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => {
        setExpanded(false);
        setHoverIdx(null);
      }}
    >
      {expanded ? (
        <div className="pointer-events-auto flex w-[280px] flex-col gap-0.5 rounded-2xl border border-border bg-background p-2 text-foreground shadow-xl">
          {userMessages.map((m) => (
            <button
              key={m.index}
              type="button"
              onClick={() => scrollTo(m.index)}
              onMouseEnter={() => setHoverIdx(m.index)}
              className={cn(
                "truncate rounded-lg px-3 py-1.5 text-left text-xs transition-colors",
                hoverIdx === m.index
                  ? "bg-muted text-foreground"
                  : activeIdx === m.index
                    ? "bg-muted font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted/60"
              )}
              title={m.text}
            >
              {m.text || "(empty message)"}
            </button>
          ))}
        </div>
      ) : (
        <div className="pointer-events-auto flex flex-col items-end gap-1.5 py-1">
          {userMessages.map((m) => (
            <span
              key={m.index}
              className={cn(
                "block h-[3px] rounded-full transition-all",
                activeIdx === m.index
                  ? "w-4 bg-foreground"
                  : "w-3 bg-muted-foreground/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
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
  const userMessages = messages
    .map((msg, i) => ({ msg, i }))
    .filter(({ msg }) => msg.role === "user")
    .map(({ msg, i }) => ({ index: i, text: messageTextPreview(msg) }));
  return (
    <>
      <div className="mx-auto flex w-full max-w-[48rem] flex-col gap-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            id={`msg-${chatId}-${i}`}
            className={cn(
              "scroll-mt-6 text-sm",
              msg.role === "user"
                ? "max-w-[85%] self-end whitespace-pre-wrap rounded-2xl bg-black/5 px-4 py-2.5 text-foreground"
                : "w-full self-start text-foreground"
            )}
          >
            {msg.role === "user" && msg.parts ? (
              msg.parts.map((part, j) =>
                part.type === "text" ? (
                  <React.Fragment key={j}>{part.text}</React.Fragment>
                ) : (
                  <ChatChipInline key={j} chip={part.chip} />
                )
              )
            ) : msg.role === "assistant" && msg.blocks ? (
              <AssistantBlocks blocks={msg.blocks} />
            ) : (
              <span className="whitespace-pre-wrap">{msg.content}</span>
            )}
          </div>
        ))}
      </div>
      <MessageNavigator userMessages={userMessages} chatId={chatId} />
    </>
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

  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragDepthRef = useRef(0);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const addAttachedFiles = useCallback((files: File[]) => {
    setAttachedFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${prev.length + Math.floor(Math.random() * 1e9)}`,
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      })),
    ]);
  }, []);
  const removeAttachedFile = useCallback((id: string) => {
    setAttachedFiles((prev) => {
      const found = prev.find((f) => f.id === id);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);
  useEffect(() => {
    return () => {
      attachedFiles.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addMenuSearch, setAddMenuSearch] = useState("");
  const [addMenuSuggestionMode, setAddMenuSuggestionMode] = useState(false);
  const [addMenuAnchor, setAddMenuAnchor] = useState<{ left: number; top: number } | null>(null);
  const [mentionAnchor, setMentionAnchor] = useState<{ left: number; top: number } | null>(null);
  const [newChatKey, setNewChatKey] = useState(0);
  const [extraRecentChats, setExtraRecentChats] = useState<ChatItem[]>([]);
  // Named-agent chats open with the agent's workflow apps already connected;
  // the blank landing composer starts empty so it can prompt the user to
  // connect tools.
  const [connectedConnectors, setConnectedConnectors] = useState<string[]>(() =>
    isNewChat ? [] : getAgentApps(id)
  );
  // Apps loaded from a suggested prompt on the blank landing — shown in the
  // Tools trigger with a pulsing dot until connected.
  const [promptApps, setPromptApps] = useState<string[]>([]);
  // Knowledge bases the user has added to the chat via the "+" menu.
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>([]);
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [connectionSetupOpen, setConnectionSetupOpen] = useState(false);
  const [moreAppsOpen, setMoreAppsOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState("claude-sonnet");
  const [effort, setEffort] = useState<EffortLevel>("low");
  const [thinking, setThinking] = useState(false);
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
  const anchoredAddMenuKeepOpenUntilRef = useRef(0);

  const saveSelection = useCallback(() => {
    const el = mentionTextareaRef.current;
    const sel = window.getSelection();
    if (el && sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const applyPrompt = useCallback((text: string) => {
    const el = mentionTextareaRef.current;
    if (el) {
      const selection = window.getSelection();
      const currentRange =
        selection && selection.rangeCount > 0 && el.contains(selection.anchorNode)
          ? selection.getRangeAt(0).cloneRange()
          : null;
      const savedRange =
        savedRangeRef.current && el.contains(savedRangeRef.current.startContainer)
          ? savedRangeRef.current.cloneRange()
          : null;
      const mentionRange =
        addMenuOpen && !addMenuSuggestionMode
          ? findMentionTriggerRange(el, currentRange ?? savedRange)
          : null;

      if (mentionRange) {
        mentionRange.deleteContents();
        mentionRange.insertNode(document.createTextNode(text));
      } else {
        const currentText = getComposerText(el);
        const nextText = appendSavedPromptText(currentText, text);
        const insertedText = nextText.slice(currentText.length);
        el.appendChild(document.createTextNode(insertedText));
      }

      setMessage(getComposerText(el));
      el.focus();
      // place caret at the end of the inserted text
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      savedRangeRef.current = range.cloneRange();
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } else {
      setMessage((currentText) => appendSavedPromptText(currentText, text));
    }

    anchoredAddMenuKeepOpenUntilRef.current = 0;
    setAddMenuOpen(false);
    setAddMenuSearch("");
    setAddMenuSuggestionMode(false);
  }, [addMenuOpen, addMenuSuggestionMode]);

  // Opens the agent-mention menu anchored below the toolbar "Agents" button.
  // Unlike the "@"-key path, this does not insert an "@" into the composer.
  const openMentionMenuFromButton = useCallback((rect: DOMRect) => {
    setMentionAnchor({ left: rect.left, top: rect.bottom });
    setMentionMenuOpen(true);
  }, []);

  const openAddMenuForAppSearch = useCallback((text: string, el: HTMLElement) => {
    const matchedApp = findSearchedApp(text);
    if (!matchedApp) {
      if (addMenuSuggestionMode) {
        setAddMenuOpen(false);
        setAddMenuSearch("");
        setAddMenuSuggestionMode(false);
      }
      return;
    }

    const selection = window.getSelection();
    const range =
      selection && selection.rangeCount > 0 && el.contains(selection.anchorNode)
        ? selection.getRangeAt(0)
        : null;
    const rangeRect = range?.getBoundingClientRect();
    const composerRect = el.getBoundingClientRect();
    const left = rangeRect && (rangeRect.left !== 0 || rangeRect.right !== 0)
      ? rangeRect.left
      : composerRect.left + 16;
    const top = rangeRect && (rangeRect.bottom !== 0 || rangeRect.top !== 0)
      ? rangeRect.bottom
      : composerRect.bottom;

    setAddMenuSearch(matchedApp.label);
    setAddMenuSuggestionMode(true);
    setAddMenuAnchor({ left, top });
    setAddMenuOpen(true);
    requestAnimationFrame(() => {
      el.focus();
      selection?.removeAllRanges();
      if (range) selection?.addRange(range);
    });
  }, [addMenuSuggestionMode]);

  const restoreComposerFocusAfterMenuChange = useCallback((el?: HTMLElement | null) => {
    const target = el ?? mentionTextareaRef.current;
    const selection = window.getSelection();
    const currentRange =
      target && selection && selection.rangeCount > 0 && target.contains(selection.anchorNode)
        ? selection.getRangeAt(0).cloneRange()
        : null;
    const fallbackRange = target ? document.createRange() : null;
    if (target && fallbackRange) {
      fallbackRange.selectNodeContents(target);
      fallbackRange.collapse(false);
    }
    const restoreRange = currentRange ?? fallbackRange;

    const restoreComposerFocus = () => {
      if (!target) return;
      target.focus();
      if (!restoreRange) return;
      const nextSelection = window.getSelection();
      nextSelection?.removeAllRanges();
      nextSelection?.addRange(restoreRange);
    };

    requestAnimationFrame(restoreComposerFocus);
    setTimeout(restoreComposerFocus, 0);
    setTimeout(restoreComposerFocus, 50);
  }, []);

  const closeAddMenuAndRestoreComposerFocus = useCallback((el?: HTMLElement | null) => {
    anchoredAddMenuKeepOpenUntilRef.current = 0;
    setAddMenuOpen(false);
    setAddMenuSearch("");
    setAddMenuSuggestionMode(false);
    restoreComposerFocusAfterMenuChange(el);
  }, [restoreComposerFocusAfterMenuChange]);

  const closeAddMenuForOutsidePointer = useCallback(() => {
    anchoredAddMenuKeepOpenUntilRef.current = 0;
    setAddMenuOpen(false);
    setAddMenuSearch("");
    setAddMenuSuggestionMode(false);
  }, []);

  const composerAddMenuHasResults = useCallback((search: string) =>
    hasAddMenuSearchResults({
      search,
      hideConnectedApps: true,
      hasAgentsEntry: true,
      hasAgentsPicker: true,
    }), []);

  useEffect(() => {
    if (!addMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeAddMenuAndRestoreComposerFocus();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-add-menu-content], [data-app-tool-suggestion-panel]")) {
        return;
      }
      closeAddMenuForOutsidePointer();
    };

    window.addEventListener("keydown", handleEscape, true);
    window.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      window.removeEventListener("keydown", handleEscape, true);
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [addMenuOpen, closeAddMenuAndRestoreComposerFocus, closeAddMenuForOutsidePointer]);

  const openAddMenuForPromptMention = useCallback((text: string, el: HTMLElement) => {
    if (!text.includes("@")) return false;
    const search = getPromptAnchoredMenuSearch(text);
    if (search && !composerAddMenuHasResults(search)) {
      anchoredAddMenuKeepOpenUntilRef.current = 0;
      setAddMenuOpen(false);
      setAddMenuSearch("");
      setAddMenuSuggestionMode(false);
      restoreComposerFocusAfterMenuChange(el);
      return true;
    }

    const selection = window.getSelection();
    const range =
      selection && selection.rangeCount > 0 && el.contains(selection.anchorNode)
        ? selection.getRangeAt(0)
        : null;
    const rangeRect = range?.getBoundingClientRect();
    const composerRect = el.getBoundingClientRect();
    const left = rangeRect && (rangeRect.left !== 0 || rangeRect.right !== 0)
      ? rangeRect.left
      : composerRect.left + 16;
    const top = rangeRect && (rangeRect.bottom !== 0 || rangeRect.top !== 0)
      ? rangeRect.bottom
      : composerRect.bottom;

    setAddMenuSuggestionMode(false);
    setAddMenuSearch(search);
    setAddMenuAnchor({ left, top });
    anchoredAddMenuKeepOpenUntilRef.current = Date.now() + 500;
    setAddMenuOpen(true);
    restoreComposerFocusAfterMenuChange(el);
    return true;
  }, [composerAddMenuHasResults, restoreComposerFocusAfterMenuChange]);

  const removeMentionChip = useCallback((chip: HTMLElement, workflowId: string) => {
    const el = mentionTextareaRef.current;
    if (!el) return;
    const next = chip.nextSibling;
    if (next && next.nodeType === Node.TEXT_NODE && next.textContent === " ") {
      next.remove();
    }
    chip.remove();
    setSelectedWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    setMessage(getComposerText(el));
  }, []);

  const removeKnowledgeBaseChip = useCallback((chip: HTMLElement, knowledgeBaseId: string) => {
    const el = mentionTextareaRef.current;
    if (!el) return;
    const next = chip.nextSibling;
    if (next && next.nodeType === Node.TEXT_NODE && [" ", "\u00A0"].includes(next.textContent ?? "")) {
      next.remove();
    }
    chip.remove();
    setSelectedKnowledgeBases((prev) => prev.filter((kb) => kb !== knowledgeBaseId));
    setMessage(getComposerText(el));
  }, []);

  const removeToolMentionChip = useCallback((chip: HTMLElement, connectorId: string) => {
    const el = mentionTextareaRef.current;
    if (!el) return;
    const next = chip.nextSibling;
    if (next && next.nodeType === Node.TEXT_NODE && [" ", "\u00A0"].includes(next.textContent ?? "")) {
      next.remove();
    }
    chip.remove();
    const hasSameConnectorChip = Boolean(
      el.querySelector(`[${TOOL_MENTION_CHIP_ATTR}="${connectorId}"]`)
    );
    if (!hasSameConnectorChip) {
      setPromptApps((prev) => prev.filter((id) => id !== connectorId));
    }
    setMessage(getComposerText(el));
  }, []);

  const insertInlineChipAtMentionTrigger = useCallback((chip: HTMLElement) => {
    const el = mentionTextareaRef.current;
    if (!el) return;

    const anchor = el.querySelector(`[${MENTION_ANCHOR_ATTR}]`);
    if (anchor) {
      anchor.replaceWith(chip);
    } else {
      const selection = window.getSelection();
      const currentRange =
        selection && selection.rangeCount > 0 && el.contains(selection.anchorNode)
          ? selection.getRangeAt(0).cloneRange()
          : null;
      const savedRange =
        savedRangeRef.current && el.contains(savedRangeRef.current.startContainer)
          ? savedRangeRef.current.cloneRange()
          : null;
      const insertionRange = savedRange ?? currentRange;

      if (insertionRange) {
        const mentionRange = findMentionTriggerRange(el, insertionRange);
        const replacementRange = mentionRange ?? insertionRange;
        replacementRange.deleteContents();
        replacementRange.insertNode(chip);
      } else {
        const mentionRange = findMentionTriggerRange(el, null);
        if (mentionRange) {
          mentionRange.deleteContents();
          mentionRange.insertNode(chip);
        } else {
          el.appendChild(chip);
        }
      }
    }

    const space = document.createTextNode("\u00A0");
    chip.after(space);

    const after = document.createRange();
    after.setStartAfter(space);
    after.collapse(true);
    savedRangeRef.current = after.cloneRange();
    setMessage(getComposerText(el));

    requestAnimationFrame(() => {
      el.focus();
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(after);
    });
  }, []);

  const handleSelectConnectorMention = useCallback((connectorId: string, labelText: string) => {
    const el = mentionTextareaRef.current;
    if (!el) return;

    const chip = createToolMentionChip(connectorId, labelText, () =>
      removeToolMentionChip(chip, connectorId)
    );
    insertInlineChipAtMentionTrigger(chip);
  }, [insertInlineChipAtMentionTrigger, removeToolMentionChip]);

  const handleSelectKnowledgeBaseMention = useCallback((knowledgeBaseId: string) => {
    const el = mentionTextareaRef.current;
    if (!el) return;

    if (selectedKnowledgeBases.includes(knowledgeBaseId)) {
      setSelectedKnowledgeBases((prev) => prev.filter((id) => id !== knowledgeBaseId));
      return;
    }

    const knowledgeBase = KNOWLEDGE_BASES.find((kb) => kb.id === knowledgeBaseId);
    if (!knowledgeBase) return;

    const chip = createKnowledgeBaseChip(knowledgeBase, () =>
      removeKnowledgeBaseChip(chip, knowledgeBaseId)
    );
    insertInlineChipAtMentionTrigger(chip);
    setSelectedKnowledgeBases((prev) =>
      prev.includes(knowledgeBaseId) ? prev : [...prev, knowledgeBaseId]
    );
  }, [insertInlineChipAtMentionTrigger, removeKnowledgeBaseChip, selectedKnowledgeBases]);

  const handleSelectAppSuggestion = useCallback((connectorId: string, labelText: string) => {
    const el = mentionTextareaRef.current;
    if (!el) return;

    const alreadyActive =
      connectedConnectors.includes(connectorId) || promptApps.includes(connectorId);
    if (!alreadyActive) {
      setPromptApps((prev) =>
        prev.includes(connectorId) ? prev : [...prev, connectorId]
      );
    }

    const chip = createToolMentionChip(connectorId, labelText, () =>
      removeToolMentionChip(chip, connectorId)
    );
    const replacedTypedApp = replaceSearchedAppTextWithChip(
      el,
      chip,
      savedRangeRef.current
    );

    if (replacedTypedApp) {
      const space = document.createTextNode("\u00A0");
      chip.after(space);

      const after = document.createRange();
      after.setStartAfter(space);
      after.collapse(true);
      savedRangeRef.current = after.cloneRange();
      setMessage(getComposerText(el));

      requestAnimationFrame(() => {
        el.focus();
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(after);
      });
    } else {
      handleSelectConnectorMention(connectorId, labelText);
    }

    setAddMenuOpen(false);
    setAddMenuSearch("");
    setAddMenuSuggestionMode(false);
  }, [connectedConnectors, handleSelectConnectorMention, promptApps, removeToolMentionChip]);

  const handleAnchoredAddMenuOpenChange = useCallback((open: boolean) => {
    if (!open) {
      if (!addMenuSuggestionMode && Date.now() < anchoredAddMenuKeepOpenUntilRef.current) {
        return;
      }
      const text = mentionTextareaRef.current
        ? getComposerText(mentionTextareaRef.current)
        : "";
      if (!addMenuSuggestionMode && text.includes("@")) {
        return;
      }
      setAddMenuSearch("");
      setAddMenuSuggestionMode(false);
    }
    setAddMenuOpen(open);
  }, [addMenuSuggestionMode]);

  const openConnectionSetup = useCallback((integrationId: string) => {
    setEditingConnectionId(integrationId);
    setConnectionSetupOpen(true);
  }, []);

  const handleConnectionSave = useCallback((integrationId: string) => {
    setConnectedConnectors((prev) =>
      prev.includes(integrationId) ? prev : [...prev, integrationId]
    );
    setPromptApps((prev) => prev.filter((id) => id !== integrationId));
  }, []);

  const handleSelectWorkflow = useCallback((workflow: Workflow) => {
    setAutoSelectWorkflow(false);
    setSelectedWorkflows((prev) =>
      prev.some((w) => w.id === workflow.id) ? prev : [...prev, { id: workflow.id, name: workflow.name }]
    );

    const el = mentionTextareaRef.current;
    if (!el) return;

    const chip = createMentionChip(workflow, () => removeMentionChip(chip, workflow.id));
    insertInlineChipAtMentionTrigger(chip);
  }, [insertInlineChipAtMentionTrigger, removeMentionChip]);

  useEffect(() => {
    const el = mentionTextareaRef.current;
    if (!el) return;

    const existingKbIds = Array.from(el.querySelectorAll<HTMLElement>(`[${KNOWLEDGE_BASE_CHIP_ATTR}]`)).map(
      (chip) => chip.getAttribute(KNOWLEDGE_BASE_CHIP_ATTR)
    );
    const desiredKbIds = selectedKnowledgeBases.filter((id) =>
      KNOWLEDGE_BASES.some((kb) => kb.id === id)
    );

    if (
      existingKbIds.length === desiredKbIds.length &&
      existingKbIds.every((id, index) => id === desiredKbIds[index])
    ) {
      return;
    }

    const remainingNodes: Node[] = [];
    const nodes = Array.from(el.childNodes);
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (
        node instanceof HTMLElement &&
        node.hasAttribute(KNOWLEDGE_BASE_CHIP_ATTR)
      ) {
        const next = nodes[i + 1];
        if (
          next?.nodeType === Node.TEXT_NODE &&
          [" ", "\u00A0"].includes(next.textContent ?? "")
        ) {
          i += 1;
        }
        continue;
      }
      remainingNodes.push(node);
    }

    el.replaceChildren();
    desiredKbIds.forEach((id) => {
      const knowledgeBase = KNOWLEDGE_BASES.find((kb) => kb.id === id);
      if (!knowledgeBase) return;
      const chip = createKnowledgeBaseChip(knowledgeBase, () => removeKnowledgeBaseChip(chip, id));
      el.appendChild(chip);
      el.appendChild(document.createTextNode("\u00A0"));
    });
    remainingNodes.forEach((node) => el.appendChild(node));
    setMessage(getComposerText(el));
  }, [removeKnowledgeBaseChip, selectedKnowledgeBases]);

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
      if (
        e.key === "Tab" &&
        addMenuOpen &&
        !e.shiftKey
      ) {
        const suggestionRoot = addMenuSuggestionMode
          ? document
          : document.querySelector("[data-add-menu-content]");
        if (suggestionRoot && focusDropdownOption(suggestionRoot)) {
          e.preventDefault();
          return;
        }
      }
      if (e.key === "Escape" && addMenuOpen) {
        e.preventDefault();
        e.stopPropagation();
        closeAddMenuAndRestoreComposerFocus(e.currentTarget);
        return;
      }
      if (e.key === "@" || e.key === "/") {
        // Let the trigger character be typed into the composer as normal text,
        // then anchor the add-menu at the caret so it opens right next to it.
        requestAnimationFrame(() => {
          setAddMenuSearch("");
          setAddMenuSuggestionMode(false);
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const caret = sel.getRangeAt(0);
            const restoreRange = caret.cloneRange();
            // Measure the just-typed "@" itself rather than the collapsed
            // caret — a collapsed range can report an empty (0,0) rect.
            let rect = caret.getBoundingClientRect();
            if (
              caret.startOffset > 0 &&
              caret.startContainer.nodeType === Node.TEXT_NODE
            ) {
              const charRange = document.createRange();
              charRange.setStart(caret.startContainer, caret.startOffset - 1);
              charRange.setEnd(caret.startContainer, caret.startOffset);
              const charRect = charRange.getBoundingClientRect();
              if (charRect.width > 0 || charRect.height > 0) rect = charRect;
            }
            if (rect.left !== 0 || rect.bottom !== 0) {
              setAddMenuAnchor({ left: rect.left, top: rect.bottom });
            }
            setTimeout(() => {
              const el = mentionTextareaRef.current;
              if (!el) return;
              el.focus();
              const nextSelection = window.getSelection();
              nextSelection?.removeAllRanges();
              nextSelection?.addRange(restoreRange);
            }, 0);
          }
          anchoredAddMenuKeepOpenUntilRef.current = Date.now() + 500;
          setAddMenuOpen(true);
        });
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        beginConversation(mentionTextareaRef.current ? getComposerText(mentionTextareaRef.current) : message);
      }
    },
    [
      addMenuOpen,
      addMenuSuggestionMode,
      beginConversation,
      closeAddMenuAndRestoreComposerFocus,
      message,
    ]
  );

  const handleComposerKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      saveSelection();
      if (addMenuOpen && !addMenuSuggestionMode) {
        const text = getComposerText(e.currentTarget);
        if (!text.includes("@") && !text.includes("/")) {
          anchoredAddMenuKeepOpenUntilRef.current = 0;
          closeAddMenuAndRestoreComposerFocus(e.currentTarget);
          return;
        }
        const search = getPromptAnchoredMenuSearch(text);
        if (search && !composerAddMenuHasResults(search)) {
          closeAddMenuAndRestoreComposerFocus(e.currentTarget);
          return;
        }
        setAddMenuSearch(search);
      }
    },
    [
      addMenuOpen,
      addMenuSuggestionMode,
      closeAddMenuAndRestoreComposerFocus,
      composerAddMenuHasResults,
      saveSelection,
    ]
  );

  const arrivedViaChat = searchParams.get("from") === "chat";

  const handleNewChat = useCallback(() => {
    setActiveConv(null);
    setMessage("");
    setSelectedWorkflows([]);
    setWorkflowSearch("");
    if (mentionTextareaRef.current) mentionTextareaRef.current.textContent = "";
    savedRangeRef.current = null;
    pendingChatIdRef.current = null;
    if (id === "new") {
      router.replace("/agent/new");
    } else {
      router.push("/agent/new");
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

  const activeAgent =
    id === "new"
      ? newChatWorkflows.length === 1
        ? { id: newChatWorkflows[0].id, name: newChatWorkflows[0].name }
        : newChatWorkflows.length > 1
          ? {
              id: newChatWorkflows[0].id,
              name: `${newChatWorkflows[0].name} +${newChatWorkflows.length - 1}`,
            }
          : null
      : name
        ? { id, name }
        : null;
  const otherAgents = AGENT_DIRECTORY.filter((agent) => agent.id !== activeAgent?.id);

  const renderChatHeader = () => (
    <header className="flex h-12 shrink-0 items-center gap-1 px-3">
      <Link
        href={isNewChat ? "/" : "/agents"}
        aria-label="Back"
        className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4 shrink-0" />
      </Link>
      {activeAgent && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="group/agent flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              <span className="relative flex size-5 shrink-0 items-center justify-center">
                <span className="flex size-5 items-center justify-center transition-opacity group-hover/agent:opacity-0">
                  {getAgentIcon(activeAgent.id, "size-4 shrink-0 text-muted-foreground")}
                </span>
                <ChevronDownIcon className="absolute size-4 text-muted-foreground opacity-0 transition-opacity group-hover/agent:opacity-100" />
              </span>
              <span className="min-w-0 truncate">{activeAgent.name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-64">
            <div className="max-h-72 overflow-y-auto py-1">
              {otherAgents.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() =>
                    router.push(`/agent/${agent.id}?name=${encodeURIComponent(agent.name)}`)
                  }
                  className="flex items-center gap-2"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-black/8">
                    {getAgentIcon(agent.id, "size-4 shrink-0 text-muted-foreground")}
                  </span>
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
      )}
      {activeAgent && <span className="shrink-0 text-sm text-muted-foreground/50">/</span>}
      <span className="min-w-0 max-w-[24rem] truncate text-sm text-muted-foreground">
        {conversationTitle}
      </span>
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
            Hey Fred, how can I help?
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
    { id: "5", name: "Peak Season Comms Writer", description: "Creates coordinated peak-season shipper and consumer communications.", labels: ["Comms", "Peak"], integrations: ["teams", "salesforce"], runsCount: 1532 },
    { id: "9", name: "Volume Forecaster", description: "Forecasts weekly and seasonal package volume by service and lane.", labels: ["Analytics", "Ops"], integrations: ["outlook", "salesforce", "sharepoint"], runsCount: 1024 },
    { id: "11", name: "Delivery Support Bot", description: "Handles shipper and consignee questions on tracking and claims.", labels: ["Support", "Tracking"], integrations: ["teams", "connector", "sharepoint"], runsCount: 1893 },
  ];

  /* ── New Chat ── */
  if (isNewChat) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-muted" key={id}>
        <AgentSidebar
          selectedCategory="all"
          onCategoryChange={() => router.push("/agents")}
          categories={[
            { id: "work", label: "Hub Ops" },
            { id: "marketing", label: "Customer Service" },
            { id: "sales", label: "Enterprise Sales" },
          ]}
          organisationName="FedEx"
          userName="Fred Smith"
          onNewChat={handleNewChat}
          activeChatId={conversationId}
        />
        <div
          key={newChatKey}
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background"
          onDragEnter={(e) => {
            if (!e.dataTransfer?.types.includes("Files")) return;
            e.preventDefault();
            dragDepthRef.current += 1;
            setIsDraggingFiles(true);
          }}
          onDragOver={(e) => {
            if (!e.dataTransfer?.types.includes("Files")) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={(e) => {
            if (!e.dataTransfer?.types.includes("Files")) return;
            dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
            if (dragDepthRef.current === 0) setIsDraggingFiles(false);
          }}
          onDrop={(e) => {
            if (!e.dataTransfer?.types.includes("Files")) return;
            e.preventDefault();
            dragDepthRef.current = 0;
            setIsDraggingFiles(false);
            const files = Array.from(e.dataTransfer.files ?? []);
            if (files.length) addAttachedFiles(files);
          }}
        >
          {isDraggingFiles && (
            <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-foreground/30 bg-background/60 px-10 py-8 text-center">
                <UploadIcon className="size-8 text-muted-foreground" />
                <div className="text-sm font-medium">Drop files to upload</div>
                <div className="text-xs text-muted-foreground">Release to attach them to this chat</div>
              </div>
            </div>
          )}
          {showChat ? (
            /* ── After first message: chat view ── */
            <>
              <div className="relative z-10">{renderChatHeader()}</div>
              <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
                <ChatThread chatId={conversationId!} agentName="Assistant" />
              </div>
              <div className="shrink-0 px-4 pb-4 pt-2">
                <div className="mx-auto max-w-[48rem] flex flex-col rounded-xl border border-border bg-background px-3 pt-3 pb-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
                  <AttachedFilesRow files={attachedFiles} onRemove={removeAttachedFile} />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a message…"
                    rows={3}
                    className="min-h-[72px] w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center gap-1 pt-2">
                    <FileAttachButton onFiles={addAttachedFiles} /><AddMenu uploadOnly={newChatAgentApps != null} toggles={toolToggles} onToggle={(key) => setToolToggles((prev) => ({ ...prev, [key]: !prev[key] }))} connectedConnectors={connectedConnectors} onConnectorChange={setConnectedConnectors} onActiveAppsChange={setPromptApps} onRequestConnect={openConnectionSetup} onOpenMoreApps={() => setMoreAppsOpen(true)} side="top" agentApps={newChatAgentApps} activeApps={promptApps} selectedKnowledgeBases={selectedKnowledgeBases} onKnowledgeBaseChange={setSelectedKnowledgeBases} onSelectPrompt={applyPrompt} />
                    <ComposerToolIcons connectedConnectors={connectedConnectors} activeApps={promptApps} selectedKnowledgeBases={selectedKnowledgeBases} onConnectorChange={setConnectedConnectors} onActiveAppsChange={setPromptApps} onKnowledgeBaseChange={setSelectedKnowledgeBases} onEditConnection={openConnectionSetup} showConnectionPulse={false} />
                    <div className="ml-auto flex items-center gap-0.5">
                      <ModelMenu
                        selectedId={selectedModelId}
                        onSelect={setSelectedModelId}
                        effort={effort}
                        onEffortChange={setEffort}
                        thinking={thinking}
                        onThinkingChange={setThinking}
                        side="top"
                      />
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
              <div className="relative flex flex-1 flex-col overflow-y-auto gap-6">
              <div
                aria-hidden
                className="dotted-backdrop pointer-events-none absolute inset-x-0 top-0 h-full"
              />
              {/* Greeting + composer */}
              <div className="flex w-full shrink-0 flex-col items-center px-4 pt-[24vh] pb-10">
                <div className="mx-auto w-full max-w-[48rem] flex flex-col items-center gap-10 text-center">
                  <div className="flex flex-col gap-1.5">
                    <h1 className="text-[2rem] font-bold tracking-tight leading-none text-black dark:text-white">
                      Hey Fred, <span className="text-foreground/85">what can I help with?</span>
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
                        <AttachedFilesRow files={attachedFiles} onRemove={removeAttachedFile} />
                        <div
                          ref={mentionTextareaRef}
                          contentEditable
                          suppressContentEditableWarning
                          role="textbox"
                          aria-multiline="true"
                          data-placeholder="Ask, create, explore, or @ add Tools, Skills, Saved Prompts"
                          onInput={(e) => {
                            const text = getComposerText(e.currentTarget);
                            setMessage(text);
                            if (addMenuOpen && !addMenuSuggestionMode) {
                              if (!text.includes("@") && !text.includes("/")) {
                                anchoredAddMenuKeepOpenUntilRef.current = 0;
                                closeAddMenuAndRestoreComposerFocus(e.currentTarget);
                                return;
                              }
                              const search = getPromptAnchoredMenuSearch(text);
                              if (search && !composerAddMenuHasResults(search)) {
                                closeAddMenuAndRestoreComposerFocus(e.currentTarget);
                                return;
                              }
                              setAddMenuSearch(search);
                              return;
                            }
                            if (openAddMenuForPromptMention(text, e.currentTarget)) {
                              return;
                            }
                            openAddMenuForAppSearch(text, e.currentTarget);
                          }}
                          onKeyUp={handleComposerKeyUp}
                          onMouseUp={saveSelection}
                          onKeyDown={handleComposerKeyDown}
                          className="composer-editable min-h-[72px] w-full whitespace-pre-wrap break-words bg-transparent text-left text-sm outline-none leading-relaxed"
                        />
                        <div className="flex items-center gap-1 pt-1">
                          {/* Left toolbar */}
                          <div className="flex items-center gap-0.5">
                            <FileAttachButton onFiles={addAttachedFiles} /><AddMenu toggles={toolToggles} onToggle={(key) => setToolToggles((prev) => ({ ...prev, [key]: !prev[key] }))} connectedConnectors={connectedConnectors} onConnectorChange={setConnectedConnectors} onActiveAppsChange={setPromptApps} onRequestConnect={openConnectionSetup} onOpenMoreApps={() => setMoreAppsOpen(true)} side="bottom" activeApps={promptApps} selectedKnowledgeBases={selectedKnowledgeBases} onKnowledgeBaseChange={setSelectedKnowledgeBases} onSelectPrompt={applyPrompt} onAgentsClick={openMentionMenuFromButton} agentsAutoSelect={autoSelectWorkflow} workflowSearch={workflowSearch} onWorkflowSearchChange={setWorkflowSearch} workflowTab={workflowTab} onWorkflowTabChange={setWorkflowTab} selectedWorkflowIds={selectedWorkflows.map((w) => w.id)} onSelectWorkflow={handleSelectWorkflow} onAutoSelectWorkflowChange={setAutoSelectWorkflow} />
                            {/* Caret-anchored menu opened by typing "@" in the composer. */}
                            {addMenuSuggestionMode ? (
                              <AppToolSuggestionPanel
                                anchor={addMenuAnchor}
                                searchValue={addMenuSearch}
                                onSelect={handleSelectAppSuggestion}
                              />
                            ) : (
                              <AddMenuAnchored toggles={toolToggles} onToggle={(key) => setToolToggles((prev) => ({ ...prev, [key]: !prev[key] }))} connectedConnectors={connectedConnectors} onConnectorChange={setConnectedConnectors} onActiveAppsChange={setPromptApps} onRequestConnect={openConnectionSetup} onOpenMoreApps={() => setMoreAppsOpen(true)} side="bottom" activeApps={promptApps} selectedKnowledgeBases={selectedKnowledgeBases} onKnowledgeBaseChange={setSelectedKnowledgeBases} onSelectPrompt={applyPrompt} onAgentsClick={openMentionMenuFromButton} agentsAutoSelect={autoSelectWorkflow} workflowSearch={workflowSearch} onWorkflowSearchChange={setWorkflowSearch} workflowTab={workflowTab} onWorkflowTabChange={setWorkflowTab} selectedWorkflowIds={selectedWorkflows.map((w) => w.id)} onSelectWorkflow={handleSelectWorkflow} onAutoSelectWorkflowChange={setAutoSelectWorkflow} onSelectConnectorMention={handleSelectConnectorMention} onSelectKnowledgeBaseMention={handleSelectKnowledgeBaseMention} open={addMenuOpen} onOpenChange={handleAnchoredAddMenuOpenChange} anchor={addMenuAnchor} searchValue={addMenuSearch} />
                            )}
                            <ComposerToolIcons connectedConnectors={connectedConnectors} activeApps={promptApps} selectedKnowledgeBases={selectedKnowledgeBases} onConnectorChange={setConnectedConnectors} onActiveAppsChange={setPromptApps} onKnowledgeBaseChange={setSelectedKnowledgeBases} onEditConnection={openConnectionSetup} showConnectionPulse={false} />
                            <WorkflowMentionMenu
                              search={workflowSearch}
                              onSearchChange={setWorkflowSearch}
                              tab={workflowTab}
                              onTabChange={setWorkflowTab}
                              selectedIds={selectedWorkflows.map((w) => w.id)}
                              onSelect={handleSelectWorkflow}
                              autoSelect={autoSelectWorkflow}
                              onAutoSelectChange={setAutoSelectWorkflow}
                              side="bottom"
                              open={mentionMenuOpen}
                              onOpenChange={setMentionMenuOpen}
                              anchor={mentionAnchor}
                            />
                          </div>
                          {/* Right toolbar */}
                          <div className="ml-auto flex items-center gap-0.5">
                            <ModelMenu
                              selectedId={selectedModelId}
                              onSelect={setSelectedModelId}
                              effort={effort}
                              onEffortChange={setEffort}
                              thinking={thinking}
                              onThinkingChange={setThinking}
                              side="bottom"
                            />
                            <button type="button" className={toolbarBtn} title="Voice input">
                              <MicIcon className={toolbarIcon} />
                            </button>
                            <button
                              type="button"
                              onClick={() => beginConversation(mentionTextareaRef.current ? getComposerText(mentionTextareaRef.current) : message)}
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
                      <div className="flex items-center -space-x-1.5 ml-auto">
                        <div className="size-6 rounded-md border bg-background flex items-center justify-center overflow-hidden" title="SharePoint">
                          {integrationIcons.sharepoint}
                        </div>
                        <div className="size-6 rounded-md border bg-background flex items-center justify-center overflow-hidden" title="Teams">
                          {integrationIcons.teams}
                        </div>
                        <div className="size-6 rounded-md border bg-background flex items-center justify-center overflow-hidden" title="Outlook">
                          {integrationIcons.outlook}
                        </div>
                        <button type="button" className="!ml-3 text-muted-foreground/50 hover:text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>
                          <XIcon className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Prompt examples */}
                  <div className="mt-6 w-full text-left">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Suggested Prompts</div>
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
                            // Load the tool without connecting it, so it shows
                            // in the Tools button with a "needs connection" dot.
                            setPromptApps([example.app]);
                          }
                          if (example.agentId) {
                            setPromptApps([]);
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
          activeApps={promptApps}
          onActiveAppsChange={setPromptApps}
          onRequestConnect={openConnectionSetup}
        />
        <ConnectionSetupModal
          open={connectionSetupOpen}
          integrationId={editingConnectionId}
          isConnected={editingConnectionId ? connectedConnectors.includes(editingConnectionId) : false}
          onOpenChange={(open) => {
            setConnectionSetupOpen(open);
            if (!open) setEditingConnectionId(null);
          }}
          onSave={handleConnectionSave}
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
          { id: "work", label: "Hub Ops" },
          { id: "marketing", label: "Customer Service" },
          { id: "sales", label: "Enterprise Sales" },
        ]}
        organisationName="FedEx"
        userName="Fred Smith"
        onNewChat={handleNewChat}
        activeChatId={conversationId}
        filterAgentId={id}
      />

      {/* Chat panel */}
      <div
        className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background"
        onDragEnter={(e) => {
          if (!e.dataTransfer?.types.includes("Files")) return;
          e.preventDefault();
          dragDepthRef.current += 1;
          setIsDraggingFiles(true);
        }}
        onDragOver={(e) => {
          if (!e.dataTransfer?.types.includes("Files")) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={(e) => {
          if (!e.dataTransfer?.types.includes("Files")) return;
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
          if (dragDepthRef.current === 0) setIsDraggingFiles(false);
        }}
        onDrop={(e) => {
          if (!e.dataTransfer?.types.includes("Files")) return;
          e.preventDefault();
          dragDepthRef.current = 0;
          setIsDraggingFiles(false);
          const files = Array.from(e.dataTransfer.files ?? []);
          if (files.length) addAttachedFiles(files);
        }}
      >
        {isDraggingFiles && (
          <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-foreground/30 bg-background/60 px-10 py-8 text-center">
              <UploadIcon className="size-8 text-muted-foreground" />
              <div className="text-sm font-medium">Drop files to upload</div>
              <div className="text-xs text-muted-foreground">Release to attach them to this chat</div>
            </div>
          </div>
        )}
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
                    <AttachedFilesRow files={attachedFiles} onRemove={removeAttachedFile} />
                    <div
                      ref={mentionTextareaRef}
                      contentEditable
                      suppressContentEditableWarning
                      role="textbox"
                      aria-multiline="true"
                      data-placeholder="Ask, create, explore, or @ add Tools, Skills, Saved Prompts"
                      onInput={(e) => setMessage(getComposerText(e.currentTarget))}
                      onKeyUp={saveSelection}
                      onMouseUp={saveSelection}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          beginConversation(mentionTextareaRef.current ? getComposerText(mentionTextareaRef.current) : message);
                        }
                      }}
                      className="composer-editable min-h-[72px] w-full whitespace-pre-wrap break-words bg-transparent text-left text-sm outline-none leading-relaxed"
                    />
                    <div className="flex items-center gap-1 pt-1">
                      <FileAttachButton onFiles={addAttachedFiles} /><AddMenu uploadOnly toggles={toolToggles} onToggle={(key) => setToolToggles((prev) => ({ ...prev, [key]: !prev[key] }))} connectedConnectors={connectedConnectors} onConnectorChange={setConnectedConnectors} onRequestConnect={openConnectionSetup} onOpenMoreApps={() => setMoreAppsOpen(true)} side="bottom" agentApps={getAgentApps(id)} selectedKnowledgeBases={selectedKnowledgeBases} onKnowledgeBaseChange={setSelectedKnowledgeBases} onSelectPrompt={applyPrompt} />
                      <ComposerToolIcons connectedConnectors={connectedConnectors} selectedKnowledgeBases={selectedKnowledgeBases} onConnectorChange={setConnectedConnectors} onKnowledgeBaseChange={setSelectedKnowledgeBases} onEditConnection={openConnectionSetup} />
                      <div className="ml-auto flex items-center gap-0.5">
                        <button type="button" className={toolbarBtn} title="Voice input">
                          <MicIcon className={toolbarIcon} />
                        </button>
                        <button
                          type="button"
                          onClick={() => beginConversation(mentionTextareaRef.current ? getComposerText(mentionTextareaRef.current) : message)}
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
                <AttachedFilesRow files={attachedFiles} onRemove={removeAttachedFile} />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message…"
                  rows={3}
                  className="min-h-[72px] w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <div className="flex items-center gap-1 pt-2">
                  <FileAttachButton onFiles={addAttachedFiles} /><AddMenu uploadOnly toggles={toolToggles} onToggle={(key) => setToolToggles((prev) => ({ ...prev, [key]: !prev[key] }))} connectedConnectors={connectedConnectors} onConnectorChange={setConnectedConnectors} onRequestConnect={openConnectionSetup} onOpenMoreApps={() => setMoreAppsOpen(true)} side="top" agentApps={getAgentApps(id)} selectedKnowledgeBases={selectedKnowledgeBases} onKnowledgeBaseChange={setSelectedKnowledgeBases} onSelectPrompt={applyPrompt} />
                  <ComposerToolIcons connectedConnectors={connectedConnectors} selectedKnowledgeBases={selectedKnowledgeBases} onConnectorChange={setConnectedConnectors} onKnowledgeBaseChange={setSelectedKnowledgeBases} onEditConnection={openConnectionSetup} />
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
        onRequestConnect={openConnectionSetup}
      />
      <ConnectionSetupModal
        open={connectionSetupOpen}
        integrationId={editingConnectionId}
        isConnected={editingConnectionId ? connectedConnectors.includes(editingConnectionId) : false}
        onOpenChange={(open) => {
          setConnectionSetupOpen(open);
          if (!open) setEditingConnectionId(null);
        }}
        onSave={handleConnectionSave}
      />
    </div>
  );
}
