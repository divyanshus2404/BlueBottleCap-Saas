"use client";

import React from "react";
import { AuthProvider } from "@/src/context/AuthContext";
import { GlobalStateProvider } from "@/src/context/GlobalStateContext";
import { I18nProvider } from "@/src/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <GlobalStateProvider>
          {children}
        </GlobalStateProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
