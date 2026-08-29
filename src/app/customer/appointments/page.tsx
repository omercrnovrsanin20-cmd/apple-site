"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  vehicle: { make: string; model: string };
  service: { nameEn: string; nameMe: string };
  workOrder: { status: string } | null;
}

export default function AppointmentsPage() {
  const { t, lang } = useI18n();
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);

  useEffect(() => {
    apiFetch<{ appointments: Appointment[] }>("/api/customer/appointments").then((r) => setAppointments(r.appointments));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl">{t("nav.myAppointments")}</h1>
      <div className="mt-8 flex flex-col gap-3">
        {appointments?.length === 0 && <p className="text-[#a8a6a0]">{t("customer.noAppointments")}</p>}
        {appointments?.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border border-[#2a2a2e] bg-[#141416] p-5">
            <div>
              <p className="font-display">{lang === "me" ? a.service.nameMe : a.service.nameEn}</p>
              <p className="mt-1 text-sm text-[#a8a6a0]">
                {a.vehicle.make} {a.vehicle.model} · {a.date} {a.time}
              </p>
            </div>
            <StatusBadge status={a.workOrder ? a.workOrder.status : a.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
