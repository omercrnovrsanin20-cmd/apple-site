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
    <header className="sticky top-0 z-40 border-b border-[#2a2a2e] bg-[#141416]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/staff" className="text-base font-semibold text-[#f4f2ec]">
          Lustro <span className="text-[#c8a24a]">Staff</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-[#a8a6a0]">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[#f4f2ec] transition">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={handleLogout}
            className="rounded-full border border-[#2a2a2e] px-4 py-1.5 text-xs text-[#f4f2ec] hover:border-[#c8a24a] transition"
          >
            {t("common.logout")}
          </button>
        </div>
      </div>
      <div className="md:hidden flex gap-4 overflow-x-auto px-6 pb-3 text-xs text-[#a8a6a0]">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-[#f4f2ec]">
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
