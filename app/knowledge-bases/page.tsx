"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
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
  UploadIcon,
  ChevronDownIcon,
  FilterIcon,
  FileTextIcon,
  ImageIcon,
  LockIcon,
  BarChart3Icon,
  CodeIcon,
  GitBranchIcon,
  FileBarChart2Icon,
  EyeIcon,
  MessageSquareIcon,
  FolderInputIcon,
  DownloadIcon,
} from "lucide-react";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { AgentSidebar } from "@/components/agent-sidebar";
import {
  PageHeader,
  pageContainerClass,
  pageContentScrollClass,
} from "@/components/page-layout";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ConnectionProvider = "google-drive" | "sharepoint" | "website" | null;
type FolderVisibility = "private" | "shared";

interface LibraryFolder {
  id: string;
  name: string;
  visibility: FolderVisibility;
  fileCount: number;
  provider: ConnectionProvider;
  kind: "knowledge" | "user";
}

interface RecentFile {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
  origin: "uploaded" | "chat";
  thumbnailKind: "image" | "doc";
}

const MOCK_FOLDERS: LibraryFolder[] = [
  { id: "kb-1", name: "FedEx Service Guide", visibility: "shared", fileCount: 24, provider: null, kind: "knowledge" },
  { id: "kb-2", name: "Customs & HS Code Handbook", visibility: "shared", fileCount: 41, provider: "google-drive", kind: "knowledge" },
  { id: "kb-3", name: "fedex.com marketing site", visibility: "shared", fileCount: 12, provider: "website", kind: "knowledge" },
  { id: "kb-4", name: "Hub SOPs — Memphis", visibility: "private", fileCount: 8, provider: null, kind: "knowledge" },
  { id: "kb-5", name: "Dangerous Goods Reference", visibility: "shared", fileCount: 32, provider: "sharepoint", kind: "knowledge" },
  { id: "kb-6", name: "Enterprise Contract Templates", visibility: "private", fileCount: 14, provider: null, kind: "knowledge" },
  { id: "kb-7", name: "Workflow Documents", visibility: "shared", fileCount: 56, provider: "google-drive", kind: "knowledge" },
  { id: "kb-9", name: "Claims & Refund Playbook", visibility: "shared", fileCount: 19, provider: null, kind: "knowledge" },
  { id: "kb-10", name: "Enterprise Accounts", visibility: "shared", fileCount: 87, provider: "sharepoint", kind: "knowledge" },
  { id: "u-1", name: "Q2 volume research", visibility: "private", fileCount: 6, provider: null, kind: "user" },
  { id: "u-2", name: "Peak season prep", visibility: "shared", fileCount: 3, provider: null, kind: "user" },
];

interface ArtifactPreview {
  id: string;
  title: string;
  description: string;
  kind: "Chart" | "Markdown" | "Diagram" | "Report" | "Code";
  editedAt: string;
}

const MOCK_ARTIFACTS: ArtifactPreview[] = [
  {
    id: "a-1",
    title: "Volume forecast chart",
    description: "Weekly parcel volume by region with holiday overlay and QoQ trend.",
    kind: "Chart",
    editedAt: "1h ago",
  },
  {
    id: "a-2",
    title: "Peak season memo",
    description: "Executive memo outlining staffing plans and SLA guardrails for peak.",
    kind: "Markdown",
    editedAt: "Today",
  },
  {
    id: "a-3",
    title: "Route map draft",
    description: "Draft last-mile route optimization diagram for the Memphis hub.",
    kind: "Diagram",
    editedAt: "Yesterday",
  },
  {
    id: "a-4",
    title: "SLA analysis",
    description: "Report on carrier SLA breaches over the last quarter with root causes.",
    kind: "Report",
    editedAt: "2 days ago",
  },
];

const MOCK_RECENT_FILES: RecentFile[] = [
  { id: "f-1", name: "Q2 Volume Report.pdf", type: "PDF", updatedAt: "2h ago", origin: "chat", thumbnailKind: "doc" },
  { id: "f-2", name: "hub-map.png", type: "PNG image", updatedAt: "Yesterday", origin: "uploaded", thumbnailKind: "image" },
  { id: "f-3", name: "SLA breach — Aug.xlsx", type: "Spreadsheet", updatedAt: "2 days ago", origin: "chat", thumbnailKind: "doc" },
  { id: "f-4", name: "Driver debrief SOP.docx", type: "Doc", updatedAt: "3 days ago", origin: "uploaded", thumbnailKind: "doc" },
  { id: "f-5", name: "carrier-sla.png", type: "PNG image", updatedAt: "Last week", origin: "chat", thumbnailKind: "image" },
  { id: "f-6", name: "Peak playbook v3.pdf", type: "PDF", updatedAt: "Last week", origin: "uploaded", thumbnailKind: "doc" },
];

function FolderProviderIcon({ provider }: { provider: ConnectionProvider }) {
  if (provider === "google-drive") {
    return (
      <svg className="size-3.5 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
        <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
        <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
        <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
        <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
        <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
      </svg>
    );
  }
  if (provider === "sharepoint") {
    return (
      <div className="flex size-3.5 shrink-0 items-center justify-center rounded-sm bg-[#038387] text-white">
        <span className="text-[8px] font-bold leading-none">S</span>
      </div>
    );
  }
  if (provider === "website") {
    return <GlobeIcon className="size-3.5 shrink-0 text-muted-foreground" />;
  }
  return null;
}

function FolderThumbnailIcon({ provider }: { provider: ConnectionProvider }) {
  if (provider === "google-drive") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-black/10 bg-background">
        <svg className="size-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
          <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
          <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
          <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
          <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
          <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
          <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
        </svg>
      </div>
    );
  }
  if (provider === "sharepoint") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-black/10 bg-background">
        <FolderIcon className="size-4 text-[#038387]" />
      </div>
    );
  }
  if (provider === "website") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-black/10 bg-background">
        <GlobeIcon className="size-4 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-black/10 bg-background text-muted-foreground">
      <FolderIcon className="size-4" />
    </div>
  );
}

function FolderCard({ folder }: { folder: LibraryFolder }) {
  return (
    <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-black/8 bg-card p-3 transition-colors hover:border-black/15 hover:bg-accent/40">
      <FolderThumbnailIcon provider={folder.provider} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-foreground">{folder.name}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {folder.visibility === "private" && <LockIcon className="size-3 shrink-0" />}
          <span className="capitalize">{folder.visibility}</span>
          <span aria-hidden>·</span>
          <span>{folder.fileCount} files</span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground/50 opacity-0 transition-opacity hover:bg-black/5 hover:text-muted-foreground group-hover:opacity-100"
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
  );
}

const ARTIFACT_KIND_META: Record<
  ArtifactPreview["kind"],
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  Chart: { icon: BarChart3Icon, color: "text-indigo-500", label: "Chart" },
  Markdown: { icon: FileTextIcon, color: "text-neutral-700", label: "Markdown" },
  Diagram: { icon: GitBranchIcon, color: "text-amber-500", label: "Diagram" },
  Report: { icon: FileBarChart2Icon, color: "text-rose-500", label: "Report" },
  Code: { icon: CodeIcon, color: "text-neutral-800", label: "Code" },
};

function ArtifactPreviewCard({ artifact }: { artifact: ArtifactPreview }) {
  const meta = ARTIFACT_KIND_META[artifact.kind];
  const KindIcon = meta.icon;
  return (
    <div className="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-black/8 bg-card transition-colors hover:border-black/15">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-black/10 bg-background">
          <KindIcon className={cn("size-4", meta.color)} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-medium text-foreground">
            {artifact.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">{meta.label}</p>
        </div>
        <FileActionsMenu />
      </div>
      <div className="mx-3 h-20 overflow-hidden rounded-md border border-black/8 opacity-40 saturate-50">
        {renderArtifactPreview(artifact.kind)}
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
        <LockIcon className="size-3" />
        <span>Edited {artifact.editedAt}</span>
      </div>
    </div>
  );
}

function ArtifactPreviewRow({ artifact }: { artifact: ArtifactPreview }) {
  return (
    <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-black/8 bg-card p-3 transition-colors hover:border-black/15 hover:bg-accent/40">
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md">
        <div className="h-full w-full">{renderArtifactPreview(artifact.kind)}</div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-foreground">{artifact.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {artifact.kind} · Edited {artifact.editedAt}
        </p>
      </div>
    </div>
  );
}

function renderArtifactPreview(kind: ArtifactPreview["kind"]) {
  if (kind === "Chart") {
    return (
      <div className="flex h-full w-full items-end justify-around gap-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 px-4 pb-3 pt-2">
        {[38, 62, 48, 78, 55, 90].map((h, i) => (
          <div
            key={i}
            className="w-2 rounded-t-sm bg-white/85"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    );
  }
  if (kind === "Markdown" || kind === "Report") {
    return (
      <div className="flex h-full w-full flex-col gap-1 bg-white px-4 py-3">
        <div className="h-1.5 w-1/3 rounded-full bg-neutral-800" />
        <div className="mt-1 h-1 w-full rounded-full bg-neutral-200" />
        <div className="h-1 w-10/12 rounded-full bg-neutral-200" />
        <div className="h-1 w-9/12 rounded-full bg-neutral-200" />
        <div className="h-1 w-11/12 rounded-full bg-neutral-200" />
        <div className="h-1 w-8/12 rounded-full bg-neutral-200" />
      </div>
    );
  }
  if (kind === "Diagram") {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-[#f4ead5]">
        <svg viewBox="0 0 120 60" className="h-3/4 w-3/4" fill="none">
          <rect x="6" y="22" width="22" height="16" rx="3" stroke="#8a5a2b" strokeWidth="1.5" />
          <rect x="49" y="22" width="22" height="16" rx="3" stroke="#8a5a2b" strokeWidth="1.5" />
          <rect x="92" y="22" width="22" height="16" rx="3" stroke="#8a5a2b" strokeWidth="1.5" />
          <path d="M28 30 H49" stroke="#8a5a2b" strokeWidth="1.5" />
          <path d="M71 30 H92" stroke="#8a5a2b" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#111827] text-white/80">
      <span className="font-mono text-xs">{"</>"}</span>
    </div>
  );
}

function RecentFileCard({ file }: { file: RecentFile }) {
  return (
    <div className="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-black/8 bg-card transition-colors hover:border-black/15">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-black/10 bg-background">
          {file.thumbnailKind === "image" ? (
            <ImageIcon className="size-4 text-sky-500" />
          ) : (
            <FileTextIcon className="size-4 text-rose-500" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
          <p className="truncate text-xs text-muted-foreground">{file.type}</p>
        </div>
        <FileActionsMenu />
      </div>
      <div className="mx-3 flex-1 rounded-md border border-black/8 bg-muted/40" />
      <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
        <span>{file.updatedAt}</span>
        <span aria-hidden>·</span>
        <span className="capitalize">{file.origin}</span>
      </div>
    </div>
  );
}

function FileActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="More actions"
          className="flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground/60 opacity-0 transition-opacity hover:bg-black/5 hover:text-foreground focus:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
        >
          <MoreHorizontalIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem>
          <EyeIcon className="mr-2 size-3.5" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MessageSquareIcon className="mr-2 size-3.5" />
          Start chat with file
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderInputIcon className="mr-2 size-3.5" />
            Move
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52">
            {MOCK_FOLDERS.slice(0, 5).map((folder) => (
              <DropdownMenuItem key={folder.id}>
                <FolderIcon className="mr-2 size-3.5" />
                {folder.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem>
          <DownloadIcon className="mr-2 size-3.5" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <Trash2Icon className="mr-2 size-3.5" />
          Delete file
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ViewToggle({
  mode,
  onChange,
}: {
  mode: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
}) {
  return (
    <div className="inline-flex h-8 items-center justify-center rounded-lg bg-muted p-0.5 text-muted-foreground">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "inline-flex h-7 items-center justify-center rounded-md border-[0.5px] border-transparent px-2 transition-all hover:text-foreground",
          mode === "grid" && "bg-background text-foreground shadow"
        )}
        aria-label="Grid view"
      >
        <LayoutGridIcon className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex h-7 items-center justify-center rounded-md border-[0.5px] border-transparent px-2 transition-all hover:text-foreground",
          mode === "list" && "bg-background text-foreground shadow"
        )}
        aria-label="List view"
      >
        <ListIcon className="size-3.5" />
      </button>
    </div>
  );
}

function IconButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-md border border-black/10 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
    >
      {icon}
    </button>
  );
}

export default function KnowledgeBasesPage() {
  const router = useRouter();
  const [folderSearch, setFolderSearch] = useState("");
  const [folderView, setFolderView] = useState<"grid" | "list">("grid");
  const [fileSearch, setFileSearch] = useState("");
  const [fileView, setFileView] = useState<"grid" | "list">("grid");
  const [artifactSearch, setArtifactSearch] = useState("");
  const [artifactView, setArtifactView] = useState<"grid" | "list">("grid");
  const [folderTab, setFolderTab] = useState<"all" | "shared" | "private">("all");

  const filteredFolders = MOCK_FOLDERS.filter((folder) =>
    folder.name.toLowerCase().includes(folderSearch.toLowerCase())
  ).filter((folder) => {
    if (folderTab === "all") return true;
    return folder.visibility === folderTab;
  });

  const visibleFolders = filteredFolders.slice(0, 6);

  const filteredFiles = MOCK_RECENT_FILES.filter((file) =>
    file.name.toLowerCase().includes(fileSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted">
      <AgentSidebar
        selectedCategory="all"
        onCategoryChange={() => {}}
        organisationName="FedEx"
        userName="Fred Smith"
        onNewChat={() => router.push("/agent/new")}
        activeSection="knowledge-bases"
      />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <PageHeader>
          <h1 className="text-base font-semibold">Library</h1>
        </PageHeader>

        <div className={cn(pageContentScrollClass, "bg-background")}>
          <div className={cn(pageContainerClass, "flex flex-col gap-10 pb-12 pt-0")}>
            <p className="text-sm text-muted-foreground">
              View recent files from chats & manage files in your knowledge bases.{" "}
              <a href="#" className="underline underline-offset-2 hover:text-foreground">
                Learn more
              </a>
            </p>

            {/* Artifacts */}
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-foreground">Artifacts</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={artifactSearch}
                    onChange={(e) => setArtifactSearch(e.target.value)}
                    placeholder="Search artifacts..."
                    className="h-8 w-52 rounded-md border border-black/10 bg-background py-1.5 pl-8 pr-3 text-xs text-foreground shadow-xs outline-none placeholder:text-muted-foreground/50 focus:border-black/15 focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <ViewToggle mode={artifactView} onChange={setArtifactView} />
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/agent/new?skill=${encodeURIComponent(
                          "Expert Writer"
                        )}&prompt=${encodeURIComponent(
                          "Create a new artifact — a document I can edit and share, like a Google Doc. Start with a blank page titled \"Untitled\" and open it in the canvas so I can write in it."
                        )}`
                      )
                    }
                    className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <PlusIcon className="size-3.5" />
                    Create artifact
                  </button>
                </div>
              </div>
              <div
                className={cn(
                  artifactView === "grid"
                    ? "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col gap-2"
                )}
              >
                {MOCK_ARTIFACTS.filter((artifact) =>
                  artifact.title.toLowerCase().includes(artifactSearch.toLowerCase())
                ).map((artifact) =>
                  artifactView === "grid" ? (
                    <ArtifactPreviewCard key={artifact.id} artifact={artifact} />
                  ) : (
                    <ArtifactPreviewRow key={artifact.id} artifact={artifact} />
                  )
                )}
              </div>
            </section>

            {/* Knowledge bases */}
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-foreground">Knowledge bases</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={folderSearch}
                    onChange={(e) => setFolderSearch(e.target.value)}
                    placeholder="Search knowledge bases..."
                    className="h-8 w-52 rounded-md border border-black/10 bg-background py-1.5 pl-8 pr-3 text-xs text-foreground shadow-xs outline-none placeholder:text-muted-foreground/50 focus:border-black/15 focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <Tabs value={folderTab} onValueChange={(v) => setFolderTab(v as typeof folderTab)}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="shared">Shared</TabsTrigger>
                    <TabsTrigger value="private">Private</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="ml-auto flex items-center gap-2">
                  <ViewToggle mode={folderView} onChange={setFolderView} />
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <PlusIcon className="size-3.5" />
                    Add new knowledge base
                  </button>
                </div>
              </div>

              {visibleFolders.length > 0 && (
                <div
                  className={cn(
                    folderView === "grid"
                      ? "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col gap-2"
                  )}
                >
                  {visibleFolders.map((folder) => (
                    <FolderCard key={folder.id} folder={folder} />
                  ))}
                </div>
              )}

              {filteredFolders.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-black/10 py-12 text-center">
                  <FolderIcon className="mb-2 size-8 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">No knowledge bases found</p>
                </div>
              )}
            </section>

            {/* Recent uploaded files */}
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-foreground">Recent uploaded files</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    placeholder="Search files..."
                    className="h-8 w-52 rounded-md border border-black/10 bg-background py-1.5 pl-8 pr-3 text-xs text-foreground shadow-xs outline-none placeholder:text-muted-foreground/50 focus:border-black/15 focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <ViewToggle mode={fileView} onChange={setFileView} />
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <UploadIcon className="size-3.5" />
                    Upload files
                  </button>
                </div>
              </div>

              {filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-black/10 py-12 text-center">
                  <FileTextIcon className="mb-2 size-8 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">No files yet</p>
                </div>
              ) : (
                <div
                  className={cn(
                    fileView === "grid"
                      ? "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                      : "flex flex-col gap-2"
                  )}
                >
                  {filteredFiles.map((file) => (
                    <RecentFileCard key={file.id} file={file} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
