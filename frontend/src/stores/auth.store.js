import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";
import { tokenStore } from "@/services/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  register: (data: any) => Promise<{ email: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  updateProfile: (p: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  setTheme: (t: "light" | "dark") => void;
  theme: "light" | "dark";
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      isAuthenticated: false,
      theme: "light",
      hydrate: async () => {
        if (!tokenStore.get()) { set({ isAuthenticated: false, user: null }); return; }
        try { const me = await authService.me(); set({ user: me, isAuthenticated: true }); } catch { tokenStore.clear(); set({ isAuthenticated: false, user: null }); }
      },
      login: async (email, password) => {
        set({ loading: true });
        try { const r = await authService.login({ email, password }); set({ user: r.user, isAuthenticated: true }); }
        finally { set({ loading: false }); }
      },
      googleLogin: async () => {
        set({ loading: true });
        try { const r = await authService.googleLogin(); set({ user: r.user, isAuthenticated: true }); }
        finally { set({ loading: false }); }
      },
      register: async (data) => { await authService.register(data); return { email: data.email }; },
      verifyOtp: async (email, otp) => {
        await authService.verifyOtp({ email, otp });
        const me = await authService.me(); set({ user: me, isAuthenticated: true });
      },
      updateProfile: async (p) => { const u = await authService.updateProfile(p); set({ user: u }); },
      logout: async () => { await authService.logout(); set({ user: null, isAuthenticated: false }); },
      setTheme: (t) => { set({ theme: t }); document.documentElement.classList.toggle("dark", t === "dark"); },
    }),
    { name: "billingit-auth", partialize: (s) => ({ theme: s.theme }) }
  )
);

// Apply theme on load
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("billingit-auth");
  try {
    const t = stored ? JSON.parse(stored)?.state?.theme : "light";
    document.documentElement.classList.toggle("dark", t === "dark");
  } catch {}
}
