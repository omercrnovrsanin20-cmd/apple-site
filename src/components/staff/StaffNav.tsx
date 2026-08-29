"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { apiFetch } from "@/lib/api";

export function StaffNav() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await apiFetch("/api/auth/staff/logout", { method: "POST" });
    router.push("/staff/login");
    router.refresh();
  }

  if (pathname === "/staff/login") return null;

  const links = [
    { href: "/staff", label: t("nav.dashboard") },
    { href: "/staff/requests", label: t("nav.requests") },
    { href: "/staff/calendar", label: t("nav.calendar") },
    { href: "/staff/workorders", label: t("nav.workOrders") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#e2e5ea] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/staff" className="text-base font-semibold text-[#12151c]">
          Lustro <span className="text-[#2563eb]">Staff</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-[#5b6472]">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[#12151c] transition">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={handleLogout}
            className="rounded-full border border-[#e2e5ea] px-4 py-1.5 text-xs text-[#12151c] hover:border-[#2563eb] transition"
          >
            {t("common.logout")}
          </button>
        </div>
      </div>
      <div className="md:hidden flex gap-4 overflow-x-auto px-6 pb-3 text-xs text-[#5b6472]">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-[#12151c]">
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
