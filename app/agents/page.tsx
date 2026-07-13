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
    name: "Compliance Checker",
    description:
      "Automatically reviews LTV, DSCR, borrower history, and geographic flags. Validates compliance requirements and generates detailed audit reports.",
    category: ["recent", "favorites", "work", "all", "your-agents"],
    integrations: ["slack", "gmail", "figma"],
    labels: ["Compliance", "Finance", "Audit"],
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
    name: "Document Verifier",
    description:
      "Detects forged files and fake borrower data with document-level AI analysis. Uses advanced ML to identify anomalies and inconsistencies.",
    category: ["recent", "favorites", "work", "all", "your-agents"],
    integrations: ["gmail", "connector", "excel"],
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
    name: "Memo Generator",
    description:
      "Turns messy borrower data into polished investment memos and term sheets. Automates document generation with customizable templates.",
    category: ["favorites", "work", "all", "your-agents", "automations"],
    integrations: ["slack", "figma", "gmail"],
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
    name: "File Scanner",
    description:
      "This agent scans closing folders, detects outdated or missing files. Ensures document completeness before deal finalization.",
    category: ["work", "all", "your-agents", "automations"],
    integrations: ["connector", "gmail", "excel", "slack"],
    labels: ["Validation", "Ops", "Closing", "Checklist"],
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
    name: "Campaign Writer",
    description:
      "Creates compelling marketing copy and campaigns tailored to your audience. Generates multi-channel content with brand voice consistency.",
    category: ["marketing", "all", "your-agents"],
    integrations: ["slack", "figma"],
    labels: ["Marketing", "Content", "Copy", "Campaigns", "Brand"],
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
    name: "Blog Generator",
    description:
      "Generates blog posts, social media content, and email newsletters. Optimizes content for engagement and SEO performance.",
    category: ["marketing", "all", "your-agents", "favorites"],
    integrations: ["gmail", "slack"],
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
    name: "SEO Analyzer",
    description:
      "Analyzes and improves your content for better search engine rankings. Provides keyword suggestions and technical SEO recommendations.",
    category: ["marketing", "all", "your-agents"],
    integrations: ["connector", "excel"],
    labels: ["SEO", "Analytics"],
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
    name: "LinkedIn Scraper",
    description:
      "Identifies and qualifies potential leads from various data sources. Scrapes, finds leads, and sends personalized messages on LinkedIn.",
    category: ["sales", "all"],
    integrations: ["slack", "connector", "gmail"],
    labels: ["Scraping", "Sales", "LinkedIn", "Leads"],
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
    name: "Sales Forecaster",
    description:
      "Evaluates sales opportunities and provides win probability scores. Analyzes historical data to predict deal outcomes.",
    category: ["sales", "all"],
    integrations: ["gmail", "figma", "notion"],
    labels: ["Analytics", "Sales"],
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
    name: "Proposal Builder",
    description:
      "Generates customized sales pitches based on prospect profiles. Creates personalized presentations and proposal documents.",
    category: ["sales", "all"],
    integrations: ["slack", "gmail"],
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
    name: "Customer Support Bot",
    description:
      "Handles customer inquiries and provides instant, accurate responses. Uses knowledge base to resolve issues autonomously.",
    category: ["support", "all"],
    integrations: ["slack", "connector", "notion"],
    labels: ["Support", "Chat", "Helpdesk", "Knowledge base"],
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
    name: "Ticket Router",
    description:
      "Automatically categorizes and prioritizes support tickets. Routes issues to appropriate teams based on urgency and type.",
    category: ["support", "all", "automations"],
    integrations: ["gmail", "notion"],
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
    name: "Ad Copy Optimizer",
    description:
      "A/B tests ad headlines and copy across channels. Suggests variants and tracks performance to improve conversion rates.",
    category: ["marketing", "all"],
    integrations: ["slack", "figma"],
    labels: ["Marketing", "Ads", "Optimization"],
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
    name: "Deal Closer",
    description:
      "Tracks deal stages and suggests next steps. Sends reminders for follow-ups and prepares closing checklists for won opportunities.",
    category: ["sales", "all"],
    integrations: ["gmail", "slack", "notion"],
    labels: ["Sales", "Pipeline", "Follow-up"],
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
    !agent.integrations.includes("slack")
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
          { id: "work", label: "Engineering" },
          { id: "marketing", label: "Growth" },
          { id: "sales", label: "Revenue" },
        ]}
        organisationName="Acme"
        userName="David Hidalgo"
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
