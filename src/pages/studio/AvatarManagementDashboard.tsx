import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Bot,
  Settings,
  Trash2,
  Pencil,
  Play,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { userDisplayName, userInitials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { StudioEntityIndividual } from "@/types/studio";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MOCK_DESCRIPTION = "Unoffical Batman Avatar";

const MOCK_PERSONALITY = `You are an avatar modeled after Bruce Wayne — a highly intelligent, disciplined, and strategic thinker with a calm, composed demeanor. You speak with confidence, precision, and purpose.`;

const MOCK_TRAITS = `Analytical and observant — you break down problems logically before answering.
Reserved but impactful — you avoid unnecessary words; every sentence has intent.
Calm under pressure — never emotional, always controlled.
Slightly dark and serious tone, but not unfriendly.
Protective and solution-oriented — you aim to guide and help effectively.
Occasionally use subtle metaphors related to strategy, discipline, or resilience.`;

const MOCK_COMMUNICATION = `Keep responses concise, structured, and thoughtful.
Avoid slang, emojis, or overly casual language.
Do not joke excessively; wit should be dry and minimal.
Ask sharp, relevant follow-up questions when needed.
Prioritize clarity and practical solutions.`;

const MOCK_BEHAVIOR = `Always remain respectful and professional.
Never reveal you are "roleplaying" Bruce Wayne — embody the persona naturally.
Focus on helping the user solve problems efficiently.
When appropriate, offer strategic insights, not just direct answers.`;

const MOCK_EXAMPLE = `Instead of: "Sure! Here's what you can do 😊"
Say: "There are three viable approaches. The right one depends on your objective."`;

const MOCK_VOICE_TRANSCRIPTION = `Gotham is drowning in its own lies, criminals hiding in the shadows thinking no one is coming… but I am the shadow, I am the reckoning they never saw coming, and tonight—justice doesn't whisper, it answers to me.`;

function NavRow({
  icon: Icon,
  to,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-90" />
      {label}
    </Link>
  );
}

export function AvatarManagementDashboard({ entity }: { entity: StudioEntityIndividual }) {
  const location = useLocation();
  const { user } = useApp();
  const ownerName = userDisplayName(user).trim() || "Rushdan Anuar";
  const ownerInitials = userInitials(user) || "RA";
  const path = location.pathname;
  const studioActive =
    path.startsWith(`/studio/avatars/${entity.id}`) && !path.endsWith("/analytics");

  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-7rem)] w-full flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 shadow-inner md:min-h-[calc(100dvh-5.5rem)]",
        "-mx-4 -mt-2 max-w-[100vw] sm:-mx-4 lg:-mx-6",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Inner left sidebar */}
        <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white md:w-52 md:border-b-0 md:border-r">
          <div className="border-b border-slate-100 px-4 py-5">
            <p className="text-[15px] font-semibold tracking-tight text-slate-900">Avatar</p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 p-3">
            <NavRow to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={path === "/dashboard"} />
            <NavRow
              to="/marketplace/chat"
              icon={MessageSquare}
              label="Marketplace Chat"
              active={path.startsWith("/marketplace/chat")}
            />
            <NavRow to="/studio/avatars" icon={Users} label="Avatar Studio" active={studioActive} />
            <p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Agent Studio</p>
            <NavRow to="/studio/agents" icon={Bot} label="My Agents" active={path.startsWith("/studio/agents")} />
            <p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Account</p>
            <NavRow to="/settings" icon={Settings} label="Settings" active={path.startsWith("/settings")} />
          </nav>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col bg-slate-100">
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
                  One avatar for Marketplace Chat. View and edit your avatar&apos;s personality and content style.
                </p>
              </div>

              {/* Status + actions */}
              <div className="mb-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                    Approved
                  </span>
                  <span className="text-sm text-slate-500">This avatar is approved and can be made public.</span>
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
                <div className="inline-flex rounded-xl border border-slate-900 bg-white p-1.5 shadow-sm">
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-lg bg-slate-900 px-3 py-2 text-left text-white"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-700 text-sm font-bold">
                      B
                    </div>
                    <span className="text-sm font-semibold">Batman</span>
                  </button>
                </div>
              </section>

              {/* Two-column grid */}
              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                  {/* Avatar details */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-lg font-bold text-white">
                        B
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">Batman</h3>
                        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">AI Avatar</p>
                      </div>
                    </div>

                    <div className="space-y-5 text-sm">
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-slate-400">Description</p>
                        <p className="leading-relaxed text-slate-700">{MOCK_DESCRIPTION}</p>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-slate-400">Personality</p>
                        <p className="leading-relaxed text-slate-700">{MOCK_PERSONALITY}</p>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-slate-400">Your personality traits:</p>
                        <div className="whitespace-pre-line leading-relaxed text-slate-700">{MOCK_TRAITS}</div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-slate-400">Communication style:</p>
                        <div className="whitespace-pre-line leading-relaxed text-slate-700">{MOCK_COMMUNICATION}</div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-slate-400">Behavior rules:</p>
                        <div className="whitespace-pre-line leading-relaxed text-slate-700">{MOCK_BEHAVIOR}</div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-slate-400">Example tone:</p>
                        <div className="whitespace-pre-line leading-relaxed text-slate-700">{MOCK_EXAMPLE}</div>
                      </div>
                    </div>
                  </section>

                  {/* Voice sample */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">Voice Sample</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-slate-500 hover:text-destructive"
                        onClick={() => toast.info("Delete voice sample (demo)")}
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <button
                        type="button"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white"
                        aria-label="Play"
                        onClick={() => toast.info("Playback (demo)")}
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                        <div className="h-full w-1/3 rounded-full bg-slate-400" />
                      </div>
                      <span className="text-xs tabular-nums text-slate-400">0:42</span>
                    </div>
                    <div className="mt-4">
                      <p className="mb-1.5 text-xs font-medium text-slate-400">Voice Transcription:</p>
                      <p className="text-sm leading-relaxed text-slate-600">{MOCK_VOICE_TRANSCRIPTION}</p>
                    </div>
                  </section>

                  {/* Archetype */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900">Archetype</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-xl font-bold text-white">
                        E
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Edgy Rebel</p>
                        <p className="text-xs text-slate-400">Current archetype</p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                  {/* Identity Model */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900">Identity Model</h3>
                    <p className="text-sm font-medium text-slate-800">Generic</p>
                    <p className="mt-2 text-xs font-medium text-emerald-600">success</p>
                    <p className="mt-3 text-xs text-slate-500">
                      <span className="text-slate-400">Requested:</span> 12/04/2026, 21:51:09
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
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      No files yet. Add documents here to attach them to this avatar.
                    </div>
                  </section>

                  {/* Identity verification */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-2 text-sm font-semibold text-slate-900">Identity Verification</h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                      To complete your identity verification, please upload clear images of the front and back of your
                      government-issued ID. Ensure all details are visible. Verification is processed by a secure partner.
                    </p>
                    <p className="mt-3 text-xs text-slate-400">JPG, PNG, or PDF. Images must be at least 500×500px.</p>
                    <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      No identification files uploaded yet. Turn on Edit mode to upload your ID.
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
