"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { FormField } from "@/components/FormField";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string | null;
}

export default function VehiclesPage() {
  const { t } = useI18n();
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiFetch<{ vehicles: Vehicle[] }>("/api/customer/vehicles")
      .then((r) => setVehicles(r.vehicles))
      .catch(() => setVehicles([]));
  }

  useEffect(load, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/api/customer/vehicles", {
        method: "POST",
        body: JSON.stringify({ make, model, year: Number(year), licensePlate: licensePlate || undefined }),
      });
      setMake("");
      setModel("");
      setYear("");
      setLicensePlate("");
      setShowForm(false);
      load();
    } catch {
      setError(t("common.error"));
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{t("nav.myVehicles")}</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-full bg-[#c8a24a] px-5 py-2 text-sm font-medium text-black hover:bg-[#e8d29a]"
        >
          {t("customer.addVehicle")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-lg border border-[#2a2a2e] bg-[#141416] p-6 sm:grid-cols-2">
          <FormField label={t("customer.make")}>
            <input required value={make} onChange={(e) => setMake(e.target.value)} className="input-dark" />
          </FormField>
          <FormField label={t("customer.model")}>
            <input required value={model} onChange={(e) => setModel(e.target.value)} className="input-dark" />
          </FormField>
          <FormField label={t("customer.year")}>
            <input
              required
              type="number"
              min={1950}
              max={new Date().getFullYear() + 1}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="input-dark"
            />
          </FormField>
          <FormField label={t("customer.licensePlate")}>
            <input value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} className="input-dark" />
          </FormField>
          {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
          <button type="submit" className="sm:col-span-2 mt-2 rounded-full bg-[#c8a24a] px-6 py-2.5 text-sm font-medium text-black">
            {t("common.save")}
          </button>
        </form>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {vehicles?.length === 0 && <p className="text-[#a8a6a0]">{t("customer.noVehicles")}</p>}
        {vehicles?.map((v) => (
          <Link
            key={v.id}
            href={`/customer/vehicles/${v.id}`}
            className="rounded-lg border border-[#2a2a2e] bg-[#141416] p-5 transition hover:border-[#c8a24a]"
          >
            <h3 className="font-display text-lg">
              {v.make} {v.model}
            </h3>
            <p className="mt-1 text-sm text-[#a8a6a0]">
              {v.year} {v.licensePlate ? `· ${v.licensePlate}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
