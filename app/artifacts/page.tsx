"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, ChevronDownIcon } from "lucide-react";
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

type TabKey = "all" | "yours" | "shared";

export default function ArtifactsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("all");
  const [filter, setFilter] = useState("All");

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

            <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mt-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="yours">Yours</TabsTrigger>
                <TabsTrigger value="shared">Shared with you</TabsTrigger>
              </TabsList>
            </Tabs>

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
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                onClick={() => router.push("/agent/new")}
              >
                New artifact
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
