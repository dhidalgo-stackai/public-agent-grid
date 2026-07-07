import {
  SearchIcon,
  HelpCircleIcon,
  LandmarkIcon,
  MailIcon,
  BarChart3Icon,
  FileTextIcon,
  type LucideIcon,
} from "lucide-react";

export interface Workflow {
  id: string;
  name: string;
  icon: LucideIcon;
  favorite: boolean;
  recent: boolean;
  /** Short summary of what the agent does — shown in the hover tooltip. */
  description: string;
  /** App ids this workflow connects to — shown as icons in the tooltip. */
  apps: string[];
  /** Category tags — shown as chips in the tooltip. */
  tags: string[];
}

export const ALL_WORKFLOWS: Workflow[] = [
  {
    id: "wf-1",
    name: "Research Sales Lead Profile and Outreach",
    icon: SearchIcon,
    favorite: true,
    recent: true,
    description:
      "Enriches a lead from public sources and CRM data, then drafts a tailored first-touch outreach message.",
    apps: ["gmail", "notion", "connector"],
    tags: ["Sales", "Research", "Outreach"],
  },
  {
    id: "wf-2",
    name: "Generate Custom Interview Questions",
    icon: HelpCircleIcon,
    favorite: false,
    recent: true,
    description:
      "Turns a job description and candidate resume into a structured set of role-specific interview questions.",
    apps: ["gdrive", "notion"],
    tags: ["Hiring", "HR"],
  },
  {
    id: "wf-3",
    name: "Research Company Financial Profile",
    icon: SearchIcon,
    favorite: false,
    recent: false,
    description:
      "Compiles a company's financial snapshot — funding, revenue signals, and recent filings — into a concise brief.",
    apps: ["excel", "gdrive", "connector"],
    tags: ["Research", "Finance"],
  },
  {
    id: "wf-4",
    name: "Create Personalized Emails from CRM Data",
    icon: LandmarkIcon,
    favorite: true,
    recent: true,
    description:
      "Pulls contact and deal context from your CRM and writes individually tailored emails at scale.",
    apps: ["gmail", "outlook", "connector"],
    tags: ["Sales", "Outreach"],
  },
  {
    id: "wf-5",
    name: "Draft Follow-Up Sequence for Cold Leads",
    icon: MailIcon,
    favorite: false,
    recent: false,
    description:
      "Generates a multi-touch nurture sequence with varied angles and timing to re-warm cold leads.",
    apps: ["gmail", "notion"],
    tags: ["Sales", "Outreach"],
  },
  {
    id: "wf-6",
    name: "Summarize Call Transcript and Action Items",
    icon: FileTextIcon,
    favorite: true,
    recent: false,
    description:
      "Condenses a call transcript into a summary, key decisions, and a checklist of owned action items.",
    apps: ["slack", "notion", "gdrive"],
    tags: ["Productivity", "Summary"],
  },
  {
    id: "wf-7",
    name: "Score Inbound Leads by Fit and Intent",
    icon: BarChart3Icon,
    favorite: false,
    recent: false,
    description:
      "Evaluates each inbound lead against your ICP and buying signals to produce a prioritized fit-and-intent score.",
    apps: ["excel", "connector"],
    tags: ["Sales", "Analytics"],
  },
  {
    id: "wf-8",
    name: "Research Sales Lead Profile and Enrichment",
    icon: SearchIcon,
    favorite: false,
    recent: false,
    description:
      "Fills in missing lead details — title, company, tech stack, and contact info — from public and third-party sources.",
    apps: ["connector", "gdrive"],
    tags: ["Sales", "Research", "Data"],
  },
];
