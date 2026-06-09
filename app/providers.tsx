"use client";

import React from "react";
import { AuthProvider } from "@/src/context/AuthContext";
import { GlobalStateProvider } from "@/src/context/GlobalStateContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GlobalStateProvider>
        {children}
      </GlobalStateProvider>
    </AuthProvider>
  );
}
