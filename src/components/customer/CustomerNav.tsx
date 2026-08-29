"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { apiFetch } from "@/lib/api";

interface Session {
  id: string;
  name: string;
  email: string;
}

export function CustomerNav() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    apiFetch<{ session: Session }>("/api/auth/customer/me")
      .then((r) => setSession(r.session))
      .catch(() => setSession(null));
  }, [pathname]);

  async function handleLogout() {
    await apiFetch("/api/auth/customer/logout", { method: "POST" });
    setSession(null);
    router.push("/customer");
    router.refresh();
  }

  const links = [
    { href: "/customer", label: t("nav.home") },
    { href: "/customer/services", label: t("nav.services") },
  ];
  const authedLinks = [
    { href: "/customer/vehicles", label: t("nav.myVehicles") },
    { href: "/customer/requests", label: t("nav.myRequests") },
    { href: "/customer/appointments", label: t("nav.myAppointments") },
    { href: "/customer/history", label: t("nav.history") },
    { href: "/customer/notifications", label: t("nav.notifications") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#2a2a2e] bg-[#0b0b0c]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/customer" className="font-display text-lg tracking-wide text-[#f4f2ec]">
          Lustro <span className="text-[#c8a24a]">Detailing</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#a8a6a0]">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[#f4f2ec] transition">
              {l.label}
            </Link>
          ))}
          {session &&
            authedLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[#f4f2ec] transition">
                {l.label}
              </Link>
            ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="dark" />
          {session === undefined ? null : session ? (
            <button
              onClick={handleLogout}
              className="rounded-full border border-[#2a2a2e] px-4 py-1.5 text-xs text-[#f4f2ec] hover:border-[#c8a24a] transition"
            >
              {t("common.logout")}
            </button>
          ) : (
            <Link
              href="/customer/login"
              className="rounded-full bg-[#c8a24a] px-4 py-1.5 text-xs font-medium text-black hover:bg-[#e8d29a] transition"
            >
              {t("common.login")}
            </Link>
          )}
        </div>
      </div>
      <div className="md:hidden flex gap-4 overflow-x-auto px-6 pb-3 text-xs text-[#a8a6a0]">
        {[...links, ...(session ? authedLinks : [])].map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-[#f4f2ec]">
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
