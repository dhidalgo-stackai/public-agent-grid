"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  WorkflowIcon,
  PlusIcon,
  SquarePenIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ZapIcon,
  PanelLeftIcon,
  SearchIcon,
  XIcon,
  ListFilterIcon,
  StarIcon,
  BookOpenIcon,
  PuzzleIcon,
  Plug2Icon,
  CheckIcon,
  MoreHorizontalIcon,
  GlobeIcon,
  UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MOCK_RECENT_CHATS,
  RECENT_CHATS_EVENT,
  getExtraRecentChats,
  type ChatItem,
} from "@/lib/chats-data";
import { MOCK_FORM_RUNS, MOCK_BATCH_RUNS, type RunItem } from "@/lib/runs-data";
import { getAgentIcon } from "@/lib/agent-icons";
import { ChatSearchModal } from "@/components/chat-search-modal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

function ChatSidebarLink({
  item,
  activeChatId,
  fallbackAgentId,
}: {
  item: ChatItem;
  activeChatId: string | null;
  fallbackAgentId?: string;
}) {
  const isActive = activeChatId === item.id;
  return (
    <Link
      href={
        item.agentId
          ? `/agent/${item.agentId}?chat=${item.id}${item.agentName ? `&name=${encodeURIComponent(item.agentName)}` : ""}&from=chat`
          : `/agent/new?chat=${item.id}`
      }
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left transition-colors hover:bg-black/5",
        isActive && "bg-black/8 font-medium"
      )}
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-black/8">
        {getAgentIcon(item.agentId ?? fallbackAgentId)}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm leading-none",
          isActive ? "text-foreground" : "text-foreground/70"
        )}
      >
        {item.label.replace(/@\s*/g, "").replace(/\s{2,}/g, " ").trim()}
      </span>
    </Link>
  );
}

function RunSidebarLink({ item, basePath }: { item: RunItem; basePath: string }) {
  return (
    <Link
      href={`${basePath}/${item.agentId}?name=${encodeURIComponent(item.agentName)}&run=${item.id}`}
      className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left transition-colors hover:bg-black/5"
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-black/8">
        {getAgentIcon(item.agentId)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm leading-none text-foreground/70">
        {item.label}
      </span>
    </Link>
  );
}

// Lists always cap at RUNS_COLLAPSED_COUNT items by default; a "Show more"
// toggle to reveal the rest only appears when a list exceeds the threshold.
const RUNS_SHOW_MORE_THRESHOLD = 5;
const RUNS_COLLAPSED_COUNT = 2;
const RECENTS_COLLAPSED_COUNT = 10;

interface Category {
  id: string;
  label: string;
}

interface AgentSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories?: Category[];
  organisationName?: string;
  organisationLogoUrl?: string;
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
  recentChats?: ChatItem[];
  activeChatId?: string | null;
  onNewChat?: () => void;
  agentMode?: boolean;
  filterAgentId?: string;
  activeSection?: "agents" | "automations" | "knowledge-bases" | "connections" | "skills";
  favoriteAgents?: { id: string; name: string }[];
  defaultCollapsed?: boolean;
}

export function AgentSidebar({
  selectedCategory,
  onCategoryChange,
  categories = [],
  organisationName = "FedEx",
  organisationLogoUrl = "/fedex-logo.png",
  userName = "Fred Smith",
  userEmail = "fred.smith@fedex.com",
  userAvatarUrl,
  recentChats = MOCK_RECENT_CHATS,
  activeChatId = null,
  onNewChat,
  agentMode = false,
  filterAgentId,
  activeSection,
  favoriteAgents = [],
  defaultCollapsed = false,
}: AgentSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [peeking, setPeeking] = useState(false);
  const initials = organisationName[0]?.toUpperCase() ?? "S";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const pathname = usePathname();
  const router = useRouter();

  const [chatsOpen, setChatsOpen] = useState(true);
  const [chatsShowAll, setChatsShowAll] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [extraChats, setExtraChats] = useState<ChatItem[]>([]);
  const [chatFilterAgentId, setChatFilterAgentId] = useState<string | null>(
    !!filterAgentId && !activeChatId ? filterAgentId : null
  );
  const [chatFilterInterface, setChatFilterInterface] = useState<
    "chat" | "form" | "batch" | null
  >(null);
  const hasActiveFilter = !!chatFilterAgentId || !!chatFilterInterface;

  const teamCategories =
    categories.length > 0
      ? categories
      : [
          { id: "work", label: "Hub Ops" },
          { id: "marketing", label: "Customer Service" },
          { id: "sales", label: "Enterprise Sales" },
        ];

  useEffect(() => {
    const refresh = () => setExtraChats(getExtraRecentChats());
    refresh();
    window.addEventListener(RECENT_CHATS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(RECENT_CHATS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (activeChatId) setChatsOpen(true);
  }, [activeChatId]);

  // Cmd/Ctrl+K starts a new chat from anywhere.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (onNewChat) onNewChat();
        else router.push("/agent/new");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNewChat, router]);

  const allChats = [...extraChats, ...recentChats];
  const filterableAgents = Array.from(
    new Map(
      allChats
        .filter((c) => c.agentId && c.agentName)
        .map((c) => [c.agentId as string, c.agentName as string])
    )
  ).map(([id, name]) => ({ id, name }));
  const mergedChats = chatFilterAgentId
    ? allChats.filter((c) => c.agentId === chatFilterAgentId)
    : allChats;

  // Combined "Recents" list — chats, forms, and batch interfaces in one stream.
  const recentItems: { key: string; node: ReactNode }[] = [
    ...(chatFilterInterface && chatFilterInterface !== "chat"
      ? []
      : mergedChats.map((item) => ({
          key: `chat-${item.id}`,
          node: (
            <ChatSidebarLink
              key={`chat-${item.id}`}
              item={item}
              activeChatId={activeChatId}
              fallbackAgentId={filterAgentId}
            />
          ),
        }))),
    ...(chatFilterInterface && chatFilterInterface !== "form"
      ? []
      : MOCK_FORM_RUNS.map((item) => ({
          key: `form-${item.id}`,
          node: <RunSidebarLink key={`form-${item.id}`} item={item} basePath="/form" />,
        }))),
    ...(chatFilterInterface && chatFilterInterface !== "batch"
      ? []
      : MOCK_BATCH_RUNS.map((item) => ({
          key: `batch-${item.id}`,
          node: <RunSidebarLink key={`batch-${item.id}`} item={item} basePath="/batch" />,
        }))),
  ];

  const isAutomations =
    activeSection === "automations" ||
    (activeSection === undefined && pathname.startsWith("/automations"));
  const isKnowledgeBases =
    activeSection === "knowledge-bases" || pathname.startsWith("/knowledge-bases");
  const isConnections =
    activeSection === "connections" || pathname.startsWith("/connections");
  const isNewChat = pathname === "/agent/new";
  const isAgentsActive =
    (activeSection === "agents" ||
      selectedCategory === "all" ||
      teamCategories.some((cat) => cat.id === selectedCategory)) &&
    !isAutomations &&
    !isKnowledgeBases &&
    !isConnections &&
    !isNewChat &&
    !filterAgentId &&
    !activeChatId;

  const filteredChats = mergedChats.filter((c) =>
    c.label.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const railPanel = (
    <div className="flex h-full w-14 flex-col border-r border-black/5 bg-muted">
      <div className="flex flex-col items-center gap-1 px-2 py-3">
        <Avatar className="size-7 rounded-md border border-black/10">
          {organisationLogoUrl && (
            <AvatarImage src={organisationLogoUrl} alt={organisationName} loading="eager" />
          )}
          <AvatarFallback className="rounded-md text-xs font-semibold bg-neutral-900 text-white">{initials}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col items-center gap-1 px-2">
        <button
          type="button"
          onClick={onNewChat}
          title="New Chat"
          className="flex size-9 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-black/5 hover:text-foreground"
        >
          <SquarePenIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (isAutomations || isKnowledgeBases || isConnections) {
              router.push("/agents");
            } else {
              onCategoryChange("all");
            }
          }}
          title="All Agents"
          className={cn(
            "flex size-9 items-center justify-center rounded-md transition-colors hover:bg-black/5",
            isAgentsActive
              ? "bg-black/8 text-foreground"
              : "text-foreground/60 hover:text-foreground"
          )}
        >
          <WorkflowIcon className="size-4" />
        </button>
        <Link
          href="/automations"
          title="My automations"
          className={cn(
            "flex size-9 items-center justify-center rounded-md transition-colors hover:bg-black/5",
            isAutomations ? "bg-black/8 text-foreground" : "text-foreground/60 hover:text-foreground"
          )}
        >
          <ZapIcon className="size-4" />
        </Link>
        <Link
          href="/knowledge-bases"
          title="Library"
          className={cn(
            "flex size-9 items-center justify-center rounded-md transition-colors hover:bg-black/5",
            isKnowledgeBases ? "bg-black/8 text-foreground" : "text-foreground/60 hover:text-foreground"
          )}
        >
          <BookOpenIcon className="size-4" />
        </Link>
        <Link
          href="/connections"
          title="Connections"
          className={cn(
            "flex size-9 items-center justify-center rounded-md transition-colors hover:bg-black/5",
            isConnections ? "bg-black/8 text-foreground" : "text-foreground/60 hover:text-foreground"
          )}
        >
          <Plug2Icon className="size-4" />
        </Link>
      </div>

      <div className="mt-auto border-t border-black/5 p-2 pb-3 flex justify-center">
        <Avatar className="size-6 rounded-full">
          {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
          <AvatarFallback className="text-[10px] bg-neutral-200 text-neutral-700">{userInitials}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );

  const expandedPanel = agentMode ? (
      <div className="flex h-full w-64 flex-col border-r border-black/5 bg-background">
        {/* Org header */}
        <div className="flex items-center gap-2 pl-3.5 pr-3 py-3">
          <Avatar className="size-7 rounded-md border border-black/10">
            {organisationLogoUrl && (
              <AvatarImage src={organisationLogoUrl} alt={organisationName} loading="eager" />
            )}
            <AvatarFallback className="rounded-md text-xs font-semibold bg-neutral-900 text-white">{initials}</AvatarFallback>
          </Avatar>
          <p className="flex-1 text-sm font-semibold tracking-tight truncate">{organisationName}</p>
          <button
            type="button"
            onClick={() => { setCollapsed((prev) => !prev); setPeeking(false); }}
            className="shrink-0 rounded p-0.5 text-muted-foreground/50 transition-colors hover:bg-black/5 hover:text-muted-foreground"
          >
            <PanelLeftIcon className="size-3.5" />
          </button>
        </div>

        <div className="px-2">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground"
          >
            <SquarePenIcon className="size-4 shrink-0" />
            <span>New Chat</span>
          </button>
        </div>

        <p className="px-5 pt-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
          Recents
        </p>

        {/* Search */}
        <div className="px-3 pb-1">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search"
              className="h-8 w-full rounded-md border border-black/10 bg-background py-1.5 pl-8 pr-7 text-xs text-foreground shadow-xs outline-none placeholder:text-muted-foreground/50 focus:border-black/15 focus:ring-2 focus:ring-ring/20"
            />
            {chatSearch && (
              <button
                type="button"
                onClick={() => setChatSearch("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground/50 transition-colors hover:bg-black/5 hover:text-muted-foreground"
                aria-label="Clear search"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </div>
        </div>

        <div className="no-scrollbar flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
          {filteredChats.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground/50">No conversations found</p>
          ) : (
            filteredChats.map((item) => (
              <ChatSidebarLink
                key={item.id}
                item={item}
                activeChatId={activeChatId}
                fallbackAgentId={filterAgentId}
              />
            ))
          )}
        </div>

        <div className="mt-auto border-t border-black/5 p-2 pb-3">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-black/5"
          >
            <Avatar className="size-8 rounded-full">
              {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
              <AvatarFallback className="text-xs bg-neutral-200 text-neutral-700">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </button>
        </div>
      </div>
    ) : (
    <div className="flex h-full w-64 flex-col border-r border-black/5 bg-muted">
      {/* Org header */}
      <div className="flex items-center gap-2 pl-3.5 pr-3 py-3">
        <Avatar className="size-7 rounded-md border border-black/10">
          {organisationLogoUrl && (
            <AvatarImage src={organisationLogoUrl} alt={organisationName} loading="eager" />
          )}
          <AvatarFallback className="rounded-md text-xs font-semibold bg-neutral-900 text-white">{initials}</AvatarFallback>
        </Avatar>
        <p className="flex-1 text-sm font-semibold tracking-tight truncate">
          {organisationName.replace(" ", " ")}
        </p>
        <button
          type="button"
          onClick={() => { setCollapsed((prev) => !prev); setPeeking(false); }}
          className="shrink-0 rounded p-0.5 text-muted-foreground/50 transition-colors hover:bg-black/5 hover:text-muted-foreground"
        >
          <PanelLeftIcon className="size-3.5" />
        </button>
      </div>

      {/* Nav */}
      <div className="no-scrollbar flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        <button
          type="button"
          onClick={onNewChat}
          className="group/newchat flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground"
        >
          <span className="flex size-5 shrink-0 items-center justify-center">
            <SquarePenIcon className="size-4" />
          </span>
          <span>New Chat</span>
          <span className="ml-auto flex items-center gap-0.5 text-xs text-muted-foreground/70 opacity-0 transition-opacity group-hover/newchat:opacity-100">
            <kbd className="font-sans">⌘</kbd>
            <kbd className="font-sans">K</kbd>
          </span>
        </button>

        <div className="flex flex-col gap-0.5">
          <div
            className={cn(
              "group/agents relative flex w-full items-center rounded-md text-sm leading-none transition-colors",
              isAgentsActive
                ? "bg-black/8 text-foreground font-medium"
                : "text-foreground/70 hover:bg-black/5 hover:text-foreground"
            )}
          >
            {/* Full-row navigation target */}
            <button
              type="button"
              onClick={() => {
                if (isAutomations || isKnowledgeBases || isConnections) {
                  router.push("/agents");
                } else {
                  onCategoryChange("all");
                }
              }}
              aria-label="Agents"
              className="absolute inset-0 rounded-md"
            />
            <span className="pointer-events-none flex flex-1 items-center gap-2 py-1.5 pl-3 pr-1">
              <span className="flex size-5 shrink-0 items-center justify-center">
                <WorkflowIcon className="size-4" />
              </span>
              <span>Agents</span>
            </span>
            <button
              type="button"
              onClick={() => setCategoriesOpen((v) => !v)}
              aria-expanded={categoriesOpen}
              aria-label="Toggle categories"
              className="relative z-10 mr-1 flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-black/10 hover:text-muted-foreground"
            >
              <ChevronDownIcon
                className={cn(
                  "size-3.5 shrink-0 transition-transform duration-150",
                  categoriesOpen && "rotate-180"
                )}
              />
            </button>
          </div>
          {categoriesOpen && (
            <div className="flex flex-col gap-0.5 pb-0.5">
              {teamCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={cn(
                    "flex w-full items-center rounded-md py-1.5 pl-10 pr-3 text-left text-sm leading-none transition-colors",
                    selectedCategory === cat.id &&
                      !isAutomations &&
                      !isNewChat &&
                      !filterAgentId &&
                      !activeChatId
                      ? "bg-black/8 font-medium text-foreground"
                      : "text-foreground/60 hover:bg-black/5 hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/automations"
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm leading-none transition-colors",
            isAutomations
              ? "bg-black/8 text-foreground font-medium"
              : "text-foreground/70 hover:bg-black/5 hover:text-foreground"
          )}
        >
          <span className="flex size-5 shrink-0 items-center justify-center">
            <ZapIcon className="size-4" />
          </span>
          <span>My automations</span>
        </Link>

        <Link
          href="/knowledge-bases"
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm leading-none transition-colors",
            isKnowledgeBases
              ? "bg-black/8 text-foreground font-medium"
              : "text-foreground/70 hover:bg-black/5 hover:text-foreground"
          )}
        >
          <span className="flex size-5 shrink-0 items-center justify-center">
            <BookOpenIcon className="size-4" />
          </span>
          <span>Library</span>
        </Link>

        {moreOpen && (
          <>
            <Link
              href="/skills"
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm leading-none transition-colors",
                pathname.startsWith("/skills")
                  ? "bg-black/8 text-foreground font-medium"
                  : "text-foreground/70 hover:bg-black/5 hover:text-foreground"
              )}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <PuzzleIcon className="size-4" />
              </span>
              <span>Skills</span>
            </Link>

            <Link
              href="/connections"
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm leading-none transition-colors",
                isConnections
                  ? "bg-black/8 text-foreground font-medium"
                  : "text-foreground/70 hover:bg-black/5 hover:text-foreground"
              )}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <Plug2Icon className="size-4" />
              </span>
              <span>Connections</span>
            </Link>
          </>
        )}

        {!moreOpen && (
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm leading-none text-foreground/45 transition-colors hover:bg-black/5 hover:text-foreground/70"
          >
            <span className="flex size-5 shrink-0 items-center justify-center">
              <MoreHorizontalIcon className="size-4" />
            </span>
            More
          </button>
        )}

        <div
          role="button"
          tabIndex={0}
          onClick={() => setChatsOpen((v) => !v)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setChatsOpen((v) => !v); } }}
          className="group/chats mt-4 flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground/60 transition-colors hover:bg-black/5 hover:text-muted-foreground"
        >
          <span className="text-left">Recents</span>
          <ChevronRightIcon
            className={cn(
              "size-3 shrink-0 opacity-0 transition-all duration-150 group-hover/chats:opacity-100",
              chatsOpen && "rotate-90"
            )}
          />
          <span className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "relative shrink-0 rounded p-0.5 outline-none transition-colors hover:bg-black/5",
                  hasActiveFilter
                    ? "text-foreground"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
                )}
                aria-label="Filter recents"
              >
                <ListFilterIcon className="size-3.5" />
                {hasActiveFilter && (
                  <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-primary" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              onClick={(e) => e.stopPropagation()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Filter by
              </DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <GlobeIcon className="size-4" />
                  <span className="flex-1">Interface</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-40">
                  {(
                    [
                      { id: "chat", label: "Chat" },
                      { id: "form", label: "Form" },
                      { id: "batch", label: "Batch" },
                    ] as const
                  ).map((opt) => (
                    <DropdownMenuItem
                      key={opt.id}
                      onSelect={(e) => {
                        e.preventDefault();
                        setChatFilterInterface((prev) =>
                          prev === opt.id ? null : opt.id
                        );
                        setChatsOpen(true);
                      }}
                    >
                      <span className="flex-1">{opt.label}</span>
                      {chatFilterInterface === opt.id && (
                        <CheckIcon className="size-4 shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  disabled={filterableAgents.length === 0}
                >
                  <UserIcon className="size-4" />
                  <span className="flex-1">Agent</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-52">
                  {filterableAgents.map((agent) => (
                    <DropdownMenuItem
                      key={agent.id}
                      onSelect={(e) => {
                        e.preventDefault();
                        setChatFilterAgentId((prev) =>
                          prev === agent.id ? null : agent.id
                        );
                        setChatsOpen(true);
                      }}
                    >
                      <span className="flex-1">{agent.name}</span>
                      {chatFilterAgentId === agent.id && (
                        <CheckIcon className="size-4 shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={!hasActiveFilter}
                onSelect={() => {
                  setChatFilterAgentId(null);
                  setChatFilterInterface(null);
                }}
                className="text-red-500 focus:text-red-500 data-[disabled]:text-red-500/40"
              >
                <XIcon className="size-4" />
                <span>Clear all filters</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSearchModalOpen(true);
            }}
            className="shrink-0 rounded p-0.5 text-muted-foreground/50 transition-colors hover:bg-black/5 hover:text-muted-foreground"
            aria-label="Search chats"
          >
            <SearchIcon className="size-3.5" />
          </button>
        </div>
        {chatsOpen && (
          <div className="flex flex-col gap-0.5 pb-0.5">
            {(chatsShowAll ? recentItems : recentItems.slice(0, RECENTS_COLLAPSED_COUNT)).map(
              (entry) => entry.node
            )}
            {recentItems.length > RECENTS_COLLAPSED_COUNT && (
              <button
                type="button"
                onClick={() => setChatsShowAll((v) => !v)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm leading-none text-foreground/45 transition-colors hover:bg-black/5 hover:text-foreground/70"
              >
                <span className="flex size-5 shrink-0 items-center justify-center">
                  <MoreHorizontalIcon className="size-4" />
                </span>
                {chatsShowAll ? "Show less" : `Show ${recentItems.length - RECENTS_COLLAPSED_COUNT} more`}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-black/5 p-2 pb-3">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-black/5"
        >
          <Avatar className="size-8 rounded-full">
            {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
            <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </button>
      </div>
    </div>
  );

  const searchModal = (
    <ChatSearchModal
      open={searchModalOpen}
      onClose={() => setSearchModalOpen(false)}
      chats={allChats}
    />
  );

  return (
    <>
      {searchModal}
      <div
        className="relative flex h-full shrink-0"
        onMouseEnter={collapsed ? () => setPeeking(true) : undefined}
        onMouseLeave={collapsed ? () => setPeeking(false) : undefined}
      >
        {/* Width-reserving track: animates so page content slides smoothly. */}
        <div
          className={cn(
            "relative h-full overflow-hidden transition-[width] duration-300 ease-in-out",
            collapsed && !peeking ? "w-14" : "w-64"
          )}
        >
          {/* Rail (icon) layer — crossfades in when collapsing. */}
          <div
            className={cn(
              "absolute inset-y-0 left-0 w-14 transition-opacity duration-200 ease-in-out",
              collapsed && !peeking ? "opacity-100 delay-200" : "pointer-events-none opacity-0"
            )}
          >
            {railPanel}
          </div>
          {/* Full panel — fixed width so it clips (not reflows) while the track shrinks. */}
          <div
            className={cn(
              "absolute inset-y-0 left-0 w-64 transition-opacity duration-200 ease-in-out",
              collapsed && !peeking ? "pointer-events-none opacity-0" : "opacity-100 delay-200"
            )}
          >
            {expandedPanel}
          </div>
        </div>
      </div>
    </>
  );
}
