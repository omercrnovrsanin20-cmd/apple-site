"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { apiFetch, ApiError } from "@/lib/api";
import { FormField } from "@/components/FormField";
import { GoogleButton } from "@/components/customer/GoogleButton";

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <CustomerLoginForm />
    </Suspense>
  );
}

function CustomerLoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() => {
    const googleError = searchParams.get("error");
    return googleError ? t(`validation.${googleError}`) : null;
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/customer/login", { method: "POST", body: JSON.stringify({ email, password }) });
      router.push("/customer/vehicles");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(t(`validation.${err.message}`));
      else setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="font-display text-3xl">{t("customer.loginTitle")}</h1>

      <GoogleButton />

      <div className="my-6 flex items-center gap-3 text-xs text-[#6f6d68]">
        <div className="h-px flex-1 bg-[#2a2a2e]" />
        {t("customer.orDivider")}
        <div className="h-px flex-1 bg-[#2a2a2e]" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField label={t("common.email")}>
          <input
            type="email"
            required
            autoComplete="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark"
          />
        </FormField>
        <FormField label={t("common.password")}>
          <input
            type="password"
            required
            autoComplete="current-password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark"
          />
        </FormField>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-[#c8a24a] px-6 py-3 text-sm font-medium text-black transition hover:bg-[#e8d29a] disabled:opacity-50"
        >
          {t("common.login")}
        </button>
      </form>
      <p className="mt-6 text-sm text-[#a8a6a0]">
        {t("customer.noAccount")}{" "}
        <Link href="/customer/register" className="text-[#c8a24a] hover:underline">
          {t("common.register")}
        </Link>
      </p>
    </div>
  );
}
