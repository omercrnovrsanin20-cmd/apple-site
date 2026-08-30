"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";

interface Service {
  id: string;
  nameEn: string;
  nameMe: string;
  descriptionEn: string;
  descriptionMe: string;
  durationMinutes: number;
  priceMin: number;
  priceMax: number | null;
  active: boolean;
}

const BLANK_SERVICE: Partial<Service> = {
  nameEn: "",
  nameMe: "",
  descriptionEn: "",
  descriptionMe: "",
  durationMinutes: 60,
  priceMin: 0,
  priceMax: undefined,
};

export default function OwnerServicesPage() {
  const { t } = useI18n();
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Service>>({});
  const [savedFlash, setSavedFlash] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<Partial<Service>>(BLANK_SERVICE);

  function load() {
    apiFetch<{ services: Service[] }>("/api/owner/services").then((r) => setServices(r.services));
  }
  useEffect(load, []);

  function startEdit(s: Service) {
    setEditingId(s.id);
    setForm(s);
  }

  async function addService() {
    const { nameEn, nameMe, descriptionEn, descriptionMe, durationMinutes, priceMin, priceMax } = newForm;
    await apiFetch("/api/owner/services", {
      method: "POST",
      body: JSON.stringify({ nameEn, nameMe, descriptionEn, descriptionMe, durationMinutes, priceMin, priceMax }),
    });
    setAdding(false);
    setNewForm(BLANK_SERVICE);
    load();
  }

  async function save() {
    if (!editingId) return;
    const { nameEn, nameMe, descriptionEn, descriptionMe, durationMinutes, priceMin, priceMax } = form;
    await apiFetch(`/api/owner/services/${editingId}`, {
      method: "PATCH",
      body: JSON.stringify({ nameEn, nameMe, descriptionEn, descriptionMe, durationMinutes, priceMin, priceMax }),
    });
    setEditingId(null);
    setSavedFlash(editingId);
    load();
    setTimeout(() => setSavedFlash(null), 2500);
  }

  async function toggleActive(s: Service) {
    await apiFetch(`/api/owner/services/${s.id}`, { method: "PATCH", body: JSON.stringify({ active: !s.active }) });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("owner.manageServices")}</h1>
      <p className="mt-1 text-sm text-[#a8a6a0]">
        Changes here update the shared database immediately and are reflected in the Customer Portal.
      </p>

      {adding ? (
        <div className="mt-6 flex flex-col gap-2 rounded-lg border border-[#c8a24a] bg-[#141416] p-4">
          <input className="input-owner" value={newForm.nameEn ?? ""} onChange={(e) => setNewForm({ ...newForm, nameEn: e.target.value })} placeholder="Name (EN)" />
          <input className="input-owner" value={newForm.nameMe ?? ""} onChange={(e) => setNewForm({ ...newForm, nameMe: e.target.value })} placeholder="Naziv (ME)" />
          <textarea className="input-owner" value={newForm.descriptionEn ?? ""} onChange={(e) => setNewForm({ ...newForm, descriptionEn: e.target.value })} placeholder="Description (EN)" />
          <textarea className="input-owner" value={newForm.descriptionMe ?? ""} onChange={(e) => setNewForm({ ...newForm, descriptionMe: e.target.value })} placeholder="Opis (ME)" />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              className="input-owner"
              value={newForm.durationMinutes ?? 0}
              onChange={(e) => setNewForm({ ...newForm, durationMinutes: Number(e.target.value) })}
              placeholder={t("common.duration")}
            />
            <input
              type="number"
              className="input-owner"
              value={newForm.priceMin ?? 0}
              onChange={(e) => setNewForm({ ...newForm, priceMin: Number(e.target.value) })}
              placeholder="Min €"
            />
            <input
              type="number"
              className="input-owner"
              value={newForm.priceMax ?? ""}
              onChange={(e) => setNewForm({ ...newForm, priceMax: Number(e.target.value) })}
              placeholder="Max €"
            />
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={addService} className="rounded-lg bg-[#c8a24a] px-4 py-2 text-sm font-medium text-black">
              {t("common.save")}
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setNewForm(BLANK_SERVICE);
              }}
              className="rounded-lg border border-[#2a2a2e] px-4 py-2 text-sm"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-6 rounded-lg bg-[#c8a24a] px-4 py-2 text-sm font-medium text-black"
        >
          {t("owner.addService")}
        </button>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {services.map((s) => (
          <div key={s.id} className="rounded-lg border border-[#2a2a2e] bg-[#141416] p-4">
            {editingId === s.id ? (
              <div className="flex flex-col gap-2">
                <input className="input-owner" value={form.nameEn ?? ""} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Name (EN)" />
                <input className="input-owner" value={form.nameMe ?? ""} onChange={(e) => setForm({ ...form, nameMe: e.target.value })} placeholder="Naziv (ME)" />
                <textarea className="input-owner" value={form.descriptionEn ?? ""} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} placeholder="Description (EN)" />
                <textarea className="input-owner" value={form.descriptionMe ?? ""} onChange={(e) => setForm({ ...form, descriptionMe: e.target.value })} placeholder="Opis (ME)" />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    className="input-owner"
                    value={form.durationMinutes ?? 0}
                    onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                    placeholder={t("common.duration")}
                  />
                  <input
                    type="number"
                    className="input-owner"
                    value={form.priceMin ?? 0}
                    onChange={(e) => setForm({ ...form, priceMin: Number(e.target.value) })}
                    placeholder="Min €"
                  />
                  <input
                    type="number"
                    className="input-owner"
                    value={form.priceMax ?? ""}
                    onChange={(e) => setForm({ ...form, priceMax: Number(e.target.value) })}
                    placeholder="Max €"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={save} className="rounded-lg bg-[#c8a24a] px-4 py-2 text-sm font-medium text-black">
                    {t("common.save")}
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded-lg border border-[#2a2a2e] px-4 py-2 text-sm">
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {s.nameEn} / {s.nameMe}
                  </p>
                  <p className="text-sm text-[#a8a6a0]">
                    {s.priceMin}
                    {s.priceMax ? `–${s.priceMax}` : "+"} € · {s.durationMinutes} {t("common.min")}
                  </p>
                  {savedFlash === s.id && <p className="text-xs text-emerald-400">Saved — now live in Customer Portal.</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleActive(s)}
                    className={`rounded-full px-3 py-1 text-xs ${s.active ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-500/15 text-zinc-400"}`}
                  >
                    {s.active ? t("owner.active") : t("owner.inactive")}
                  </button>
                  <button onClick={() => startEdit(s)} className="text-sm text-[#c8a24a] hover:underline">
                    {t("common.edit")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
