import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/stores/auth.store";
import { useEffect, useState } from "react";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, hydrate } = useAuth();

  const [ready, setReady] = useState(false);

  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (!isMounted) return;
      await hydrate();
      if (isMounted) setReady(true);
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
