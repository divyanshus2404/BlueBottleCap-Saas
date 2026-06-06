import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-rose-900/30 m-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-3">Something went wrong</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-md">
            We encountered an unexpected error while rendering this section. Our team has been notified.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy dark:bg-brand-cobalt hover:bg-brand-cobalt dark:hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
