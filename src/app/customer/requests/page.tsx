"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface RequestRow {
  id: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  declineReason: string | null;
  vehicle: { make: string; model: string };
  service: { nameEn: string; nameMe: string };
}

export default function MyRequestsPage() {
  const { t, lang } = useI18n();
  const [requests, setRequests] = useState<RequestRow[] | null>(null);

  useEffect(() => {
    apiFetch<{ requests: RequestRow[] }>("/api/customer/requests").then((r) => setRequests(r.requests));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl">{t("nav.myRequests")}</h1>
      <div className="mt-8 flex flex-col gap-3">
        {requests?.length === 0 && <p className="text-[#a8a6a0]">{t("customer.noRequests")}</p>}
        {requests?.map((r) => (
          <Link
            key={r.id}
            href={`/customer/requests/${r.id}`}
            className="flex items-center justify-between rounded-lg border border-[#2a2a2e] bg-[#141416] p-5 transition hover:border-[#c8a24a]"
          >
            <div>
              <p className="font-display">{lang === "me" ? r.service.nameMe : r.service.nameEn}</p>
              <p className="mt-1 text-sm text-[#a8a6a0]">
                {r.vehicle.make} {r.vehicle.model} · {r.preferredDate} {r.preferredTime}
              </p>
              {r.status === "DECLINED" && r.declineReason && (
                <p className="mt-1 text-xs text-red-400">{r.declineReason}</p>
              )}
            </div>
            <StatusBadge status={r.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
