"use client";

import { CheckCircle2, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Toast = { id: number; tone: "ok" | "error"; message: string };

type ToastContextValue = {
  pushToast: (tone: Toast["tone"], message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useWorkspaceToast(): ToastContextValue {
  const context = useContext(ToastContext);
  // A no-op fallback keeps row actions usable if one is ever rendered outside
  // the workspace layout, rather than crashing the whole table.
  return context ?? { pushToast: () => {} };
}

let nextId = 1;

export function WorkspaceToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((tone: Toast["tone"], message: string) => {
    const id = nextId++;
    setToasts((current) => [...current, { id, tone, message }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="workspace-toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    // Errors stay long enough to read and act on; confirmations clear quickly.
    const timeout = window.setTimeout(() => onDismiss(toast.id), toast.tone === "error" ? 9000 : 5000);
    return () => window.clearTimeout(timeout);
  }, [toast.id, toast.tone, onDismiss]);

  return (
    <div className={`workspace-toast tone-${toast.tone}`}>
      {toast.tone === "ok" ? <CheckCircle2 /> : <TriangleAlert />}
      <p>{toast.message}</p>
      <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
        <X />
      </button>
    </div>
  );
}
