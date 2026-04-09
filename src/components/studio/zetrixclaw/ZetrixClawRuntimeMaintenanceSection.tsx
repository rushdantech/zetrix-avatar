import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bot,
  HelpCircle,
  Info,
  RefreshCw,
  RotateCcw,
  Settings,
  Tag,
  Terminal,
  Trash2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import {
  ZETRIXCLAW_DEFAULT_AGENT_NAME,
  ZETRIXCLAW_DEFAULT_DESCRIPTION,
  ZETRIXCLAW_USER_AGENT_ID,
  getDefaultRestoredZetrixClawAgent,
  loadZetrixClawAgentInstance,
  saveZetrixClawAgentInstance,
} from "@/lib/studio/zetrixclaw-agent-instance";
import { clearWorkspaceOverrides } from "@/lib/studio/zetrixclaw-workspace-mock";
import { cn } from "@/lib/utils";

export type MaintenanceBanner = {
  message: string;
  variant: "info" | "success" | "warning" | "destructive";
};

type OpRow = { label: string; tone: "default" | "success" | "failure" };

const btnClass =
  "h-auto min-h-[2.75rem] w-full justify-start rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm font-medium shadow-sm hover:bg-muted/60";

export function ZetrixClawRuntimeMaintenanceSection({
  onCloseSidebar,
  onBanner,
}: {
  onCloseSidebar: () => void;
  onBanner: (b: MaintenanceBanner | null) => void;
}) {
  const navigate = useNavigate();
  const { bumpZetrixClawStorage, removeStudioEntity } = useApp();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [opRow, setOpRow] = useState<OpRow | null>(null);

  const openEdit = useCallback(() => {
    const s = loadZetrixClawAgentInstance();
    setEditName(s?.name?.trim() || ZETRIXCLAW_DEFAULT_AGENT_NAME);
    setEditOpen(true);
  }, []);

  useEffect(() => {
    if (!opRow) return;
    const t = window.setTimeout(() => setOpRow(null), 6000);
    return () => window.clearTimeout(t);
  }, [opRow]);

  const saveName = useCallback(() => {
    const s = loadZetrixClawAgentInstance();
    if (!s) return;
    const next = editName.trim();
    if (!next) {
      toast.error("Enter a display name.");
      return;
    }
    saveZetrixClawAgentInstance({ ...s, name: next });
    bumpZetrixClawStorage();
    setEditOpen(false);
    toast.success("Bot name updated.");
    onBanner({ message: `Display name saved as “${next}”.`, variant: "success" });
    window.setTimeout(() => onBanner(null), 4000);
  }, [bumpZetrixClawStorage, editName, onBanner]);

  const runGatewayRestart = useCallback(() => {
    onBanner({ message: "Restarting gateway…", variant: "info" });
    setOpRow({ label: "Restart Gateway: in progress…", tone: "default" });
    window.setTimeout(() => {
      const ok = Math.random() > 0.18;
      onBanner({
        message: ok ? "Gateway restarted successfully." : "Gateway restart failed.",
        variant: ok ? "success" : "destructive",
      });
      setOpRow({
        label: ok ? "Restart Gateway: success" : "Restart Gateway: failed",
        tone: ok ? "success" : "failure",
      });
      window.setTimeout(() => onBanner(null), 5000);
    }, 2000);
  }, [onBanner]);

  const runFixConfig = useCallback(() => {
    onBanner({ message: "Running configuration diagnostics…", variant: "info" });
    setOpRow({ label: "Fix Config: in progress…", tone: "default" });
    window.setTimeout(() => {
      const ok = Math.random() > 0.12;
      onBanner({
        message: ok ? "Configuration repaired successfully." : "Repair could not be completed.",
        variant: ok ? "success" : "destructive",
      });
      setOpRow({
        label: ok ? "Fix Config: success" : "Fix Config: failed",
        tone: ok ? "success" : "failure",
      });
      window.setTimeout(() => onBanner(null), 5000);
    }, 2200);
  }, [onBanner]);

  const confirmRestore = useCallback(() => {
    setRestoreOpen(false);
    onBanner({ message: "Restoring default settings…", variant: "info" });
    window.setTimeout(() => {
      const prev = loadZetrixClawAgentInstance();
      const createdAt = prev?.createdAt ?? new Date().toISOString();
      saveZetrixClawAgentInstance(getDefaultRestoredZetrixClawAgent(createdAt));
      clearWorkspaceOverrides();
      bumpZetrixClawStorage();
      onBanner({
        message: "Defaults restored successfully.",
        variant: "success",
      });
      setOpRow({ label: "Restore Defaults: success", tone: "success" });
      window.setTimeout(() => onBanner(null), 5000);
    }, 1600);
  }, [bumpZetrixClawStorage, onBanner]);

  const confirmDelete = useCallback(() => {
    setDeleteOpen(false);
    removeStudioEntity(ZETRIXCLAW_USER_AGENT_ID);
    onCloseSidebar();
    navigate("/studio/agents", { replace: true });
    toast.success("ZetrixClaw removed from My Agents.");
  }, [navigate, onCloseSidebar, removeStudioEntity]);

  const terminalPath = `/studio/agents/${ZETRIXCLAW_USER_AGENT_ID}/terminal`;
  const guidePath = `/studio/agents/${ZETRIXCLAW_USER_AGENT_ID}/guide`;

  return (
    <section>
      <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Settings &amp; maintenance
      </h2>
      <div className="rounded-lg border border-border bg-muted/20 p-2 space-y-2">
        <Button variant="outline" className={btnClass} onClick={openEdit}>
          <Settings className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          Edit bot name
        </Button>
        <Button variant="outline" className={btnClass} asChild>
          <Link to={`/studio/agents/${ZETRIXCLAW_USER_AGENT_ID}`} onClick={onCloseSidebar}>
            <Bot className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            Open profile
          </Link>
        </Button>
        <Button variant="outline" className={btnClass} asChild>
          <Link to={terminalPath} onClick={onCloseSidebar}>
            <Terminal className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            Open terminal
          </Link>
        </Button>
        <Button variant="outline" className={btnClass} onClick={runGatewayRestart}>
          <RefreshCw className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          Restart gateway
        </Button>
        <Button variant="outline" className={btnClass} onClick={runFixConfig}>
          <Wrench className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          Fix config
        </Button>
        <Button variant="outline" className={btnClass} onClick={() => setRestoreOpen(true)}>
          <RotateCcw className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          Restore defaults
        </Button>
        <Button variant="outline" className={btnClass} onClick={() => setVersionOpen(true)}>
          <Tag className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          View version
        </Button>
        <Button variant="outline" className={btnClass} asChild>
          <Link to={guidePath} onClick={onCloseSidebar}>
            <HelpCircle className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            Help
          </Link>
        </Button>
        <Button
          variant="outline"
          className={cn(
            btnClass,
            "border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive",
          )}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4 shrink-0" />
          Delete agent
        </Button>

        {opRow && (
          <p
            className={cn(
              "rounded-md px-2 py-1.5 text-[11px] leading-snug",
              opRow.tone === "success" && "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
              opRow.tone === "failure" && "bg-destructive/10 text-destructive",
              opRow.tone === "default" && "bg-muted text-muted-foreground",
            )}
          >
            {opRow.label}
          </p>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit bot name</DialogTitle>
            <DialogDescription>
              ZetrixClaw is the agent type. The field below edits this bot&apos;s display name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="zc-edit-name">Display name</Label>
            <Input id="zc-edit-name" value={editName} onChange={e => setEditName(e.target.value)} autoComplete="off" />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveName}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore default settings</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the current agent configuration to its default state. Your custom adjustments may be lost.
              Workspace file edits in this browser will also be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>Restore defaults</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete agent</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the ZetrixClaw instance and remove it from My Agents. This cannot be
              undone in this prototype flow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={versionOpen} onOpenChange={setVersionOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Version</DialogTitle>
            <DialogDescription>ZetrixClaw runtime (browser prototype)</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm">
            <Info className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-mono font-medium">zetrix-claw-runtime 0.1.0</p>
              <p className="text-xs text-muted-foreground">Mock gateway · local workspace</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setVersionOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** Profile tab form for ZetrixClaw on the agent detail page */
export function ZetrixClawProfileFormCard() {
  const { bumpZetrixClawStorage, zetrixClawStorageGeneration } = useApp();
  const [name, setName] = useState(() => loadZetrixClawAgentInstance()?.name?.trim() || ZETRIXCLAW_DEFAULT_AGENT_NAME);
  const [description, setDescription] = useState(
    () => loadZetrixClawAgentInstance()?.description?.trim() || ZETRIXCLAW_DEFAULT_DESCRIPTION,
  );

  useEffect(() => {
    const s = loadZetrixClawAgentInstance();
    if (!s) return;
    setName(s.name?.trim() || ZETRIXCLAW_DEFAULT_AGENT_NAME);
    setDescription(s.description?.trim() || ZETRIXCLAW_DEFAULT_DESCRIPTION);
  }, [zetrixClawStorageGeneration]);

  const save = useCallback(() => {
    const s = loadZetrixClawAgentInstance();
    if (!s) return;
    const n = name.trim() || ZETRIXCLAW_DEFAULT_AGENT_NAME;
    const d = description.trim();
    saveZetrixClawAgentInstance({
      ...s,
      name: n,
      description: d.length === 0 || d === ZETRIXCLAW_DEFAULT_DESCRIPTION ? undefined : d,
    });
    bumpZetrixClawStorage();
    toast.success("Saved.");
  }, [bumpZetrixClawStorage, name, description]);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 text-sm">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        <p className="mt-1 text-xs text-muted-foreground">Update how this agent appears in Studio and runtime chat.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="zc-profile-name">Bot name</Label>
        <Input id="zc-profile-name" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Agent type</Label>
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-medium">ZetrixClaw</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="zc-profile-desc">Description</Label>
        <Textarea
          id="zc-profile-desc"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          className="resize-y min-h-[100px]"
        />
      </div>
      <div className="flex justify-end border-t border-border pt-3">
        <Button type="button" onClick={save}>
          Save name
        </Button>
      </div>
    </div>
  );
}
