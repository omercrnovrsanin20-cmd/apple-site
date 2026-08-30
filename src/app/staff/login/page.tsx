"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { apiFetch, ApiError } from "@/lib/api";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function StaffLoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/staff/login", { method: "POST", body: JSON.stringify({ email, password }) });
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
    <div className="flex flex-1 flex-col items-center justify-center bg-[#0b0b0c] px-6 py-20">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm rounded-xl border border-[#2a2a2e] bg-[#141416] p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-[#f4f2ec]">{t("staff.loginTitle")}</h1>
        <p className="mt-1 text-sm text-[#a8a6a0]">{t("staff.loginSubtitle")}</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-light"
            placeholder={t("common.email")}
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-light"
            placeholder={t("common.password")}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#c8a24a] px-6 py-3 text-sm font-medium text-black transition hover:bg-[#e8d29a] disabled:opacity-50"
          >
            {t("common.login")}
          </button>
        </form>
      </div>
    </div>
  );
}
