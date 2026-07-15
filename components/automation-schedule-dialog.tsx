"use client";

import { useEffect, useState } from "react";
import { ClockIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Frequency = "daily" | "weekly" | "monthly";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface ParsedSchedule {
  frequency: Frequency;
  day: string;
  time24: string;
}

/** Parse a human schedule string like "Every Monday at 9:00 AM" into parts. */
function parseSchedule(schedule: string): ParsedSchedule {
  const timeMatch = schedule.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let time24 = "09:00";
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const meridiem = timeMatch[3].toUpperCase();
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    time24 = `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  let frequency: Frequency = "weekly";
  let day = "Monday";
  if (/^daily/i.test(schedule)) {
    frequency = "daily";
  } else if (/^monthly/i.test(schedule)) {
    frequency = "monthly";
  } else {
    const dayMatch = schedule.match(/every\s+(\w+day)/i);
    if (dayMatch) {
      const matched = WEEKDAYS.find(
        (d) => d.toLowerCase() === dayMatch[1].toLowerCase()
      );
      if (matched) day = matched;
    }
  }

  return { frequency, day, time24 };
}

/** Turn a 24h "HH:MM" string into a 12h "h:MM AM/PM" label. */
function formatTime(time24: string): string {
  const [h, m] = time24.split(":");
  let hours = parseInt(h, 10);
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${m} ${meridiem}`;
}

/** Recompose a human schedule string from the edited parts. */
function formatSchedule({ frequency, day, time24 }: ParsedSchedule): string {
  const time = formatTime(time24);
  if (frequency === "daily") return `Daily at ${time}`;
  if (frequency === "monthly") return `Monthly on the 1st at ${time}`;
  return `Every ${day} at ${time}`;
}

interface AutomationScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automationName: string;
  schedule: string;
  onSave: (schedule: string) => void;
}

export function AutomationScheduleDialog({
  open,
  onOpenChange,
  automationName,
  schedule,
  onSave,
}: AutomationScheduleDialogProps) {
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [day, setDay] = useState("Monday");
  const [time24, setTime24] = useState("09:00");

  // Re-seed the form from the current schedule each time the dialog opens.
  useEffect(() => {
    if (open) {
      const parsed = parseSchedule(schedule);
      setFrequency(parsed.frequency);
      setDay(parsed.day);
      setTime24(parsed.time24);
    }
  }, [open, schedule]);

  const preview = formatSchedule({ frequency, day, time24 });

  const handleSave = () => {
    onSave(preview);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] rounded-xl border border-border/80 p-0 shadow-[0_16px_48px_rgba(15,23,42,0.14)]">
        <DialogHeader className="space-y-3 border-b border-border/80 px-7 pb-6 pt-7">
          <DialogTitle className="text-2xl font-semibold">
            Edit schedule
          </DialogTitle>
          <DialogDescription className="max-w-xl text-sm leading-6">
            Choose when “{automationName}” runs.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 px-7 py-6">
          {/* Frequency */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">Frequency</label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency(v as Frequency)}
            >
              <SelectTrigger className="h-10 w-full rounded-lg px-3 text-sm shadow-none hover:bg-background focus-visible:ring-ring/15">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Day of week — only relevant for weekly */}
          {frequency === "weekly" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Day of week</label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="h-10 w-full rounded-lg px-3 text-sm shadow-none hover:bg-background focus-visible:ring-ring/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Time */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">Time</label>
            <input
              type="time"
              value={time24}
              onChange={(e) => setTime24(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-none outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15"
            />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-background px-4 py-3 text-sm text-muted-foreground">
            <ClockIcon className="size-4 shrink-0" />
            <span>{preview}</span>
          </div>
        </div>

        <DialogFooter className="border-t border-border/80 bg-muted/30 px-7 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 min-w-[78px] rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Save schedule
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
