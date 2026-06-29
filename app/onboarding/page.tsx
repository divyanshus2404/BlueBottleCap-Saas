"use client";
import React from "react";
import { Onboarding } from "@/src/components/Onboarding";
import { useGlobalState } from "@/src/context/GlobalStateContext";
import { useRouter } from "next/navigation";

export default function OnboardingRoute() {
  const { userStats } = useGlobalState();
  const router = useRouter();

  return (
    <Onboarding
      userStats={userStats}
      onComplete={() => router.push("/dashboard")}
    />
  );
}
