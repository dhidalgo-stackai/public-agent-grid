"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  ChevronDownIcon,
  LockIcon,
  CodeIcon,
  FileTextIcon,
  BarChart3Icon,
  GamepadIcon,
  SparklesIcon,
  LayoutGridIcon,
  ListIcon,
} from "lucide-react";
import { AgentSidebar } from "@/components/agent-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  pageContentInnerClass,
} from "@/components/page-layout";
import { cn } from "@/lib/utils";

type TabKey = "all" | "yours" | "shared";
type ArtifactKind = "Code" | "Document" | "Chart" | "Game" | "App";

interface Artifact {
  id: string;
  title: string;
  description: string;
  kind: ArtifactKind;
  editedAt: string;
  preview: React.ReactNode;
  accent: string;
}

const ARTIFACTS: Artifact[] = [
  {
    id: "hola",
    title: "¡Hola!",
    description:
      "A one-page greeting: ¡Hola! set in oversized italic serif on warm parchment.",
    kind: "Code",
    editedAt: "3 minutes ago",
    accent: "bg-[#f4ead5] text-[#8a5a2b]",
    preview: (
      <div className="flex h-full w-full items-center justify-center bg-[#f4ead5]">
        <span
          className="text-[54px] font-semibold italic text-[#8a5a2b]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          ¡Hola!
        </span>
      </div>
    ),
  },
  {
    id: "q3-review",
    title: "Q3 Business Review",
    description:
      "Executive summary with revenue trends, headcount, and roadmap slippage callouts.",
    kind: "Document",
    editedAt: "1 hour ago",
    accent: "bg-white text-neutral-800",
    preview: (
      <div className="flex h-full w-full flex-col gap-1.5 bg-white px-5 py-4">
        <div className="h-1.5 w-1/3 rounded-full bg-neutral-800" />
        <div className="mt-2 h-1 w-full rounded-full bg-neutral-200" />
        <div className="h-1 w-11/12 rounded-full bg-neutral-200" />
        <div className="h-1 w-10/12 rounded-full bg-neutral-200" />
        <div className="h-1 w-9/12 rounded-full bg-neutral-200" />
        <div className="mt-2 h-1 w-full rounded-full bg-neutral-200" />
        <div className="h-1 w-8/12 rounded-full bg-neutral-200" />
      </div>
    ),
  },
  {
    id: "revenue-dash",
    title: "Revenue dashboard",
    description:
      "Interactive quarterly revenue view with region breakdown and forecast overlay.",
    kind: "Chart",
    editedAt: "Yesterday",
    accent: "bg-gradient-to-br from-indigo-500 to-purple-600 text-white",
    preview: (
      <div className="flex h-full w-full items-end justify-around gap-2 bg-gradient-to-br from-indigo-500 to-purple-600 px-6 pb-6 pt-4">
        {[38, 62, 48, 78, 55, 90].map((h, i) => (
          <div
            key={i}
            className="w-3 rounded-t-sm bg-white/85"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    ),
  },
  {
    id: "snake",
    title: "Neon Snake",
    description:
      "Classic snake game with neon trail, WASD controls, and a persistent high-score board.",
    kind: "Game",
    editedAt: "2 days ago",
    accent: "bg-[#0b0f1a] text-emerald-300",
    preview: (
      <div className="relative h-full w-full overflow-hidden bg-[#0b0f1a]">
        <div className="absolute inset-4 grid grid-cols-8 grid-rows-5 gap-[3px] opacity-40">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="rounded-[1px] bg-emerald-500/10" />
          ))}
        </div>
        <div className="absolute left-6 top-10 flex gap-[3px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="size-2 rounded-[1px] bg-emerald-400"
              style={{ opacity: 0.4 + i * 0.15 }}
            />
          ))}
        </div>
        <div className="absolute right-8 bottom-8 size-2 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.9)]" />
      </div>
    ),
  },
  {
    id: "onboarding",
    title: "Onboarding checklist",
    description:
      "Interactive checklist for new hires — track progress across setup, access, and training.",
    kind: "App",
    editedAt: "3 days ago",
    accent: "bg-white text-neutral-800",
    preview: (
      <div className="flex h-full w-full flex-col justify-center gap-2 bg-white px-6">
        {[
          { done: true, w: "w-8/12" },
          { done: true, w: "w-9/12" },
          { done: false, w: "w-7/12" },
          { done: false, w: "w-10/12" },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                "size-3 rounded-sm border",
                row.done
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-neutral-300 bg-white"
              )}
            />
            <div
              className={cn(
                "h-1 rounded-full",
                row.done ? "bg-neutral-300" : "bg-neutral-200",
                row.w
              )}
            />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "landing",
    title: "Acme landing page",
    description:
      "Marketing landing page with hero, feature grid, and pricing table — Tailwind + Next.js.",
    kind: "Code",
    editedAt: "5 days ago",
    accent: "bg-[#111827] text-white",
    preview: (
      <div className="flex h-full w-full flex-col gap-2 bg-[#111827] px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-10 rounded-full bg-white/70" />
          <div className="flex gap-1.5">
            <div className="h-1 w-4 rounded-full bg-white/30" />
            <div className="h-1 w-4 rounded-full bg-white/30" />
            <div className="h-1 w-4 rounded-full bg-white/30" />
          </div>
        </div>
        <div className="mt-3 h-2 w-9/12 rounded-full bg-white" />
        <div className="h-2 w-7/12 rounded-full bg-white/80" />
        <div className="mt-1 h-1 w-8/12 rounded-full bg-white/30" />
        <div className="mt-2 h-4 w-16 rounded-full bg-indigo-500" />
      </div>
    ),
  },
];

const KIND_META: Record<ArtifactKind, { icon: React.ComponentType<{ className?: string }> }> = {
  Code: { icon: CodeIcon },
  Document: { icon: FileTextIcon },
  Chart: { icon: BarChart3Icon },
  Game: { icon: GamepadIcon },
  App: { icon: SparklesIcon },
};

export default function ArtifactsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("all");
  const [filter, setFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARTIFACTS.filter((a) => {
      if (filter !== "All" && a.kind !== filter.replace(/s$/, "")) {
        // handle "Apps" -> "App", "Games" -> "Game", etc.
      }
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted">
      <AgentSidebar
        selectedCategory=""
        onCategoryChange={(cat) => {
          router.push(cat === "all" ? "/agents" : `/agents?category=${cat}`);
        }}
        categories={[
          { id: "work", label: "Hub Ops" },
          { id: "marketing", label: "Customer Service" },
          { id: "sales", label: "Enterprise Sales" },
        ]}
        organisationName="FedEx"
        userName="Fred Smith"
        onNewChat={() => router.push("/agent/new")}
        activeSection="artifacts"
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <PageHeader>
          <h1 className="text-base font-semibold">Artifacts</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <span className="text-muted-foreground">Filter by</span>
                  <span>{filter}</span>
                  <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["All", "Apps", "Games", "Tools", "Docs"].map((f) => (
                  <DropdownMenuItem key={f} onSelect={() => setFilter(f)}>
                    {f}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  New artifact
                  <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => router.push("/agent/new")}>
                  Blank artifact
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/agent/new")}>
                  From a prompt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PageHeader>

        <div className="flex-1 overflow-y-auto py-6">
          <div className={pageContentInnerClass}>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search artifacts..."
                className="h-10 pl-9"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="yours">Yours</TabsTrigger>
                  <TabsTrigger value="shared">Shared with you</TabsTrigger>
                </TabsList>
              </Tabs>
              <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>

            {visible.length === 0 ? (
              <EmptyState onNew={() => router.push("/agent/new")} />
            ) : viewMode === "grid" ? (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {visible.map((a) => (
                  <ArtifactCard key={a.id} artifact={a} />
                ))}
              </div>
            ) : (
              <ArtifactTable artifacts={visible} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  return (
    <div className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-black/10 bg-card transition-shadow hover:shadow-md">
      <div className="relative h-24 w-full overflow-hidden border-b border-black/8">
        <div className="pointer-events-none absolute inset-0">
          {artifact.preview}
        </div>
        <div className="absolute left-2 top-2 z-10 inline-flex items-center rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {artifact.kind}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-5 w-5 bg-[linear-gradient(225deg,rgba(0,0,0,0.18)_50%,transparent_50%)]" />
      </div>
      <div className="flex flex-col gap-1 px-3 pb-2.5 pt-2.5">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {artifact.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <LockIcon className="size-3" />
          <span aria-hidden>·</span>
          <span>Edited {artifact.editedAt}</span>
        </div>
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
          mode === "grid"
            ? "bg-black/8 text-foreground"
            : "text-muted-foreground hover:bg-black/5"
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
          mode === "list"
            ? "bg-black/8 text-foreground"
            : "text-muted-foreground hover:bg-black/5"
        )}
        aria-label="List view"
      >
        <ListIcon className="size-3.5" />
      </button>
    </div>
  );
}

function ArtifactTable({ artifacts }: { artifacts: Artifact[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-black/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/8 bg-muted/40 text-left text-xs font-medium text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Name</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Visibility</th>
            <th className="px-4 py-2.5 font-medium">Edited</th>
          </tr>
        </thead>
        <tbody>
          {artifacts.map((a) => {
            const KindIcon = KIND_META[a.kind].icon;
            return (
              <tr
                key={a.id}
                className="cursor-pointer border-b border-black/6 last:border-b-0 transition-colors hover:bg-accent/40"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <KindIcon className="size-3.5" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-foreground">
                        {a.title}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {a.description}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{a.kind}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <LockIcon className="size-3" />
                    Private
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {a.editedAt}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="mt-20 flex flex-col items-center justify-center text-center">
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-foreground/70"
      >
        <rect x="14" y="20" width="22" height="30" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="20" y="26" width="8" height="10" rx="1" fill="currentColor" opacity="0.4" />
        <path d="M44 22 L58 22 L51 34 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <circle cx="48" cy="46" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
      <h2 className="mt-6 text-base font-medium text-muted-foreground">
        What will you build with artifacts?
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        If you can dream it, you can build it. Take apps, games, templates, and tools from thought to reality.
      </p>
      <Button variant="outline" size="sm" className="mt-6" onClick={onNew}>
        New artifact
      </Button>
    </div>
  );
}
