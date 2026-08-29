"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { apiFetch, ApiError } from "@/lib/api";
import { FormField } from "@/components/FormField";

interface Vehicle {
  id: string;
  make: string;
  model: string;
}
interface Service {
  id: string;
  nameEn: string;
  nameMe: string;
  durationMinutes: number;
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={null}>
      <NewRequestForm />
    </Suspense>
  );
}

function NewRequestForm() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [serviceId, setServiceId] = useState(searchParams.get("serviceId") ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<{ vehicles: Vehicle[] }>("/api/customer/vehicles").catch(() => ({ vehicles: [] })),
      apiFetch<{ services: Service[] }>("/api/services"),
    ]).then(([v, s]) => {
      setVehicles(v.vehicles);
      setServices(s.services);
      if (v.vehicles.length > 0) setVehicleId((cur) => cur || v.vehicles[0].id);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!vehicleId) {
      setError(t("customer.noVehicles"));
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.set("vehicleId", vehicleId);
      form.set("serviceId", serviceId);
      form.set("preferredDate", date);
      form.set("preferredTime", time);
      form.set("description", description);
      if (files) Array.from(files).forEach((f) => form.append("photos", f));

      await apiFetch("/api/customer/requests", { method: "POST", body: form });
      setSuccess(true);
      setTimeout(() => router.push("/customer/requests"), 1200);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl">{t("customer.heroCta")}</h1>

      {success ? (
        <p className="mt-8 rounded-lg border border-emerald-700 bg-emerald-950/40 p-6 text-emerald-300">
          {t("customer.requestSubmitted")}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <FormField label={t("customer.selectVehicle")}>
            <select className="input-dark" required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="" disabled>
                {t("customer.selectVehicle")}
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model}
                </option>
              ))}
            </select>
          </FormField>
          {vehicles.length === 0 && <p className="text-xs text-amber-400">{t("customer.noVehicles")}</p>}

          <FormField label={t("customer.selectService")}>
            <select className="input-dark" required value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="" disabled>
                {t("customer.selectService")}
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === "me" ? s.nameMe : s.nameEn}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label={t("customer.preferredDate")}>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                className="input-dark"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormField>
            <FormField label={t("customer.preferredTime")}>
              <input type="time" required className="input-dark" value={time} onChange={(e) => setTime(e.target.value)} />
            </FormField>
          </div>

          <FormField label={t("customer.describeRequest")}>
            <textarea
              className="input-dark min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <FormField label={t("customer.uploadPhotos")}>
            <input
              type="file"
              accept="image/*"
              multiple
              className="text-sm text-[#a8a6a0]"
              onChange={(e) => setFiles(e.target.files)}
            />
          </FormField>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || vehicles.length === 0}
            className="mt-2 rounded-full bg-[#c8a24a] px-6 py-3 text-sm font-medium text-black transition hover:bg-[#e8d29a] disabled:opacity-50"
          >
            {t("customer.submitRequest")}
          </button>
        </form>
      )}
    </div>
  );
}
