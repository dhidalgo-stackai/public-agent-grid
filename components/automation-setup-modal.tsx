"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Automation } from "@/lib/automations-data";
import { getAgentIcon } from "@/lib/agent-icons";

const SLACK_CONNECTIONS = [
  { id: "conn-1", name: "Acme — Slack" },
  { id: "conn-2", name: "Marketing Team — Slack" },
  { id: "conn-3", name: "Engineering — Slack" },
];

const SLACK_CHANNELS = [
  { id: "ch-1", name: "#general" },
  { id: "ch-2", name: "#sales-leads" },
  { id: "ch-3", name: "#compliance" },
  { id: "ch-4", name: "#marketing" },
  { id: "ch-5", name: "#engineering" },
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Custom"];

interface AutomationSetupModalProps {
  open: boolean;
  onClose: () => void;
  automation: Automation | null;
  isSetup?: boolean;
  onSave?: () => void;
}

export function AutomationSetupModal({
  open,
  onClose,
  automation,
  isSetup = false,
  onSave,
}: AutomationSetupModalProps) {
  const isSlack = automation?.triggerType === "slack";

  const [frequency, setFrequency] = useState("Weekly");
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState("09:00");
  const [connection, setConnection] = useState("");
  const [channel, setChannel] = useState(SLACK_CHANNELS[1].id);
  const [isLoading, setIsLoading] = useState(false);
  const slackReady = !isSlack || connection !== "";
  const allConnected = slackReady;

  useEffect(() => {
    if (!open) setIsLoading(false);
  }, [open]);

  const handleActivate = () => {
    setIsLoading(true);
    setTimeout(() => {
      onSave?.();
      onClose();
    }, 1600);
  };

  const triggerLabel =
    isSlack
      ? `#${SLACK_CHANNELS.find((c) => c.id === channel)?.name?.replace("#", "") ?? "channel"}`
      : frequency === "Daily"
      ? `Every day at ${time}`
      : frequency === "Weekly"
      ? `Every ${day} at ${time}`
      : frequency === "Custom"
      ? "Custom schedule"
      : `Monthly at ${time}`;

  if (!automation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden max-w-[480px]">
        {/* Header */}
        <DialogHeader className="flex flex-col items-center px-8 pt-10 pb-6 border-b border-border space-y-0">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted text-muted-foreground mb-4">
            <span className="flex size-7 items-center justify-center">
              {getAgentIcon(automation.agentId, "size-7 text-muted-foreground")}
            </span>
          </div>
          <DialogTitle className="text-base font-semibold text-foreground text-center">
            {automation.name}
          </DialogTitle>
          {automation.description && (
            <DialogDescription className="text-xs text-center mt-1.5 max-w-xs leading-relaxed line-clamp-2">
              {automation.description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[360px] overflow-y-auto">
          {/* Trigger section */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-muted-foreground">Trigger</p>

            {isSlack ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Connection</p>
                  <Select value={connection} onValueChange={setConnection}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Select a connection" />
                    </SelectTrigger>
                    <SelectContent>
                      {SLACK_CONNECTIONS.map((conn) => (
                        <SelectItem key={conn.id} value={conn.id}>
                          {conn.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your credentials are encrypted and can be removed at any time.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Channel</p>
                  <Select value={channel} onValueChange={setChannel}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLACK_CHANNELS.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          {ch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className={cn(frequency !== "Weekly" && "invisible")}>
                  <Select value={day} onValueChange={setDay} disabled={frequency !== "Weekly"}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={cn("relative max-w-[180px]", frequency === "Custom" && "invisible")}>
                  <ClockIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={frequency === "Custom"}
                    className="w-full h-9 rounded-md border border-input bg-transparent pl-8 pr-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring shadow-xs"
                  />
                </div>

                <div className={cn(frequency !== "Custom" && "invisible")}>
                  <input
                    type="text"
                    placeholder="Cron expression, e.g. 0 9 * * 1"
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring shadow-xs"
                  />
                </div>

                {/* Schedule preview */}
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5">
                  <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Runs <span className="font-medium text-foreground">{triggerLabel}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <DialogFooter className="flex-col px-6 py-4 border-t border-border bg-muted/20 gap-2">
          {!allConnected && (
            <p className="text-xs text-muted-foreground text-center w-full">
              Select a connection to continue
            </p>
          )}
          <Button
            className="w-full"
            size="lg"
            disabled={!allConnected || isLoading}
            onClick={handleActivate}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Activating…
              </span>
            ) : isSetup ? "Activate" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
