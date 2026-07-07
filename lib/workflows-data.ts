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
}

export const ALL_WORKFLOWS: Workflow[] = [
  { id: "wf-1", name: "Research Sales Lead Profile and Outreach",       icon: SearchIcon,      favorite: true,  recent: true  },
  { id: "wf-2", name: "Generate Custom Interview Questions",            icon: HelpCircleIcon,  favorite: false, recent: true  },
  { id: "wf-3", name: "Research Company Financial Profile",             icon: SearchIcon,      favorite: false, recent: false },
  { id: "wf-4", name: "Create Personalized Emails from CRM Data",       icon: LandmarkIcon,    favorite: true,  recent: true  },
  { id: "wf-5", name: "Draft Follow-Up Sequence for Cold Leads",        icon: MailIcon,        favorite: false, recent: false },
  { id: "wf-6", name: "Summarize Call Transcript and Action Items",     icon: FileTextIcon,    favorite: true,  recent: false },
  { id: "wf-7", name: "Score Inbound Leads by Fit and Intent",          icon: BarChart3Icon,   favorite: false, recent: false },
  { id: "wf-8", name: "Research Sales Lead Profile and Enrichment",     icon: SearchIcon,      favorite: false, recent: false },
];
