"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { integrationMeta } from "@/lib/integrations";

const fieldClassName =
  "h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm shadow-none transition-[color,box-shadow] hover:bg-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15";

type ConnectionSetupModalProps = {
  open: boolean;
  integrationId: string | null;
  isConnected?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (integrationId: string) => void;
};

export function ConnectionSetupModal({
  open,
  integrationId,
  isConnected = false,
  onOpenChange,
  onSave,
}: ConnectionSetupModalProps) {
  const meta = useMemo(
    () => (integrationId ? integrationMeta[integrationId] : undefined),
    [integrationId]
  );
  const [connectionId, setConnectionId] = useState("");
  const [detailId, setDetailId] = useState("");

  useEffect(() => {
    if (!open || !meta) return;
    setConnectionId(meta.connections[0]?.id ?? "");
    setDetailId(meta.detail?.options[0]?.id ?? "");
  }, [open, meta]);

  if (!meta || !integrationId) return null;

  const handleSave = () => {
    onSave(integrationId);
    onOpenChange(false);
  };

  const dialogTitle = isConnected ? "Edit Connection" : `Connect ${meta.label}`;
  const dialogDescription = isConnected
    ? `Choose which ${meta.label} account this chat should use, then save the connection.`
    : `Choose which ${meta.label} account this chat should use, then connect it to this chat.`;
  const saveLabel = isConnected ? "Save connection" : "Connect";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] overflow-hidden rounded-[28px] border border-border/80 p-0 shadow-[0_20px_70px_rgba(15,23,42,0.14)]">
        <DialogHeader className="space-y-4 border-b border-border/80 px-8 pb-6 pt-8 text-left">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/40">
              {meta.icon}
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-[1.75rem] font-semibold tracking-[-0.03em] text-foreground">
                {dialogTitle}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-muted-foreground">
                {dialogDescription}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-8 py-6">
          <div className="rounded-[22px] border border-border/80 bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center">{meta.icon}</span>
                <span className="text-sm font-semibold text-foreground">{meta.label}</span>
              </div>
              {isConnected ? (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                  <CheckCircle2 className="size-4" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="size-2 rounded-full bg-amber-500" />
                  Not connected
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Account</label>
                <Select value={connectionId} onValueChange={setConnectionId}>
                  <SelectTrigger className={fieldClassName}>
                    <SelectValue placeholder={`Select a ${meta.label} account`} />
                  </SelectTrigger>
                  <SelectContent>
                    {meta.connections.map((conn) => (
                      <SelectItem key={conn.id} value={conn.id}>
                        {conn.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {meta.detail && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{meta.detail.label}</label>
                  <Select value={detailId} onValueChange={setDetailId}>
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
                </div>
              )}

              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-xl px-1 py-1 text-sm text-muted-foreground/70"
              >
                <PlusIcon className="size-4" />
                Connect new account
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/80 px-8 py-5 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!connectionId || (meta.detail && !detailId)}>
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
