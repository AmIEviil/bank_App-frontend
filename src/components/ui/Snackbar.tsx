import { useEffect } from "react";
import { useAppStore } from "../../store/appStore";

export const Snackbar = () => {
  const snackbar = useAppStore((state) => state.snackbar);
  const hideSnackbar = useAppStore((state) => state.hideSnackbar);

  useEffect(() => {
    if (!snackbar.open) {
      return;
    }

    const timeout = globalThis.setTimeout(() => {
      hideSnackbar();
    }, 3500);

    return () => {
      globalThis.clearTimeout(timeout);
    };
  }, [hideSnackbar, snackbar.open]);

  if (!snackbar.open) {
    return null;
  }

  return <div className={`snackbar snackbar-${snackbar.type}`}>{snackbar.message}</div>;
};
