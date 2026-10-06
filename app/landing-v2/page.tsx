"use client";
import React from "react";
import { LandingV2 } from "@/src/components/LandingV2";

export default function LandingV2Preview() {
  const handleNavigate = (view: string) => {
    if (view === "landing") window.location.href = "/";
    else window.location.href = "/" + view;
  };
  return <LandingV2 onNavigate={handleNavigate} />;
}
