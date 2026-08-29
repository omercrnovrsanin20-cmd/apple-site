"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface VehicleHistory {
  vehicle: { make: string; model: string; year: number; licensePlate: string | null; customer: { name: string; email: string } };
  workOrders: { id: number; status: string; notes: string | null; service: { nameEn: string; nameMe: string } }[];
  photos: { id: string; url: string; category: string }[];
  requests: { id: string; status: string; preferredDate: string; service: { nameEn: string; nameMe: string } }[];
}

export default function StaffVehicleHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const { t, lang } = useI18n();
  const [data, setData] = useState<VehicleHistory | null>(null);

  useEffect(() => {
    apiFetch<VehicleHistory>(`/api/staff/vehicles/${id}`).then(setData);
  }, [id]);

  if (!data) return <div className="px-6 py-16 text-[#5b6472]">{t("common.loading")}</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">
        {data.vehicle.make} {data.vehicle.model}
      </h1>
      <p className="text-[#5b6472]">
        {data.vehicle.year} {data.vehicle.licensePlate ? `· ${data.vehicle.licensePlate}` : ""} · {data.vehicle.customer.name} (
        {data.vehicle.customer.email})
      </p>

      <h2 className="mt-8 mb-2 text-sm font-semibold uppercase text-[#5b6472]">{t("staff.vehicleHistory")}</h2>
      <div className="flex flex-col gap-2">
        {data.workOrders.map((wo) => (
          <Link
            key={wo.id}
            href={`/staff/workorders/${wo.id}`}
            className="flex items-center justify-between rounded-lg border border-[#e2e5ea] bg-white p-4 hover:border-[#2563eb]"
          >
            <p>
              {t("staff.jobNumber")} #{wo.id} · {lang === "me" ? wo.service.nameMe : wo.service.nameEn}
            </p>
            <StatusBadge status={wo.status} />
          </Link>
        ))}
      </div>

      {data.photos.length > 0 && (
        <>
          <h2 className="mt-8 mb-2 text-sm font-semibold uppercase text-[#5b6472]">{t("common.photos")}</h2>
          <div className="flex flex-wrap gap-2">
            {data.photos.map((p) => (
              <img key={p.id} src={`/api/files/${p.url}`} alt={p.category} className="h-20 w-20 rounded object-cover" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
