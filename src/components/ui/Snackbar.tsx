import { useEffect } from "react";
import { useAppStore } from "../../store/appStore";

export const Snackbar = () => {
  const snackbar = useAppStore((state) => state.snackbar);
  const hideSnackbar = useAppStore((state) => state.hideSnackbar);

  useEffect(() => {
    if (!snackbar.open) return;
    const timeout = setTimeout(() => hideSnackbar(), 3500);
    return () => clearTimeout(timeout);
  }, [hideSnackbar, snackbar.open]);

  if (!snackbar.open) return null;

  return (
    <div className="snackbar" role="status" aria-live="polite">
      <div className={`snackbar-item ${snackbar.type}`}>{snackbar.message}</div>
    </div>
  );
};
