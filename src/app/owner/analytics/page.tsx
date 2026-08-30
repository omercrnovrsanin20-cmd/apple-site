"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { MiniLineChart, MiniBarChart } from "@/components/owner/MiniChart";

interface AnalyticsData {
  revenueOverTime: { date: string; value: number }[];
  jobsOverTime: { date: string; value: number }[];
  customersOverTime: { date: string; value: number }[];
  appointmentStatusBreakdown: Record<string, number>;
  requestStatusBreakdown: Record<string, number>;
  hasData: boolean;
}

export default function OwnerAnalyticsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    apiFetch<AnalyticsData>("/api/owner/analytics").then(setData);
  }, []);

  if (!data) return <div className="px-6 py-16 text-[#a8a6a0]">{t("common.loading")}</div>;

  if (!data.hasData) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-semibold">{t("nav.analytics")}</h1>
        <p className="mt-8 rounded-lg border border-dashed border-[#2a2a2e] p-8 text-center text-[#a8a6a0]">
          {t("owner.noDataYet")}
        </p>
      </div>
    );
  }

  const statusBars = Object.entries(data.appointmentStatusBreakdown).map(([label, value]) => ({ label, value }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.analytics")}</h1>

      <Section title={t("owner.revenueOverTime")}>
        <MiniLineChart data={data.revenueOverTime} color="#c8a24a" />
      </Section>

      <Section title={t("owner.jobsOverTime")}>
        <MiniLineChart data={data.jobsOverTime} color="#e8d29a" />
      </Section>

      <Section title={t("owner.appointmentStatusBreakdown")}>
        {statusBars.length > 0 ? <MiniBarChart data={statusBars} /> : <Empty text={t("owner.noDataYet")} />}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#a8a6a0]">{title}</h2>
      <div className="rounded-lg border border-[#2a2a2e] bg-[#141416] p-5">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-[#a8a6a0]">{text}</p>;
}
