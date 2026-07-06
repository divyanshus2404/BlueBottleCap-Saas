const PERMISSION_KEY = "bluebottlecap_notif_enabled";
const LAST_REMINDER_KEY = "bluebottlecap_last_reminder";

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") {
    localStorage.setItem(PERMISSION_KEY, "1");
    return true;
  }
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  if (result === "granted") {
    localStorage.setItem(PERMISSION_KEY, "1");
    return true;
  }
  return false;
}

export function isNotificationEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return Notification.permission === "granted" && localStorage.getItem(PERMISSION_KEY) === "1";
}

export function disableNotifications() {
  localStorage.removeItem(PERMISSION_KEY);
}

export async function sendLocalNotification(title: string, body: string, url = "/", tag = "bbc-notification") {
  if (!isNotificationEnabled()) return;
  const reg = await navigator.serviceWorker?.ready;
  if (reg) {
    reg.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/favicon.png",
      tag,
      data: { url },
    } as NotificationOptions);
  }
}

export function scheduleStreakReminder(streakDays: number, lastLoggedDate: string) {
  if (!isNotificationEnabled()) return;
  const today = new Date().toISOString().split("T")[0];
  if (lastLoggedDate === today) return;

  const lastReminder = localStorage.getItem(LAST_REMINDER_KEY);
  if (lastReminder === today) return;
  localStorage.setItem(LAST_REMINDER_KEY, today);

  const messages = [
    { title: "Your streak is at risk! 🔥", body: `${streakDays}-day streak will break if you don't study today.` },
    { title: "Don't lose your progress! 💪", body: `You've built a ${streakDays}-day streak. Keep it alive!` },
    { title: "Quick study session? ⚡", body: `Just 5 minutes to save your ${streakDays}-day streak.` },
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  setTimeout(() => {
    sendLocalNotification(msg.title, msg.body, "/dashboard", "streak-reminder");
  }, 2 * 60 * 60 * 1000); // 2 hours after page load
}

export function sendStudyCompleteNotification(minutes: number) {
  sendLocalNotification(
    "Great study session! 🎯",
    `You studied for ${minutes} minutes today. Keep the momentum going!`,
    "/dashboard",
    "study-complete",
  );
}

export function sendNewQuoteNotification() {
  sendLocalNotification(
    "New daily quote is here! ✨",
    "A fresh dose of motivation is waiting for you.",
    "/",
    "daily-quote",
  );
}
