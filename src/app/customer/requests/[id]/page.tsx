"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface RequestDetail {
  id: string;
  preferredDate: string;
  preferredTime: string;
  description: string | null;
  status: string;
  declineReason: string | null;
  vehicle: { make: string; model: string; year: number };
  service: { nameEn: string; nameMe: string };
  photos: { id: string; url: string }[];
  appointment: {
    date: string;
    time: string;
    status: string;
    workOrder: { status: string; photos: { id: string; url: string; category: string }[] } | null;
  } | null;
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const { t, lang } = useI18n();
  const [request, setRequest] = useState<RequestDetail | null>(null);

  useEffect(() => {
    apiFetch<{ request: RequestDetail }>(`/api/customer/requests/${id}`).then((r) => setRequest(r.request));
  }, [id]);

  if (!request) return <div className="px-6 py-16 text-[#a8a6a0]">{t("common.loading")}</div>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">{lang === "me" ? request.service.nameMe : request.service.nameEn}</h1>
        <StatusBadge status={request.status} />
      </div>
      <p className="mt-2 text-[#a8a6a0]">
        {request.vehicle.make} {request.vehicle.model} ({request.vehicle.year})
      </p>
      <p className="mt-1 text-[#a8a6a0]">
        {t("common.date")}: {request.preferredDate} · {t("common.time")}: {request.preferredTime}
      </p>
      {request.description && <p className="mt-4 text-sm text-[#f4f2ec]">{request.description}</p>}

      {request.status === "DECLINED" && request.declineReason && (
        <p className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {t("customer.declineReason")}: {request.declineReason}
        </p>
      )}

      {request.photos.length > 0 && (
        <>
          <h2 className="font-display mt-8 text-lg">{t("common.photos")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {request.photos.map((p) => (
              <img key={p.id} src={`/api/files/${p.url}`} alt="" className="h-24 w-24 rounded object-cover" />
            ))}
          </div>
        </>
      )}

      {request.appointment?.workOrder && (
        <div className="mt-8 rounded-lg border border-[#2a2a2e] bg-[#141416] p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display">{t("nav.workOrders")}</h3>
            <StatusBadge status={request.appointment.workOrder.status} />
          </div>
          {request.appointment.workOrder.photos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {request.appointment.workOrder.photos.map((p) => (
                <div key={p.id} className="text-center">
                  <img src={`/api/files/${p.url}`} alt={p.category} className="h-20 w-20 rounded object-cover" />
                  <p className="mt-1 text-[10px] uppercase text-[#a8a6a0]">{p.category}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
