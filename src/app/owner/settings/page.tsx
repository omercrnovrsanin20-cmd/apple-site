"use client";

import { useI18n } from "@/lib/i18n";

export default function OwnerSettingsPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.settings")}</h1>

      <div className="mt-6 flex flex-col gap-4 text-sm">
        <SettingRow
          title={t("owner.manageServices")}
          desc="Pricing, service durations and active status are managed from the Services page — changes take effect immediately across the platform."
          href="/owner/services"
        />
        <SettingRow
          title={t("nav.staffMgmt")}
          desc="Staff login and future individual accounts."
          href="/owner/staff"
        />
        <div className="rounded-lg border border-[#263041] bg-[#151b25] p-5">
          <p className="font-medium">System configuration</p>
          <p className="mt-1 text-[#8a94a3]">
            Auth secrets, the shared staff development password and owner credentials are configured via server-side
            environment variables (AUTH_SECRET, STAFF_PASSWORD, OWNER_EMAIL, OWNER_PASSWORD) and are never exposed to
            the frontend.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <a href={href} className="block rounded-lg border border-[#263041] bg-[#151b25] p-5 hover:border-[#4fd1c5]">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-[#8a94a3]">{desc}</p>
    </a>
  );
}
