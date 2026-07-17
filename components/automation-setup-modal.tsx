"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon, CheckCircle2, PlusIcon, PlayIcon, XIcon, LockIcon } from "lucide-react";
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
const FREQUENCIES = ["Daily", "Weekdays", "Weekly", "Monthly", "Custom"];
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
    (i) =>
      !(isSlackTrigger && i === "slack") &&
      integrationMeta[i] &&
      !integrationMeta[i].isSystem,
  );

  const [frequency, setFrequency] = useState("Weekdays");
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState("07:00");
  const [timezone, setTimezone] = useState("local");
  const [station, setStation] = useState("Memphis Hub");
  const [services, setServices] = useState<Record<string, boolean>>({
    Express: true,
    Ground: true,
    Freight: false,
    International: false,
  });
  const [accounts, setAccounts] = useState("My assigned accounts");
  const [maxShipments, setMaxShipments] = useState("25");
  const [exceptions, setExceptions] = useState<Record<string, boolean>>({
    "Delivery commitment at risk": true,
    "No scan for 12 hours": true,
    "Weather disruption": false,
    "Customs clearance hold": false,
    "Failed delivery attempt": false,
    "Address issue": false,
    "Damaged shipment": false,
  });
  const [minSeverity, setMinSeverity] = useState("Medium and above");
  const [outlookAddress, setOutlookAddress] = useState("jordan.lee@example.com");
  // Selected account per integration key. Slack trigger uses the "slack" key too.
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset transient state whenever the modal opens for a new automation.
  useEffect(() => {
    if (open) {
      // Pre-connect Teams if the automation includes it.
      const initial: Record<string, string> = {};
      if (automation?.integrations.includes("teams") && integrationMeta.teams) {
        initial.teams = integrationMeta.teams.connections[0]?.id ?? "";
      }
      setConnections(initial);
      setDetails(
        isSlackTrigger
          ? { slack: integrationMeta.slack.detail?.options[1].id ?? "" }
          : {},
      );
      setIsLoading(false);
    }
  }, [open, isSlackTrigger, automation]);

  const setConnection = (key: string, value: string) =>
    setConnections((prev) => ({ ...prev, [key]: value }));
  const setDetail = (key: string, value: string) =>
    setDetails((prev) => ({ ...prev, [key]: value }));

  const triggerReady = !isSlackTrigger || !!connections.slack;
  const connectionsReady = connectionIntegrations.every((i) => !!connections[i]);
  const hasException = Object.values(exceptions).some(Boolean);
  const allConnected = triggerReady && connectionsReady && hasException;

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
    : frequency === "Weekdays"
    ? `Every weekday at ${time}`
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
            {automation.setupTitle ?? automation.name}
          </DialogTitle>
          {(automation.setupDescription ?? automation.description) && (
            <DialogDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
              {automation.setupDescription ?? automation.description}
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
          {/* Schedule section */}
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Schedule</p>
              <p className="text-sm text-muted-foreground">
                Choose when your morning brief should run.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className={fieldClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.filter((f) => f !== "Custom").map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <ClockIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground shadow-none outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                />
              </div>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className={fieldClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local station time</SelectItem>
                  <SelectItem value="ct">Central Time (Memphis)</SelectItem>
                  <SelectItem value="et">Eastern Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {frequency === "Weekly" && (
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className={fieldClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* My coverage */}
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">My coverage</p>
              <p className="text-sm text-muted-foreground">
                Select the operational area included in your personal brief.
              </p>
            </div>
            <Select value={station} onValueChange={setStation}>
              <SelectTrigger className={fieldClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Memphis Hub", "Indianapolis Hub", "Oakland Hub", "Anchorage Hub"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-3 rounded-lg border border-border/80 bg-background px-3 py-2.5">
              {Object.keys(services).map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={services[s]}
                    onChange={(e) =>
                      setServices((prev) => ({ ...prev, [s]: e.target.checked }))
                    }
                    className="size-4 rounded border-input"
                  />
                  {s}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={accounts} onValueChange={setAccounts}>
                <SelectTrigger className={fieldClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["My assigned accounts", "All station accounts", "Custom list…"].map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="number"
                value={maxShipments}
                onChange={(e) => setMaxShipments(e.target.value)}
                placeholder="Max shipments"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
              />
            </div>
          </div>

          {/* Exceptions to include */}
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Exceptions to include</p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/80 bg-background px-3 py-3">
              {Object.keys(exceptions).map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={exceptions[k]}
                    onChange={(e) =>
                      setExceptions((prev) => ({ ...prev, [k]: e.target.checked }))
                    }
                    className="size-4 rounded border-input"
                  />
                  {k}
                </label>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Minimum severity</p>
              <Select value={minSeverity} onValueChange={setMinSeverity}>
                <SelectTrigger className={fieldClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Low and above", "Medium and above", "High only"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Send my brief to */}
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Send my brief to</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-background p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center">{integrationMeta.teams?.icon}</span>
                  <span className="text-sm font-medium text-foreground">Microsoft Teams</span>
                </div>
                <span className="text-xs text-muted-foreground">Direct message to Jordan Lee</span>
              </div>
            </div>
            <div className="rounded-lg border border-border/80 bg-background p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center">{integrationMeta.outlook?.icon}</span>
                <span className="text-sm font-medium text-foreground">Outlook</span>
              </div>
              <input
                type="email"
                value={outlookAddress}
                onChange={(e) => setOutlookAddress(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
              />
            </div>
          </div>

          {/* Connections section */}
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Connections</p>
              <p className="text-sm text-muted-foreground">
                Enterprise connections are managed by IT. Select the account used to receive your results.
              </p>
            </div>
            <div className="space-y-3">
              {connectionIntegrations.map((key) => renderConnectionField(key))}
              {automation.integrations.includes("shipment-visibility") && (
                <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/40 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center">
                      {integrationMeta["shipment-visibility"]?.icon}
                    </span>
                    <span className="text-sm font-medium text-foreground">Shipment Visibility</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <LockIcon className="size-3.5" />
                    Managed by Enterprise IT
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Managed workflow info */}
          <div className="rounded-lg border border-border/80 bg-muted/40 p-4">
            <p className="text-sm font-semibold text-foreground">Managed workflow</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              The Enterprise Automation Team controls workflow logic, data access, prompts, and safety policies. Your preferences only control which approved results you receive.
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-border/80 bg-muted/30 px-7 py-4 sm:flex-row sm:items-center sm:justify-between">
          {!allConnected ? (
            <p className="w-full text-sm text-muted-foreground sm:w-auto">
              Connect required accounts and select at least one exception to continue
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
              Test with sample data
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
              ) : isSetup ? "Activate" : "Save preferences"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
