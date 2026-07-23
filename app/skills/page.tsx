"use client";

import { useRouter } from "next/navigation";
import { AgentSidebar } from "@/components/agent-sidebar";
import { PageHeader } from "@/components/page-layout";

export default function SkillsPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted">
      <AgentSidebar
        selectedCategory="all"
        onCategoryChange={() => {}}
        organisationName="FedEx"
        userName="Fred Smith"
        onNewChat={() => router.push("/agent/new")}
        activeSection="skills"
      />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <PageHeader>
          <h1 className="text-base font-semibold">Skills</h1>
        </PageHeader>
      </div>
    </div>
  );
}
