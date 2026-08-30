"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface ChecklistItem {
  id: string;
  labelEn: string;
  labelMe: string;
  completed: boolean;
}
interface Photo {
  id: string;
  category: string;
  url: string;
}
interface Assignment {
  staff: { id: string; name: string };
}
interface WorkOrderDetail {
  id: number;
  status: string;
  notes: string | null;
  vehicle: { make: string; model: string; year: number; licensePlate: string | null };
  service: { nameEn: string; nameMe: string };
  checklistItems: ChecklistItem[];
  photos: Photo[];
  appointment: { date: string; time: string; customer: { name: string; email: string; phone: string | null } };
  assignments: Assignment[];
}

const FLOW = ["CONFIRMED", "CAR_ARRIVED", "IN_PROGRESS", "QUALITY_CHECK", "READY", "COMPLETED"];

export default function StaffWorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const { t, lang } = useI18n();
  const [wo, setWo] = useState<WorkOrderDetail | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState<"BEFORE" | "DURING" | "AFTER">("BEFORE");
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const [claiming, setClaiming] = useState(false);

  function load() {
    apiFetch<{ workOrder: WorkOrderDetail }>(`/api/staff/workorders/${id}`).then((r) => {
      setWo(r.workOrder);
      setNotes(r.workOrder.notes ?? "");
    });
  }
  useEffect(load, [id]);
  useEffect(() => {
    apiFetch<{ session: { id: string; name: string } }>("/api/auth/staff/me").then((r) => setMe(r.session));
  }, []);

  async function advance() {
    setBusy(true);
    try {
      await apiFetch(`/api/staff/workorders/${id}/advance`, { method: "POST" });
      load();
    } finally {
      setBusy(false);
    }
  }

  async function claimJob() {
    setClaiming(true);
    try {
      await apiFetch(`/api/staff/workorders/${id}/claim`, { method: "POST" });
      load();
    } finally {
      setClaiming(false);
    }
  }

  async function saveNotes() {
    await apiFetch(`/api/staff/workorders/${id}`, { method: "PATCH", body: JSON.stringify({ notes }) });
    load();
  }

  async function toggleItem(itemId: string, completed: boolean) {
    await apiFetch(`/api/staff/workorders/${id}/checklist/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    });
    load();
  }

  async function uploadPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const form = new FormData();
    form.set("category", category);
    Array.from(files).forEach((f) => form.append("photos", f));
    await apiFetch(`/api/staff/workorders/${id}/photos`, { method: "POST", body: form });
    e.target.value = "";
    load();
  }

  if (!wo) return <div className="px-6 py-16 text-[#a8a6a0]">{t("common.loading")}</div>;

  const currentIndex = FLOW.indexOf(wo.status);
  const nextStatus = FLOW[currentIndex + 1];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {t("staff.jobNumber")} #{wo.id}
        </h1>
        <StatusBadge status={wo.status} />
      </div>

      <div className="mt-4 rounded-lg border border-[#2a2a2e] bg-[#141416] p-4 text-sm">
        <p className="font-medium">{wo.appointment.customer.name}</p>
        <p className="text-[#a8a6a0]">
          {wo.appointment.customer.email} {wo.appointment.customer.phone ? `· ${wo.appointment.customer.phone}` : ""}
        </p>
        <p className="mt-2">
          {wo.vehicle.make} {wo.vehicle.model} ({wo.vehicle.year}) {wo.vehicle.licensePlate ?? ""}
        </p>
        <p className="text-[#a8a6a0]">{lang === "me" ? wo.service.nameMe : wo.service.nameEn}</p>
        <p className="text-[#a8a6a0]">
          {wo.appointment.date} · {wo.appointment.time}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-[#2a2a2e] bg-[#141416] p-4 text-sm">
        <span className="text-[#a8a6a0]">{t("staff.assignedStaff")}:</span>
        {wo.assignments.length === 0 ? (
          <span className="text-[#a8a6a0]">{t("staff.noStaffAssigned")}</span>
        ) : (
          <span>{wo.assignments.map((a) => a.staff.name).join(", ")}</span>
        )}
        {me && !wo.assignments.some((a) => a.staff.id === me.id) && (
          <button
            onClick={claimJob}
            disabled={claiming}
            className="ml-auto rounded-lg bg-[#c8a24a] px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {t("staff.claimJob")}
          </button>
        )}
      </div>

      {nextStatus && (
        <button
          onClick={advance}
          disabled={busy}
          className="mt-4 rounded-lg bg-[#1c1c1f] px-6 py-2.5 text-sm font-medium text-[#f4f2ec] border border-[#2a2a2e] disabled:opacity-50"
        >
          {t("staff.advanceStatus")} → {t(`statuses.${nextStatus}`)}
        </button>
      )}

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase text-[#a8a6a0]">{t("staff.checklist")}</h2>
        <div className="flex flex-col gap-1 rounded-lg border border-[#2a2a2e] bg-[#141416] p-3">
          {wo.checklistItems.map((item) => (
            <label key={item.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[#1c1c1f]">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={(e) => toggleItem(item.id, e.target.checked)}
                className="h-4 w-4"
              />
              <span className={item.completed ? "text-[#a8a6a0] line-through" : ""}>
                {lang === "me" ? item.labelMe : item.labelEn}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase text-[#a8a6a0]">{t("common.photos")}</h2>
        <div className="flex items-center gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="input-light">
            <option value="BEFORE">{t("staff.uploadBefore")}</option>
            <option value="DURING">{t("staff.uploadDuring")}</option>
            <option value="AFTER">{t("staff.uploadAfter")}</option>
          </select>
          <input type="file" accept="image/*" multiple onChange={uploadPhotos} className="text-sm" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {wo.photos.map((p) => (
            <div key={p.id} className="text-center">
              <img src={`/api/files/${p.url}`} alt={p.category} className="h-24 w-24 rounded object-cover" />
              <p className="mt-1 text-[10px] uppercase text-[#a8a6a0]">{p.category}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase text-[#a8a6a0]">{t("staff.addNote")}</h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-light w-full min-h-24" />
        <button onClick={saveNotes} className="mt-2 rounded-lg border border-[#2a2a2e] px-4 py-2 text-sm">
          {t("common.save")}
        </button>
      </section>
    </div>
  );
}
