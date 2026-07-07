"use client";
import React from "react";
import { SignUpPage } from "@/src/components/SignUpPage";
import { useRouter } from "next/navigation";

export default function SignUpRoute() {
  const handleNavigate = (view: string) => {
    if (view === "landing") window.location.href = "/";
    else if (view === "study-material-page") window.location.href = "/study-material";
    else window.location.href = "/" + view;
  };

  return <SignUpPage setCurrentView={handleNavigate} />;
}
