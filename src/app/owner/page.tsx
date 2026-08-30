"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";

interface DashboardData {
  revenue: { today: number; week: number; month: number };
  jobs: { total: number; completed: number; cancelled: number; inProgress: number };
  customers: { total: number; new: number; returning: number };
  services: { popular: { service?: { nameEn: string; nameMe: string }; jobCount: number; revenue: number }[]; avgJobValue: number };
  operations: { todaysWorkload: number; pendingRequests: number; currentJobs: { id: number; vehicle: { make: string; model: string }; service: { nameEn: string; nameMe: string }; status: string; appointment: { customer: { name: string } } }[] };
}

export default function OwnerDashboard() {
  const { t, lang } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiFetch<DashboardData>("/api/owner/dashboard").then(setData);
  }, []);

  if (!data) return <div className="px-6 py-16 text-[#a8a6a0]">{t("common.loading")}</div>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.dashboard")}</h1>

      <h2 className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wide text-[#a8a6a0]">{t("owner.revenue")}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t("owner.today")} value={`${data.revenue.today.toFixed(0)} €`} />
        <Stat label={t("owner.thisWeek")} value={`${data.revenue.week.toFixed(0)} €`} />
        <Stat label={t("owner.thisMonth")} value={`${data.revenue.month.toFixed(0)} €`} />
      </div>

      <h2 className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wide text-[#a8a6a0]">{t("owner.totalJobs")}</h2>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label={t("owner.totalJobs")} value={data.jobs.total} />
        <Stat label={t("owner.completedCount")} value={data.jobs.completed} accent="text-emerald-400" />
        <Stat label={t("owner.inProgressCount")} value={data.jobs.inProgress} accent="text-blue-400" />
        <Stat label={t("owner.cancelledCount")} value={data.jobs.cancelled} accent="text-red-400" />
      </div>

      <h2 className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wide text-[#a8a6a0]">{t("owner.totalCustomers")}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t("owner.totalCustomers")} value={data.customers.total} />
        <Stat label={t("owner.newCustomers")} value={data.customers.new} />
        <Stat label={t("owner.returningCustomers")} value={data.customers.returning} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#a8a6a0]">{t("owner.popularServices")}</h2>
          {data.services.popular.length === 0 ? (
            <Empty text={t("owner.noDataYet")} />
          ) : (
            <div className="flex flex-col gap-2">
              {data.services.popular.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-[#2a2a2e] bg-[#141416] p-3 text-sm">
                  <span>{lang === "me" ? p.service?.nameMe : p.service?.nameEn}</span>
                  <span className="text-[#a8a6a0]">
                    {p.jobCount} jobs · {p.revenue.toFixed(0)} €
                  </span>
                </div>
              ))}
              <div className="mt-2 text-sm text-[#a8a6a0]">
                {t("owner.avgJobValue")}: {data.services.avgJobValue.toFixed(0)} €
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#a8a6a0]">{t("owner.todaysWorkload")}</h2>
          {data.operations.currentJobs.length === 0 ? (
            <Empty text={t("owner.noDataYet")} />
          ) : (
            <div className="flex flex-col gap-2">
              {data.operations.currentJobs.map((j) => (
                <div key={j.id} className="rounded-lg border border-[#2a2a2e] bg-[#141416] p-3 text-sm">
                  <p>
                    {j.appointment.customer.name} · {j.vehicle.make} {j.vehicle.model}
                  </p>
                  <p className="text-[#a8a6a0]">{lang === "me" ? j.service.nameMe : j.service.nameEn}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-lg border border-[#2a2a2e] bg-[#141416] p-5">
      <p className={`text-2xl font-semibold ${accent ?? "text-[#f4f2ec]"}`}>{value}</p>
      <p className="mt-1 text-sm text-[#a8a6a0]">{label}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-[#2a2a2e] p-4 text-sm text-[#a8a6a0]">{text}</p>;
}
