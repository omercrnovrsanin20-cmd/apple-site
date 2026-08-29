"use client";

import { useI18n } from "@/lib/i18n";

export default function OwnerStaffPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.staffMgmt")}</h1>
      <p className="mt-4 rounded-lg border border-[#263041] bg-[#151b25] p-5 text-sm text-[#8a94a3]">
        {t("owner.staffPortalNotice")}
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-[#263041] p-6 text-sm text-[#8a94a3]">
        <p className="mb-2 font-medium text-[#eef2f6]">Coming soon: individual staff accounts</p>
        <p>
          The database already models a <code className="text-[#4fd1c5]">StaffAccount</code> entity (name, email, role,
          active/inactive) so this screen can be wired up to create real accounts, assign roles and permissions, and
          replace the shared password without changing how the Staff Portal is structured.
        </p>
      </div>
    </div>
  );
}
