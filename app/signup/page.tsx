"use client";
import React from "react";
import { SignUpPage } from "@/src/components/SignUpPage";
import { useRouter } from "next/navigation";

export default function SignUpRoute() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (view === "landing") router.push("/");
    else if (view === "study-material-page") router.push("/study-material");
    else router.push("/" + view);
  };

  return <SignUpPage setCurrentView={handleNavigate} />;
}
