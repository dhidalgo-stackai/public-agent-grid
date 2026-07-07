"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { type ChatItem } from "@/lib/chats-data";
import { getAgentIcon } from "@/lib/agent-icons";

interface ChatSearchModalProps {
  open: boolean;
  onClose: () => void;
  chats: ChatItem[];
}

function groupByTime(chats: ChatItem[]): { label: string; items: ChatItem[] }[] {
  // Simple grouping — use timestamp hints or fall back to "Older"
  const today: ChatItem[] = [];
  const pastHour: ChatItem[] = [];
  const yesterday: ChatItem[] = [];
  const older: ChatItem[] = [];

  for (const c of chats) {
    const t = c.timestamp?.toLowerCase() ?? "";
    if (t.includes("just now") || t.includes("min")) today.push(c);
    else if (t.includes("hour")) pastHour.push(c);
    else if (t.includes("yesterday")) yesterday.push(c);
    else older.push(c);
  }

  return [
    { label: "Today", items: today },
    { label: "Past hour", items: pastHour },
    { label: "Yesterday", items: yesterday },
    { label: "Older", items: older },
  ].filter((g) => g.items.length > 0);
}

export function ChatSearchModal({ open, onClose, chats }: ChatSearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = query
    ? chats.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : chats;

  const groups = query ? [{ label: "Results", items: filtered }] : groupByTime(filtered);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl mx-4 rounded-xl bg-background shadow-2xl border border-black/8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-black/6">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats and projects"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded p-0.5 text-muted-foreground/40 transition-colors hover:bg-black/5 hover:text-muted-foreground"
            aria-label="Close search"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground/50">
              No chats found
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <p className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground/50">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={
                      item.agentId
                        ? `/agent/${item.agentId}?chat=${item.id}${item.agentName ? `&name=${encodeURIComponent(item.agentName)}` : ""}&from=chat`
                        : `/agent/new?chat=${item.id}`
                    }
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-black/4 first-of-type:rounded-none"
                    )}
                  >
                    <span className="shrink-0 text-muted-foreground/60">
                      {getAgentIcon(item.agentId)}
                    </span>
                    <span className="flex-1 truncate text-foreground/80">{item.label}</span>
                    {item.timestamp && (
                      <span className="shrink-0 text-xs text-muted-foreground/40">
                        {item.timestamp}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
