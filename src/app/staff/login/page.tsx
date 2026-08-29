"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { apiFetch, ApiError } from "@/lib/api";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function StaffLoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/staff/login", { method: "POST", body: JSON.stringify({ password }) });
      router.push("/staff");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(t(`validation.${err.message}`));
      else setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#f5f6f8] px-6 py-20">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm rounded-xl border border-[#e2e5ea] bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-[#12151c]">{t("staff.loginTitle")}</h1>
        <p className="mt-1 text-sm text-[#5b6472]">{t("staff.loginSubtitle")}</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-light"
            placeholder={t("common.password")}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#2563eb] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1d4ed8] disabled:opacity-50"
          >
            {t("common.login")}
          </button>
        </form>
      </div>
    </div>
  );
}
