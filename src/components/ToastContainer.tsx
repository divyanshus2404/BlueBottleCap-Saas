import React from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none" style={{ maxWidth: 340 }}>
      {toasts.map((toast) => {
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
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl bg-white shadow-lg shadow-slate-200/80 px-4 py-3 text-sm text-slate-700 font-medium animate-in slide-in-from-right-4 fade-in duration-200 ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <span className="leading-snug flex-1">{toast.message}</span>
            <button onClick={() => onDismiss(toast.id)} className="shrink-0 text-gray-300 hover:text-gray-500 transition cursor-pointer ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
