"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch, ApiError } from "@/lib/api";

interface StaffAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function OwnerStaffPage() {
  const { t } = useI18n();
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    apiFetch<{ staff: StaffAccount[] }>("/api/owner/staff").then((r) => setStaff(r.staff));
  }
  useEffect(load, []);

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/api/owner/staff", { method: "POST", body: JSON.stringify({ name, email, password }) });
      setName("");
      setEmail("");
      setPassword("");
      load();
    } catch (err) {
      if (err instanceof ApiError) setError(t(`validation.${err.message}`));
      else setError(t("common.error"));
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(s: StaffAccount) {
    await apiFetch(`/api/owner/staff/${s.id}`, { method: "PATCH", body: JSON.stringify({ active: !s.active }) });
    load();
  }

  async function removeStaff(s: StaffAccount) {
    await apiFetch(`/api/owner/staff/${s.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.staffMgmt")}</h1>
      <p className="mt-1 text-sm text-[#a8a6a0]">{t("owner.staffPortalNotice")}</p>

      <form onSubmit={addStaff} className="mt-6 rounded-lg border border-[#2a2a2e] bg-[#141416] p-5">
        <p className="mb-3 font-medium">{t("owner.addStaffAccount")}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className="input-owner"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("common.name")}
            required
          />
          <input
            type="email"
            className="input-owner"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("common.email")}
            required
          />
          <input
            type="password"
            className="input-owner"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("common.password")}
            minLength={8}
            required
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-lg bg-[#c8a24a] px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {t("common.add")}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {staff.length === 0 && <p className="text-sm text-[#a8a6a0]">{t("owner.noStaffAccounts")}</p>}
        {staff.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-[#2a2a2e] bg-[#141416] p-4">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-[#a8a6a0]">{s.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleActive(s)}
                className={`rounded-full px-3 py-1 text-xs ${s.active ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-500/15 text-zinc-400"}`}
              >
                {s.active ? t("owner.active") : t("owner.inactive")}
              </button>
              <button onClick={() => removeStaff(s)} className="text-sm text-red-400 hover:underline">
                {t("common.delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
