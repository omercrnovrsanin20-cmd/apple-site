"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { apiFetch } from "@/lib/api";

export function OwnerNav() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await apiFetch("/api/auth/owner/logout", { method: "POST" });
    router.push("/owner/login");
    router.refresh();
  }

  if (pathname === "/owner/login") return null;

  const links = [
    { href: "/owner", label: t("nav.dashboard") },
    { href: "/owner/appointments", label: t("nav.appointments") },
    { href: "/owner/customers", label: t("nav.customers") },
    { href: "/owner/vehicles", label: t("nav.vehicles") },
    { href: "/owner/services", label: t("nav.services") },
    { href: "/owner/analytics", label: t("nav.analytics") },
    { href: "/owner/staff", label: t("nav.staffMgmt") },
    { href: "/owner/settings", label: t("nav.settings") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#263041] bg-[#0d1117]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/owner" className="text-base font-semibold text-[#eef2f6]">
          Lustro <span className="text-[#4fd1c5]">Owner</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-4 text-sm text-[#8a94a3]">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[#eef2f6] transition">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="dark" />
          <button
            onClick={handleLogout}
            className="rounded-full border border-[#263041] px-4 py-1.5 text-xs text-[#eef2f6] hover:border-[#4fd1c5] transition"
          >
            {t("common.logout")}
          </button>
        </div>
      </div>
      <div className="lg:hidden flex gap-4 overflow-x-auto px-6 pb-3 text-xs text-[#8a94a3]">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-[#eef2f6]">
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
