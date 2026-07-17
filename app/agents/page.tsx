"use client";

import { Suspense, useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  ScanLine,
  ScrollText,
  FolderSearch,
  Megaphone,
  Newspaper,
  TrendingUp,
  UserSearch,
  BarChart2,
  Presentation,
  Headphones,
  GitBranch,
  Wand2,
  Handshake,
} from "lucide-react";
import { AgentSidebar } from "@/components/agent-sidebar";
import { AgentGrid, AgentSection } from "@/components/agent-grid";
const allAgents = [
  {
    id: "1",
    name: "Customs Docs Checker",
    description:
      "Automatically reviews HS codes, commercial invoices, and dangerous goods paperwork for international shipments. Flags missing documents before pickup.",
    category: ["recent", "favorites", "work", "all", "your-agents"],
    integrations: ["teams", "outlook", "salesforce"],
    labels: ["Compliance", "Customs", "International"],
    interfaceType: "Chat" as const,
    icon: <ShieldCheck className="size-5" />,
    authorName: "Alex Chen",
    createdDate: "Jan 15, 2025",
    lastUpdatedDate: "Jan 29, 2025",
    runsCount: 1247,
    runnersCount: 62,
  },
  {
    id: "2",
    name: "Bill of Lading Verifier",
    description:
      "Validates bills of lading against manifests and shipper submissions. Uses ML to flag mismatched weights, addresses, and hazmat declarations.",
    category: ["recent", "favorites", "work", "all", "your-agents"],
    integrations: ["outlook", "connector", "excel"],
    labels: [],
    interfaceType: "Chat" as const,
    icon: <ScanLine className="size-5" />,
    authorName: "Sam Rivera",
    createdDate: "Dec 3, 2024",
    lastUpdatedDate: "Jan 28, 2025",
    runsCount: 892,
    runnersCount: 45,
  },
  {
    id: "3",
    name: "Shipper Notice Generator",
    description:
      "Turns raw exception data into polished shipper notices — delays, address corrections, customs holds. Uses customizable templates by service and language.",
    category: ["favorites", "work", "all", "your-agents", "automations"],
    integrations: ["teams", "salesforce", "outlook"],
    labels: [],
    interfaceType: "Automation" as const,
    icon: <ScrollText className="size-5" />,
    authorName: "Jordan Lee",
    createdDate: "Nov 20, 2024",
    lastUpdatedDate: "Jan 27, 2025",
    runsCount: 2103,
    runnersCount: 105,
  },
  {
    id: "4",
    name: "Manifest Scanner",
    description:
      "This agent scans inbound manifests, detects missing or mismatched packages, and confirms hub-level intake completeness before dispatch.",
    category: ["work", "all", "your-agents", "automations"],
    integrations: ["connector", "outlook", "excel", "teams"],
    labels: ["Validation", "Ops", "Hub", "Checklist"],
    interfaceType: "Automation" as const,
    icon: <FolderSearch className="size-5" />,
    authorName: "Morgan Taylor",
    createdDate: "Jan 8, 2025",
    lastUpdatedDate: "Jan 29, 2025",
    runsCount: 456,
    runnersCount: 23,
  },
  {
    id: "5",
    name: "Peak Season Comms Writer",
    description:
      "Creates coordinated peak-season shipper and consumer communications — capacity notices, cutoff dates, service updates — in FedEx brand voice.",
    category: ["marketing", "all", "your-agents"],
    integrations: ["teams", "salesforce"],
    labels: ["Comms", "Peak", "Content", "Brand"],
    interfaceType: "Chat" as const,
    icon: <Megaphone className="size-5" />,
    authorName: "Casey Kim",
    createdDate: "Dec 12, 2024",
    lastUpdatedDate: "Jan 26, 2025",
    runsCount: 1532,
    runnersCount: 77,
  },
  {
    id: "6",
    name: "Service Alert Writer",
    description:
      "Generates service alerts, weekly ops digests, and internal broadcasts. Distills TMS metrics into readable summaries for leadership and hub teams.",
    category: ["marketing", "all", "your-agents", "favorites"],
    integrations: ["outlook", "teams"],
    labels: [],
    interfaceType: "Form" as const,
    icon: <Newspaper className="size-5" />,
    authorName: "Riley Walsh",
    createdDate: "Jan 2, 2025",
    lastUpdatedDate: "Jan 25, 2025",
    runsCount: 678,
    runnersCount: 34,
  },
  {
    id: "7",
    name: "Route Efficiency Analyzer",
    description:
      "Analyzes ground and express route performance across a hub or region. Surfaces bottlenecks, idle miles, and staffing gaps with cost impact.",
    category: ["marketing", "all", "your-agents"],
    integrations: ["connector", "excel"],
    labels: ["Ops", "Analytics"],
    interfaceType: "Batch" as const,
    icon: <TrendingUp className="size-5" />,
    authorName: "Quinn Davis",
    createdDate: "Dec 18, 2024",
    lastUpdatedDate: "Jan 24, 2025",
    runsCount: 321,
    runnersCount: 16,
  },
  {
    id: "8",
    name: "Shipper Account Enricher",
    description:
      "Identifies and qualifies new enterprise shipper signups. Enriches accounts with industry, volume estimates, and buying-committee contacts.",
    category: ["sales", "all"],
    integrations: ["teams", "connector", "outlook"],
    labels: ["Enrichment", "Sales", "Enterprise", "Leads"],
    interfaceType: "Form" as const,
    icon: <UserSearch className="size-5" />,
    authorName: "Jamie Foster",
    createdDate: "Nov 28, 2024",
    lastUpdatedDate: "Jan 23, 2025",
    runsCount: 2841,
    runnersCount: 142,
  },
  {
    id: "9",
    name: "Volume Forecaster",
    description:
      "Forecasts weekly and seasonal package volume by service and lane. Uses historical shipment data plus macro signals to guide capacity planning.",
    category: ["sales", "all"],
    integrations: ["outlook", "salesforce", "sharepoint"],
    labels: ["Analytics", "Ops"],
    interfaceType: "Chat" as const,
    icon: <BarChart2 className="size-5" />,
    authorName: "Skyler Brooks",
    createdDate: "Jan 5, 2025",
    lastUpdatedDate: "Jan 22, 2025",
    runsCount: 1024,
    runnersCount: 51,
  },
  {
    id: "10",
    name: "Enterprise RFP Builder",
    description:
      "Generates customized shipper RFP responses using contract templates, service capabilities, and volume-based pricing tiers.",
    category: ["sales", "all"],
    integrations: ["teams", "outlook"],
    labels: [],
    interfaceType: "Form" as const,
    icon: <Presentation className="size-5" />,
    authorName: "Reese Morgan",
    createdDate: "Dec 22, 2024",
    lastUpdatedDate: "Jan 21, 2025",
    runsCount: 567,
    runnersCount: 28,
  },
  {
    id: "11",
    name: "Delivery Support Bot",
    description:
      "Handles shipper and consignee questions on tracking, ETAs, exceptions, and claims. Resolves the majority of tickets autonomously via TMS lookups.",
    category: ["support", "all"],
    integrations: ["teams", "connector", "sharepoint"],
    labels: ["Support", "Chat", "Tracking", "Claims"],
    interfaceType: "Chat" as const,
    icon: <Headphones className="size-5" />,
    authorName: "Drew Hayes",
    createdDate: "Jan 10, 2025",
    lastUpdatedDate: "Jan 20, 2025",
    runsCount: 1893,
    runnersCount: 95,
  },
  {
    id: "12",
    name: "Exception Router",
    description:
      "Automatically categorizes and prioritizes shipment exceptions. Routes to the right hub team based on service, SLA risk, and shipper tier.",
    category: ["support", "all", "automations"],
    integrations: ["outlook", "sharepoint"],
    labels: ["Support", "Ops"],
    interfaceType: "Automation" as const,
    icon: <GitBranch className="size-5" />,
    authorName: "Parker Ellis",
    createdDate: "Dec 5, 2024",
    lastUpdatedDate: "Jan 19, 2025",
    runsCount: 734,
    runnersCount: 37,
  },
  {
    id: "13",
    name: "Tracking Page Optimizer",
    description:
      "A/B tests tracking-page copy, status states, and exception messaging. Suggests variants and tracks self-service resolution rates.",
    category: ["marketing", "all"],
    integrations: ["teams", "salesforce"],
    labels: ["Digital", "UX", "Optimization"],
    interfaceType: "Form" as const,
    icon: <Wand2 className="size-5" />,
    authorName: "Morgan Blake",
    createdDate: "Jan 12, 2025",
    lastUpdatedDate: "Jan 28, 2025",
    runsCount: 912,
    runnersCount: 46,
  },
  {
    id: "14",
    name: "Contract Renewal Assistant",
    description:
      "Tracks enterprise renewal stages and suggests next steps. Sends reminders, prepares talking points, and drafts renewal packets for account managers.",
    category: ["sales", "all"],
    integrations: ["outlook", "teams", "sharepoint"],
    labels: ["Sales", "Renewals", "Enterprise"],
    interfaceType: "Chat" as const,
    icon: <Handshake className="size-5" />,
    authorName: "Jordan Reese",
    createdDate: "Dec 8, 2024",
    lastUpdatedDate: "Jan 27, 2025",
    runsCount: 1156,
    runnersCount: 58,
  },
];

function isScheduledAutomation(agent: (typeof allAgents)[0]) {
  return (
    agent.interfaceType === "Automation" &&
    !agent.integrations.includes("teams")
  );
}

function sortAgentsForAllGrid(
  agents: typeof allAgents,
  favorites: Set<string>
) {
  const scheduled = agents.filter(
    (a) => isScheduledAutomation(a) && !favorites.has(a.id)
  );
  const nonFavourites = agents.filter((a) => !favorites.has(a.id));
  const favourited = agents.filter((a) => favorites.has(a.id));

  const ordered: typeof allAgents = [];
  const seen = new Set<string>();

  const push = (list: typeof allAgents) => {
    for (const agent of list) {
      if (!seen.has(agent.id)) {
        ordered.push(agent);
        seen.add(agent.id);
      }
    }
  };

  if (scheduled.length > 0) push([scheduled[0]]);
  push(nonFavourites);
  push(favourited);
  push(agents);

  return ordered;
}

function agentMatchesTag(
  agent: (typeof allAgents)[0],
  tagId: string
): boolean {
  const ti = tagId.toLowerCase();
  if (agent.integrations.some((i) => i.toLowerCase() === ti)) return true;
  const labelMatch: Record<string, string[]> = {
    engineering: ["Compliance", "Security", "Validation"],
    "customer-success": ["Support", "Chat"],
    "chat-assistants": [],
    automation: ["Ops", "Validation"],
    analytics: ["Analytics", "SEO"],
  };
  if (tagId === "chat-assistants" && agent.interfaceType === "Chat") return true;
  if (tagId === "automation" && agent.interfaceType === "Automation") return true;
  const labelsToMatch = labelMatch[tagId];
  if (labelsToMatch?.length && agent.labels.some((l) => labelsToMatch.includes(l))) return true;
  return false;
}

function AgentLibraryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("category") ?? "all");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("last-updated");
  const [integrationFilter, setIntegrationFilter] = useState("all");
  const [interfaceFilter, setInterfaceFilter] = useState(() => searchParams.get("interface") ?? "all");
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(allAgents.filter((a) => a.category.includes("favorites")).map((a) => a.id))
  );

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") ?? "all");
    setInterfaceFilter(searchParams.get("interface") ?? "all");
  }, [searchParams]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat);
    if (cat !== "all") setSelectedTagId(null);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "all") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    const qs = params.toString();
    router.replace(qs ? `/agents?${qs}` : "/agents", { scroll: false });
  }, [router, searchParams]);

  const handleInterfaceFilterChange = useCallback((value: string) => {
    setInterfaceFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategory === "automations" && value !== "all") {
      setSelectedCategory("all");
      params.delete("category");
    }
    if (value === "all") {
      params.delete("interface");
    } else {
      params.set("interface", value);
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/agents", { scroll: false });
  }, [router, searchParams, selectedCategory]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory("all");
    setSelectedTagId(null);
    setInterfaceFilter("all");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("interface");
    const qs = params.toString();
    router.replace(qs ? `/agents?${qs}` : "/agents", { scroll: false });
  }, [router, searchParams]);

  const favoriteAgents = useMemo(
    () => allAgents.filter((a) => favorites.has(a.id)).map((a) => ({ id: a.id, name: a.name })),
    [favorites]
  );

  const sections = useMemo(() => {
    const filteredByCategory =
      selectedCategory === "all"
        ? allAgents
        : allAgents.filter((agent) =>
            agent.category.includes(selectedCategory)
          );

    const filteredBySidebarSearch = filteredByCategory;

    if (selectedCategory === "my-agents") {
      return [
        {
          id: "my-agents",
          title: "Favourite",
          hideTitle: true,
          agents: allAgents.filter((a) => favorites.has(a.id)),
        },
      ];
    }

    if (selectedCategory === "your-agents") {
      const savedAgents = filteredBySidebarSearch.filter((a) =>
        a.category.includes("your-agents")
      );
      const latestUsed = savedAgents
        .slice()
        .reverse()
        .slice(0, Math.max(0, savedAgents.length - 3));
      const marketingAgents = allAgents.filter((a) => a.category.includes("marketing"));
      const salesAgents = allAgents.filter((a) => a.category.includes("sales"));
      const scrapersAgents = allAgents.filter((a) => a.category.includes("support"));

      return [
        { id: "saved-agents", title: "Saved Agents", agents: savedAgents },
        { id: "latest-used", title: "Latest used by you", agents: latestUsed },
        { id: "marketing", title: "Marketing", agents: marketingAgents },
        { id: "sales", title: "Sales", agents: salesAgents },
        { id: "scrapers", title: "Scrapers", agents: scrapersAgents },
      ];
    }

    if (selectedCategory === "all") {
      const favourites = filteredBySidebarSearch.filter((a) => favorites.has(a.id));
      const result: AgentSection[] = [];
      if (favourites.length > 0) {
        result.push({
          id: "favourites",
          title: "Favourites",
          agents: favourites,
          showCount: false,
          initialOpen: true,
        });
      }
      result.push({
        id: "all-agents",
        title: "All Agents",
        agents: sortAgentsForAllGrid(filteredBySidebarSearch, favorites),
      });
      return result;
    }

    if (selectedCategory === "automations") {
      return [
        {
          id: "automations",
          title: "Automations",
          hideTitle: true,
          agents: allAgents.filter((a) => a.category.includes("automations")),
        },
      ];
    }

    const sectionTitles: Record<string, string> = {
      "your-agents": "Your Agents",
      recent: "Recently Used",
      favorites: "Favorites",
      work: "Work",
      marketing: "Marketing",
      sales: "Sales",
      support: "Support",
      scrapers: "Scrapers",
    };

    return [
      {
        id: selectedCategory,
        title: sectionTitles[selectedCategory] || selectedCategory,
        agents: filteredBySidebarSearch,
      },
    ];
  }, [selectedCategory, selectedTagId, favorites]);

  const handleAgentClick = useCallback(
    (agent: {
      id: string;
      name: string;
      description: string;
      interfaceType?: string;
      authorName?: string;
      labels?: string[];
    }) => {
      const base =
        agent.interfaceType === "Automation"
          ? `/automations/${agent.id}`
          : agent.interfaceType === "Form"
          ? `/form/${agent.id}`
          : agent.interfaceType === "Batch"
          ? `/batch/${agent.id}`
          : `/agent/${agent.id}`;
      const params = new URLSearchParams({
        name: agent.name,
        description: agent.description,
      });
      if (agent.authorName) params.set("authorName", agent.authorName);
      if (agent.labels?.length) params.set("labels", agent.labels.join(","));
      router.push(`${base}?${params.toString()}`);
    },
    [router]
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AgentSidebar
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categories={[
          { id: "work", label: "Hub Ops" },
          { id: "marketing", label: "Customer Service" },
          { id: "sales", label: "Enterprise Sales" },
        ]}
        organisationName="FedEx"
        userName="Fred Smith"
        onNewChat={() => router.push("/agent/new")}
        favoriteAgents={favoriteAgents}
      />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <AgentGrid
          sections={sections}
          toolSearchQuery={toolSearchQuery}
          onToolSearchChange={setToolSearchQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          integrationFilter={integrationFilter}
          onIntegrationFilterChange={setIntegrationFilter}
          interfaceFilter={interfaceFilter}
          onInterfaceFilterChange={handleInterfaceFilterChange}
          onClearFilters={handleClearFilters}
          selectedCategory={selectedCategory}
          selectedTagId={selectedTagId}
          onTagSelect={(tagId) => {
            setSelectedTagId(tagId);
            if (tagId != null) setSelectedCategory("all");
          }}
          onAgentClick={handleAgentClick}
          onNewChat={() => router.push("/agent/new")}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          title={selectedCategory === "my-agents" ? "favourite agents" : "All Agents"}
        />
      </div>
    </div>
  );
}

export default function AgentLibraryPage() {
  return (
    <Suspense>
      <AgentLibraryPageContent />
    </Suspense>
  );
}
