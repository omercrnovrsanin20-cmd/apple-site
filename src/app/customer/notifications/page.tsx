"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";

interface Notification {
  id: string;
  messageEn: string;
  messageMe: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { t, lang } = useI18n();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  function load() {
    apiFetch<{ notifications: Notification[] }>("/api/customer/notifications").then((r) => setNotifications(r.notifications));
  }
  useEffect(load, []);

  async function markAllRead() {
    await apiFetch("/api/customer/notifications", { method: "PATCH" });
    load();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{t("nav.notifications")}</h1>
        {notifications && notifications.some((n) => !n.read) && (
          <button onClick={markAllRead} className="text-sm text-[#c8a24a] hover:underline">
            {t("customer.markAllRead")}
          </button>
        )}
      </div>
      <div className="mt-8 flex flex-col gap-2">
        {notifications?.length === 0 && <p className="text-[#a8a6a0]">{t("customer.noNotifications")}</p>}
        {notifications?.map((n) => (
          <div
            key={n.id}
            className={`rounded-lg border p-4 text-sm ${
              n.read ? "border-[#2a2a2e] bg-[#141416] text-[#a8a6a0]" : "border-[#c8a24a]/50 bg-[#1c1c1f] text-[#f4f2ec]"
            }`}
          >
            {lang === "me" ? n.messageMe : n.messageEn}
            <p className="mt-1 text-[10px] text-[#6f6d68]">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
