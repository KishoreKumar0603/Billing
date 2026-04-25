import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "@/stores/auth.store";

import {
  useEffect,
  useState,
} from "react";

import { tokenStore } from "@/services/api";

export function ProtectedRoute({
  children,
}) {
  const {
    isAuthenticated,
    hydrate,
  } = useAuth();

  const [ready, setReady] =
    useState(
      isAuthenticated
    );

  const location =
    useLocation();

  useEffect(() => {
    if (
      !isAuthenticated &&
      tokenStore.get()
    ) {
      hydrate().finally(() =>
        setReady(true)
      );
    } else {
      setReady(true);
    }
  }, [
    isAuthenticated,
    hydrate,
  ]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  return <>{children}</>;
}