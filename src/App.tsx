import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import AvatarClawAccessGuard from "@/components/AvatarClawAccessGuard";
import ProUpgradeModals from "@/components/ProUpgradeModals";
import Dashboard from "./pages/Dashboard";
import Persona from "./pages/Persona";
import Calendar from "./pages/Calendar";
import Studio from "./pages/Studio";
import Queue from "./pages/Queue";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import Marketplace from "./pages/Marketplace";
import MarketplaceBrowse from "./pages/MarketplaceBrowse";
import NotFound from "./pages/NotFound";
import MyAvatars from "./pages/studio/MyAvatars";
import MyAgents from "./pages/studio/MyAgents";
import CreateAvatar from "./pages/studio/CreateAvatar";
import CreateAgent from "./pages/studio/CreateAgent";
import CreateAvatarClaw from "./pages/studio/CreateAvatarClaw";
import AvatarClawSetupStep2Name from "./pages/studio/AvatarClawSetupStep2Name";
import AvatarClawSetupStep3Personality from "./pages/studio/AvatarClawSetupStep3Personality";
import AvatarClawSetupStep4SkillPacks from "./pages/studio/AvatarClawSetupStep4SkillPacks";
import AvatarClawSetupStep5Review from "./pages/studio/AvatarClawSetupStep5Review";
import AgentActivity from "./pages/studio/AgentActivity";
import AvatarMatch from "./pages/AvatarMatch";
import AvatarDetail from "./pages/studio/AvatarDetail";
import AgentLogs from "./pages/studio/AgentLogs";
import AvatarClawRuntimeChat from "./pages/studio/AvatarClawRuntimeChat";
import AvatarClawTerminalPage from "./pages/studio/AvatarClawTerminalPage";
import AvatarClawGuidePage from "./pages/studio/AvatarClawGuidePage";
import AvatarClawIntegrationsPage from "./pages/studio/AvatarClawIntegrationsPage";
import AvatarClawWorkspacePage, {
  AvatarClawWorkspaceLegacyNavigate,
} from "./pages/studio/AvatarClawWorkspacePage";
import IdentityOverview from "./pages/identity/IdentityOverview";
import MyIdentity from "./pages/identity/MyIdentity";
import AgentCredentials from "./pages/identity/AgentCredentials";
import AgentCredentialDetail from "./pages/identity/AgentCredentialDetail";
import Delegations from "./pages/identity/Delegations";
import DelegationDetail from "./pages/identity/DelegationDetail";
import PoliciesAudit from "./pages/identity/PoliciesAudit";

const queryClient = new QueryClient();
queryClient.setQueryDefaults(["studio-avatars"], { staleTime: Infinity });

function LayoutClawGuard({ children }: { children: ReactNode }) {
  return (
    <Layout>
      <AvatarClawAccessGuard>{children}</AvatarClawAccessGuard>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ProUpgradeModals />
          <Routes>
            <Route path="/" element={<Navigate to="/marketplace" replace />} />
            {/* Legacy: avatar setup now only at Create Avatar → Avatar */}
            <Route path="/onboarding" element={<Navigate to="/studio/avatars/create" replace />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/persona" element={<Layout><Persona /></Layout>} />
            <Route path="/studio/avatars" element={<Layout><MyAvatars /></Layout>} />
            <Route path="/studio/avatars/create" element={<Layout><CreateAvatar /></Layout>} />
            <Route path="/studio/avatars/:id" element={<Layout><AvatarDetail /></Layout>} />
            <Route path="/studio/agents" element={<Layout><MyAgents /></Layout>} />
            <Route path="/studio/agents/create/enterprise" element={<LayoutClawGuard><CreateAgent /></LayoutClawGuard>} />
            <Route path="/studio/agents/create/step/5" element={<LayoutClawGuard><AvatarClawSetupStep5Review /></LayoutClawGuard>} />
            <Route path="/studio/agents/create/step/4" element={<LayoutClawGuard><AvatarClawSetupStep4SkillPacks /></LayoutClawGuard>} />
            <Route path="/studio/agents/create/step/3" element={<LayoutClawGuard><AvatarClawSetupStep3Personality /></LayoutClawGuard>} />
            <Route path="/studio/agents/create/step/2" element={<LayoutClawGuard><AvatarClawSetupStep2Name /></LayoutClawGuard>} />
            <Route path="/studio/agents/create" element={<LayoutClawGuard><CreateAvatarClaw /></LayoutClawGuard>} />
            <Route path="/studio/agents/activity" element={<Layout><AgentActivity /></Layout>} />
            <Route path="/studio/agents/:agentId/workspace/:segment" element={<LayoutClawGuard><AvatarClawWorkspaceLegacyNavigate /></LayoutClawGuard>} />
            <Route path="/studio/agents/:agentId/workspace" element={<LayoutClawGuard><AvatarClawWorkspacePage /></LayoutClawGuard>} />
            <Route path="/studio/agents/:agentId/terminal" element={<LayoutClawGuard><AvatarClawTerminalPage /></LayoutClawGuard>} />
            <Route path="/studio/agents/:agentId/guide" element={<LayoutClawGuard><AvatarClawGuidePage /></LayoutClawGuard>} />
            <Route path="/studio/agents/:agentId/integrations" element={<LayoutClawGuard><AvatarClawIntegrationsPage /></LayoutClawGuard>} />
            <Route path="/studio/agents/:agentId/runtime" element={<LayoutClawGuard><AvatarClawRuntimeChat /></LayoutClawGuard>} />
            <Route path="/studio/agents/:id/logs" element={<LayoutClawGuard><AgentLogs /></LayoutClawGuard>} />
            <Route path="/studio/agents/:id" element={<LayoutClawGuard><AvatarDetail /></LayoutClawGuard>} />
            <Route path="/studio/dpo" element={<Navigate to="/studio/avatars" replace />} />
            <Route path="/identity" element={<Layout><IdentityOverview /></Layout>} />
            <Route path="/identity/me" element={<Layout><MyIdentity /></Layout>} />
            <Route path="/identity/agents" element={<Layout><AgentCredentials /></Layout>} />
            <Route path="/identity/agents/credential/:agentId" element={<Layout><AgentCredentials /></Layout>} />
            <Route path="/identity/agents/:agentId" element={<Layout><AgentCredentialDetail /></Layout>} />
            <Route path="/identity/delegations" element={<Layout><Delegations /></Layout>} />
            <Route path="/identity/delegations/:id" element={<Layout><DelegationDetail /></Layout>} />
            <Route path="/identity/policies" element={<Layout><PoliciesAudit /></Layout>} />
            <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
            <Route path="/studio" element={<Layout><Studio /></Layout>} />
            <Route path="/queue" element={<Layout><Queue /></Layout>} />
            <Route path="/settings" element={<Layout><AccountSettingsPage /></Layout>} />
            <Route path="/avatar-match" element={<Layout><AvatarMatch /></Layout>} />
            <Route path="/marketplace" element={<Layout><MarketplaceBrowse /></Layout>} />
            <Route path="/marketplace/chat" element={<Layout><Marketplace /></Layout>} />
            <Route path="/marketplace/browse" element={<Navigate to="/marketplace" replace />} />
            <Route path="/online-avatar" element={<Navigate to="/persona" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
