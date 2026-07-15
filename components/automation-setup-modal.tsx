"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon, CheckCircle2, PlusIcon, PlayIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
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
import { integrationMeta } from "@/lib/integrations";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Custom"];
const fieldClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-none transition-[color,box-shadow] hover:bg-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15";

interface AutomationSetupModalProps {
  open: boolean;
  onClose: () => void;
  automation: Automation | null;
  isSetup?: boolean;
  onSave?: (schedule?: string) => void;
}

export function AutomationSetupModal({
  open,
  onClose,
  automation,
  isSetup = false,
  onSave,
}: AutomationSetupModalProps) {
  const isSlackTrigger = automation?.triggerType === "slack";

  // The trigger connection (Slack) is configured in the Trigger section; every
  // other integration the automation touches is bound in the Connections section.
  const connectionIntegrations = (automation?.integrations ?? []).filter(
    (i) => !(isSlackTrigger && i === "slack") && integrationMeta[i],
  );

  const [frequency, setFrequency] = useState("Weekly");
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState("09:00");
  // Selected account per integration key. Slack trigger uses the "slack" key too.
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset transient state whenever the modal opens for a new automation.
  useEffect(() => {
    if (open) {
      setConnections({});
      setDetails(
        isSlackTrigger
          ? { slack: integrationMeta.slack.detail?.options[1].id ?? "" }
          : {},
      );
      setIsLoading(false);
    }
  }, [open, isSlackTrigger]);

  const setConnection = (key: string, value: string) =>
    setConnections((prev) => ({ ...prev, [key]: value }));
  const setDetail = (key: string, value: string) =>
    setDetails((prev) => ({ ...prev, [key]: value }));

  const triggerReady = !isSlackTrigger || !!connections.slack;
  const connectionsReady = connectionIntegrations.every((i) => !!connections[i]);
  const allConnected = triggerReady && connectionsReady;

  const handleActivate = () => {
    setIsLoading(true);
    setTimeout(() => {
      onSave?.(triggerLabel);
      onClose();
    }, 1600);
  };

  const slackChannels = integrationMeta.slack.detail?.options ?? [];
  const triggerLabel = isSlackTrigger
    ? slackChannels.find((c) => c.id === details.slack)?.name ?? "#channel"
    : frequency === "Daily"
    ? `Every day at ${time}`
    : frequency === "Weekly"
    ? `Every ${day} at ${time}`
    : frequency === "Custom"
    ? "Custom schedule"
    : `Monthly at ${time}`;

  if (!automation) return null;

  const renderConnectionField = (key: string) => {
    const meta = integrationMeta[key];
    if (!meta) return null;
    const value = connections[key] ?? "";
    return (
      <div key={key} className="space-y-3 rounded-xl border border-border/80 bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center">{meta.icon}</span>
            <span className="text-sm font-medium text-foreground">{meta.label}</span>
          </div>
          {value ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 className="size-3.5" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Not connected
            </span>
          )}
        </div>

        <Select value={value} onValueChange={(v) => setConnection(key, v)}>
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder={`Select a ${meta.label} account`} />
          </SelectTrigger>
          <SelectContent>
            {meta.connections.map((conn) => (
              <SelectItem key={conn.id} value={conn.id}>
                {conn.name}
              </SelectItem>
            ))}
            <div className="mt-1 border-t border-border pt-1">
              <button
                type="button"
                disabled
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-muted-foreground/70"
              >
                <PlusIcon className="size-3.5" />
                Connect new account
              </button>
            </div>
          </SelectContent>
        </Select>

        {value && meta.detail && (
          <Select value={details[key] ?? ""} onValueChange={(v) => setDetail(key, v)}>
            <SelectTrigger className={fieldClassName}>
              <SelectValue placeholder={`Select a ${meta.detail.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {meta.detail.options.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent hideX className="max-w-[640px] overflow-hidden rounded-xl border border-border/80 p-0 shadow-[0_16px_48px_rgba(15,23,42,0.14)]">
        <DialogClose className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* Header */}
        <DialogHeader className="space-y-4 border-b border-border/80 px-7 pb-6 pt-7 pr-16 text-left">
          <DialogTitle className="text-2xl font-semibold text-foreground">
            {automation.name}
          </DialogTitle>
          {automation.description && (
            <DialogDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
              {automation.description}
            </DialogDescription>
          )}

          <div className="rounded-lg border border-border/80 bg-background px-4 py-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CalendarIcon className="size-4 shrink-0" />
              <p>
                Runs <span className="font-semibold text-foreground">{triggerLabel}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="max-h-[440px] space-y-6 overflow-y-auto px-7 py-6">
          {/* Trigger section */}
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Trigger</p>
              <p className="text-sm text-muted-foreground">
                Configure when this automation should run.
              </p>
            </div>

            {isSlackTrigger ? (
              <div className="space-y-3">
                {renderConnectionField("slack")}
                <p className="text-sm leading-6 text-muted-foreground">
                  Runs whenever a message is posted to the selected channel. Your
                  credentials are encrypted and can be removed at any time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className={fieldClassName}>
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
                    <SelectTrigger className={fieldClassName}>
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
                  <ClockIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={frequency === "Custom"}
                    className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground shadow-none outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                  />
                </div>

                <div className={cn(frequency !== "Custom" && "invisible")}>
                  <input
                    type="text"
                    placeholder="Cron expression, e.g. 0 9 * * 1"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-none outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Connections section */}
          {connectionIntegrations.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Connections</p>
                <p className="text-sm text-muted-foreground">
                  Accounts the steps in this automation act through.
                </p>
              </div>
              <div className="space-y-3">
                {connectionIntegrations.map((key) => renderConnectionField(key))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-border/80 bg-muted/30 px-7 py-4 sm:flex-row sm:items-center sm:justify-between">
          {!allConnected ? (
            <p className="w-full text-sm text-muted-foreground sm:w-auto">
              Connect all accounts to continue
            </p>
          ) : (
            <div />
          )}
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={!allConnected || isLoading}
              className="h-9 rounded-lg border-border bg-background px-5 text-sm shadow-sm"
            >
              <PlayIcon className="size-3.5" />
              Test run
            </Button>
            <Button
              className="h-9 min-w-[118px] rounded-lg px-5 text-sm shadow-none"
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
