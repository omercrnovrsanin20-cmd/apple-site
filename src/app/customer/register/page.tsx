"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { apiFetch, ApiError } from "@/lib/api";
import { FormField } from "@/components/FormField";

export default function CustomerRegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t("validation.passwordTooShort"));
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/api/auth/customer/register", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, password }),
      });
      router.push("/customer/vehicles");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(t(`validation.${err.message}`) || err.message);
      else setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="font-display text-3xl">{t("customer.registerTitle")}</h1>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <FormField label={t("common.name")}>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input-dark" />
        </FormField>
        <FormField label={t("common.email")}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark" />
        </FormField>
        <FormField label={t("common.phone")}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-dark" />
        </FormField>
        <FormField label={t("common.password")}>
          <input
            type="password"
            required
            minLength={8}
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
          {t("common.register")}
        </button>
      </form>
      <p className="mt-6 text-sm text-[#a8a6a0]">
        {t("customer.haveAccount")}{" "}
        <Link href="/customer/login" className="text-[#c8a24a] hover:underline">
          {t("common.login")}
        </Link>
      </p>
    </div>
  );
}
