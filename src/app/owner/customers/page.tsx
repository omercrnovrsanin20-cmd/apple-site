"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  vehicles: { id: string }[];
  _count: { requests: number; appointments: number };
  totalSpending: number;
}

export default function OwnerCustomersPage() {
  const { t } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    apiFetch<{ customers: Customer[] }>("/api/owner/customers").then((r) => setCustomers(r.customers));
  }, []);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.customers")}</h1>
      <input
        placeholder={t("common.name")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="input-owner mt-4 w-64"
      />
      <div className="mt-6 flex flex-col gap-2">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/owner/customers/${c.id}`}
            className="flex items-center justify-between rounded-lg border border-[#2a2a2e] bg-[#141416] p-4 hover:border-[#c8a24a]"
          >
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-[#a8a6a0]">
                {c.email} {c.phone ? `· ${c.phone}` : ""} · {c.vehicles.length} vehicle(s)
              </p>
            </div>
            <div className="text-right text-sm text-[#a8a6a0]">
              <p>
                {t("owner.totalJobsForCustomer")}: {c._count.appointments}
              </p>
              <p>
                {t("owner.totalSpending")}: {c.totalSpending.toFixed(0)} €
              </p>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-[#a8a6a0]">{t("common.noData")}</p>}
      </div>
    </div>
  );
}
