"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";

interface Photo {
  id: string;
  category: string;
  url: string;
}
interface Appointment {
  id: string;
  date: string;
  vehicle: { make: string; model: string };
  service: { nameEn: string; nameMe: string };
  status: string;
  workOrder: { photos: Photo[] } | null;
}

export default function HistoryPage() {
  const { t, lang } = useI18n();
  const [completed, setCompleted] = useState<Appointment[] | null>(null);

  useEffect(() => {
    apiFetch<{ appointments: Appointment[] }>("/api/customer/appointments").then((r) =>
      setCompleted(r.appointments.filter((a) => a.status === "COMPLETED"))
    );
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl">{t("nav.history")}</h1>
      <div className="mt-8 flex flex-col gap-6">
        {completed?.length === 0 && <p className="text-[#a8a6a0]">{t("customer.noHistory")}</p>}
        {completed?.map((a) => {
          const before = a.workOrder?.photos.filter((p) => p.category === "BEFORE") ?? [];
          const after = a.workOrder?.photos.filter((p) => p.category === "AFTER") ?? [];
          return (
            <div key={a.id} className="rounded-lg border border-[#2a2a2e] bg-[#141416] p-5">
              <p className="font-display">{lang === "me" ? a.service.nameMe : a.service.nameEn}</p>
              <p className="mt-1 text-sm text-[#a8a6a0]">
                {a.vehicle.make} {a.vehicle.model} · {a.date}
              </p>
              {(before.length > 0 || after.length > 0) && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2 text-xs uppercase text-[#a8a6a0]">{t("customer.beforeAfter").split(" / ")[0]}</p>
                    <div className="flex flex-wrap gap-2">
                      {before.map((p) => (
                        <img key={p.id} src={`/api/files/${p.url}`} alt="" className="h-20 w-20 rounded object-cover" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase text-[#a8a6a0]">{t("customer.beforeAfter").split(" / ")[1]}</p>
                    <div className="flex flex-wrap gap-2">
                      {after.map((p) => (
                        <img key={p.id} src={`/api/files/${p.url}`} alt="" className="h-20 w-20 rounded object-cover" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
