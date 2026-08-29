"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface DashboardData {
  todaysAppointments: { id: string; time: string; customer: { name: string }; vehicle: { make: string; model: string }; service: { nameEn: string; nameMe: string }; workOrder: { id: number; status: string } | null }[];
  pendingRequests: { id: string; customer: { name: string }; vehicle: { make: string; model: string }; service: { nameEn: string; nameMe: string }; preferredDate: string; preferredTime: string; status: string }[];
  confirmedAppointments: number;
  inService: { id: number; vehicle: { make: string; model: string }; service: { nameEn: string; nameMe: string }; status: string }[];
  completedJobs: number;
  upcoming: { id: string; date: string; time: string; customer: { name: string }; vehicle: { make: string; model: string } }[];
}

export default function StaffDashboard() {
  const { t, lang } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiFetch<DashboardData>("/api/staff/dashboard").then(setData);
  }, []);

  if (!data) return <div className="px-6 py-16 text-[#5b6472]">{t("common.loading")}</div>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.dashboard")}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <StatCard label={t("staff.pendingRequests")} value={data.pendingRequests.length} />
        <StatCard label={t("staff.confirmedAppointments")} value={data.confirmedAppointments} />
        <StatCard label={t("staff.inService")} value={data.inService.length} />
        <StatCard label={t("staff.completedJobs")} value={data.completedJobs} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Panel title={t("staff.pendingRequests")}>
          {data.pendingRequests.length === 0 && <Empty text={t("staff.noPendingRequests")} />}
          {data.pendingRequests.map((r) => (
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
        </Panel>

        <Panel title={t("staff.todaysAppointments")}>
          {data.todaysAppointments.length === 0 && <Empty text={t("common.noData")} />}
          {data.todaysAppointments.map((a) => (
            <Link
              key={a.id}
              href={a.workOrder ? `/staff/workorders/${a.workOrder.id}` : "#"}
              className="flex items-center justify-between rounded-lg border border-[#e2e5ea] bg-white p-4 hover:border-[#2563eb]"
            >
              <div>
                <p className="font-medium">
                  {a.time} · {a.customer.name}
                </p>
                <p className="text-sm text-[#5b6472]">
                  {a.vehicle.make} {a.vehicle.model} · {lang === "me" ? a.service.nameMe : a.service.nameEn}
                </p>
              </div>
              {a.workOrder && <StatusBadge status={a.workOrder.status} />}
            </Link>
          ))}
        </Panel>

        <Panel title={t("staff.inService")}>
          {data.inService.length === 0 && <Empty text={t("common.noData")} />}
          {data.inService.map((w) => (
            <Link
              key={w.id}
              href={`/staff/workorders/${w.id}`}
              className="flex items-center justify-between rounded-lg border border-[#e2e5ea] bg-white p-4 hover:border-[#2563eb]"
            >
              <div>
                <p className="font-medium">
                  {w.vehicle.make} {w.vehicle.model}
                </p>
                <p className="text-sm text-[#5b6472]">{lang === "me" ? w.service.nameMe : w.service.nameEn}</p>
              </div>
              <StatusBadge status={w.status} />
            </Link>
          ))}
        </Panel>

        <Panel title={t("staff.upcoming")}>
          {data.upcoming.length === 0 && <Empty text={t("common.noData")} />}
          {data.upcoming.map((a) => (
            <div key={a.id} className="rounded-lg border border-[#e2e5ea] bg-white p-4">
              <p className="font-medium">
                {a.date} {a.time} · {a.customer.name}
              </p>
              <p className="text-sm text-[#5b6472]">
                {a.vehicle.make} {a.vehicle.model}
              </p>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#e2e5ea] bg-white p-5">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-[#5b6472]">{label}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5b6472]">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-[#e2e5ea] p-4 text-sm text-[#5b6472]">{text}</p>;
}
