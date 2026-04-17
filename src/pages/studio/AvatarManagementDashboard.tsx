import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  Trash2,
  Pencil,
  Play,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { questionnaireQuestions, userDisplayName, userInitials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { StudioEntityIndividual, StudioEntityStatus } from "@/types/studio";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatQuestionnaireAnswer } from "@/components/studio/QuestionnaireFields";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";

function nameInitial(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  return t[0].toUpperCase();
}

function nameInitialsChip(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase() || "?";
}

function statusPresentation(status: StudioEntityStatus): {
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

function toneSummary(setup: StudioEntityIndividual["individualSetup"]): string {
  return `Playful ${setup.tonePlayful}% · Bold ${setup.toneBold}% · Witty ${setup.toneWitty}%`;
}

const QUESTIONNAIRE_PREVIEW_COUNT = 6;

export function AvatarManagementDashboard({ entity }: { entity: StudioEntityIndividual }) {
  const { user } = useApp();
  const merged = useMergedStudioEntities();
  const ownerName = userDisplayName(user).trim() || "Rushdan Anuar";
  const ownerInitials = userInitials(user) || "RA";
  const setup = entity.individualSetup;
  const status = statusPresentation(entity.status);

  const myAvatars = useMemo(
    () => merged.filter((e): e is StudioEntityIndividual => e.type === "individual"),
    [merged],
  );

  const questionnairePreview = useMemo(
    () => questionnaireQuestions.slice(0, QUESTIONNAIRE_PREVIEW_COUNT),
    [],
  );

  const createdLabel = useMemo(() => {
    try {
      return format(parseISO(entity.created_at), "dd/MM/yyyy, HH:mm:ss");
    } catch {
      return entity.created_at;
    }
  }, [entity.created_at]);

  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-7rem)] w-full flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 shadow-inner md:min-h-[calc(100dvh-5.5rem)]",
        "-mx-4 -mt-2 max-w-[100vw] sm:-mx-4 lg:-mx-6",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col bg-slate-100">
          {/* Top bar — user pill */}
          <header className="flex items-center justify-end border-b border-slate-200 bg-white px-4 py-3 md:px-6">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
                {ownerInitials}
              </div>
              <span className="text-sm font-medium text-slate-800">{ownerName}</span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">
              {/* Page header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[26px]">Avatar Management</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                  One avatar for Marketplace Chat. View and edit this avatar&apos;s personality and content style.
                </p>
              </div>

              {/* Status + actions */}
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

              {/* Your Avatars selector */}
              <section className="mb-8">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Your Avatars</h2>
                <div className="flex flex-wrap gap-2">
                  {myAvatars.length === 0 ? (
                    <p className="text-sm text-slate-500">No individual avatars in your studio yet.</p>
                  ) : null}
                  {myAvatars.map((a) => {
                    const active = a.id === entity.id;
                    return (
                      <Link
                        key={a.id}
                        to={`/studio/avatars/${a.id}`}
                        className={cn(
                          "inline-flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm font-semibold shadow-sm transition-colors",
                          active
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-bold",
                            active ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-800",
                          )}
                        >
                          {nameInitialsChip(a.name)}
                        </div>
                        <span className="max-w-[12rem] truncate">{a.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Two-column grid */}
              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                  {/* Avatar details */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-start gap-4">
                      {entity.image ? (
                        <img
                          src={entity.image}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-lg font-bold text-white">
                          {nameInitial(entity.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-900">{entity.name}</h3>
                        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">AI Avatar</p>
                      </div>
                    </div>

                    <div className="space-y-5 text-sm">
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-slate-400">Listing description</p>
                        <p className="leading-relaxed text-slate-700">
                          {entity.description.trim() || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-slate-400">Bio</p>
                        <p className="leading-relaxed text-slate-700">
                          {setup.bio.trim() || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-slate-400">Audience</p>
                        <p className="leading-relaxed text-slate-700">
                          {setup.audience.trim() || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-slate-400">Style tags</p>
                        {setup.styleTags.length ? (
                          <p className="leading-relaxed text-slate-700">{setup.styleTags.join(" · ")}</p>
                        ) : (
                          <p className="text-slate-500">—</p>
                        )}
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-slate-400">Tone mix</p>
                        <p className="leading-relaxed text-slate-700">{toneSummary(setup)}</p>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-slate-400">Questionnaire (excerpt)</p>
                        <div className="space-y-3 text-slate-700">
                          {questionnairePreview.map((q) => (
                            <div key={q.id} className="rounded-md border border-slate-100 bg-slate-50/80 p-3">
                              <p className="text-xs font-medium text-slate-500">
                                {q.id}. {q.question}
                              </p>
                              <p className="mt-1.5 text-sm leading-relaxed">
                                {formatQuestionnaireAnswer(q, setup.questionnaireAnswers[q.id])}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Voice sample */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">Voice</h3>
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

                  {/* Archetype */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900">Archetype</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-xl font-bold text-white">
                        {setup.avatarArchetype?.trim() ? nameInitial(setup.avatarArchetype) : "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {setup.avatarArchetype?.trim() || "Not set"}
                        </p>
                        <p className="text-xs text-slate-400">From Avatar Setup (preset)</p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                  {/* Identity Model */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900">Identity &amp; model</h3>
                    <p className="text-sm font-medium text-slate-800">
                      {entity.zid_credentialed ? "ZID credentials bound" : "No ZID credentials bound yet"}
                    </p>
                    {setup.zetrixDid ? (
                      <p className="mt-2 break-all font-mono text-xs text-slate-600">{setup.zetrixDid}</p>
                    ) : null}
                    <p className="mt-2 text-xs font-medium text-emerald-600">
                      {setup.mydigitalEkycVerified ? "MyDigital ID verification (demo): verified" : "MyDigital ID: not completed"}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">
                      <span className="text-slate-400">Avatar created:</span> {createdLabel}
                    </p>
                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <p className="text-sm font-semibold text-slate-900">Iterative Questionnaire</p>
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

                  {/* PKM */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-2 text-sm font-semibold text-slate-900">Personal Knowledge Model</h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                      Upload documents your avatar can use during chat. Turn on Edit to add files; they are sent to the server when
                      you press Save.
                    </p>
                    <p className="mb-3 mt-4 text-xs font-medium text-slate-400">Upload history</p>
                    {setup.ragDocuments.length ? (
                      <ul className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm text-slate-700">
                        {setup.ragDocuments.map((d) => (
                          <li key={d.id} className="flex justify-between gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <span className="min-w-0 truncate font-medium">{d.name}</span>
                            <span className="shrink-0 text-xs text-slate-500">
                              {(d.size / 1024).toFixed(0)} KB
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                        No files yet. Add documents here to attach them to this avatar.
                      </div>
                    )}
                  </section>

                  {/* Identity verification */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-2 text-sm font-semibold text-slate-900">Identity Verification</h3>
                    {setup.mydigitalEkycVerified ? (
                      <p className="text-sm leading-relaxed text-slate-600">
                        MyDigital ID eKYC is marked complete for this avatar (demo). Government ID checks are simulated in this
                        build.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed text-slate-500">
                          To complete your identity verification, please upload clear images of the front and back of your
                          government-issued ID. Ensure all details are visible. Verification is processed by a secure partner.
                        </p>
                        <p className="mt-3 text-xs text-slate-400">JPG, PNG, or PDF. Images must be at least 500×500px.</p>
                        <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                          No identification files uploaded yet. Turn on Edit mode to upload your ID.
                        </div>
                      </>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
