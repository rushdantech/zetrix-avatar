import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Palette, Clock, Settings,
  Bell, ChevronLeft, ChevronRight, Menu, X, Sparkles, MessageSquare,
  Users, PlusCircle, Fingerprint, BarChart3, ShieldCheck, KeyRound, FileCheck, ScrollText, Bot,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  hideWhenComplete?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

/** Match sidebar item to current route (supports detail URLs under list roots). */
function navItemActive(itemPath: string, pathname: string): boolean {
  if (itemPath === "/dashboard") return pathname === "/" || pathname === "/dashboard";
  if (itemPath === "/marketplace") return pathname === "/marketplace" || pathname.startsWith("/marketplace/");
  if (itemPath === "/studio/avatars") {
    if (pathname === "/studio/avatars") return true;
    return pathname.startsWith("/studio/avatars/") && !pathname.startsWith("/studio/avatars/create");
  }
  if (itemPath === "/studio/avatars/create") return pathname === "/studio/avatars/create";
  if (itemPath === "/studio/agents") {
    if (pathname === "/studio/agents") return true;
    return pathname.startsWith("/studio/agents/") && !pathname.startsWith("/studio/agents/create");
  }
  if (itemPath === "/studio/agents/create") return pathname === "/studio/agents/create";
  return pathname === itemPath;
}

const navSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    ],
  },
  {
    title: "Avatar Studio",
    items: [
      { label: "Marketplace", icon: MessageSquare, path: "/marketplace" },
      { label: "My Avatars", icon: Users, path: "/studio/avatars" },
      { label: "Create Avatar", icon: PlusCircle, path: "/studio/avatars/create" },
    ],
  },
  {
    title: "Agent Studio",
    items: [
      { label: "My Agents", icon: Bot, path: "/studio/agents" },
      { label: "Create Agent", icon: PlusCircle, path: "/studio/agents/create" },
    ],
  },
  {
    title: "Digital Assets",
    items: [
      { label: "Overview", icon: BarChart3, path: "/identity" },
      { label: "My Identity", icon: ShieldCheck, path: "/identity/me" },
      { label: "Credentials", icon: KeyRound, path: "/identity/agents" },
      { label: "Delegations", icon: FileCheck, path: "/identity/delegations" },
      { label: "Policies & Audit", icon: ScrollText, path: "/identity/policies" },
    ],
  },
  {
    items: [{ label: "Settings", icon: Settings, path: "/settings" }],
  },
];

function getVisibleNavItems(sections: NavSection[], onboardingComplete: boolean): NavItem[] {
  return sections.flatMap(s => s.items).filter(item => !(item.hideWhenComplete && onboardingComplete));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user, onboardingComplete, notifications } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleItems = getVisibleNavItems(navSections, onboardingComplete);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Zetrix <span className="text-gradient">Avatar</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {Math.min(notifications.length, 9)}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">
              {user.avatar}
            </div>
            <span className="hidden text-sm font-medium md:block">{user.name}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden border-r border-border bg-sidebar transition-all duration-300 lg:flex lg:flex-col",
            sidebarCollapsed ? "w-16" : "w-60"
          )}
        >
          <div className="flex flex-1 flex-col gap-1 p-3 pt-4 overflow-y-auto">
            {navSections.map((section, sectionIdx) => {
              const sectionItems = section.items.filter(
                item => !(item.hideWhenComplete && onboardingComplete)
              );
              if (sectionItems.length === 0) return null;
              return (
                <div key={sectionIdx} className={cn("flex flex-col gap-1", sectionIdx > 0 && "mt-4")}>
                  {section.title && !sidebarCollapsed && (
                    <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </p>
                  )}
                  {sectionItems.map(item => {
                    const active = navItemActive(item.path, pathname);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                          active
                            ? "bg-primary/10 text-primary shadow-glow"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center justify-center border-t border-border p-3 text-muted-foreground hover:text-foreground"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </aside>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <nav
              className="absolute left-0 top-0 h-full w-64 animate-slide-in-right border-r border-border bg-card p-4 pt-16 overflow-y-auto"
              onClick={e => e.stopPropagation()}
              style={{ animationName: "none", transform: "translateX(0)" }}
            >
              {navSections.map((section, sectionIdx) => {
                const sectionItems = section.items.filter(
                  item => !(item.hideWhenComplete && onboardingComplete)
                );
                if (sectionItems.length === 0) return null;
                return (
                  <div key={sectionIdx} className={sectionIdx > 0 ? "mt-4" : ""}>
                    {section.title && (
                      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.title}
                      </p>
                    )}
                    <div className="space-y-0.5">
                      {sectionItems.map(item => {
                        const active = navItemActive(item.path, pathname);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="animate-fade-in p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-card py-2 lg:hidden">
        {visibleItems.slice(0, 5).map(item => {
          const active = navItemActive(item.path, pathname);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-all",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
