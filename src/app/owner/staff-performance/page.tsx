"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";

type Period = "today" | "week" | "month" | "lastMonth" | "custom";

interface ServiceCount {
  nameEn: string;
  nameMe: string;
  count: number;
}
interface StaffPerf {
  id: string;
  name: string;
  email: string;
  active: boolean;
  totalJobs: number;
  completedJobs: number;
  services: ServiceCount[];
}

export default function OwnerStaffPerformancePage() {
  const { t, lang } = useI18n();
  const [period, setPeriod] = useState<Period>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [staff, setStaff] = useState<StaffPerf[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  function load() {
    const params = new URLSearchParams({ period });
    if (period === "custom" && customFrom && customTo) {
      params.set("from", customFrom);
      params.set("to", customTo);
    }
    apiFetch<{ staff: StaffPerf[] }>(`/api/owner/staff-performance?${params}`).then((r) => setStaff(r.staff));
  }

  useEffect(load, [period, customFrom, customTo]);

  const periods: { key: Period; label: string }[] = [
    { key: "today", label: t("owner.periodToday") },
    { key: "week", label: t("owner.periodWeek") },
    { key: "month", label: t("owner.periodMonth") },
    { key: "lastMonth", label: t("owner.periodLastMonth") },
    { key: "custom", label: t("owner.periodCustom") },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.staffPerformance")}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              period === p.key ? "bg-[#c8a24a] text-black" : "border border-[#2a2a2e] text-[#a8a6a0]"
            }`}
          >
            {p.label}
          </button>
        ))}
        {period === "custom" && (
          <div className="flex items-center gap-2">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="input-owner" />
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="input-owner" />
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {staff?.length === 0 && <p className="text-[#a8a6a0]">{t("common.noData")}</p>}
        {staff?.map((s) => (
          <div key={s.id} className="rounded-lg border border-[#2a2a2e] bg-[#141416] p-4">
            <button
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <p className="font-medium">
                  {s.name} {!s.active && <span className="text-xs text-zinc-500">({t("owner.inactive")})</span>}
                </p>
                <p className="text-sm text-[#a8a6a0]">
                  {t("owner.totalJobsWorked")}: {s.totalJobs} · {t("owner.completedJobsLabel")}: {s.completedJobs}
                </p>
              </div>
              <span className="text-xs text-[#c8a24a]">{t("owner.viewDetails")}</span>
            </button>
            {expanded === s.id && (
              <div className="mt-3 border-t border-[#2a2a2e] pt-3">
                <p className="mb-2 text-xs font-semibold uppercase text-[#a8a6a0]">{t("owner.servicesWorked")}</p>
                {s.services.length === 0 ? (
                  <p className="text-sm text-[#a8a6a0]">{t("owner.noJobsInPeriod")}</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {s.services.map((svc) => (
                      <div key={svc.nameEn} className="flex items-center justify-between text-sm">
                        <span>{lang === "me" ? svc.nameMe : svc.nameEn}</span>
                        <span className="text-[#a8a6a0]">{svc.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
