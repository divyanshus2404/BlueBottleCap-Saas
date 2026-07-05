"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/src/components/Navigation";
import { GlobalBackground } from "@/src/components/GlobalBackground";
import { AuthModal } from "@/src/components/AuthModal";
import { ToastContainer } from "@/src/components/ToastContainer";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { SmoothScroll } from "@/src/components/SmoothScroll";
import { Footer } from "@/src/components/Footer";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

/** Routes that should trigger the onboarding gate */
const ONBOARDING_GATED_PATHS = ["/dashboard", "/tools", "/pdf-editor", "/flashcards"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, userProfile, initialised } = useAuth();

  // Onboarding gate: redirect new users to /onboarding if they haven't completed it
  useEffect(() => {
    if (!initialised) return;
    if (!currentUser) return;
    if (pathname === "/onboarding") return;

    const isGated = ONBOARDING_GATED_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
    if (!isGated) return;

    // userProfile may be null briefly while Firestore loads; wait until it's set
    if (userProfile === null) return;

    if (!userProfile.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [initialised, currentUser, userProfile, pathname, router]);

  return (
    <SmoothScroll>
      <ErrorBoundary>
        <div className="min-h-screen bg-transparent font-sans antialiased flex flex-col">
          <GlobalBackground />
          <Navigation onLoginClick={() => setIsAuthModalOpen(true)} />
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
