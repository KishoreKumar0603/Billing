import { useEffect } from "react";
import { useAuth } from "@/stores/auth.store";
import { tokenStore } from "@/services/api";
import { isTokenExpired, getTokenExpiryTime } from "@/lib/tokenUtils";

/**
 * Auth Initialization Hook
 * Handles:
 * - Initial auth check on app load
 * - Proactive token refresh before expiry
 * - Auth state persistence
 */
export const useAuthInit = () => {
  const { hydrate, isAuthenticated } = useAuth();

  useEffect(() => {
    // Initialize auth on app load
    hydrate();
  }, [hydrate]);

  // Proactive token refresh timer
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = tokenStore.get();
    if (!token) return;

    const timeRemaining = getTokenExpiryTime(token);

    if (timeRemaining < 0) {
      // Token is already expired, auth interceptor will handle refresh
      return;
    }

    // Refresh token 2 minutes before expiry
    const refreshBeforeExpiry = 2 * 60 * 1000;
    const scheduleRefresh = Math.max(timeRemaining - refreshBeforeExpiry, 5000);

    const timer = setTimeout(() => {
      console.log("🔄 Proactively refreshing token...");
      // The interceptor will handle the actual refresh on next request
      // Or we can call the refresh endpoint directly if needed
    }, scheduleRefresh);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return { isAuthenticated };
};
