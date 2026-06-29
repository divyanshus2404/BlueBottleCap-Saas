"use client";
import React from "react";
import { LandingPage } from "@/src/components/LandingPage";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  const handleNavigate = (view: string) => {
    if (view === "landing") router.push("/");
    else if (view === "study-material-page") router.push("/study-material");
    else router.push("/" + view);
  };

  return <LandingPage onNavigate={handleNavigate} />;
}
