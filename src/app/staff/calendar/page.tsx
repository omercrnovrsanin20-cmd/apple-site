"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";

interface Appointment {
  id: string;
  date: string;
  time: string;
  customer: { name: string };
  vehicle: { make: string; model: string };
  service: { nameEn: string; nameMe: string };
  workOrder: { id: number; status: string } | null;
}
interface PendingRequest {
  id: string;
  preferredDate: string;
  preferredTime: string;
  customer: { name: string };
  vehicle: { make: string; model: string };
}

const STATUS_DOT: Record<string, string> = {
  CONFIRMED: "bg-emerald-500",
  CAR_ARRIVED: "bg-cyan-500",
  IN_PROGRESS: "bg-blue-500",
  QUALITY_CHECK: "bg-orange-500",
  READY: "bg-emerald-600",
  COMPLETED: "bg-violet-500",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function StaffCalendarPage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    apiFetch<{ appointments: Appointment[]; pendingRequests: PendingRequest[] }>("/api/staff/calendar").then((r) => {
      setAppointments(r.appointments);
      setPending(r.pendingRequests);
    });
  }, []);

  const byDate = useMemo(() => {
    const map = new Map<string, { appointments: Appointment[]; pending: PendingRequest[] }>();
    for (const a of appointments) {
      if (!map.has(a.date)) map.set(a.date, { appointments: [], pending: [] });
      map.get(a.date)!.appointments.push(a);
    }
    for (const p of pending) {
      if (!map.has(p.preferredDate)) map.set(p.preferredDate, { appointments: [], pending: [] });
      map.get(p.preferredDate)!.pending.push(p);
    }
    return map;
  }, [appointments, pending]);

  const firstOfMonth = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0

  const cells: (number | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = firstOfMonth.toLocaleDateString(lang === "me" ? "sr-Latn-ME" : "en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("nav.calendar")}</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))}
            className="rounded border border-[#2a2a2e] px-3 py-1 text-sm"
          >
            ←
          </button>
          <span className="w-40 text-center text-sm font-medium capitalize">{monthLabel}</span>
          <button
            onClick={() => setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))}
            className="rounded border border-[#2a2a2e] px-3 py-1 text-sm"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-xs text-[#a8a6a0]">
        {["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"].map((d) => (
          <div key={d} className="px-2 py-1 text-center font-medium">
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const dateStr = `${cursor.year}-${pad(cursor.month + 1)}-${pad(day)}`;
          const entry = byDate.get(dateStr);
          return (
            <div key={idx} className="min-h-24 rounded-lg border border-[#2a2a2e] bg-[#141416] p-2">
              <p className="text-right text-xs text-[#a8a6a0]">{day}</p>
              <div className="mt-1 flex flex-col gap-1">
                {entry?.pending.map((p) => (
                  <div key={p.id} onClick={() => router.push(`/staff/requests/${p.id}`)} className="cursor-pointer truncate rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300">
                    ● {p.customer.name}
                  </div>
                ))}
                {entry?.appointments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => a.workOrder && router.push(`/staff/workorders/${a.workOrder.id}`)}
                    className="cursor-pointer truncate rounded bg-[#2a2a2e] px-1.5 py-0.5 text-[10px] text-[#c8a24a]"
                  >
                    <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${a.workOrder ? STATUS_DOT[a.workOrder.status] : "bg-emerald-500"}`} />
                    {a.time} {a.customer.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
