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
    name: "Research Shipper Account and Volume History",
    icon: SearchIcon,
    favorite: true,
    recent: true,
    description:
      "Enriches an enterprise shipper from public sources and internal data, then summarizes their shipping volume, service mix, and account health.",
    apps: ["outlook", "notion", "connector"],
    tags: ["Sales", "Research", "Enterprise"],
  },
  {
    id: "wf-2",
    name: "Draft Driver Debrief Questions for Exception",
    icon: HelpCircleIcon,
    favorite: false,
    recent: true,
    description:
      "Turns a delivery exception and route context into a structured set of questions for the driver debrief and root-cause review.",
    apps: ["gdrive", "notion"],
    tags: ["Operations", "Hub"],
  },
  {
    id: "wf-3",
    name: "Shipper Account Health and Risk Profile",
    icon: SearchIcon,
    favorite: false,
    recent: false,
    description:
      "Compiles a shipper's account snapshot — recent volume, on-time performance, claims rate, and renewal risk — into a concise brief.",
    apps: ["excel", "gdrive", "connector"],
    tags: ["Research", "Accounts"],
  },
  {
    id: "wf-4",
    name: "Proactive Delay Notifications from TMS",
    icon: LandmarkIcon,
    favorite: true,
    recent: true,
    description:
      "Pulls at-risk shipments from the TMS and writes tailored delay notifications to shippers and consignees with revised ETAs.",
    apps: ["outlook", "salesforce", "connector"],
    tags: ["Customer Service", "Notifications"],
  },
  {
    id: "wf-5",
    name: "Recover At-Risk Enterprise Accounts",
    icon: MailIcon,
    favorite: false,
    recent: false,
    description:
      "Generates a multi-touch recovery sequence for enterprise shippers with declining volume, tailored to their service history.",
    apps: ["outlook", "notion"],
    tags: ["Sales", "Retention"],
  },
  {
    id: "wf-6",
    name: "Summarize Complaint Call and Action Items",
    icon: FileTextIcon,
    favorite: true,
    recent: false,
    description:
      "Condenses a customer complaint call transcript into a summary, root cause, and a checklist of owned follow-up actions.",
    apps: ["slack", "notion", "gdrive"],
    tags: ["Customer Service", "Summary"],
  },
  {
    id: "wf-7",
    name: "Score Shipment Exceptions by Impact",
    icon: BarChart3Icon,
    favorite: false,
    recent: false,
    description:
      "Ranks open exceptions by SLA risk, shipper tier, and dollar value so the ops floor works the highest-impact recoveries first.",
    apps: ["excel", "connector"],
    tags: ["Operations", "Analytics"],
  },
  {
    id: "wf-8",
    name: "Enrich New Shipper Signup",
    icon: SearchIcon,
    favorite: false,
    recent: false,
    description:
      "Fills in missing details on a new shipper — industry, expected volume, service mix, and contact info — from public and third-party sources.",
    apps: ["connector", "gdrive"],
    tags: ["Sales", "Onboarding", "Data"],
  },
];
