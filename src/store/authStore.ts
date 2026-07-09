import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  jwt: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setJwt: (token: string) => void;
  clearJwt: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      jwt: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setJwt: (token: string) => set({ jwt: token, isAuthenticated: true }),
      clearJwt: () => set({ jwt: null, isAuthenticated: false }),
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: "nextoken-auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
