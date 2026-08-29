"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface Photo {
  id: string;
  category: string;
  url: string;
}
interface WorkOrder {
  id: number;
  status: string;
  service: { nameEn: string; nameMe: string };
  photos: Photo[];
}
interface VehicleDetail {
  vehicle: { id: string; make: string; model: string; year: number; licensePlate: string | null };
  workOrders: WorkOrder[];
  photos: Photo[];
}

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const { t, lang } = useI18n();
  const [data, setData] = useState<VehicleDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ make: "", model: "", year: "", licensePlate: "" });

  function load() {
    apiFetch<VehicleDetail>(`/api/customer/vehicles/${id}`).then((r) => {
      setData(r);
      setForm({
        make: r.vehicle.make,
        model: r.vehicle.model,
        year: String(r.vehicle.year),
        licensePlate: r.vehicle.licensePlate ?? "",
      });
    });
  }

  useEffect(load, [id]);

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    await apiFetch(`/api/customer/vehicles/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...form, year: Number(form.year) }),
    });
    setEditing(false);
    load();
  }

  if (!data) return <div className="px-6 py-16 text-[#a8a6a0]">{t("common.loading")}</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {!editing ? (
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl">
            {data.vehicle.make} {data.vehicle.model}
          </h1>
          <button onClick={() => setEditing(true)} className="text-sm text-[#c8a24a] hover:underline">
            {t("common.edit")}
          </button>
        </div>
      ) : (
        <form onSubmit={saveEdit} className="grid gap-3 sm:grid-cols-2">
          <input className="input-dark" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
          <input className="input-dark" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <input
            className="input-dark"
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
          <input
            className="input-dark"
            value={form.licensePlate}
            onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
          />
          <button className="rounded-full bg-[#c8a24a] px-5 py-2 text-sm font-medium text-black">{t("common.save")}</button>
        </form>
      )}
      <p className="mt-1 text-[#a8a6a0]">
        {data.vehicle.year} {data.vehicle.licensePlate ? `· ${data.vehicle.licensePlate}` : ""}
      </p>

      <h2 className="font-display mt-10 text-xl">{t("nav.history")}</h2>
      <div className="mt-4 flex flex-col gap-4">
        {data.workOrders.length === 0 && <p className="text-[#a8a6a0]">{t("customer.noHistory")}</p>}
        {data.workOrders.map((wo) => (
          <div key={wo.id} className="rounded-lg border border-[#2a2a2e] bg-[#141416] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display">{lang === "me" ? wo.service.nameMe : wo.service.nameEn}</h3>
              <StatusBadge status={wo.status} />
            </div>
            {wo.photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {wo.photos.map((p) => (
                  <img
                    key={p.id}
                    src={`/api/files/${p.url}`}
                    alt={p.category}
                    className="h-20 w-20 rounded object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
