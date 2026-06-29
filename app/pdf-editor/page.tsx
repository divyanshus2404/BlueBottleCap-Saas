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
      onIncrementQuery={incrementAiQueriesUsed}
      onAddFlashcard={handleAddFlashcard}
      openedPapers={openedPapers}
      onOpenPaper={handleOpenPaper}
      onUpgradeClick={() => router.push("/pricing")}
      onGoBack={() => router.push("/dashboard")}
    />
  );
}
