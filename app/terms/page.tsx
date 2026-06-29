"use client";
import React from "react";
import { TermsAndConditions } from "@/src/components/TermsAndConditions";
import { useRouter } from "next/navigation";

export default function TermsRoute() {
  const router = useRouter();

  return <TermsAndConditions onBack={() => router.push("/")} />;
}
