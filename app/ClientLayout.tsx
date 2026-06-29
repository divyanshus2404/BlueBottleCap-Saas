"use client";

import React, { useState } from "react";
import { Navigation } from "@/src/components/Navigation";
import { GlobalBackground } from "@/src/components/GlobalBackground";
import { AuthModal } from "@/src/components/AuthModal";
import { ToastContainer } from "@/src/components/ToastContainer";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { SmoothScroll } from "@/src/components/SmoothScroll";
import { Footer } from "@/src/components/Footer";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <SmoothScroll>
      <ErrorBoundary>
        <div className="min-h-screen bg-transparent font-sans antialiased flex flex-col">
          <GlobalBackground />
          {/* The landing page ("/") renders its own tailored header with
              in-page anchor nav, so the global app nav is hidden there to
              avoid two stacked headers. */}
          {pathname !== "/" && (
            <Navigation onLoginClick={() => setIsAuthModalOpen(true)} />
          )}
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
          <div className="flex-grow">
            {children}
          </div>
          {pathname !== "/virtual-test" && pathname !== "/pdf-editor" && (
            <Footer />
          )}
        </div>
      </ErrorBoundary>
    </SmoothScroll>
  );
}
