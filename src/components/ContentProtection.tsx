"use client";

import { useEffect } from "react";

export function ContentProtection() {
  useEffect(() => {
    function blockEvent(e: Event) {
      e.preventDefault();
      return false;
    }

    function blockKeys(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isEditable = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      const ctrl = e.ctrlKey || e.metaKey;
      if (!isEditable && ctrl && ["c", "a", "u", "s", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
      if (e.key === "PrintScreen") {
        e.preventDefault();
        return false;
      }
      if (ctrl && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
    }

    document.addEventListener("copy", blockEvent);
    document.addEventListener("cut", blockEvent);
    document.addEventListener("contextmenu", blockEvent);
    document.addEventListener("dragstart", blockEvent);
    document.addEventListener("keydown", blockKeys);

    const style = document.createElement("style");
    style.textContent = `@media print { body { display: none !important; } }`;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("copy", blockEvent);
      document.removeEventListener("cut", blockEvent);
      document.removeEventListener("contextmenu", blockEvent);
      document.removeEventListener("dragstart", blockEvent);
      document.removeEventListener("keydown", blockKeys);
      style.remove();
    };
  }, []);

  return null;
}
