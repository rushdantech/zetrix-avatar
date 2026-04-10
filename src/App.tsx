import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Persona from "./pages/Persona";
import Calendar from "./pages/Calendar";
import Studio from "./pages/Studio";
import Queue from "./pages/Queue";
import SettingsPage from "./pages/Settings";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Legacy: avatar setup now only at Create Avatar → Avatar */}
            <Route path="/onboarding" element={<Navigate to="/studio/avatars/create" replace />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/persona" element={<Layout><Persona /></Layout>} />
            <Route path="/studio/avatars" element={<Layout><MyAvatars /></Layout>} />
            <Route path="/studio/avatars/create" element={<Layout><CreateAvatar /></Layout>} />
            <Route path="/studio/avatars/:id" element={<Layout><AvatarDetail /></Layout>} />
            <Route path="/studio/agents" element={<Layout><MyAgents /></Layout>} />
            <Route path="/studio/agents/create/enterprise" element={<Layout><CreateAgent /></Layout>} />
            <Route path="/studio/agents/create/step/5" element={<Layout><AvatarClawSetupStep5Review /></Layout>} />
            <Route path="/studio/agents/create/step/4" element={<Layout><AvatarClawSetupStep4SkillPacks /></Layout>} />
            <Route path="/studio/agents/create/step/3" element={<Layout><AvatarClawSetupStep3Personality /></Layout>} />
            <Route path="/studio/agents/create/step/2" element={<Layout><AvatarClawSetupStep2Name /></Layout>} />
            <Route path="/studio/agents/create" element={<Layout><CreateAvatarClaw /></Layout>} />
            <Route path="/studio/agents/activity" element={<Layout><AgentActivity /></Layout>} />
            <Route path="/studio/agents/:agentId/workspace/:segment" element={<Layout><AvatarClawWorkspaceLegacyNavigate /></Layout>} />
            <Route path="/studio/agents/:agentId/workspace" element={<Layout><AvatarClawWorkspacePage /></Layout>} />
            <Route path="/studio/agents/:agentId/terminal" element={<Layout><AvatarClawTerminalPage /></Layout>} />
            <Route path="/studio/agents/:agentId/guide" element={<Layout><AvatarClawGuidePage /></Layout>} />
            <Route path="/studio/agents/:agentId/runtime" element={<Layout><AvatarClawRuntimeChat /></Layout>} />
            <Route path="/studio/agents/:id/logs" element={<Layout><AgentLogs /></Layout>} />
            <Route path="/studio/agents/:id" element={<Layout><AvatarDetail /></Layout>} />
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
            <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
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
