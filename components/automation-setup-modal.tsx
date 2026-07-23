"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, CalendarClockIcon, ClockIcon, CheckCircle2, CheckIcon, PlusIcon, PlayIcon, XIcon, LockIcon, MailIcon, SparklesIcon, DatabaseIcon, ArrowLeftIcon, ChevronDownIcon, ChevronRightIcon, RefreshCwIcon, XCircleIcon, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon, integrationIcons } from "@/lib/integration-icons";

const OutlookStepIcon = () => <AppIcon>{integrationIcons.outlook}</AppIcon>;
const ExcelStepIcon = () => <AppIcon>{integrationIcons.excel}</AppIcon>;
const AnthropicStepIcon = () => (
  <AppIcon>
    <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#181818]" aria-hidden="true">
      <path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541zM6.696 3.541 0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.745L10.539 3.541H6.696zm-.36 10.223L8.63 7.82l2.294 5.945H6.336z" />
    </svg>
  </AppIcon>
);
const ScheduleStepIcon = () => (
  <AppIcon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  </AppIcon>
);
const SharepointStepIcon = () => <AppIcon>{integrationIcons.sharepoint}</AppIcon>;
const WeatherStepIcon = () => (
  <AppIcon>
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="16.5" cy="8.5" r="3" fill="#F5A623" />
      <path d="M6.5 17.5a3.5 3.5 0 0 1 .6-6.95 5 5 0 0 1 9.65 1.2 3.75 3.75 0 0 1-1.5 7.25H7a3.5 3.5 0 0 1-.5-1.5Z" fill="#3B7DDD" stroke="#2A5FAF" strokeWidth="0.6" strokeLinejoin="round" />
    </svg>
  </AppIcon>
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

function ScheduleField({
  label,
  typeHint,
  required,
  children,
}: {
  label: string;
  typeHint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {typeHint && (
          <span className="font-mono text-[11px] text-muted-foreground">{typeHint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function NodeHeader({ name, description }: { name: string; description: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-sm font-medium text-foreground">{name}</p>
      <p className="text-sm text-foreground">{description}</p>
    </div>
  );
}

function StaticField({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2 text-sm text-foreground">
        <AppIcon>{icon}</AppIcon>
        <span>{value}</span>
      </div>
    </div>
  );
}

const StackAiMark = ({ className = "size-4" }: { className?: string }) => (
  <span className={cn("inline-flex items-center justify-center text-foreground [&_svg]:h-full [&_svg]:w-full", className)}>
    {integrationIcons.connector}
  </span>
);

const AnthropicMark = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={cn(className, "text-[#181818]")} aria-hidden="true">
    <path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541zM6.696 3.541 0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.745L10.539 3.541H6.696zm-.36 10.223L8.63 7.82l2.294 5.945H6.336z" />
  </svg>
);

function StackAiRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-foreground">
      <span className="flex size-5 items-center justify-center [&_svg]:size-4">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
    </div>
  );
}

function StackAiToolbar({ leftItems, showFormatted }: { leftItems?: React.ReactNode; showFormatted?: boolean }) {
  return (
    <div className="flex items-center justify-between border-t border-input px-2 py-1.5">
      <div className="flex items-center gap-1">
        {leftItems}
      </div>
      <div className="flex items-center gap-1">
        <button type="button" disabled className="flex size-6 items-center justify-center rounded-md text-muted-foreground/60">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><path d="M9.94 14.34a4 4 0 1 1-4.28-4.28"/><path d="m14 6 3 3"/><path d="M18.37 3.63 8 14l-1 4 4-1L21.37 6.63a2.5 2.5 0 1 0-3.53-3.53Z"/></svg>
        </button>
        <button type="button" disabled className="flex size-6 items-center justify-center rounded-md text-muted-foreground/60">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><rect width="6" height="12" x="9" y="3" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v4"/></svg>
        </button>
      </div>
    </div>
  );
}

function StackAiInstructionsToolbar() {
  return (
    <StackAiToolbar
      leftItems={
        <>
          <button type="button" disabled className="flex size-6 items-center justify-center rounded-md text-muted-foreground/70">
            <PlusIcon className="size-3.5" />
          </button>
          <button type="button" disabled className="flex h-6 items-center gap-1 rounded-md px-1.5 text-[12px] text-muted-foreground/70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            Tools
          </button>
          <button type="button" disabled className="flex h-6 items-center gap-1 rounded-md px-1.5 text-[12px] text-muted-foreground/70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><circle cx="12" cy="12" r="10"/><path d="m8 14 2.5-6L13 14"/><path d="M9 12h3"/><path d="M15 8v6"/></svg>
            Skills
          </button>
        </>
      }
    />
  );
}

function LlmAgentBody({
  name,
  description,
  provider,
  action,
  aiProvider,
  aiProviderIcon,
  model,
  instructions,
  userMessage,
  toolsCount = 2,
}: {
  name: string;
  description: string;
  provider: string;
  action: string;
  aiProvider: string;
  aiProviderIcon: React.ReactNode;
  model: string;
  instructions: string;
  userMessage?: React.ReactNode;
  toolsCount?: number;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm font-semibold text-muted-foreground">General</p>
      <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 text-[12.5px] text-muted-foreground">
        <LockIcon className="mt-0.5 size-3.5 shrink-0" />
        <span>Managed by the automation. This step runs automatically and cannot be edited.</span>
      </div>
      <NodeHeader name={name} description={description} />
      <StaticField label="Provider" icon={aiProviderIcon} value={provider} />
      <StaticField label="Action" icon={aiProviderIcon} value={action} />

      <div className="mt-6 space-y-5 border-t border-border/70 pt-6">
        <p className="text-sm font-semibold text-muted-foreground">Configuration</p>

        <div className="space-y-2">
          <label className="text-sm text-foreground">AI Provider</label>
          <StackAiRow icon={aiProviderIcon} label={aiProvider} />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-foreground">Model</label>
          <StackAiRow icon={aiProviderIcon} label={model} />
        </div>

        <p className="text-sm font-semibold text-muted-foreground">Prompting</p>

        <div className="space-y-2">
          <label className="text-[13px] font-medium text-foreground underline decoration-dotted underline-offset-4">
            Instructions
          </label>
          <textarea
            disabled
            value={instructions}
            rows={6}
            className="block w-full resize-none rounded-md border border-input bg-background px-3 py-2 font-mono text-[12px] leading-relaxed text-foreground/90 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-medium text-foreground underline decoration-dotted underline-offset-4">
            Prompt
          </label>
          <div className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 font-mono text-[12px] leading-relaxed text-foreground/90">
            <span className="text-muted-foreground">User Message: </span>
            {userMessage}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tools</label>
          <div className="flex items-center gap-3 rounded-lg border border-input bg-background px-3 py-2">
            <div className="flex size-7 shrink-0 items-center justify-center">
              <StackAiMark className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground">StackAI Tools</p>
              <p className="text-[11.5px] text-muted-foreground">{toolsCount} tools added</p>
            </div>
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          </div>
        </div>
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
  const isWeatherBrief = !!automation?.id?.includes("auto-fedex-weather-route-brief");
  const hasSidebarLayout = isFedexEmailLog || isWeatherBrief;

  // The trigger connection (Slack) is configured in the Trigger section; every
  // other integration the automation touches is bound in the Connections section.
  const connectionIntegrations = (automation?.integrations ?? []).filter(
    (i) =>
      !(isSlackTrigger && i === "slack") &&
      integrationMeta[i] &&
      !integrationMeta[i].isSystem,
  );

  const [frequency, setFrequency] = useState(
    automation?.id?.includes("auto-fedex-weather-route-brief") ? "Every day" : "Weekdays",
  );
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState(
    automation?.id?.includes("auto-fedex-weather-route-brief") ? "09:00" : "07:00",
  );
  const [timezone, setTimezone] = useState(
    automation?.id?.includes("auto-fedex-weather-route-brief") ? "UTC" : "local",
  );
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
  const [sharepointAccount, setSharepointAccount] = useState("");
  const [sharepointSite, setSharepointSite] = useState("dispatchhub.sharepoint.com/sites/route-ops");
  const [sharepointList, setSharepointList] = useState("DispatchPlans");
  const [sharepointFilter, setSharepointFilter] = useState("Date eq today() and Hub eq '{{trigger.hub_code}}'");
  const [outlookRecipient, setOutlookRecipient] = useState("dispatch-lead@fedex.com");
  const [outlookSubject, setOutlookSubject] = useState("Morning Route Risk Brief — {{trigger.hub_code}} — {{trigger.date}}");
  const [outlookBody, setOutlookBody] = useState("{{draft.output.html}}");
  const [selectedNodeId, setSelectedNodeId] = useState<
    | "trigger"
    | "category"
    | "append"
    | "is-exception"
    | "extract"
    | "route-plan"
    | "nws"
    | "score"
    | "draft"
    | "delivery"
  >("trigger");
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
    : frequency === "Daily" || frequency === "Every day"
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
            <AppIcon>{meta.icon}</AppIcon>
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
          "data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0 data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0",
          testOpen
            ? "max-w-[1240px]"
            : hasSidebarLayout
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
            {hasSidebarLayout && (
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
        <div className={cn("no-scrollbar overflow-y-auto", hasSidebarLayout ? "flex h-[520px] p-0" : "h-[520px] space-y-6 px-7 py-6")}>
          {isWeatherBrief ? (
            <>
              {/* Left rail: node list */}
              <div className="w-[220px] shrink-0 border-r border-border/80 bg-muted/30 py-4">
                <p className="px-4 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Needs configuration
                </p>
                <div className="space-y-0.5 px-2">
                  {[
                    {
                      id: "trigger" as const,
                      label: "Every weekday at 5:30 AM",
                      icon: <ScheduleStepIcon />,
                      status: "done",
                    },
                    {
                      id: "route-plan" as const,
                      label: "Pull Today's Route Plan",
                      icon: <SharepointStepIcon />,
                      status: station ? "done" : "needs",
                    },
                    {
                      id: "delivery" as const,
                      label: "Send Brief via Outlook",
                      icon: <OutlookStepIcon />,
                      status: outlookAddress ? "done" : "needs",
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
                    { id: "nws" as const, label: "Fetch NWS Forecast", icon: <WeatherStepIcon /> },
                    { id: "score" as const, label: "Score Route Risk", icon: <AnthropicStepIcon /> },
                    { id: "draft" as const, label: "Draft Dispatch Brief", icon: <AnthropicStepIcon /> },
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
              <div className="no-scrollbar flex-1 overflow-y-auto px-7 py-6">
                {selectedNodeId === "trigger" && (
                  <div className="space-y-5">
                    <p className="text-sm font-semibold text-muted-foreground">General</p>
                    <NodeHeader
                      name="Every weekday at 5:30 AM"
                      description="Triggers this workflow on a recurring schedule at the times and timezone you set below."
                    />
                    <StaticField
                      label="Provider"
                      icon={<StackAiMark />}
                      value="Stack AI"
                    />
                    <StaticField
                      label="Trigger"
                      icon={<CalendarClockIcon className="size-4 text-foreground" />}
                      value="Scheduled Execution"
                    />

                    <div className="mt-6 space-y-5 border-t border-border/70 pt-6">
                      <p className="text-sm font-semibold text-muted-foreground">Configuration</p>

                      <ScheduleField label="Frequency" typeHint="select_string" required>
                        <Select value={frequency} onValueChange={setFrequency}>
                          <SelectTrigger className={fieldClassName}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Every day", "Weekdays", "Weekly", "Monthly"].map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </ScheduleField>

                      <ScheduleField label="Time(s)" typeHint="string_array" required>
                        <div className="space-y-1.5">
                          {time.split(",").filter(Boolean).map((t, i, arr) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <input
                                type="time"
                                value={t.trim()}
                                onChange={(e) => {
                                  const next = [...arr];
                                  next[i] = e.target.value;
                                  setTime(next.join(","));
                                }}
                                className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                              />
                              {arr.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = arr.filter((_, j) => j !== i);
                                    setTime(next.join(","));
                                  }}
                                  className="flex size-9 items-center justify-center rounded-lg border border-input text-muted-foreground hover:bg-muted hover:text-foreground"
                                  aria-label="Remove time"
                                >
                                  <XIcon className="size-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setTime(time ? `${time},09:00` : "09:00")}
                            className="flex size-9 items-center justify-center rounded-lg border border-input text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Add time"
                          >
                            <PlusIcon className="size-4" />
                          </button>
                        </div>
                      </ScheduleField>

                      <ScheduleField label="Timezone" typeHint="select_string" required>
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger className={fieldClassName}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                            <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                          </SelectContent>
                        </Select>
                      </ScheduleField>
                    </div>
                  </div>
                )}

                {selectedNodeId === "route-plan" && (
                  <div className="space-y-5">
                    <p className="text-sm font-semibold text-muted-foreground">General</p>
                    <NodeHeader
                      name="Pull Today's Route Plan"
                      description="Fetches today's planned routes from the SharePoint list for the selected hub."
                    />
                    <StaticField label="Provider" icon={integrationIcons.sharepoint} value="Microsoft SharePoint" />
                    <StaticField label="Action" icon={integrationIcons.sharepoint} value="Get List Items" />
                    <ScheduleField label="Connection" required>
                      <Select value={sharepointAccount} onValueChange={setSharepointAccount}>
                        <SelectTrigger className={fieldClassName}>
                          <SelectValue placeholder="Select a SharePoint connection" />
                        </SelectTrigger>
                        <SelectContent>
                          {(integrationMeta.sharepoint?.connections ?? [{ id: "sp-1", name: "dispatchhub.sharepoint.com" }]).map((conn) => (
                            <SelectItem key={conn.id} value={conn.id}>
                              {conn.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="underline decoration-dotted underline-offset-2">Your credentials are encrypted and can be removed at any time</span>. You can manage all your connections <span className="underline decoration-dotted underline-offset-2">here</span>.
                      </p>
                    </ScheduleField>

                    <div className="mt-6 space-y-5 border-t border-border/70 pt-6">
                      <p className="text-sm font-semibold text-muted-foreground">Configuration</p>

                      <ScheduleField label="Site" typeHint="string" required>
                        <input
                          type="text"
                          value={sharepointSite}
                          onChange={(e) => setSharepointSite(e.target.value)}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                        />
                      </ScheduleField>

                      <ScheduleField label="List" typeHint="string" required>
                        <input
                          type="text"
                          value={sharepointList}
                          onChange={(e) => setSharepointList(e.target.value)}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                        />
                      </ScheduleField>

                      <ScheduleField label="Filter (OData)" typeHint="string">
                        <textarea
                          value={sharepointFilter}
                          onChange={(e) => setSharepointFilter(e.target.value)}
                          rows={2}
                          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-[12px] text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                        />
                      </ScheduleField>

                      <ScheduleField label="Hub" typeHint="select_string" required>
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
                      </ScheduleField>
                    </div>
                  </div>
                )}

                {selectedNodeId === "nws" && (
                  <div className="space-y-5">
                    <p className="text-sm font-semibold text-muted-foreground">General</p>
                    <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 text-[12.5px] text-muted-foreground">
                      <LockIcon className="mt-0.5 size-3.5 shrink-0" />
                      <span>Managed by the automation. This step runs automatically and cannot be edited.</span>
                    </div>
                    <NodeHeader
                      name="Fetch NWS Forecast"
                      description="Calls the National Weather Service API to retrieve the hourly forecast for each route origin."
                    />
                    <StaticField
                      label="Provider"
                      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/><path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/></svg>}
                      value="Custom API"
                    />
                    <StaticField
                      label="Action"
                      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
                      value="HTTP Request"
                    />

                    <div className="mt-6 space-y-5 border-t border-border/70 pt-6">
                      <p className="text-sm font-semibold text-muted-foreground">Configuration</p>
                      <StaticField
                        label="Method"
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M17 3 21 3 21 7"/><path d="m21 3-8 8"/><path d="M7 21H3v-4"/><path d="m3 21 8-8"/></svg>}
                        value="GET"
                      />
                      <StaticField
                        label="URL"
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
                        value="https://api.weather.gov/points/{lat},{lon}/forecast/hourly"
                      />
                      <StaticField
                        label="Headers"
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>}
                        value="User-Agent: FedEx-DispatchBrief/1.0"
                      />
                    </div>
                  </div>
                )}

                {selectedNodeId === "score" && (
                  <LlmAgentBody
                    name="Score Route Risk"
                    description="Uses Claude to score delay risk 0–100 for each route based on the NWS forecast, SLA commit, and driver-hours."
                    provider="Anthropic"
                    action="Anthropic Agent"
                    aiProvider="Anthropic"
                    aiProviderIcon={<AnthropicMark />}
                    model="Claude 4.6 Sonnet"
                    instructions={`You are a dispatch risk analyst for a FedEx hub.
For each route, score delay risk 0-100 from NWS hourly forecast, SLA commit, and driver-hours.
Return JSON only. Fields: route_id, service, risk_score, risk_band, primary_driver, sla_exposure_minutes, recommended_action.
Recommended actions: HOLD_FOR_UPDATE | RESEQUENCE | PRE_STAGE_RELAY | NOTIFY_CUSTOMER | PROCEED.`}
                  />
                )}

                {selectedNodeId === "draft" && (
                  <LlmAgentBody
                    name="Draft Dispatch Brief"
                    description="Uses Claude to draft the morning risk brief email for the hub dispatcher from the scored route data."
                    provider="Anthropic"
                    action="Anthropic Agent"
                    aiProvider="Anthropic"
                    aiProviderIcon={<AnthropicMark />}
                    model="Claude 4.6 Opus"
                    instructions={`Draft the morning risk brief for the hub dispatcher.
Input: JSON output of the risk scorer.
Compose Outlook email with:
- Subject: 'Morning Route Risk Brief — {hub_code} — {date}'
- Summary line with count of HIGH+SEVERE routes and primary weather driver.
- Ranked table of top 10 at-risk routes.
- 'Watch items' paragraph flagging active NWS advisories.
Tone: neutral, operational. No emoji.`}
                  />
                )}

                {selectedNodeId === "delivery" && (
                  <div className="space-y-5">
                    <p className="text-sm font-semibold text-muted-foreground">General</p>
                    <NodeHeader
                      name="Send Brief via Outlook"
                      description="Sends the drafted risk brief to the dispatch lead's inbox using the connected Outlook account."
                    />
                    <StaticField label="Provider" icon={integrationIcons.outlook} value="Microsoft Outlook" />
                    <StaticField label="Action" icon={integrationIcons.outlook} value="Send Email" />
                    <ScheduleField label="Connection" required>
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
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="underline decoration-dotted underline-offset-2">Your credentials are encrypted and can be removed at any time</span>. You can manage all your connections <span className="underline decoration-dotted underline-offset-2">here</span>.
                      </p>
                    </ScheduleField>

                    <div className="mt-6 space-y-5 border-t border-border/70 pt-6">
                      <p className="text-sm font-semibold text-muted-foreground">Configuration</p>

                      <ScheduleField label="To" typeHint="string" required>
                        <input
                          type="email"
                          value={outlookRecipient}
                          onChange={(e) => setOutlookRecipient(e.target.value)}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                        />
                      </ScheduleField>

                      <ScheduleField label="Subject" typeHint="string" required>
                        <input
                          type="text"
                          value={outlookSubject}
                          onChange={(e) => setOutlookSubject(e.target.value)}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                        />
                      </ScheduleField>

                      <ScheduleField label="Body" typeHint="string" required>
                        <textarea
                          value={outlookBody}
                          onChange={(e) => setOutlookBody(e.target.value)}
                          rows={3}
                          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-[12px] text-foreground shadow-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
                        />
                      </ScheduleField>

                      <ScheduleField label="Body Format" typeHint="select_string" required>
                        <Select value="HTML" onValueChange={() => {}}>
                          <SelectTrigger className={fieldClassName}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HTML">HTML</SelectItem>
                            <SelectItem value="Text">Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </ScheduleField>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : isFedexEmailLog ? (
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
                        <AppIcon>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.8.66c0 1.87-.44 3.75-1.63 5.83a13.4 13.4 0 0 1-3.37 4.15" />
                          </svg>
                        </AppIcon>
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
                  <p className="text-sm font-semibold text-muted-foreground">General</p>
                  <NodeHeader
                    name="New Exception Email"
                    description="Triggers a workflow execution every time an email is received in the selected inbox."
                  />
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
                  <p className="text-sm font-semibold text-muted-foreground">General</p>
                  <NodeHeader
                    name="Set Email Category"
                    description="Applies a category tag to the incoming Outlook message so it can be filtered downstream."
                  />
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
                    <span className="text-sm font-semibold text-muted-foreground">Configuration</span>
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
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground">General</p>
                  <NodeHeader
                    name="Is Exception?"
                    description="Branches the workflow based on whether the extracted fields indicate a genuine exception."
                  />
                  <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 text-[12.5px] text-muted-foreground">
                    <LockIcon className="mt-0.5 size-3.5 shrink-0" />
                    <span>Managed by the automation. This step runs automatically and cannot be edited.</span>
                  </div>
                  <StaticField label="Type" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22V11"/><path d="M21 3l-6.5 6.5a4 4 0 0 0-1.172 2.829"/><path d="M3 3l6.5 6.5a4 4 0 0 1 1.172 2.829"/></svg>} value="If-else router" />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground">Branches</p>
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
                <LlmAgentBody
                  name="Extract Exception Fields"
                  description="Uses Claude to extract structured exception fields from the incoming email body."
                  provider="Anthropic"
                  action="Anthropic Agent"
                  aiProvider="Anthropic"
                  aiProviderIcon={<AnthropicMark />}
                  model="Claude 4.6 Opus"
                  instructions={`You extract structured fields from FedEx exception emails.
Return JSON only: tracking_number, service_type, origin, destination, exception_code, exception_reason, event_timestamp (ISO 8601), shipper_account.
Rules:
- If a field is not present, use null. Do not guess.
- Normalize timestamps to UTC.
- exception_code ∈ { DELAY, DAMAGE, MISROUTE, HELD_CUSTOMS, DELIVERY_ATTEMPT_FAILED, OTHER }.
- If the email is not an exception, return isException=false.`}
                />
              )}

              {/* Destination: Excel */}
              {selectedNodeId === "append" && (
              <div className="space-y-5">
                {/* General */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground">General</p>
                  <NodeHeader
                    name="Append to Excel"
                    description="Appends the extracted exception as a new row in the shared Excel log on SharePoint."
                  />
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
                    <span className="text-sm font-semibold text-muted-foreground">Configuration</span>
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
                  <AppIcon>{integrationMeta.teams?.icon}</AppIcon>
                  <span className="text-sm font-medium text-foreground">Microsoft Teams</span>
                </div>
                <span className="text-xs text-muted-foreground">Direct message to Jordan Lee</span>
              </div>
            </div>
            <div className="rounded-lg border border-border/80 bg-background p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AppIcon>{integrationMeta.outlook?.icon}</AppIcon>
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
                    <AppIcon>{integrationMeta["shipment-visibility"]?.icon}</AppIcon>
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
            {!hasSidebarLayout && !testOpen && (
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
              ) : isSetup ? "Activate" : "Update"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
