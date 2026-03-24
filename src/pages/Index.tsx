import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const { onboardingComplete } = useApp();

  useEffect(() => {
    navigate(onboardingComplete ? "/dashboard" : "/onboarding", { replace: true });
  }, [navigate, onboardingComplete]);

  return null;
};

export default Index;
