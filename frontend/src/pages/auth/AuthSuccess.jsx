import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { tokenStore } from "@/services/api";
import { useAuth } from "@/stores/auth.store";

export default function AuthSuccess() {
  const navigate = useNavigate();

  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    async function init() {
      const params = new URLSearchParams(window.location.search);

      const token = params.get("token");

      if (!token) {
        navigate("/login");
        return;
      }

      tokenStore.set(token);

      await hydrate();

      navigate("/app/dashboard");
    }

    init();
  }, []);

  return <div>Signing in...</div>;
}
