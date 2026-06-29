"use client";

import React, { useState, useEffect } from "react";
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
  // Routes that render their own full-screen chrome (no global nav/footer).
  const chromeless = ["/", "/signup", "/onboarding", "/create-profile"].includes(pathname);

  // Capture an inbound referral code (?ref=CODE) once, so it can be attributed
  // to the referrer at signup. Only stores the first one seen.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && !localStorage.getItem("bluebottlecap_referred_by")) {
      localStorage.setItem("bluebottlecap_referred_by", ref.toUpperCase());
    }
  }, []);

  return (
    <SmoothScroll>
      <ErrorBoundary>
        <div className="min-h-screen bg-transparent font-sans antialiased flex flex-col">
          <GlobalBackground />
          {/* Immersive / full-screen routes own their own chrome: the landing
              page has its own header+footer, and the auth/onboarding flows are
              standalone full-screen layouts. Hide the global nav there. */}
          {!chromeless && (
            <Navigation onLoginClick={() => setIsAuthModalOpen(true)} />
          )}
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
          <div className="flex-grow">
            {children}
          </div>
          {!chromeless && pathname !== "/virtual-test" && pathname !== "/pdf-editor" && (
            <Footer />
          )}
        </div>
      </ErrorBoundary>
    </SmoothScroll>
  );
}
