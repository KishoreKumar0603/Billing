import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/stores/auth.store";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, hydrate, user } = useAuth();
  const [ready, setReady] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (!isMounted) return;

      try {
        await hydrate();

        // Show session expired notification if redirected from token expiry
        const params = new URLSearchParams(location.search);
        if (params.get("session_expired") === "true" && isMounted) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });

          // Clear the query param
          window.history.replaceState({}, "", location.pathname);
        }
      } catch (error) {
        console.error("❌ Auth check failed:", error);
        if (isMounted) {
          toast({
            title: "Authentication Error",
            description:
              "Failed to verify your authentication. Please log in again.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) setReady(true);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [hydrate, toast, location]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Profile...</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we load your profile.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
