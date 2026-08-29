"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string | null;
  customer: { name: string };
  workOrders: { id: number; service: { nameEn: string; nameMe: string } }[];
  photos: { id: string }[];
}

export default function OwnerVehiclesPage() {
  const { t } = useI18n();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    apiFetch<{ vehicles: Vehicle[] }>("/api/owner/vehicles").then((r) => setVehicles(r.vehicles));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.vehicles")}</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {vehicles.map((v) => (
          <div key={v.id} className="rounded-lg border border-[#263041] bg-[#151b25] p-4 text-sm">
            <p className="font-medium">
              {v.make} {v.model} ({v.year})
            </p>
            <p className="text-[#8a94a3]">
              {v.licensePlate ?? "—"} · {v.customer.name}
            </p>
            <p className="mt-1 text-xs text-[#8a94a3]">
              {v.workOrders.length} work order(s) · {v.photos.length} photo(s)
            </p>
          </div>
        ))}
        {vehicles.length === 0 && <p className="text-[#8a94a3]">{t("common.noData")}</p>}
      </div>
    </div>
  );
}
