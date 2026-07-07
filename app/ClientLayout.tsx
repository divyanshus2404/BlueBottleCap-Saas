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
import { WhatsAppButton } from "@/src/components/WhatsAppButton";
import { OnboardingTutorial } from "@/src/components/OnboardingTutorial";
import { NotificationPrompt } from "@/src/components/NotificationPrompt";
import { ContentProtection } from "@/src/components/ContentProtection";
import { PageTransition } from "@/src/components/PageTransition";
import { ScrollToTop } from "@/src/components/ScrollToTop";

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

  // Listen for custom event to open auth modal from anywhere
  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuth);
  }, []);

  return (
    <SmoothScroll>
      <ErrorBoundary>
        <div className="min-h-screen bg-transparent font-sans antialiased flex flex-col">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-lg focus:bg-[var(--color-blue-ink)] focus:px-4 focus:py-2 focus:text-white focus:outline-none">
            Skip to content
          </a>
          <GlobalBackground />
          {/* Immersive / full-screen routes own their own chrome: the landing
              page has its own header+footer, and the auth/onboarding flows are
              standalone full-screen layouts. Hide the global nav there. */}
          {pathname !== "/" && pathname !== "/for-institutes" && (
            <Navigation onLoginClick={() => setIsAuthModalOpen(true)} />
          )}
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
          <main id="main-content" className="flex-grow">
            <PageTransition>{children}</PageTransition>
          </main>
          {pathname !== "/" && pathname !== "/for-institutes" && pathname !== "/virtual-test" && pathname !== "/pdf-editor" && (
            <Footer />
          )}
          <WhatsAppButton />
          {currentUser && <OnboardingTutorial />}
          {currentUser && <NotificationPrompt />}
          <ContentProtection />
          <ScrollToTop />
        </div>
      </ErrorBoundary>
    </SmoothScroll>
  );
}
