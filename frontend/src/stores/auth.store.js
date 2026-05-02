import { create } from "zustand";
import { persist } from "zustand/middleware";

import { authService } from "@/services/auth.service";
import { tokenStore } from "@/services/api";
export const useAuth = create()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      isAuthenticated: false,
      authChecking: true,
      theme: "light",

      // HYDRATE USER FROM TOKEN
      hydrate: async () => {
        // no token
        if (!tokenStore.get()) {
          set({
            isAuthenticated: false,
            user: null,
            authChecking: false,
          });

          return;
        }

        try {
          const me = await authService.me();

          set({
            user: me,
            isAuthenticated: true,
            authChecking: false,
          });
        } catch {
          tokenStore.clear();

          set({
            isAuthenticated: false,
            user: null,
            authChecking: false,
          });
        }
      },

      // LOGIN
      login: async (email, password) => {
        set({ loading: true });

        try {
          const r = await authService.login({
            email,
            password,
          });

          // verified user
          if (r.accessToken) {
            set({
              user: r.user,
              isAuthenticated: true,
            });
          }

          return r;
        } finally {
          set({ loading: false });
        }
      },

      // GOOGLE LOGIN
      googleLogin: async () => {
        set({ loading: true });

        try {
          await authService.googleLogin();
        } finally {
          set({ loading: false });
        }
      },

      // REGISTER
      register: async (data) => {
        await authService.register(data);

        return {
          email: data.email,
        };
      },

      // VERIFY OTP
      verifyOtp: async (email, otp) => {
        const data = await authService.verifyOtp({
          email,
          otp,
        });

        set({
          user: data.user,
          isAuthenticated: true,
        });

        return data;
      },

      // UPDATE PROFILE
      updateProfile: async (payload) => {
        const updatedUser = await authService.updateProfile(payload);

        set({
          user: updatedUser,
        });
      },

      // LOGOUT
      logout: async () => {
        await authService.logout();

        tokenStore.clear();

        set({
          user: null,
          isAuthenticated: false,
        });
      },

      // THEME
      setTheme: (theme) => {
        set({ theme });

        document.documentElement.classList.toggle("dark", theme === "dark");
      },
    }),
    {
      name: "billingit-auth",

      partialize: (state) => ({
        theme: state.theme,
      }),
    },
  ),
);

// APPLY THEME ON LOAD
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("billingit-auth");

  try {
    const theme = stored ? JSON.parse(stored)?.state?.theme : "light";

    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {}
}
