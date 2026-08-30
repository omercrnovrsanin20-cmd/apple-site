"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface RequestDetail {
  id: string;
  status: string;
  preferredDate: string;
  preferredTime: string;
  description: string | null;
  declineReason: string | null;
  customer: { name: string; email: string; phone: string | null };
  vehicle: { id: string; make: string; model: string; year: number; licensePlate: string | null };
  service: { nameEn: string; nameMe: string; durationMinutes: number };
  photos: { id: string; url: string }[];
  appointment: { workOrder: { id: number } | null } | null;
}

interface AiSuggestions {
  potentialServices: string[];
  possibleConditions: string[];
  note: string;
}

export default function StaffRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const { t, lang } = useI18n();
  const router = useRouter();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ai, setAi] = useState<AiSuggestions | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch<{ request: RequestDetail }>(`/api/staff/requests/${id}`).then((r) => setRequest(r.request));
  }
  useEffect(load, [id]);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/staff/requests/${id}/confirm`, { method: "POST" });
      load();
    } catch {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  async function decline() {
    if (declineReason.trim().length < 3) {
      setError(t("staff.declineReasonRequired"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/staff/requests/${id}/decline`, { method: "POST", body: JSON.stringify({ reason: declineReason }) });
      setShowDecline(false);
      load();
    } catch {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  async function loadAi() {
    const res = await apiFetch<{ suggestions: AiSuggestions }>("/api/staff/ai-suggest", {
      method: "POST",
      body: JSON.stringify({ requestId: id }),
    });
    setAi(res.suggestions);
  }

  if (!request) return <div className="px-6 py-16 text-[#a8a6a0]">{t("common.loading")}</div>;

  const canAct = request.status === "REQUESTED" || request.status === "UNDER_REVIEW";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("staff.openRequest")}</h1>
        <StatusBadge status={request.status} />
      </div>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card title={t("staff.contactInfo")}>
          <p>{request.customer.name}</p>
          <p className="text-[#a8a6a0]">{request.customer.email}</p>
          {request.customer.phone && <p className="text-[#a8a6a0]">{request.customer.phone}</p>}
        </Card>
        <Card title={t("staff.vehicleInfo")}>
          <p>
            {request.vehicle.make} {request.vehicle.model} ({request.vehicle.year})
          </p>
          {request.vehicle.licensePlate && <p className="text-[#a8a6a0]">{request.vehicle.licensePlate}</p>}
          <button
            onClick={() => router.push(`/staff/vehicles/${request.vehicle.id}`)}
            className="mt-1 text-xs text-[#c8a24a] hover:underline"
          >
            {t("staff.vehicleHistory")}
          </button>
        </Card>
        <Card title={t("staff.requestedService")}>
          <p>{lang === "me" ? request.service.nameMe : request.service.nameEn}</p>
          <p className="text-[#a8a6a0]">
            {t("staff.requestedDate")}: {request.preferredDate} · {t("staff.requestedTime")}: {request.preferredTime}
          </p>
          <p className="text-[#a8a6a0]">
            {t("customer.estimatedDuration")}: {request.service.durationMinutes} {t("common.min")}
          </p>
        </Card>
        <Card title={t("common.description")}>
          <p className="text-[#a8a6a0]">{request.description || "—"}</p>
        </Card>
      </section>

      {request.photos.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase text-[#a8a6a0]">{t("common.photos")}</h2>
          <div className="flex flex-wrap gap-2">
            {request.photos.map((p) => (
              <img key={p.id} src={`/api/files/${p.url}`} alt="" className="h-28 w-28 rounded object-cover" />
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <button onClick={loadAi} className="text-xs text-[#c8a24a] hover:underline">
          {t("staff.aiSuggestions")}
        </button>
        {ai && (
          <div className="mt-2 rounded-lg border border-dashed border-[#2a2a2e] bg-[#141416] p-4 text-sm">
            <p className="font-medium">Potential services:</p>
            <p className="text-[#a8a6a0]">{ai.potentialServices.join(", ")}</p>
            {ai.possibleConditions.length > 0 && (
              <>
                <p className="mt-2 font-medium">Possible vehicle condition:</p>
                <p className="text-[#a8a6a0]">{ai.possibleConditions.join(", ")}</p>
              </>
            )}
            <p className="mt-2 text-xs italic text-[#a8a6a0]">{ai.note}</p>
          </div>
        )}
      </section>

      {request.status === "DECLINED" && request.declineReason && (
        <p className="mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {t("customer.declineReason")}: {request.declineReason}
        </p>
      )}

      {request.appointment?.workOrder && (
        <button
          onClick={() => router.push(`/staff/workorders/${request.appointment!.workOrder!.id}`)}
          className="mt-6 rounded-lg bg-[#1c1c1f] px-5 py-2.5 text-sm text-[#f4f2ec] border border-[#2a2a2e]"
        >
          {t("nav.workOrders")} →
        </button>
      )}

      {canAct && (
        <div className="mt-8 flex flex-col gap-3">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!showDecline ? (
            <div className="flex gap-3">
              <button
                onClick={confirm}
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {t("staff.confirmRequest")}
              </button>
              <button
                onClick={() => setShowDecline(true)}
                disabled={busy}
                className="rounded-lg border border-red-800 px-6 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/40"
              >
                {t("staff.declineRequest")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                className="input-light min-h-20"
                placeholder={t("customer.declineReason")}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
              <div className="flex gap-3">
                <button onClick={decline} disabled={busy} className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white">
                  {t("common.confirm")}
                </button>
                <button onClick={() => setShowDecline(false)} className="rounded-lg border border-[#2a2a2e] px-6 py-2.5 text-sm">
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#2a2a2e] bg-[#141416] p-4 text-sm">
      <h3 className="mb-1 text-xs font-semibold uppercase text-[#a8a6a0]">{title}</h3>
      {children}
    </div>
  );
}
