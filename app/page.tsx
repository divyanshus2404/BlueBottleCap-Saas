"use client";
import React from "react";
import { LandingV3 } from "@/src/components/LandingV3";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  const handleNavigate = (view: string) => {
    if (view === "landing") window.location.href = "/";
    else if (view === "study-material-page") window.location.href = "/study-material";
    else window.location.href = "/" + view;
  };

  return <LandingV3 onNavigate={handleNavigate} />;
}
