import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loadAvatarClawAgentInstance } from "@/lib/studio/avatarclaw-agent-instance";

/** Redirect away from the AvatarClaw wizard when the user already has their single agent. */
export function useBlockAvatarClawSetupIfExists() {
  const navigate = useNavigate();
  useEffect(() => {
    if (loadAvatarClawAgentInstance()) {
      toast.message("You already have a AvatarClaw", {
        description: "Only one AvatarClaw is allowed. Open it from My Agents.",
      });
      navigate("/studio/agents", { replace: true });
    }
  }, [navigate]);
}
