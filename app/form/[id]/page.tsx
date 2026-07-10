"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeftIcon, Clock, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAgentIcon } from "@/lib/agent-icons";

const MOCK_HISTORY = [
  { id: "h1", label: "Blog post about AI trends", time: "2h ago" },
  { id: "h2", label: "Social media campaign for Q3", time: "Yesterday" },
  { id: "h3", label: "Email newsletter — product launch", time: "3d ago" },
];

export default function FormAgentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = typeof params?.id === "string" ? params.id : "";
  const name = searchParams.get("name") ?? "Application Name";
  const description = searchParams.get("description") ?? "";
  const authorName = searchParams.get("authorName") ?? "";

  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setIsRunning(true);
    setOutput(null);
    setTimeout(() => {
      setIsRunning(false);
      setOutput(
        `Here's your generated content based on: "${input}"\n\nThis is a mock output for the ${name} agent. In production, this would be powered by your configured AI workflow.`
      );
    }, 1200);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {/* Top bar */}
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border/40 bg-background px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border transition-colors group-hover:bg-muted-foreground/15">
            <ChevronLeftIcon className="size-4 shrink-0" />
          </span>
          Back
        </button>
        <div className="mx-2 h-4 w-px bg-border" />
        <span className="mx-1 text-xs text-muted-foreground/40">·</span>
        <span className="text-xs font-medium truncate">{name}</span>
      </header>

      {/* Scrollable content */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 py-10">
        <div className="w-full max-w-[680px] space-y-8">

          {/* App header */}
          <div className="flex flex-col gap-4">
            {/* Icon */}
            <div className="flex size-[72px] items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              {getAgentIcon(id, "size-8 text-foreground/60")}
            </div>

            {/* Name + description */}
            <div>
              <h1 className="text-2xl font-semibold">{name}</h1>
              {description && (
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground max-w-lg">
                  {description}
                </p>
              )}
              {authorName && (
                <p className="mt-1 text-xs text-muted-foreground/60">by {authorName}</p>
              )}
            </div>

            {/* Instructions */}
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground space-y-1">
              <p>To add an input or output, click inside the editor and select one from the side panel.</p>
              <p>
                To{" "}
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <span className="inline-flex size-4 items-center justify-center rounded bg-blue-500 text-[10px] text-white">▶</span>
                  run your workflow
                </span>
                , just press "Submit" on the bottom right corner!
              </p>
            </div>
          </div>

          {/* Inputs */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold">Inputs</h2>
            <p className="text-sm text-muted-foreground">
              You can edit the properties of an input by clicking the{" "}
              <span title="pencil">✏️</span> pencil icon on the top right corner of the block.
            </p>

            <div className="rounded-lg border border-border bg-background p-4 space-y-2">
              <label className="text-sm font-medium text-foreground">Text Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type something..."
                rows={4}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </section>

          {/* Outputs */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold">Outputs</h2>

            <div className="rounded-lg border border-border bg-background p-4 space-y-2">
              <label className="text-sm font-medium text-foreground">Output</label>
              <div
                className={cn(
                  "min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                  !output && !isRunning && "flex items-start gap-2 text-muted-foreground"
                )}
              >
                {isRunning ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="inline-block size-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    Running…
                  </div>
                ) : output ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{output}</p>
                ) : (
                  <>
                    <span className="mt-0.5 shrink-0 text-muted-foreground/50">ⓘ</span>
                    <span>
                      This field with ID out-0 isn't connected to the workflow. Connect it to an input or output, then try again.
                    </span>
                  </>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Bottom bar */}
      <footer className="flex h-14 shrink-0 items-center justify-between border-t border-border bg-background px-6">
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Clock className="size-4" />
          Result History
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!input.trim() || isRunning}
          className={cn(
            "rounded-lg px-5 py-2 text-sm font-medium transition-colors",
            input.trim() && !isRunning
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          {isRunning ? "Running…" : "Submit"}
        </button>
      </footer>

      {/* History panel (simple slide-up) */}
      {showHistory && (
        <div className="absolute bottom-14 left-0 right-0 z-10 border-t border-border bg-background shadow-lg">
          <div className="mx-auto max-w-[680px] px-6 py-4 space-y-2">
            <h3 className="text-sm font-medium">Result History</h3>
            {MOCK_HISTORY.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
