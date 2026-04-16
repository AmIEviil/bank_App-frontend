import { create } from "zustand";
import { ACCESS_TOKEN_KEY } from "../client/client";
import type { AuthUser } from "../service/loginService";

export type SnackbarType = "success" | "error" | "info";

interface SnackbarState {
  open: boolean;
  message: string;
  type: SnackbarType;
}

interface AppStore {
  token: string;
  user: AuthUser | null;
  snackbar: SnackbarState;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
  showSnackbar: (message: string, type: SnackbarType) => void;
  hideSnackbar: () => void;
  hydrateSession: () => void;
}

const USER_STORAGE_KEY = "bank_app_user";

const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const useAppStore = create<AppStore>((set) => ({
  token: localStorage.getItem(ACCESS_TOKEN_KEY) || "",
  user: getStoredUser(),
  snackbar: {
    open: false,
    message: "",
    type: "info",
  },
  setSession: (token, user) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    set({ token, user });
  },
  clearSession: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    set({ token: "", user: null });
  },
  showSnackbar: (message, type) => {
    set({ snackbar: { open: true, message, type } });
  },
  hideSnackbar: () => {
    set((state) => ({
      snackbar: {
        ...state.snackbar,
        open: false,
      },
    }));
  },
  hydrateSession: () => {
    set({
      token: localStorage.getItem(ACCESS_TOKEN_KEY) || "",
      user: getStoredUser(),
    });
  },
}));
