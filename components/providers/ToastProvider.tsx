"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Toast, type ToastOptions } from "@/components/ui/Toast";

interface ToastContextValue {
  toast: (opts: ToastOptions) => void;
  success: (message: string) => void;
  error: (message: string, retry?: () => void) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = useState<ToastOptions | null>(null);

  const toast = useCallback((opts: ToastOptions) => {
    setItem(opts);
  }, []);

  const success = useCallback((message: string) => {
    toast({ message, type: "success" });
  }, [toast]);

  const error = useCallback((message: string, retry?: () => void) => {
    toast({ message, type: "error", retry });
  }, [toast]);

  const close = useCallback(() => setItem(null), []);

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence mode="wait">
            {item && (
              <Toast
                key={JSON.stringify(item)}
                {...item}
                onClose={close}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
