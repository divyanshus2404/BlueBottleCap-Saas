"use client";
import React from "react";
import { LandingPage } from "@/src/components/LandingPage";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  const handleNavigate = (view: string) => {
    if (view === "landing") window.location.href = "/";
    else if (view === "study-material-page") window.location.href = "/study-material";
    else window.location.href = "/" + view;
  };

  return <LandingPage onNavigate={handleNavigate} />;
}
