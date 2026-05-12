import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "wrestler" | "promotion" | "admin";
  wrestler_profile_id: number | null;
  promotion_profile_id: number | null;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
};

function syncBearer(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("ringlink_token", token);
  else window.localStorage.removeItem("ringlink_token");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => {
        syncBearer(token);
        set({ token, user });
      },
      clearSession: () => {
        syncBearer(null);
        set({ token: null, user: null });
      },
    }),
    {
      name: "ringlink-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) syncBearer(state.token);
      },
    },
  ),
);
