"use client";

import React from "react";
import { whatsappContactUrl } from "../lib/whatsapp";

// Floating "chat on WhatsApp" button, bottom-left so it doesn't collide with
// the feedback widget (bottom-right). Renders nothing when no number is
// configured, so it never links to a dead chat. WhatsApp is the default
// channel for Indian coaching owners — this is the lowest-friction way for
// them to reach out.

const WhatsAppGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
    <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.6c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-4.9 1 1-4.8-.2-.4C5.5 18.4 5 16.7 5 15c0-6 4.9-11 11-11s11 5 11 11-4.9 10.8-11 9.8zm5.5-7.9c-.3-.2-1.8-.9-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4z"/>
  </svg>
);

export const WhatsAppButton: React.FC = () => {
  const href = whatsappContactUrl(
    "Hi BlueBottleCap — I run a coaching institute and want to know more.",
  );
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 left-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,.6)] transition hover:scale-105"
      style={{ height: 52, width: 52 }}
    >
      <WhatsAppGlyph className="h-7 w-7" />
    </a>
  );
};
