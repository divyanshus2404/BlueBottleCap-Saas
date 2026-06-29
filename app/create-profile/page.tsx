"use client";
import React from "react";
import { CreateProfilePage } from "@/src/components/CreateProfilePage";
import { useRouter } from "next/navigation";

export default function CreateProfileRoute() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (view === "landing") router.push("/");
    else if (view === "study-material-page") router.push("/study-material");
    else router.push("/" + view);
  };

  return <CreateProfilePage setCurrentView={handleNavigate} />;
}
