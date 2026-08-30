"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { apiFetch, ApiError } from "@/lib/api";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function OwnerLoginPage() {
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
      await apiFetch("/api/auth/owner/login", { method: "POST", body: JSON.stringify({ email, password }) });
      router.push("/owner");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(t(`validation.${err.message}`));
      else setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#0b0b0c] px-6 py-20 text-[#f4f2ec]">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher variant="dark" />
      </div>
      <div className="w-full max-w-sm rounded-xl border border-[#2a2a2e] bg-[#141416] p-8">
        <h1 className="text-xl font-semibold">{t("owner.loginTitle")}</h1>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-owner"
            placeholder={t("common.email")}
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-owner"
            placeholder={t("common.password")}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
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
