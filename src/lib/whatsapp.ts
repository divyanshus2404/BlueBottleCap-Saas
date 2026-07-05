// WhatsApp deep-link helpers. Uses the free wa.me / api.whatsapp.com scheme —
// no Business API, no cost, works on every phone. Two uses:
//   1. Contact: open a chat with *our* number (support / institute sales).
//   2. Share: open the user's WhatsApp with prefilled text to send to *anyone*.
//
// The contact number is configured via NEXT_PUBLIC_WHATSAPP_NUMBER (digits
// only, with country code, e.g. "919876543210"). When unset, the floating
// contact button hides itself rather than linking to a dead number.

export const WHATSAPP_NUMBER: string =
  (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/[^\d]/g, "");

/** Chat with our number, optionally with a prefilled first message. */
export function whatsappContactUrl(message?: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Open WhatsApp with prefilled text so the user can forward it to anyone.
 *  No recipient number — the user picks who to send to. */
export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
