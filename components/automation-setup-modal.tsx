"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon, CheckCircle2, CheckIcon, PlusIcon, PlayIcon, XIcon, LockIcon, MailIcon, SparklesIcon, DatabaseIcon, ArrowLeftIcon, ChevronDownIcon, ChevronRightIcon, RefreshCwIcon, XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { integrationIcons } from "@/lib/integration-icons";

const OutlookStepIcon = () => (
  <span className="flex size-5 items-center justify-center rounded-sm bg-white [&_svg]:size-4">
    {integrationIcons.outlook}
  </span>
);
const ExcelStepIcon = () => (
  <span className="flex size-5 items-center justify-center rounded-sm bg-white [&_svg]:size-4">
    {integrationIcons.excel}
  </span>
);
const AnthropicStepIcon = () => (
  <span className="flex size-5 items-center justify-center rounded-sm bg-[#181818] text-white">
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3" aria-hidden="true">
      <path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541zM6.696 3.541 0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.745L10.539 3.541H6.696zm-.36 10.223L8.63 7.82l2.294 5.945H6.336z" />
    </svg>
  </span>
);
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { Automation } from "@/lib/automations-data";
import { integrationMeta } from "@/lib/integrations";

type StepState = "pending" | "running" | "done" | "failed";

type Sample = {
  id: string;
  name: string;
  sender: string;
  subject: string;
  body: string;
  messageId: string;
  failsAt?: number; // step index where this sample fails, if any
};

const SAMPLES: Sample[] = [
  {
    id: "new-email-1",
    name: "New email 1",
    sender: "no-reply@fedex.com",
    subject: "Delivery commitment at risk — tracking 794512300456",
    body: "Shipment 794512300456 (Priority Overnight, MEM → JFK) is delayed at MEM hub due to a mechanical hold. Estimated new commitment: 11:30 AM.",
    messageId: "AAMkADEzYWFmYTFmLTM1YjItNGYwYy1hYzE0",
  },
  {
    id: "new-email-2",
    name: "New email 2",
    sender: "logistics@fedex.com",
    subject: "Weather disruption in ATL — 4 shipments affected",
    body: "Severe weather in ATL is impacting inbound loads. 4 of your shipments are delayed by an estimated 3–6 hours.",
    messageId: "AAMkADEzYWFmYTFmLTM1YjItNGYwYy1hYzE1",
  },
  {
    id: "new-email-3",
    name: "New email 3",
    sender: "no-reply@teams.mail.microsoft",
    subject: "Chris Hart mentioned AI",
    body: "<html dir=\"ltr\" lang=\"en-us\"><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"></head><body>Chris Hart mentioned you in a Teams channel.</body></html>",
    messageId: "AAMkAGM3ZDl0N2MzLWUwOGYtNDdkMy1iMTcyLW",
    failsAt: 1,
  },
  {
    id: "default",
    name: "Default values",
    sender: "sample@example.com",
    subject: "Sample subject line",
    body: "Sample email body used when no live samples are available.",
    messageId: "AAAA0000BBBB1111CCCC2222DDDD3333",
  },
];

function TestPanel({
  emailFolder,
  emailCategory,
  onClose,
}: {
  emailFolder: string;
  emailCategory: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"choose" | "running" | "done">("choose");
  const [selectedSampleId, setSelectedSampleId] = useState(SAMPLES[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [failedAt, setFailedAt] = useState<number | null>(null);

  const sample = SAMPLES.find((s) => s.id === selectedSampleId) ?? SAMPLES[0];

  const steps = [
    { id: "trigger-0", label: "Watch inbox", icon: integrationIcons.outlook },
    { id: "action-0", label: "Set email category", icon: integrationIcons.outlook },
    { id: "action-1", label: "Append to Excel", icon: integrationIcons.excel },
  ];

  const stateOf = (i: number): StepState => {
    if (phase === "choose") return "pending";
    if (failedAt !== null) {
      if (i < failedAt) return "done";
      if (i === failedAt) return "failed";
      return "pending";
    }
    if (stepIndex > i) return "done";
    if (stepIndex === i) return phase === "done" ? "done" : "running";
    return "pending";
  };

  const runWorkflow = () => {
    const willFail = sample.failsAt ?? null;
    setFailedAt(null);
    setStepIndex(0);
    setPhase("running");
    if (willFail === null) {
      setTimeout(() => setStepIndex(1), 500);
      setTimeout(() => setStepIndex(2), 1000);
      setTimeout(() => {
        setStepIndex(3);
        setPhase("done");
      }, 1500);
    } else {
      for (let i = 1; i <= willFail; i++) {
        setTimeout(() => setStepIndex(i), 500 * i);
      }
      setTimeout(() => {
        setFailedAt(willFail);
        setPhase("done");
      }, 500 * (willFail + 1));
    }
  };

  const succeeded = phase === "done" && failedAt === null;
  const failed = phase === "done" && failedAt !== null;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Panel body */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pt-4 pb-5">
        {phase === "choose" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Choose a trigger sample
              </p>
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 -mt-1 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close test panel"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <div className="space-y-1.5">
                  {SAMPLES.map((s) => {
                    const active = s.id === selectedSampleId;
                    return (
                      <HoverCard key={s.id} openDelay={120} closeDelay={80}>
                        <HoverCardTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setSelectedSampleId(s.id)}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors",
                              active
                                ? "border-border bg-background text-foreground shadow-sm"
                                : "border-transparent bg-muted/40 text-foreground hover:border-border hover:bg-background",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                                active
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-border bg-background",
                              )}
                            >
                              {active && <CheckIcon className="size-2.5" />}
                            </span>
                            <span className="truncate font-medium">{s.name}</span>
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent side="left" align="start" sideOffset={12} className="w-[340px] p-4">
                          <p className="mb-3 text-[13px] font-medium text-foreground">{s.name}</p>
                          <div className="space-y-3">
                            <PreviewField label="Sender" value={s.sender} />
                            <PreviewField label="Subject" value={s.subject} />
                            <PreviewField label="Body" value={s.body} multiline />
                            <PreviewField label="Message ID" value={s.messageId} mono />
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={runWorkflow}
                    className="h-9 w-full rounded-lg border-border bg-background px-4 text-sm shadow-sm"
                  >
                    <PlayIcon className="size-3.5" />
                    Test automation
                  </Button>
                  <button
                    type="button"
                    className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg px-4 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RefreshCwIcon className="size-3.5" />
                    Refresh samples
                  </button>
                </div>
          </div>
        ) : (
          // running / done
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-foreground">Run progress</p>
                <span
                  className={cn(
                    "inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium",
                    failed
                      ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      : succeeded
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {failed ? "Failed" : succeeded ? "Success" : "Running…"}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 -mt-1 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close test panel"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="rounded-xl border border-border/80 bg-background">
              {steps.map((step, i) => {
                const state = stateOf(i);
                const isLast = i === steps.length - 1;
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5",
                      !isLast && "border-b border-border/60",
                    )}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white [&_svg]:size-4">
                      {step.icon}
                    </span>
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {state === "done" && (
                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-500" />
                      )}
                      {state === "failed" && (
                        <XCircleIcon className="size-4 text-red-600 dark:text-red-500" />
                      )}
                      {state === "running" && (
                        <svg
                          className="size-4 animate-spin text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      )}
                      {state === "pending" && (
                        <span className="size-2 rounded-full border border-border" />
                      )}
                    </span>
                    <span className="flex-1 truncate text-[12.5px] font-medium text-foreground">
                      {step.label}
                    </span>
                    <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                      {step.id}
                    </span>
                  </div>
                );
              })}
            </div>

            {failed && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                Step failed: could not set category &quot;{emailCategory}&quot; on this message. This sample doesn&apos;t match the expected shape.
              </div>
            )}
            {succeeded && (
              <div className="overflow-hidden rounded-lg border border-border/70 bg-muted/40">
                <div className="border-b border-border/60 px-3 py-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Output
                  </p>
                </div>
                <pre className="no-scrollbar max-h-[220px] overflow-auto px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-foreground">
{`{
  "trigger": {
    "sender": "${sample.sender}",
    "subject": ${JSON.stringify(sample.subject)},
    "messageId": "${sample.messageId}"
  },
  "actions": {
    "setEmailCategory": {
      "category": "${emailCategory}",
      "ok": true
    },
    "appendToExcel": {
      "row": {
        "received": "2026-07-21 07:42",
        "tracking": "794512300456",
        "exception": "Delivery at risk",
        "severity": "High"
      },
      "ok": true
    }
  }
}`}
                </pre>
              </div>
            )}

            {phase === "done" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setPhase("choose")}
                className="h-9 w-full rounded-lg border-border bg-background px-4 text-sm shadow-sm"
              >
                <ArrowLeftIcon className="size-3.5" />
                Choose another sample
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewField({
  label,
  value,
  mono,
  multiline,
}: {
  label: string;
  value: string;
  mono?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11.5px] font-medium text-muted-foreground">{label}</p>
      <div
        className={cn(
          "rounded-md border border-border/70 bg-background px-2.5 py-1.5 text-[12.5px] text-foreground",
          mono && "font-mono text-[11.5px]",
          multiline ? "whitespace-pre-wrap break-words" : "truncate",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function StaticField({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) {
  return (
    <div className="space-y-3">
      <label className="text-sm text-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2 text-sm text-foreground">
        <span className="flex size-5 items-center justify-center [&_svg]:size-4">{icon}</span>
        <span>{value}</span>
      </div>
    </div>
  );
}

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
  const isFedexEmailLog = !!automation?.id?.includes("auto-fedex-exception-log");

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
  const [emailFolder, setEmailFolder] = useState("Inbox");
  const [senderEmail, setSenderEmail] = useState("");
  const [configOpen, setConfigOpen] = useState(true);
  const [outlookAccount, setOutlookAccount] = useState("");
  const [excelAccount, setExcelAccount] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<"trigger" | "category" | "append" | "is-exception" | "extract">("trigger");
  const [excelWorkbook, setExcelWorkbook] = useState("FedEx Ops / Exception Log.xlsx");
  const [excelSheet, setExcelSheet] = useState("Exceptions");
  const [excelTable, setExcelTable] = useState("ExceptionsTable");
  const [emailCategory, setEmailCategory] = useState("");
  const [categoryMessageId, setCategoryMessageId] = useState("{{trigger.message.id}}");
  // Selected account per integration key. Slack trigger uses the "slack" key too.
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  // Reset transient state whenever the modal opens for a new automation.
  useEffect(() => {
    if (open) {
      // Pre-connect Teams if the automation includes it.
      const initial: Record<string, string> = {};
      if (automation?.integrations.includes("teams") && integrationMeta.teams) {
        initial.teams = integrationMeta.teams.connections[0]?.id ?? "";
      }
      setConnections(initial);
      setSelectedNodeId("trigger");
      setDetails(
        isSlackTrigger
          ? { slack: integrationMeta.slack.detail?.options[1].id ?? "" }
          : {},
      );
      setIsLoading(false);
      setTestOpen(false);
    }
  }, [open, isSlackTrigger, automation]);

  const setConnection = (key: string, value: string) =>
    setConnections((prev) => ({ ...prev, [key]: value }));
  const setDetail = (key: string, value: string) =>
    setDetails((prev) => ({ ...prev, [key]: value }));

  const triggerReady = !isSlackTrigger || !!connections.slack;
  const connectionsReady = connectionIntegrations.every((i) => !!connections[i]);
  const hasException = Object.values(exceptions).some(Boolean);
  const fedexReady = !!outlookAccount && !!excelAccount;
  const allConnected = isFedexEmailLog
    ? fedexReady
    : triggerReady && connectionsReady && hasException;

  const handleActivate = () => {
    setIsLoading(true);
    setTimeout(() => {
      onSave?.(triggerLabel);
      onClose();
    }, 1600);
  };

  const slackChannels = integrationMeta.slack.detail?.options ?? [];
  const triggerLabel = isFedexEmailLog
    ? "When a new email arrives in Outlook"
    : isSlackTrigger
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
      <DialogContent
        hideX
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={cn(
          "overflow-hidden rounded-xl border border-border/80 p-0 shadow-[0_16px_48px_rgba(15,23,42,0.14)]",
          testOpen
            ? "max-w-[1240px]"
            : isFedexEmailLog
            ? "max-w-[880px]"
            : "max-w-[640px]",
        )}
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b border-border/80 px-6 py-3 text-left">
          <DialogTitle className="text-base font-semibold text-foreground">
            {automation.setupTitle ?? automation.name}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {isFedexEmailLog && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => setTestOpen((v) => !v)}
                className={cn(
                  "h-8 rounded-lg border-border bg-background px-3 text-sm shadow-sm",
                  testOpen && "bg-muted",
                )}
              >
                <PlayIcon className="size-3.5" />
                Test automation
              </Button>
            )}
            <DialogClose className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className={cn("no-scrollbar overflow-y-auto", isFedexEmailLog ? "flex h-[520px] p-0" : "h-[520px] space-y-6 px-7 py-6")}>
          {isFedexEmailLog ? (
            <>
              {/* Left rail: node list */}
              <div className="w-[220px] shrink-0 border-r border-border/80 bg-muted/30 py-4">
                <p className="px-4 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Needs configuration
                </p>
                <div className="space-y-0.5 px-2">
                  {[
                    { id: "trigger" as const, label: "Watch inbox", icon: <OutlookStepIcon />, status: outlookAccount ? "done" : "needs" },
                    { id: "category" as const, label: "Set email category", icon: <OutlookStepIcon />, status: emailCategory ? "done" : "needs" },
                    { id: "append" as const, label: "Append to Excel", icon: <ExcelStepIcon />, status: excelAccount ? "done" : "needs" },
                  ].map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                        selectedNodeId === node.id
                          ? "bg-background text-foreground shadow-sm ring-1 ring-border/80"
                          : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                      )}
                    >
                      <span className={cn("flex size-6 items-center justify-center rounded-md", selectedNodeId === node.id ? "text-foreground" : "text-muted-foreground")}>
                        {node.icon}
                      </span>
                      <span className="flex-1 truncate font-medium">{node.label}</span>
                      {node.status === "done" && (
                        <CheckIcon className="size-3.5 text-muted-foreground" />
                      )}
                      {node.status === "needs" && (
                        <span className="size-1.5 rounded-full bg-amber-500" />
                      )}
                    </button>
                  ))}
                </div>

                <p className="mt-5 px-4 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Locked configuration
                </p>
                <div className="space-y-0.5 px-2">
                  {[
                    {
                      id: "is-exception" as const,
                      label: "Is Exception?",
                      icon: (
                        <span className="flex size-5 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.8.66c0 1.87-.44 3.75-1.63 5.83a13.4 13.4 0 0 1-3.37 4.15" />
                          </svg>
                        </span>
                      ),
                    },
                    {
                      id: "extract" as const,
                      label: "Extract Exception Fields",
                      icon: (
                        <AnthropicStepIcon />
                      ),
                    },
                  ].map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                        selectedNodeId === node.id
                          ? "bg-background text-foreground shadow-sm ring-1 ring-border/80"
                          : "text-muted-foreground/70 hover:bg-background/60 hover:text-foreground",
                      )}
                    >
                      <span className={cn("flex size-6 items-center justify-center rounded-md", selectedNodeId === node.id ? "" : "opacity-70")}>
                        {node.icon}
                      </span>
                      <span className="flex-1 truncate font-medium">{node.label}</span>
                      <LockIcon className="size-3 text-muted-foreground/60" />
                    </button>
                  ))}
                </div>

              </div>

              {/* Right pane: selected node config */}
              <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-7 py-6">
              {selectedNodeId === "trigger" && (
              <div className="space-y-5">
                {/* General */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">General</p>
                  <StaticField label="Provider" icon={integrationIcons.outlook} value="Microsoft Outlook" />
                  <StaticField label="Trigger" icon={integrationIcons.outlook} value="On Email Received" />
                  <div className="space-y-3">
                    <label className="text-sm text-foreground">
                      Connection
                    </label>
                    <Select value={outlookAccount} onValueChange={setOutlookAccount}>
                      <SelectTrigger className={fieldClassName}>
                        <SelectValue placeholder="Select an Outlook connection" />
                      </SelectTrigger>
                      <SelectContent>
                        {(integrationMeta.outlook?.connections ?? []).map((conn) => (
                          <SelectItem key={conn.id} value={conn.id}>
                            {conn.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      <span className="underline decoration-dotted underline-offset-2">Your credentials are encrypted and can be removed at any time</span>. You can manage all your connections <span className="underline decoration-dotted underline-offset-2">here</span>.
                    </p>
                  </div>
                </div>

                {/* Configuration */}
                <div>
                  <button
                    type="button"
                    onClick={() => setConfigOpen((v) => !v)}
                    className="flex w-full items-center justify-between py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      Configuration
                    </span>
                  </button>
                  {configOpen && (
                    <div className="space-y-4 py-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm text-foreground">
                            <span>Inbox Folder</span>
                          </span>
                          <span className="text-xs text-muted-foreground">string</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={emailFolder}
                            onChange={(e) => setEmailFolder(e.target.value)}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 text-sm text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                          />
                          {emailFolder && (
                            <button
                              type="button"
                              onClick={() => setEmailFolder("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label="Clear"
                            >
                              <XIcon className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm text-foreground">
                            <span>Sender Email</span>
                            <span className="text-xs text-muted-foreground">(optional)</span>
                          </span>
                          <span className="text-xs text-muted-foreground">string</span>
                        </div>
                        <div>
                          <input
                            type="email"
                            value={senderEmail}
                            onChange={(e) => setSenderEmail(e.target.value)}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Set email category */}
              {selectedNodeId === "category" && (
              <div className="space-y-5">
                {/* General */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">General</p>
                  <StaticField label="Provider" icon={integrationIcons.outlook} value="Microsoft Outlook" />
                  <StaticField label="Action" icon={integrationIcons.outlook} value="Set Email Category" />
                  <div className="space-y-3">
                    <label className="text-sm text-foreground">
                      Connection
                    </label>
                    <Select value={outlookAccount} onValueChange={setOutlookAccount}>
                      <SelectTrigger className={fieldClassName}>
                        <SelectValue placeholder="Select an Outlook connection" />
                      </SelectTrigger>
                      <SelectContent>
                        {(integrationMeta.outlook?.connections ?? []).map((conn) => (
                          <SelectItem key={conn.id} value={conn.id}>
                            {conn.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      <span className="underline decoration-dotted underline-offset-2">Your credentials are encrypted and can be removed at any time</span>. You can manage all your connections <span className="underline decoration-dotted underline-offset-2">here</span>.
                    </p>
                  </div>
                </div>

                {/* Configuration */}
                <div>
                  <div className="flex items-center gap-2 py-3">
                    <span className="text-sm font-semibold text-foreground">Configuration</span>
                  </div>
                  <div className="space-y-4 py-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-foreground">
                          <span>Category</span>
                          <span className="text-red-500">*</span>
                        </span>
                        <span className="text-xs text-muted-foreground">string</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={emailCategory} onValueChange={setEmailCategory}>
                          <SelectTrigger className={fieldClassName}>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {["Not an exception", "Follow-up", "Reviewed", "Archived"].map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {emailCategory && (
                          <button
                            type="button"
                            onClick={() => setEmailCategory("")}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Clear"
                          >
                            <XIcon className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-foreground">
                          <span>Message ID</span>
                          <span className="text-red-500">*</span>
                        </span>
                        <span className="text-xs text-muted-foreground">string</span>
                      </div>
                      <textarea
                        value={categoryMessageId}
                        onChange={(e) => setCategoryMessageId(e.target.value)}
                        placeholder="AAMkADEzYWFmYT..."
                        rows={2}
                        className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                      />
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Is Exception? (locked) */}
              {selectedNodeId === "is-exception" && (
              <div className="space-y-5 opacity-90">
                <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 text-[12.5px] text-muted-foreground">
                  <LockIcon className="mt-0.5 size-3.5 shrink-0" />
                  <span>Managed by the automation. This step runs automatically and cannot be edited.</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">General</p>
                  <StaticField label="Type" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>} value="If-else router" />
                  <StaticField label="Route" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v3"/><path d="M12 5a7 7 0 0 0-4 12.7c.5.5 1 1.3 1 2.3"/><path d="M12 5a7 7 0 0 1 4 12.7c-.5.5-1 1.3-1 2.3"/></svg>} value="Uses Extract Exception Fields output" />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Branches</p>
                  <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 text-[12.5px]">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">If <span className="font-mono text-[12px]">isException == true</span></span>
                      <span className="text-muted-foreground">→ Set email category</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 text-[12.5px]">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Else</span>
                      <span className="text-muted-foreground">→ Skip</span>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Extract Exception Fields (locked) */}
              {selectedNodeId === "extract" && (
              <div className="space-y-5 opacity-90">
                <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 text-[12.5px] text-muted-foreground">
                  <LockIcon className="mt-0.5 size-3.5 shrink-0" />
                  <span>Managed by the automation. This step runs automatically and cannot be edited.</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">General</p>
                  <StaticField
                    label="Type"
                    icon={<svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541zM6.696 3.541 0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.745L10.539 3.541H6.696zm-.36 10.223L8.63 7.82l2.294 5.945H6.336z" /></svg>}
                    value="Anthropic Agent with tool calling"
                  />
                  <StaticField
                    label="Model"
                    icon={<svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541zM6.696 3.541 0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.745L10.539 3.541H6.696zm-.36 10.223L8.63 7.82l2.294 5.945H6.336z" /></svg>}
                    value="Claude 4.6 Opus"
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Tools</p>
                  <div className="rounded-lg border border-border/70 bg-muted/30 divide-y divide-border/60 text-[12.5px]">
                    {[
                      { name: "read_email", desc: "Fetch the triggering message body and headers" },
                      { name: "lookup_tracking", desc: "Resolve tracking numbers via Shipment Visibility" },
                      { name: "classify_severity", desc: "Map exception type to a severity bucket" },
                    ].map((t) => (
                      <div key={t.name} className="flex items-start gap-2 px-3 py-2">
                        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm bg-background text-muted-foreground">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[11.5px] text-foreground">{t.name}</p>
                          <p className="text-[11.5px] text-muted-foreground">{t.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">System prompt</p>
                  <pre className="no-scrollbar max-h-[140px] overflow-auto rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-muted-foreground whitespace-pre-wrap">{`You extract structured fields from FedEx exception emails.
Return: tracking, exception_type, severity, eta_impact.
If the email is not an exception, return isException=false.`}</pre>
                </div>
              </div>
              )}

              {/* Destination: Excel */}
              {selectedNodeId === "append" && (
              <div className="space-y-5">
                {/* General */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">General</p>
                  <StaticField label="Provider" icon={integrationIcons.excel} value="Excel on SharePoint" />
                  <StaticField label="Action" icon={integrationIcons.excel} value="Append Row to Table" />
                  <div className="space-y-3">
                    <label className="text-sm text-foreground">
                      Connection
                    </label>
                    <Select value={excelAccount} onValueChange={setExcelAccount}>
                      <SelectTrigger className={fieldClassName}>
                        <SelectValue placeholder="Select an Excel account" />
                      </SelectTrigger>
                      <SelectContent>
                        {(integrationMeta.excel?.connections ?? []).map((conn) => (
                          <SelectItem key={conn.id} value={conn.id}>
                            {conn.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      <span className="underline decoration-dotted underline-offset-2">Your credentials are encrypted and can be removed at any time</span>. You can manage all your connections <span className="underline decoration-dotted underline-offset-2">here</span>.
                    </p>
                  </div>
                </div>

                {/* Configuration */}
                <div>
                  <div className="flex items-center gap-2 py-3">
                    <span className="text-sm font-semibold text-foreground">Configuration</span>
                  </div>
                  <div className="space-y-4 py-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-foreground">
                          <span>Workbook</span>
                          <span className="text-red-500">*</span>
                        </span>
                        <span className="text-xs text-muted-foreground">string</span>
                      </div>
                      <Select value={excelWorkbook} onValueChange={setExcelWorkbook}>
                        <SelectTrigger className={fieldClassName}>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "FedEx Ops / Exception Log.xlsx",
                            "FedEx Ops / Daily Alerts.xlsx",
                            "Shared / Exception Archive.xlsx",
                          ].map((w) => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-foreground">
                          <span>Sheet</span>
                          <span className="text-red-500">*</span>
                        </span>
                        <span className="text-xs text-muted-foreground">string</span>
                      </div>
                      <Select value={excelSheet} onValueChange={setExcelSheet}>
                        <SelectTrigger className={fieldClassName}>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {["Exceptions", "Archive", "Sandbox"].map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-foreground">
                          <span>Table</span>
                          <span className="text-red-500">*</span>
                        </span>
                        <span className="text-xs text-muted-foreground">string</span>
                      </div>
                      <Select value={excelTable} onValueChange={setExcelTable}>
                        <SelectTrigger className={fieldClassName}>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {["ExceptionsTable", "ArchiveTable"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              )}

              </div>

              {testOpen && (
                <div className="flex w-[380px] shrink-0 flex-col border-l border-border/80 bg-background">
                  <TestPanel
                    emailFolder={emailFolder}
                    emailCategory={emailCategory || "Not an exception"}
                    onClose={() => setTestOpen(false)}
                  />
                </div>
              )}
            </>
          ) : (
          <>
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

          </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-border/80 bg-muted/30 px-7 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div />
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            {!isFedexEmailLog && !testOpen && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isLoading}
                onClick={() => setTestOpen(true)}
                className="h-9 rounded-lg border-border bg-background px-5 text-sm shadow-sm"
              >
                <PlayIcon className="size-3.5" />
                Test automation
              </Button>
            )}
            <Button
              className="h-9 min-w-[118px] rounded-lg px-5 text-sm shadow-none"
              size="lg"
              disabled={isLoading}
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
              ) : isSetup ? "Activate" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
