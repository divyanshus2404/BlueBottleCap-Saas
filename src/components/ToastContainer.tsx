import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  progress?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (toast.type === "error") return;
    const timeout = toast.progress !== undefined ? 8000 : 4000;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 200);
    }, timeout);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
    error:   <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />,
    info:    <Info className="w-4 h-4 text-brand-cobalt shrink-0" />,
  };
  const borders: Record<ToastType, string> = {
    success: "border-l-4 border-emerald-400",
    error:   "border-l-4 border-rose-400",
    warning: "border-l-4 border-amber-400",
    info:    "border-l-4 border-brand-cobalt",
  };

  return (
    <div
      className={`pointer-events-auto flex flex-col rounded-xl bg-white shadow-lg shadow-slate-200/80 text-sm text-slate-700 font-medium transition-all duration-200 ${borders[toast.type]} ${
        exiting ? "opacity-0 translate-x-4" : "animate-in slide-in-from-right-4 fade-in"
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {icons[toast.type]}
        <span className="leading-snug flex-1">{toast.message}</span>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="shrink-0 text-[12px] font-bold text-[var(--color-blue-ink)] hover:underline"
          >
            {toast.action.label}
          </button>
        )}
        <button onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 200); }} className="shrink-0 text-gray-300 hover:text-gray-500 transition cursor-pointer ml-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {toast.progress !== undefined && (
        <div className="h-1 w-full overflow-hidden rounded-b-xl bg-gray-100">
          <div
            className="h-full bg-[var(--color-blue-ink)] transition-all duration-300"
            style={{ width: `${Math.min(100, toast.progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  const visible = toasts.slice(-5);
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none" style={{ maxWidth: 360 }}>
      {visible.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
