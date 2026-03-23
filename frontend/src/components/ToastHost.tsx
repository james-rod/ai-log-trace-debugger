"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import styles from "./ToastHost.module.css";
type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastApi = {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast[]>([]);

  const push = useCallback((type: ToastType, message: string) => {
    const id = uid();
    setToast((toast) => [...toast, { id, type, message }]);
    setTimeout(() => {
      setToast((toast) => toast.filter((x) => x.id !== id));
    }, 2200);
  }, []);

  const api = useMemo<ToastApi>(() => {
    return {
      success: (msg) => push("success", msg),
      error: (msg) => push("error", msg),
      info: (msg) => push("info", msg),
    };
  }, [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className={styles.stack}
        aria-live="polite"
        aria-relevant="additions"
      >
        {toast.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
