import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Pencil, Play, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import type { RagDocumentItem, StudioEntityIndividual, StudioEntityStatus } from "@/types/studio";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScopeBadge } from "@/components/identity/ScopeBadge";
import { avatarPublicHandle } from "@/lib/studio/avatar-handle";

export function nameInitial(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  return t[0].toUpperCase();
}

export function statusPresentation(status: StudioEntityStatus): {
  label: string;
  helper: string;
  chipClass: string;
} {
  switch (status) {
    case "published":
      return {
        label: "Published",
        helper: "This avatar is published and can appear on the marketplace for subscribers.",
        chipClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
      };
    case "active":
      return {
        label: "Active",
        helper: "This avatar is active. You can publish it when you are ready for the marketplace.",
        chipClass: "border-sky-200 bg-sky-50 text-sky-900",
      };
    case "draft":
      return {
        label: "Draft",
        helper: "This avatar is still a draft. Complete setup and publish when you are ready.",
        chipClass: "border-amber-200 bg-amber-50 text-amber-900",
      };
    case "archived":
      return {
        label: "Archived",
        helper: "This avatar is archived and hidden from new marketplace activity.",
        chipClass: "border-slate-200 bg-slate-100 text-slate-700",
      };
    default:
      return {
        label: status,
        helper: "",
        chipClass: "border-slate-200 bg-slate-50 text-slate-800",
      };
  }
}

export function AvatarManagementStatusToolbar({ entity }: { entity: StudioEntityIndividual }) {
  const status = statusPresentation(entity.status);
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium",
            status.chipClass,
          )}
        >
          {status.label}
        </span>
        <span className="text-sm text-slate-500">{status.helper}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          onClick={() => toast.info("Make private (demo)")}
        >
          Make private
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          onClick={() => toast.info("Edit (demo)")}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="font-medium"
          onClick={() => toast.error("Delete Avatar (demo)")}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Delete Avatar
        </Button>
      </div>
    </div>
  );
}

export function AvatarProfileSection({ entity }: { entity: StudioEntityIndividual }) {
  const setup = entity.individualSetup;
  const publicHandle = avatarPublicHandle(entity);

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-start gap-4">
          {entity.image ? (
            <img src={entity.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-lg font-bold text-white">
              {nameInitial(entity.name)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900">{entity.name}</h3>
          </div>
        </div>

        <div className="space-y-5 text-sm">
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-400">Handle</p>
            <p className="leading-relaxed text-slate-700">/{publicHandle}</p>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-400">Description</p>
            <p className="leading-relaxed text-slate-700">{entity.description.trim() || "—"}</p>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-400">Personality</p>
            <p className="leading-relaxed text-slate-700">{setup.bio.trim() || "—"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Archetype</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-xl font-bold text-white">
            {setup.avatarArchetype?.trim() ? nameInitial(setup.avatarArchetype) : "?"}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{setup.avatarArchetype?.trim() || "Not set"}</p>
            <p className="text-xs text-slate-400">From Avatar Setup (preset)</p>
          </div>
        </div>
      </section>
    </>
  );
}

export function AvatarIdentityModelSection({ entity }: { entity: StudioEntityIndividual }) {
  const createdLabel = useMemo(() => {
    try {
      return format(parseISO(entity.created_at), "dd/MM/yyyy, HH:mm:ss");
    } catch {
      return entity.created_at;
    }
  }, [entity.created_at]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Identity model</h3>
      <p className="text-sm leading-relaxed text-slate-600">
        Your questionnaire answers and tone settings shape how this avatar represents you in chat. Refine them over time for
        better accuracy.
      </p>
      <p className="mt-3 text-xs text-slate-500">
        <span className="text-slate-400">Avatar created:</span> {createdLabel}
      </p>
      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="text-sm font-semibold text-slate-900">Iterative questionnaire</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          For better accuracy and understanding, please complete the iterative questionnaire as often as possible.
        </p>
        <Button
          type="button"
          className="mt-4 w-full bg-slate-900 text-white hover:bg-slate-800 sm:w-auto"
          onClick={() => toast.info("Open Iterative Questionnaire (demo)")}
        >
          Open Iterative Questionnaire
        </Button>
      </div>
    </section>
  );
}

export function AvatarVoiceSection({ entity }: { entity: StudioEntityIndividual }) {
  const setup = entity.individualSetup;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Voice sample</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-slate-500 hover:text-destructive"
          onClick={() => toast.info("Delete voice sample (demo)")}
          disabled={!setup.voiceCloningEnabled}
        >
          Delete
        </Button>
      </div>
      <p className="text-sm text-slate-600">
        {setup.voiceCloningEnabled
          ? "Voice cloning is enabled for this avatar. Upload and manage samples from Avatar Studio when editing."
          : "Voice cloning is off for this avatar. Turn it on in Create / Edit Avatar to capture a voice sample."}
      </p>
      {setup.voiceCloningEnabled ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white"
            aria-label="Play"
            onClick={() => toast.info("Playback (demo)")}
          >
            <Play className="h-4 w-4" />
          </button>
          <div className="h-1.5 flex-1 rounded-full bg-slate-200">
            <div className="h-full w-0 rounded-full bg-slate-400" />
          </div>
          <span className="text-xs tabular-nums text-slate-400">—</span>
        </div>
      ) : null}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium text-slate-400">Voice transcription</p>
        <p className="text-sm leading-relaxed text-slate-600">
          No transcription on file. After you add a processed sample, a transcript can appear here.
        </p>
      </div>
    </section>
  );
}

const DAILY_UPDATE_KB_NAME_PREFIX = "Daily update —";

export function AvatarDailyUpdatesSection({ entity }: { entity: StudioEntityIndividual }) {
  const { addUserStudioEntity } = useApp();
  const [draft, setDraft] = useState("");

  const recentDailyKb = useMemo(() => {
    return entity.individualSetup.ragDocuments.filter(
      (d) => d.name.startsWith(DAILY_UPDATE_KB_NAME_PREFIX) && d.textContent?.trim(),
    );
  }, [entity.individualSetup.ragDocuments]);

  const save = () => {
    const text = draft.trim();
    if (!text) {
      toast.message("Add a note first", { description: "Write something to save it to the knowledge base." });
      return;
    }
    const addedAt = new Date().toISOString();
    const entry: RagDocumentItem = {
      id: `daily_kb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      name: `${DAILY_UPDATE_KB_NAME_PREFIX} ${format(parseISO(addedAt), "MMM d, yyyy, h:mm a")}`,
      size: new Blob([text]).size,
      addedAt,
      textContent: text,
    };
    addUserStudioEntity({
      ...entity,
      individualSetup: {
        ...entity.individualSetup,
        ragDocuments: [entry, ...entity.individualSetup.ragDocuments],
      },
    });
    setDraft("");
    toast.success("Saved to knowledge base");
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">Daily Updates</h3>
      <p className="text-sm leading-relaxed text-slate-500">
        Capture thoughts, context, or reminders. Each save is appended to this avatar&apos;s knowledge base for chat and RAG.
      </p>
      <div className="mt-4 space-y-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What are you thinking about today?"
          className="min-h-[140px] resize-y border-slate-200 bg-white text-sm"
          rows={5}
        />
        <Button type="button" size="sm" className="bg-slate-900 text-white hover:bg-slate-800" onClick={save}>
          Save to knowledge base
        </Button>
      </div>
      {recentDailyKb.length ? (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium text-slate-400">Recent updates</p>
          <ul className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm text-slate-700">
            {recentDailyKb.slice(0, 8).map((d) => (
              <li key={d.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <p className="text-xs font-medium text-slate-500">{d.name}</p>
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-slate-700">{d.textContent}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export function AvatarPKMSection({ entity }: { entity: StudioEntityIndividual }) {
  const setup = entity.individualSetup;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">Personal Knowledge Model</h3>
      <p className="text-sm leading-relaxed text-slate-500">
        Upload documents your avatar can use during chat. Turn on Edit to add files; they are sent to the server when you press
        Save.
      </p>
      <p className="mb-3 mt-4 text-xs font-medium text-slate-400">Upload history</p>
      {setup.ragDocuments.length ? (
        <ul className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm text-slate-700">
          {setup.ragDocuments.map((d) => (
            <li key={d.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
              <div className="flex justify-between gap-2">
                <span className="min-w-0 truncate font-medium">{d.name}</span>
                <span className="shrink-0 text-xs text-slate-500">{(d.size / 1024).toFixed(0)} KB</span>
              </div>
              {d.textContent ? (
                <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-slate-500">{d.textContent}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No files yet. Add documents here to attach them to this avatar.
        </div>
      )}
    </section>
  );
}

export function AvatarIdentityVerificationSection({ entity }: { entity: StudioEntityIndividual }) {
  const setup = entity.individualSetup;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">Identity verification</h3>
      {setup.mydigitalEkycVerified ? (
        <p className="text-sm leading-relaxed text-slate-600">
          MyDigital ID eKYC is marked complete for this avatar (demo). Government ID checks are simulated in this build.
        </p>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-slate-500">
            To complete your identity verification, please upload clear images of the front and back of your government-issued
            ID. Ensure all details are visible. Verification is processed by a secure partner.
          </p>
          <p className="mt-3 text-xs text-slate-400">JPG, PNG, or PDF. Images must be at least 500×500px.</p>
          <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No identification files uploaded yet. Turn on Edit mode to upload your ID.
          </div>
        </>
      )}
    </section>
  );
}

export function AvatarZIDCredentialsSection({ entity }: { entity: StudioEntityIndividual }) {
  const setup = entity.individualSetup;
  const scopes = entity.zid_scopes ?? [];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">Verifiable credentials (ZID)</h3>
      <p className="text-sm font-medium text-slate-800">
        {entity.zid_credentialed ? "ZID credentials bound" : "No ZID credentials bound yet"}
      </p>
      {setup.zetrixDid ? (
        <p className="mt-2 break-all font-mono text-xs text-slate-600">{setup.zetrixDid}</p>
      ) : entity.zid_credentialed ? (
        <p className="mt-2 text-sm text-slate-500">DID details will appear here after issuance.</p>
      ) : null}
      {scopes.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-400">Scopes</p>
          <div className="flex flex-wrap gap-1">
            {scopes.map((s) => (
              <ScopeBadge key={s} scope={s} />
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-5">
        <Button variant="outline" size="sm" className="border-slate-200" asChild>
          <Link to={`/identity/agents/${entity.id}`}>Manage in Digital Identity</Link>
        </Button>
      </div>
    </section>
  );
}
