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
  ArrowUpDownIcon,
  ChevronDownIcon,
  FilterIcon,
  FileTextIcon,
  ImageIcon,
  LockIcon,
} from "lucide-react";
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
  { id: "kb-2", name: "Customs & HS Code Handbook", visibility: "shared", fileCount: 41, provider: null, kind: "knowledge" },
  { id: "kb-3", name: "fedex.com marketing site", visibility: "shared", fileCount: 12, provider: "website", kind: "knowledge" },
  { id: "kb-4", name: "Hub SOPs — Memphis", visibility: "private", fileCount: 8, provider: null, kind: "knowledge" },
  { id: "kb-5", name: "Dangerous Goods Reference", visibility: "shared", fileCount: 32, provider: null, kind: "knowledge" },
  { id: "kb-6", name: "Enterprise Contract Templates", visibility: "private", fileCount: 14, provider: null, kind: "knowledge" },
  { id: "kb-7", name: "Workflow Documents", visibility: "shared", fileCount: 56, provider: "google-drive", kind: "knowledge" },
  { id: "kb-9", name: "Claims & Refund Playbook", visibility: "shared", fileCount: 19, provider: null, kind: "knowledge" },
  { id: "kb-10", name: "Enterprise Accounts", visibility: "shared", fileCount: 87, provider: "sharepoint", kind: "knowledge" },
  { id: "u-1", name: "Q2 volume research", visibility: "private", fileCount: 6, provider: null, kind: "user" },
  { id: "u-2", name: "Peak season prep", visibility: "shared", fileCount: 3, provider: null, kind: "user" },
];

const MOCK_ARTIFACTS: RecentFile[] = [
  { id: "a-1", name: "Volume forecast chart.png", type: "Chart", updatedAt: "1h ago", origin: "chat", thumbnailKind: "image" },
  { id: "a-2", name: "Peak season memo.md", type: "Markdown", updatedAt: "Today", origin: "chat", thumbnailKind: "doc" },
  { id: "a-3", name: "Route map draft.png", type: "Diagram", updatedAt: "Yesterday", origin: "chat", thumbnailKind: "image" },
  { id: "a-4", name: "SLA analysis.md", type: "Report", updatedAt: "2 days ago", origin: "chat", thumbnailKind: "doc" },
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

function FolderCard({ folder }: { folder: LibraryFolder }) {
  return (
    <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-black/8 bg-card p-3 transition-colors hover:border-black/15 hover:bg-accent/40">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <FolderIcon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-foreground">{folder.name}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {folder.visibility === "private" ? (
            <LockIcon className="size-3 shrink-0" />
          ) : (
            <FolderProviderIcon provider={folder.provider} />
          )}
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

function RecentFileCard({ file }: { file: RecentFile }) {
  return (
    <div className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-black/8 bg-card transition-colors hover:border-black/15">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md text-white",
            file.thumbnailKind === "image" ? "bg-sky-500" : "bg-rose-500"
          )}
        >
          {file.thumbnailKind === "image" ? (
            <ImageIcon className="size-4" />
          ) : (
            <FileTextIcon className="size-4" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
          <p className="truncate text-xs text-muted-foreground">{file.type}</p>
        </div>
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

function ViewToggle({
  mode,
  onChange,
}: {
  mode: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-black/10 p-0.5">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "flex size-7 items-center justify-center rounded transition-colors",
          mode === "grid" ? "bg-black/8 text-foreground" : "text-muted-foreground hover:bg-black/5"
        )}
        aria-label="Grid view"
      >
        <LayoutGridIcon className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "flex size-7 items-center justify-center rounded transition-colors",
          mode === "list" ? "bg-black/8 text-foreground" : "text-muted-foreground hover:bg-black/5"
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

  const filteredFolders = MOCK_FOLDERS.filter((folder) =>
    folder.name.toLowerCase().includes(folderSearch.toLowerCase())
  );

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
          <div className={cn(pageContainerClass, "flex flex-col gap-10 py-6 pb-12")}>
            <header className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                View recent files from chats & manage files in your knowledge bases.{" "}
                <a href="#" className="underline underline-offset-2 hover:text-foreground">
                  Learn more
                </a>
              </p>
            </header>

            {/* Artifacts */}
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-foreground">Artifacts</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {MOCK_ARTIFACTS.map((artifact) => (
                  <RecentFileCard key={artifact.id} file={artifact} />
                ))}
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
                <div className="ml-auto flex items-center gap-2">
                  <IconButton icon={<ArrowUpDownIcon className="size-3.5" />} label="Sort" />
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
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-md border border-black/10 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
                >
                  <FilterIcon className="size-3.5" />
                  Filter
                  <ChevronDownIcon className="size-3.5" />
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <IconButton icon={<ArrowUpDownIcon className="size-3.5" />} label="Sort" />
                  <ViewToggle mode={fileView} onChange={setFileView} />
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
