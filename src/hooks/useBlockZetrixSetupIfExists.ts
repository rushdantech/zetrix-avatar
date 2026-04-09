import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loadZetrixClawAgentInstance } from "@/lib/studio/zetrixclaw-agent-instance";

/** Redirect away from the ZetrixClaw wizard when the user already has their single agent. */
export function useBlockZetrixSetupIfExists() {
  const navigate = useNavigate();
  useEffect(() => {
    if (loadZetrixClawAgentInstance()) {
      toast.message("You already have a ZetrixClaw", {
        description: "Only one ZetrixClaw is allowed. Open it from My Agents.",
      });
      navigate("/studio/agents", { replace: true });
    }
  }, [navigate]);
}
