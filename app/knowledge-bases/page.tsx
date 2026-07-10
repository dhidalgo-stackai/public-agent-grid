"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpenIcon,
  PlusIcon,
  FolderIcon,
  GlobeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  ShieldIcon,
  SearchIcon,
  LayoutGridIcon,
  ListIcon,
} from "lucide-react";
import { AgentSidebar } from "@/components/agent-sidebar";
import {
  PageHeader,
  pageContainerClass,
  pageContentScrollClass,
  pageContentInnerClass,
} from "@/components/page-layout";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type ConnectionStatus = "connected" | "error" | "none";
type ConnectionProvider =
  | "google-drive"
  | "sharepoint"
  | "website"
  | null;

interface KnowledgeBase {
  id: string;
  name: string;
  connectionProvider: ConnectionProvider;
  connectionStatus: ConnectionStatus;
  connectionName: string | null;
  totalSize: string;
}

const MOCK_KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: "kb-1",
    name: "brightspace",
    connectionProvider: null,
    connectionStatus: "none",
    connectionName: null,
    totalSize: "0 B",
  },
  {
    id: "kb-2",
    name: "Healthcare Docs - Acme",
    connectionProvider: null,
    connectionStatus: "none",
    connectionName: null,
    totalSize: "0 B",
  },
  {
    id: "kb-3",
    name: "Acme Website",
    connectionProvider: "website",
    connectionStatus: "none",
    connectionName: null,
    totalSize: "293 KB",
  },
  {
    id: "kb-4",
    name: "test-multi",
    connectionProvider: null,
    connectionStatus: "none",
    connectionName: null,
    totalSize: "0 B",
  },
  {
    id: "kb-5",
    name: "Shani",
    connectionProvider: null,
    connectionStatus: "none",
    connectionName: null,
    totalSize: "0 B",
  },
  {
    id: "kb-6",
    name: 'Documents for "[prod] FullE2ERun..."',
    connectionProvider: null,
    connectionStatus: "none",
    connectionName: null,
    totalSize: "12.94 KB",
  },
  {
    id: "kb-7",
    name: "Documents for Workflow",
    connectionProvider: "google-drive",
    connectionStatus: "connected",
    connectionName: "Google Drive",
    totalSize: "1.34 MB",
  },
  {
    id: "kb-8",
    name: "Documents for Workflow",
    connectionProvider: "google-drive",
    connectionStatus: "connected",
    connectionName: "Google Drive",
    totalSize: "1.34 MB",
  },
  {
    id: "kb-9",
    name: 'Documents for "citations" 2',
    connectionProvider: null,
    connectionStatus: "none",
    connectionName: null,
    totalSize: "922.47 KB",
  },
  {
    id: "kb-10",
    name: "Khushal's Sharepoint",
    connectionProvider: "sharepoint",
    connectionStatus: "error",
    connectionName: "SharePoint",
    totalSize: "18.48 MB",
  },
  {
    id: "kb-11",
    name: "test",
    connectionProvider: null,
    connectionStatus: "none",
    connectionName: null,
    totalSize: "0 B",
  },
  {
    id: "kb-12",
    name: 'Documents for "ElevenLabs" 2',
    connectionProvider: null,
    connectionStatus: "none",
    connectionName: null,
    totalSize: "505.08 KB",
  },
  {
    id: "kb-13",
    name: 'Documents for "ElevenLabs"',
    connectionProvider: null,
    connectionStatus: "none",
    connectionName: null,
    totalSize: "29.15 KB",
  },
  {
    id: "kb-14",
    name: "test-mcp",
    connectionProvider: null,
    connectionStatus: "none",
    connectionName: null,
    totalSize: "17.74 MB",
  },
  {
    id: "kb-15",
    name: "test",
    connectionProvider: null,
    connectionStatus: "none",
    connectionName: null,
    totalSize: "66.25 KB",
  },
];

function KnowledgeBaseIcon({
  provider,
  hasFiles,
}: {
  provider: ConnectionProvider;
  hasFiles: boolean;
}) {
  if (provider === "google-drive") {
    return (
      <svg
        className="size-8 shrink-0"
        viewBox="0 0 87.3 78"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
          fill="#0066da"
        />
        <path
          d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
          fill="#00ac47"
        />
        <path
          d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
          fill="#ea4335"
        />
        <path
          d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
          fill="#00832d"
        />
        <path
          d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
          fill="#2684fc"
        />
        <path
          d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z"
          fill="#ffba00"
        />
      </svg>
    );
  }

  if (provider === "sharepoint") {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded bg-[#038387] text-white">
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
          <path d="M12.5 1a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM7 8.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm5 2.5h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zm0 2v5h8v-5h-8z" />
        </svg>
      </div>
    );
  }

  if (provider === "website") {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded border border-black/10 bg-background">
        <GlobeIcon className="size-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded border border-black/10 bg-background">
      <FolderIcon className="size-4 text-muted-foreground" />
    </div>
  );
}

function ConnectionStatusDot({ status }: { status: ConnectionStatus }) {
  if (status === "none") return null;
  return (
    <div
      className={cn(
        "size-3 rounded-full border-2 border-background",
        status === "connected" && "bg-emerald-500",
        status === "error" && "bg-red-500"
      )}
    />
  );
}

function KnowledgeBaseCard({ kb }: { kb: KnowledgeBase }) {
  return (
    <div className="flex h-36 cursor-pointer flex-col items-stretch justify-between rounded-lg border border-black/8 bg-card p-3 transition-colors hover:border-black/15 hover:bg-accent/40">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <KnowledgeBaseIcon
            provider={kb.connectionProvider}
            hasFiles={kb.totalSize !== "0 B"}
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="max-w-[22ch] truncate text-sm font-medium text-foreground">
              {kb.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {kb.connectionName ?? "This knowledge base has no connection"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ConnectionStatusDot status={kb.connectionStatus} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="flex size-7 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-black/5 hover:text-muted-foreground"
              >
                <MoreHorizontalIcon className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>
                <PencilIcon className="mr-2 size-3.5" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShieldIcon className="mr-2 size-3.5" />
                Permissions
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2Icon className="mr-2 size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center px-1.5 py-1">
        <span className="text-xs text-muted-foreground">{kb.totalSize}</span>
      </div>
    </div>
  );
}

export default function KnowledgeBasesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = MOCK_KNOWLEDGE_BASES.filter((kb) =>
    kb.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted">
      <AgentSidebar
        selectedCategory="all"
        onCategoryChange={() => {}}
        organisationName="Acme"
        userName="David Hidalgo"
        onNewChat={() => router.push("/agent/new")}
        activeSection="knowledge-bases"
      />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <PageHeader>
          <h1 className="text-base font-semibold">Knowledge Bases</h1>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
          >
            <PlusIcon className="size-4" />
            New Knowledge Base
          </button>
        </PageHeader>

        {/* Toolbar */}
        <div className="shrink-0 bg-background">
          <div className={cn(pageContainerClass, "flex items-center gap-3 py-3")}>
            <div className="relative flex-1 max-w-xs">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search knowledge bases"
                className="h-8 w-full rounded-md border border-black/10 bg-background py-1.5 pl-8 pr-3 text-xs text-foreground shadow-xs outline-none placeholder:text-muted-foreground/50 focus:border-black/15 focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="ml-auto flex items-center gap-1 rounded-md border border-black/10 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex size-7 items-center justify-center rounded transition-colors",
                  viewMode === "grid"
                    ? "bg-black/8 text-foreground"
                    : "text-muted-foreground hover:bg-black/5"
                )}
              >
                <LayoutGridIcon className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex size-7 items-center justify-center rounded transition-colors",
                  viewMode === "list"
                    ? "bg-black/8 text-foreground"
                    : "text-muted-foreground hover:bg-black/5"
                )}
              >
                <ListIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className={cn(pageContentScrollClass, "bg-background")}>
          <div className={cn(pageContainerClass, "py-4 pb-8")}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <BookOpenIcon className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  No knowledge bases found
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Try a different search or create a new one
                </p>
              </div>
            ) : (
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {filtered.map((kb) => (
                  <KnowledgeBaseCard key={kb.id} kb={kb} />
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
