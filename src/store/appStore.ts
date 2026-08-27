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
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      typeof parsed.id !== "number" ||
      !parsed.nombre ||
      !parsed.apellido ||
      !parsed.email ||
      !parsed.rut
    ) {
      return null;
    }

    return {
      id: parsed.id,
      nombre: parsed.nombre,
      apellido: parsed.apellido,
      email: parsed.email,
      rut: parsed.rut,
      rutPendiente: Boolean(parsed.rutPendiente),
      googleLinked: Boolean(parsed.googleLinked),
    };
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

//

interface ModalSlice {
  isModalOpen: boolean;
  headerContent: React.ReactNode | null;
  modalContent: React.ReactNode | null;
  footerContent: React.ReactNode | null;
  dialogClassName?: string;
  bodyClassName?: string;
  openModal: ({
    header,
    content,
    footer,
    dialogClassName,
    bodyClassName,
  }: {
    header?: React.ReactNode;
    content: React.ReactNode;
    footer?: React.ReactNode;
    dialogClassName?: string;
    bodyClassName?: string;
  }) => void;
  onAccept?: () => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalSlice>((set) => ({
  isModalOpen: false,
  headerContent: null,
  modalContent: null,
  footerContent: null,
  dialogClassName: "",
  bodyClassName: "",
  openModal: ({
    header,
    content,
    footer,
    dialogClassName,
    bodyClassName,
  }: {
    header?: React.ReactNode;
    content: React.ReactNode;
    footer?: React.ReactNode;
    dialogClassName?: string;
    bodyClassName?: string;
  }) =>
    set({
      isModalOpen: true,
      headerContent: header,
      modalContent: content,
      footerContent: footer || null,
      dialogClassName: dialogClassName || "",
      bodyClassName: bodyClassName || "",
    }),
  onAccept: undefined,
  closeModal: () =>
    set({
      isModalOpen: false,
      headerContent: null,
      modalContent: null,
      footerContent: null,
      dialogClassName: "",
      bodyClassName: "",
    }),
}));
