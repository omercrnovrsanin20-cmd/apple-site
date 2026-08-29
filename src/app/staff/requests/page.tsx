"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface RequestRow {
  id: string;
  status: string;
  preferredDate: string;
  preferredTime: string;
  customer: { name: string };
  vehicle: { make: string; model: string };
  service: { nameEn: string; nameMe: string };
}

export default function StaffRequestsPage() {
  const { t, lang } = useI18n();
  const [requests, setRequests] = useState<RequestRow[] | null>(null);

  useEffect(() => {
    apiFetch<{ requests: RequestRow[] }>("/api/staff/requests").then((r) => setRequests(r.requests));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.requests")}</h1>
      <div className="mt-6 flex flex-col gap-2">
        {requests?.length === 0 && <p className="text-[#5b6472]">{t("staff.noPendingRequests")}</p>}
        {requests?.map((r) => (
          <Link
            key={r.id}
            href={`/staff/requests/${r.id}`}
            className="flex items-center justify-between rounded-lg border border-[#e2e5ea] bg-white p-4 hover:border-[#2563eb]"
          >
            <div>
              <p className="font-medium">{r.customer.name}</p>
              <p className="text-sm text-[#5b6472]">
                {r.vehicle.make} {r.vehicle.model} · {lang === "me" ? r.service.nameMe : r.service.nameEn}
              </p>
              <p className="text-xs text-[#5b6472]">
                {r.preferredDate} {r.preferredTime}
              </p>
            </div>
            <StatusBadge status={r.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
