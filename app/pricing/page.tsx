"use client";

import { useRouter } from "next/navigation";
import { Pricing } from "@/src/components/Pricing";
import { useGlobalState } from "@/src/context/GlobalStateContext";

export default function PricingPage() {
  const router = useRouter();
  const { userStats, handleUpgradeAccount } = useGlobalState();

  const navigateTo = (view: string) => {
    if (view === "dashboard") router.push("/dashboard");
    else if (view === "landing") router.push("/");
    else router.push("/" + view);
  };

  return (
    <Pricing
      userStats={userStats}
      onUpgradeApproved={(plan) => handleUpgradeAccount(plan)}
      onNavigateTo={navigateTo}
    />
  );
}
