import type { ReactNode } from "react";
import { integrationIcons } from "@/lib/integration-icons";

export interface IntegrationConnection {
  id: string;
  name: string;
}

export interface IntegrationMeta {
  label: string;
  icon: ReactNode;
  /** Mock list of already-authorized accounts to pick from. */
  connections: IntegrationConnection[];
  /** Optional secondary picker (e.g. Slack channel). */
  detail?: {
    label: string;
    options: IntegrationConnection[];
  };
  /** System integrations aren't user-configured and don't appear in the Connections section. */
  isSystem?: boolean;
}

export const integrationMeta: Record<string, IntegrationMeta> = {
  slack: {
    label: "Slack",
    icon: (
      <svg className="size-3.5" viewBox="0 0 24 24" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#36C5F0"/>
        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#2EB67D"/>
        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#ECB22E"/>
        <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
      </svg>
    ),
    connections: [
      { id: "slack-1", name: "FedEx Ops — Slack" },
      { id: "slack-2", name: "Enterprise Accounts — Slack" },
      { id: "slack-3", name: "Customer Service — Slack" },
    ],
    detail: {
      label: "Channel",
      options: [
        { id: "ch-1", name: "#hub-memphis-ops" },
        { id: "ch-2", name: "#enterprise-sales" },
        { id: "ch-3", name: "#dg-compliance" },
        { id: "ch-4", name: "#customer-escalations" },
        { id: "ch-5", name: "#network-alerts" },
      ],
    },
  },
  gmail: {
    label: "Gmail",
    icon: integrationIcons.gmail,
    connections: [
      { id: "gmail-1", name: "shipper-comms@fedex.com" },
      { id: "gmail-2", name: "ops-digest@fedex.com" },
    ],
    detail: {
      label: "Mailbox",
      options: [
        { id: "gmail-detail-1", name: "Inbox" },
        { id: "gmail-detail-2", name: "Shipper Notifications" },
        { id: "gmail-detail-3", name: "Weekly Digests" },
      ],
    },
  },
  github: {
    label: "GitHub",
    icon: integrationIcons.github,
    connections: [
      { id: "github-1", name: "FedEx Digital" },
      { id: "github-2", name: "fedex-platform" },
    ],
    detail: {
      label: "Repository",
      options: [
        { id: "github-repo-1", name: "tracking-service" },
        { id: "github-repo-2", name: "rate-engine" },
        { id: "github-repo-3", name: "shipper-portal" },
      ],
    },
  },
  linear: {
    label: "Linear",
    icon: integrationIcons.linear,
    connections: [
      { id: "linear-1", name: "FedEx Digital Product" },
      { id: "linear-2", name: "Tracking Platform" },
    ],
    detail: {
      label: "Team",
      options: [
        { id: "linear-team-1", name: "Tracking" },
        { id: "linear-team-2", name: "Shipper Portal" },
        { id: "linear-team-3", name: "Customer Support" },
      ],
    },
  },
  asana: {
    label: "Asana",
    icon: integrationIcons.asana,
    connections: [
      { id: "asana-1", name: "FedEx Ops" },
      { id: "asana-2", name: "Peak Season Planning" },
    ],
    detail: {
      label: "Project",
      options: [
        { id: "asana-project-1", name: "Peak Season 2026" },
        { id: "asana-project-2", name: "Hub Capacity" },
        { id: "asana-project-3", name: "Shipper Onboarding" },
      ],
    },
  },
  snowflake: {
    label: "Snowflake",
    icon: integrationIcons.snowflake,
    connections: [
      { id: "snowflake-1", name: "FedEx Enterprise Data Warehouse" },
      { id: "snowflake-2", name: "Network Ops Warehouse" },
    ],
    detail: {
      label: "Warehouse",
      options: [
        { id: "snowflake-wh-1", name: "SHIPMENT_WH" },
        { id: "snowflake-wh-2", name: "OPS_ANALYTICS_WH" },
        { id: "snowflake-wh-3", name: "REVENUE_WH" },
      ],
    },
  },
  jira: {
    label: "Jira",
    icon: integrationIcons.jira,
    connections: [
      { id: "jira-1", name: "FedEx IT Jira" },
      { id: "jira-2", name: "Hub Ops Jira" },
    ],
    detail: {
      label: "Project",
      options: [
        { id: "jira-project-1", name: "TMS" },
        { id: "jira-project-2", name: "TRACK" },
        { id: "jira-project-3", name: "HUB-OPS" },
      ],
    },
  },
  hubspot: {
    label: "HubSpot",
    icon: integrationIcons.hubspot,
    connections: [
      { id: "hubspot-1", name: "FedEx SMB CRM" },
      { id: "hubspot-2", name: "Enterprise Sales" },
    ],
    detail: {
      label: "Pipeline",
      options: [
        { id: "hubspot-pipeline-1", name: "New Shippers" },
        { id: "hubspot-pipeline-2", name: "Renewals" },
        { id: "hubspot-pipeline-3", name: "Reseller Partners" },
      ],
    },
  },
  salesforce: {
    label: "Salesforce",
    icon: integrationIcons.salesforce,
    connections: [
      { id: "salesforce-1", name: "FedEx Compass (SFDC)" },
      { id: "salesforce-2", name: "Enterprise Accounts CRM" },
    ],
    detail: {
      label: "Object",
      options: [
        { id: "salesforce-object-1", name: "Shipper Accounts" },
        { id: "salesforce-object-2", name: "Renewal Opportunities" },
        { id: "salesforce-object-3", name: "Support Cases" },
      ],
    },
  },
  airtable: {
    label: "Airtable",
    icon: integrationIcons.airtable,
    connections: [
      { id: "airtable-1", name: "FedEx Ops Trackers" },
      { id: "airtable-2", name: "Peak Season Ops" },
    ],
    detail: {
      label: "Base",
      options: [
        { id: "airtable-base-1", name: "Hub Capacity Tracker" },
        { id: "airtable-base-2", name: "Exception Log" },
        { id: "airtable-base-3", name: "Carrier Partners" },
      ],
    },
  },
  confluence: {
    label: "Confluence",
    icon: integrationIcons.confluence,
    connections: [
      { id: "confluence-1", name: "FedEx Ops Wiki" },
      { id: "confluence-2", name: "Hub SOPs" },
    ],
    detail: {
      label: "Space",
      options: [
        { id: "confluence-space-1", name: "Hub Operations" },
        { id: "confluence-space-2", name: "Customer Service" },
        { id: "confluence-space-3", name: "Safety & Compliance" },
      ],
    },
  },
  intercom: {
    label: "Intercom",
    icon: integrationIcons.intercom,
    connections: [
      { id: "intercom-1", name: "FedEx Customer Care" },
      { id: "intercom-2", name: "Enterprise Support" },
    ],
    detail: {
      label: "Inbox",
      options: [
        { id: "intercom-inbox-1", name: "Delivery Support" },
        { id: "intercom-inbox-2", name: "Shipper Onboarding" },
        { id: "intercom-inbox-3", name: "Enterprise Accounts" },
      ],
    },
  },
  notion: {
    label: "Notion",
    icon: integrationIcons.notion,
    connections: [
      { id: "notion-1", name: "FedEx Ops Wiki" },
      { id: "notion-2", name: "Customer Service Playbooks" },
    ],
    detail: {
      label: "Workspace",
      options: [
        { id: "notion-ws-1", name: "Hub Playbooks" },
        { id: "notion-ws-2", name: "Driver Handbook" },
        { id: "notion-ws-3", name: "Claims & Refunds" },
      ],
    },
  },
  dropbox: {
    label: "Dropbox",
    icon: integrationIcons.dropbox,
    connections: [
      { id: "dropbox-1", name: "FedEx Enterprise Shared" },
      { id: "dropbox-2", name: "Compliance Docs" },
    ],
    detail: {
      label: "Folder",
      options: [
        { id: "dropbox-folder-1", name: "/Enterprise Contracts" },
        { id: "dropbox-folder-2", name: "/Customs Docs" },
        { id: "dropbox-folder-3", name: "/Hub Reports" },
      ],
    },
  },
  gdrive: {
    label: "Google Drive",
    icon: integrationIcons.gdrive,
    connections: [
      { id: "gdrive-1", name: "FedEx Shared Drive" },
      { id: "gdrive-2", name: "Ops Leadership Docs" },
    ],
    detail: {
      label: "Drive",
      options: [
        { id: "gdrive-detail-1", name: "All company" },
        { id: "gdrive-detail-2", name: "Hub Ops" },
        { id: "gdrive-detail-3", name: "Enterprise Sales" },
      ],
    },
  },
  outlook: {
    label: "Outlook",
    icon: integrationIcons.outlook,
    connections: [
      { id: "outlook-1", name: "jordan.lee@example.com" },
      { id: "outlook-2", name: "jordan.lee.ops@example.com" },
    ],
    detail: {
      label: "Mailbox",
      options: [
        { id: "outlook-detail-1", name: "Inbox" },
        { id: "outlook-detail-2", name: "Morning Briefs" },
        { id: "outlook-detail-3", name: "Exceptions" },
      ],
    },
  },
  teams: {
    label: "Microsoft Teams",
    icon: integrationIcons.teams,
    connections: [
      { id: "teams-1", name: "Jordan Lee" },
      { id: "teams-2", name: "Memphis Hub Ops (Team)" },
    ],
    detail: {
      label: "Destination",
      options: [
        { id: "teams-dest-1", name: "Direct message to Jordan Lee" },
        { id: "teams-dest-2", name: "Memphis Hub Ops — Morning Brief" },
        { id: "teams-dest-3", name: "Exception Watch — Priority" },
      ],
    },
  },
  "shipment-visibility": {
    label: "Shipment Visibility",
    icon: integrationIcons["shipment-visibility"],
    connections: [
      { id: "sv-1", name: "Shipment Visibility (Memphis Hub)" },
    ],
    isSystem: true,
  },
  "case-management": {
    label: "Case Management",
    icon: integrationIcons["case-management"],
    connections: [
      { id: "cm-1", name: "Case Management (Ops Handoff)" },
    ],
    isSystem: true,
  },
  figma: {
    label: "Figma",
    icon: integrationIcons.figma,
    connections: [
      { id: "figma-1", name: "FedEx Design" },
      { id: "figma-2", name: "Tracking Studio" },
    ],
    detail: {
      label: "Project",
      options: [
        { id: "figma-project-1", name: "Design System" },
        { id: "figma-project-2", name: "Tracking Page" },
        { id: "figma-project-3", name: "FedEx Mobile" },
      ],
    },
  },
  connector: {
    label: "Connector",
    icon: (
      <svg className="size-3.5" viewBox="0 0 107 109" fill="currentColor">
        <path d="M102.92 57.26L81.48 44.39C80.98 44.09 80.68 43.55 80.68 42.97V17.91C80.68 16.17 79.77 14.55 78.27 13.66L57.56 1.24C56.2 0.43 54.65 0 53.07 0C51.49 0 49.93 0.43 48.58 1.24L27.87 13.67C26.38 14.57 25.46 16.18 25.46 17.92V43C25.46 43.58 25.15 44.12 24.66 44.42L3.21 57.26C1.22 58.45 0 60.61 0 62.93V87.16C0 90.49 1.66 93.57 4.34 95.19L24.18 107.25C26.29 108.53 28.93 108.53 31.04 107.25L52.31 94.43C52.83 94.12 53.48 94.13 54 94.44L75.94 107.77C77.52 108.73 79.51 108.73 81.09 107.77L101.79 95.19C104.47 93.56 106.13 90.49 106.13 87.16V62.93C106.13 60.61 104.91 58.46 102.92 57.26ZM50.76 87.16C50.76 88.94 49.91 90.56 48.57 91.38L31.88 101.52C30.51 102.35 28.87 101.19 28.87 99.39V79.63C28.87 77.85 29.72 76.23 31.06 75.41L47.75 65.27C49.12 64.44 50.76 65.6 50.76 67.4V87.16ZM76.22 43.09C76.22 44.87 75.37 46.49 74.03 47.31L57.34 57.45C55.97 58.28 54.33 57.12 54.33 55.32V35.56C54.33 33.78 55.18 32.16 56.52 31.34L73.21 21.2C74.58 20.37 76.22 21.53 76.22 23.33V43.09ZM101.67 87.16C101.67 88.94 100.82 90.56 99.48 91.38L82.79 101.52C81.42 102.35 79.78 101.19 79.78 99.39V79.63C79.78 77.85 80.63 76.23 81.97 75.41L98.66 65.27C100.03 64.44 101.67 65.6 101.67 67.4V87.16Z"/>
      </svg>
    ),
    connections: [
      { id: "conn-1", name: "FedEx Tracking API" },
      { id: "conn-2", name: "TMS Webhook" },
    ],
  },
  excel: {
    label: "Excel",
    icon: (
      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8 17v-2h4v2H8zm0-4v-2h8v2H8zm0-4v-2h8v2H8z"/>
      </svg>
    ),
    connections: [
      { id: "excel-1", name: "Weekly SLA Workbook" },
      { id: "excel-2", name: "Peak Volume Forecast.xlsx" },
    ],
  },
};
