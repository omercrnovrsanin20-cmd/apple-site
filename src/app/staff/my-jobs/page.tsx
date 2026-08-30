"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface MyJobRow {
  id: number;
  status: string;
  vehicle: { make: string; model: string };
  service: { nameEn: string; nameMe: string };
  appointment: { date: string; time: string; customer: { name: string } };
}

export default function StaffMyJobsPage() {
  const { t, lang } = useI18n();
  const [jobs, setJobs] = useState<MyJobRow[] | null>(null);

  useEffect(() => {
    apiFetch<{ workOrders: MyJobRow[] }>("/api/staff/my-jobs").then((r) => setJobs(r.workOrders));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.myJobs")}</h1>
      <div className="mt-6 flex flex-col gap-2">
        {jobs?.length === 0 && <p className="text-[#a8a6a0]">{t("common.noData")}</p>}
        {jobs?.map((w) => (
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
                {w.vehicle.make} {w.vehicle.model} · {lang === "me" ? w.service.nameMe : w.service.nameEn} ·{" "}
                {w.appointment.date} {w.appointment.time}
              </p>
            </div>
            <StatusBadge status={w.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
