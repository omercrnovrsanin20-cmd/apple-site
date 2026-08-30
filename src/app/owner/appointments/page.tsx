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
  customer: { name: string };
  vehicle: { make: string; model: string };
  service: { nameEn: string; nameMe: string; id: string };
  workOrder: { status: string; assignments: { staff: { id: string; name: string } }[] } | null;
}

export default function OwnerAppointmentsPage() {
  const { t, lang } = useI18n();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [status, setStatus] = useState("");

  function load() {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (customer) params.set("customer", customer);
    if (status) params.set("status", status);
    apiFetch<{ appointments: Appointment[] }>(`/api/owner/appointments?${params}`).then((r) => setAppointments(r.appointments));
  }

  useEffect(load, [date, customer, status]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("nav.appointments")}</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-owner" />
        <input
          placeholder={t("common.customer")}
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          className="input-owner"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-owner">
          <option value="">{t("common.status")}</option>
          <option value="CONFIRMED">{t("statuses.CONFIRMED")}</option>
          <option value="COMPLETED">{t("statuses.COMPLETED")}</option>
          <option value="CANCELLED">{t("statuses.CANCELLED")}</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-[#2a2a2e]">
        <table className="w-full text-sm">
          <thead className="bg-[#141416] text-left text-[#a8a6a0]">
            <tr>
              <th className="p-3">{t("common.date")}</th>
              <th className="p-3">{t("common.customer")}</th>
              <th className="p-3">{t("common.vehicle")}</th>
              <th className="p-3">{t("common.service")}</th>
              <th className="p-3">{t("staff.assignedStaff")}</th>
              <th className="p-3">{t("common.status")}</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t border-[#2a2a2e]">
                <td className="p-3">
                  {a.date} {a.time}
                </td>
                <td className="p-3">{a.customer.name}</td>
                <td className="p-3">
                  {a.vehicle.make} {a.vehicle.model}
                </td>
                <td className="p-3">{lang === "me" ? a.service.nameMe : a.service.nameEn}</td>
                <td className="p-3 text-[#a8a6a0]">
                  {a.workOrder && a.workOrder.assignments.length > 0
                    ? a.workOrder.assignments.map((asn) => asn.staff.name).join(", ")
                    : "—"}
                </td>
                <td className="p-3">
                  <StatusBadge status={a.workOrder ? a.workOrder.status : a.status} />
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-[#a8a6a0]">
                  {t("common.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
