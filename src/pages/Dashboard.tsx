import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import {
  CheckCircle2, Instagram, Clock, Layers, Sparkles, CalendarDays,
  User, ArrowRight, Image as ImageIcon, Video, ShieldCheck, KeyRound,
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const navigate = useNavigate();
  const app = useApp();

  useEffect(() => {
    if (!app.onboardingComplete) navigate("/onboarding");
  }, [app.onboardingComplete, navigate]);

  const nextPost = app.calendarEntries.find(e => e.status === "scheduled");
  const queueCount = app.queue.length;
  const lastGenerated = app.assets[0];

  const statusCards = [
    { label: "Avatar", value: "Ready", icon: CheckCircle2, color: "text-success" },
    { label: "Instagram", value: app.instagram.connected ? app.instagram.username : "Not connected", icon: Instagram, color: app.instagram.connected ? "text-primary" : "text-muted-foreground" },
    { label: "Next Post", value: nextPost ? format(parseISO(nextPost.date), "MMM d, h:mm a") : "None scheduled", icon: Clock, color: "text-warning" },
    { label: "Queue", value: `${queueCount} items`, icon: Layers, color: "text-info" },
    { label: "Last Generated", value: lastGenerated ? format(parseISO(lastGenerated.createdAt), "MMM d") : "None", icon: Sparkles, color: "text-accent" },
  ];

  const quickActions = [
    { label: "Generate Content", icon: Sparkles, path: "/studio" },
    { label: "Edit Avatar", icon: User, path: "/persona" },
    { label: "View Calendar", icon: CalendarDays, path: "/calendar" },
    { label: "Connect IG", icon: Instagram, path: "/settings" },
  ];

  const upcoming = app.calendarEntries
    .filter(e => ["scheduled", "generated", "planned"].includes(e.status))
    .slice(0, 7);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {app.user.name.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your avatar.</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statusCards.map(card => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <p className="mt-2 text-sm font-semibold truncate">{card.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Digital Identity</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button onClick={() => navigate("/identity/me")} className="rounded-xl border border-border bg-card p-4 text-left">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /><span className="text-xs text-muted-foreground">Identity</span></div>
            <p className="mt-2 text-sm font-semibold">Verified</p>
          </button>
          <button onClick={() => navigate("/identity/agents")} className="rounded-xl border border-border bg-card p-4 text-left">
            <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Credentialed Agents</span></div>
            <p className="mt-2 text-sm font-semibold">3 active</p>
          </button>
          <button onClick={() => navigate("/identity/delegations")} className="rounded-xl border border-border bg-card p-4 text-left">
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-warning" /><span className="text-xs text-muted-foreground">Pending Delegations</span></div>
            <p className="mt-2 text-sm font-semibold">3 pending</p>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map(action => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-glow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Posts */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Posts</h2>
          <button onClick={() => navigate("/calendar")} className="flex items-center gap-1 text-xs text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-2">
          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <CalendarDays className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No upcoming posts. Generate a content plan to get started!</p>
              <button onClick={() => { app.generateContentPlan(); app.addNotification("Content plan generated!", "success"); }} className="mt-3 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Generate Content Plan
              </button>
            </div>
          ) : (
            upcoming.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  {entry.type === "video" ? <Video className="h-4 w-4 text-muted-foreground" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.theme}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(entry.date), "MMM d, h:mm a")}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  entry.status === "scheduled" ? "bg-success/10 text-success" :
                  entry.status === "generated" ? "bg-primary/10 text-primary" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {entry.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
