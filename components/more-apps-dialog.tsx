"use client";

import { useState } from "react";
import { SearchIcon, PlugIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { integrationIcons } from "@/lib/integration-icons";

const ALL_APPS = [
  { id: "slack", label: "Slack", category: "Communication" },
  { id: "notion", label: "Notion", category: "Productivity" },
  { id: "dropbox", label: "Dropbox", category: "Storage" },
  { id: "gdrive", label: "Google Drive", category: "Storage" },
  { id: "outlook", label: "Outlook", category: "Communication" },
  { id: "figma", label: "Figma", category: "Design" },
  { id: "gmail", label: "Gmail", category: "Communication" },
  { id: "github", label: "GitHub", category: "Development" },
  { id: "jira", label: "Jira", category: "Productivity" },
  { id: "linear", label: "Linear", category: "Productivity" },
  { id: "hubspot", label: "HubSpot", category: "Sales" },
  { id: "salesforce", label: "Salesforce", category: "Sales" },
  { id: "airtable", label: "Airtable", category: "Productivity" },
  { id: "confluence", label: "Confluence", category: "Productivity" },
  { id: "intercom", label: "Intercom", category: "Support" },
];

export function MoreAppsDialog({
  open,
  onOpenChange,
  connectedConnectors,
  onConnectorChange,
  activeApps,
  onActiveAppsChange,
  onRequestConnect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectedConnectors?: string[];
  onConnectorChange?: (ids: string[]) => void;
  activeApps?: string[];
  onActiveAppsChange?: (ids: string[]) => void;
  onRequestConnect?: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const connected = connectedConnectors ?? [];
  const pending = activeApps ?? [];
  const filtered = ALL_APPS.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (id: string) => {
    if (!onConnectorChange) return;
    onConnectorChange(
      connected.includes(id)
        ? connected.filter((x) => x !== id)
        : [...connected, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="p-4 pb-0">
          <DialogTitle className="text-base font-semibold mb-3">Connect apps</DialogTitle>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              autoFocus
              className="w-full rounded-lg border border-border bg-muted/40 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30"
              placeholder="Search apps..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-2 max-h-80 overflow-y-auto px-2 pb-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No apps found</p>
          ) : (
            filtered.map((app) => {
              const isConnected = connected.includes(app.id);
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => {
                    if (isConnected) {
                      toggle(app.id);
                      return;
                    }
                    if (onActiveAppsChange) {
                      onActiveAppsChange(
                        pending.includes(app.id)
                          ? pending.filter((x) => x !== app.id)
                          : [...pending, app.id]
                      );
                      onOpenChange(false);
                      return;
                    }
                    onOpenChange(false);
                    onRequestConnect?.(app.id);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted/60 transition-colors"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                    {integrationIcons[app.id] ?? <PlugIcon className="size-4 text-muted-foreground" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{app.label}</span>
                    <span className="block text-xs text-muted-foreground">{app.category}</span>
                  </span>
                  {isConnected || pending.includes(app.id) ? (
                    <span className="text-xs font-medium text-foreground">
                      {isConnected ? "Connected" : "Added"}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Connect</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
