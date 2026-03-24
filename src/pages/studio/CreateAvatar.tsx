import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TypeSelector } from "@/components/studio/TypeSelector";
import { IndividualWizard } from "@/components/studio/IndividualWizard";
import { EnterpriseWizard } from "@/components/studio/EnterpriseWizard";
import { BootstrapTokenModal } from "@/components/identity/BootstrapTokenModal";
import type { StudioEntityType, IndividualAvatarDraft, EnterpriseAgentDraft } from "@/types/studio";

export default function CreateAvatar() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<StudioEntityType | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [tokenConfirmed, setTokenConfirmed] = useState(false);
  const [individual, setIndividual] = useState<IndividualAvatarDraft>({
    name: "",
    tagline: "",
    fullDescription: "",
    personalityTraits: [],
    communicationStyle: "Casual",
    languages: [],
    knowledgeDomains: [],
    conversationStarters: [],
    themeColor: "#b91c1c",
    voiceStyle: "Warm",
  });
  const [enterprise, setEnterprise] = useState<EnterpriseAgentDraft>({
    name: "",
    description: "",
    agentType: "Internal Operations",
    department: "",
    capabilities: [],
    operatingHours: "24/7",
    maxConcurrentTasks: 5,
    escalationEmail: "",
    setupIdentityNow: true,
    selectedScopes: [],
  });

  const create = () => {
    if (selected === "individual") {
      toast.success("Avatar created.");
      navigate("/studio/avatars");
      return;
    }
    if (selected === "enterprise") {
      if (enterprise.setupIdentityNow) {
        setShowToken(true);
      } else {
        toast.success("Agent created. This agent has no digital identity yet.");
        navigate("/studio/avatars");
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold">Create Avatar</h1>
      {!selected ? (
        <TypeSelector value={selected} onChange={setSelected} />
      ) : (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{selected === "individual" ? "Individual Avatar Wizard" : "Enterprise Agent Wizard"}</h2>
            <button onClick={() => setSelected(null)} className="rounded-lg bg-secondary px-3 py-1.5 text-xs">Change type</button>
          </div>
          {selected === "individual" ? (
            <IndividualWizard form={individual} setForm={setIndividual} />
          ) : (
            <EnterpriseWizard form={enterprise} setForm={setEnterprise} />
          )}
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => navigate("/studio/avatars")} className="rounded-lg bg-secondary px-4 py-2 text-sm">Cancel</button>
            <button onClick={create} className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              {selected === "individual" ? "Create & Publish" : "Create Agent"}
            </button>
          </div>
        </div>
      )}
      <BootstrapTokenModal
        open={showToken}
        token="zid_bootstrap_6f2b3fe2f7b14a61b1d423"
        copied={tokenConfirmed}
        onCopiedChange={setTokenConfirmed}
        onClose={() => {
          setShowToken(false);
          toast.success("Agent created and credentialed.");
          navigate("/identity/agents");
        }}
      />
    </div>
  );
}
