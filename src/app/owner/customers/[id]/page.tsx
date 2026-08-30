"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface CustomerDetail {
  name: string;
  email: string;
  phone: string | null;
  vehicles: { id: string; make: string; model: string; year: number }[];
  requests: { id: string; status: string; preferredDate: string; service: { nameEn: string; nameMe: string }; vehicle: { make: string; model: string } }[];
  appointments: { id: string; date: string; status: string; service: { nameEn: string; nameMe: string }; workOrder: { status: string; price: number | null } | null }[];
}

export default function OwnerCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const { t, lang } = useI18n();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);

  useEffect(() => {
    apiFetch<{ customer: CustomerDetail }>(`/api/owner/customers/${id}`).then((r) => setCustomer(r.customer));
  }, [id]);

  if (!customer) return <div className="px-6 py-16 text-[#a8a6a0]">{t("common.loading")}</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{customer.name}</h1>
      <p className="text-[#a8a6a0]">
        {customer.email} {customer.phone ? `· ${customer.phone}` : ""}
      </p>

      <h2 className="mt-8 mb-2 text-xs font-semibold uppercase text-[#a8a6a0]">{t("nav.vehicles")}</h2>
      <div className="flex flex-wrap gap-2">
        {customer.vehicles.map((v) => (
          <span key={v.id} className="rounded-full border border-[#2a2a2e] px-3 py-1 text-sm">
            {v.make} {v.model} ({v.year})
          </span>
        ))}
      </div>

      <h2 className="mt-8 mb-2 text-xs font-semibold uppercase text-[#a8a6a0]">{t("nav.appointments")}</h2>
      <div className="flex flex-col gap-2">
        {customer.appointments.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border border-[#2a2a2e] bg-[#141416] p-3 text-sm">
            <span>
              {a.date} · {lang === "me" ? a.service.nameMe : a.service.nameEn}
            </span>
            <StatusBadge status={a.workOrder ? a.workOrder.status : a.status} />
          </div>
        ))}
        {customer.appointments.length === 0 && <p className="text-[#a8a6a0]">{t("common.noData")}</p>}
      </div>

      <h2 className="mt-8 mb-2 text-xs font-semibold uppercase text-[#a8a6a0]">{t("nav.requests")}</h2>
      <div className="flex flex-col gap-2">
        {customer.requests.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-lg border border-[#2a2a2e] bg-[#141416] p-3 text-sm">
            <span>
              {r.preferredDate} · {r.vehicle.make} {r.vehicle.model} · {lang === "me" ? r.service.nameMe : r.service.nameEn}
            </span>
            <StatusBadge status={r.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
