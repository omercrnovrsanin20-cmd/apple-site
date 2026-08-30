"use client";

import { useI18n } from "@/lib/i18n";

export default function OwnerStaffPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.staffMgmt")}</h1>
      <p className="mt-4 rounded-lg border border-[#2a2a2e] bg-[#141416] p-5 text-sm text-[#a8a6a0]">
        {t("owner.staffPortalNotice")}
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-[#2a2a2e] p-6 text-sm text-[#a8a6a0]">
        <p className="mb-2 font-medium text-[#f4f2ec]">Coming soon: individual staff accounts</p>
        <p>
          The database already models a <code className="text-[#c8a24a]">StaffAccount</code> entity (name, email, role,
          active/inactive) so this screen can be wired up to create real accounts, assign roles and permissions, and
          replace the shared password without changing how the Staff Portal is structured.
        </p>
      </div>
    </div>
  );
}
