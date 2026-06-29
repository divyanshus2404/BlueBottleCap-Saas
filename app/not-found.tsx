"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Home, FileText } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Large 404 */}
        <div className="relative">
          <div className="text-[160px] font-display font-black text-slate-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 px-8 py-6 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-blue-600" />
              </div>
              <h1 className="font-display text-2xl font-black text-slate-900">Page not found</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                This page doesn&apos;t exist or was removed. Head back to explore the working parts of BlueBottleCap.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/pdf-editor"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Try PDF Copilot
          </Link>
        </div>
      </div>
    </div>
  );
}
