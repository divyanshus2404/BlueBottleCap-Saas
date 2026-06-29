"use client";
import React from "react";
import { PdfCopilot } from "@/src/components/PdfCopilot";
import { useGlobalState } from "@/src/context/GlobalStateContext";
import { useAuth } from "@/src/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/firebase";
import { useRouter } from "next/navigation";

export default function PdfCopilotPage() {
  const router = useRouter();
  const { userStats, incrementAiQueriesUsed, handleAddFlashcard, openedPapers, setOpenedPapers } = useGlobalState();
  const { currentUser } = useAuth();

  // Guests can try the Copilot without signing up. After a few runs, nudge them
  // to create an account (so we capture the lead once they've felt the value).
  const GUEST_FREE_RUNS = 3;
  const handleIncrementQuery = () => {
    const result = incrementAiQueriesUsed();
    if (!currentUser && typeof window !== "undefined") {
      const runs = Number(localStorage.getItem("bluebottlecap_guest_runs") || "0") + 1;
      localStorage.setItem("bluebottlecap_guest_runs", String(runs));
      if (runs >= GUEST_FREE_RUNS) {
        router.push("/signup?from=trial");
      }
    }
    return result;
  };

  const handleOpenPaper = (paperId: string) => {
    if (userStats.activePlan === "Free" && openedPapers.length >= 3 && !openedPapers.includes(paperId)) {
      return false;
    }
    setOpenedPapers((prev) => {
      if (prev.includes(paperId)) return prev;
      const next = [...prev, paperId];
      localStorage.setItem("bluebottlecap_opened_papers", JSON.stringify(next));
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        updateDoc(userDocRef, { openedPapers: next }).catch(err => console.error(err));
      }
      return next;
    });
    return true;
  };

  return (
    <PdfCopilot
      userStats={userStats}
      onIncrementQuery={handleIncrementQuery}
      onAddFlashcard={handleAddFlashcard}
      openedPapers={openedPapers}
      onOpenPaper={handleOpenPaper}
      onUpgradeClick={() => router.push("/pricing")}
      onGoBack={() => router.push("/dashboard")}
    />
  );
}
