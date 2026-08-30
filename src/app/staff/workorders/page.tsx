"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface WorkOrderRow {
  id: number;
  status: string;
  vehicle: { make: string; model: string };
  service: { nameEn: string; nameMe: string };
  appointment: { customer: { name: string } };
}

export default function StaffWorkOrdersPage() {
  const { t, lang } = useI18n();
  const [workOrders, setWorkOrders] = useState<WorkOrderRow[] | null>(null);

  useEffect(() => {
    apiFetch<{ workOrders: WorkOrderRow[] }>("/api/staff/workorders").then((r) => setWorkOrders(r.workOrders));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.workOrders")}</h1>
      <div className="mt-6 flex flex-col gap-2">
        {workOrders?.length === 0 && <p className="text-[#a8a6a0]">{t("common.noData")}</p>}
        {workOrders?.map((w) => (
          <Link
            key={w.id}
            href={`/staff/workorders/${w.id}`}
            className="flex items-center justify-between rounded-lg border border-[#2a2a2e] bg-[#141416] p-4 hover:border-[#c8a24a]"
          >
            <div>
              <p className="font-medium">
                {t("staff.jobNumber")} #{w.id} · {w.appointment.customer.name}
              </p>
              <p className="text-sm text-[#a8a6a0]">
                {w.vehicle.make} {w.vehicle.model} · {lang === "me" ? w.service.nameMe : w.service.nameEn}
              </p>
            </div>
            <StatusBadge status={w.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
