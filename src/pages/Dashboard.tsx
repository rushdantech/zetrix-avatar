import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import {
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  KeyRound,
  UserPlus,
  Gift,
  CreditCard,
  Users,
  MessageSquare,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const app = useApp();

  const statusCards = [
    { label: "Avatar", value: "Ready", icon: CheckCircle2, color: "text-success" },
  ];

  const quickActions = [
    { label: "Edit Avatar", icon: User, path: "/persona" },
    { label: "My Avatars", icon: Users, path: "/studio/avatars" },
    { label: "Marketplace", icon: MessageSquare, path: "/marketplace" },
  ];

  const subStats = useMemo(() => {
    const subs = app.marketplaceSubscriptions;
    const free = subs.filter((s) => s.pricingTier === "free").length;
    const paid = subs.filter((s) => s.pricingTier === "paid").length;
    const monthlyMyr = subs.reduce(
      (sum, s) => sum + (s.pricingTier === "paid" ? (s.priceMonthlyMyr ?? 0) : 0),
      0,
    );
    return { total: subs.length, free, paid, monthlyMyr };
  }, [app.marketplaceSubscriptions]);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {app.user.name.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your avatar.</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-3 sm:max-w-xs">
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Avatar / Agent Subscription</h2>
          <button
            type="button"
            onClick={() => navigate("/marketplace")}
            className="text-xs font-medium text-primary hover:underline"
          >
            Marketplace →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">{subStats.total}</p>
            <p className="text-[11px] text-muted-foreground">Marketplace avatars &amp; agents</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Free tier</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">{subStats.free}</p>
            <p className="text-[11px] text-muted-foreground">No monthly charge</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Paid tier</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">{subStats.paid}</p>
            <p className="text-[11px] text-muted-foreground">Billable listings</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Monthly</span>
            </div>
            <p className="mt-2 text-lg font-semibold tabular-nums">RM {subStats.monthlyMyr}</p>
            <p className="text-[11px] text-muted-foreground">Combined paid seats</p>
          </div>
        </div>
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
    </div>
  );
}
