"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
}

export default function ServicesPage() {
  const { t, lang } = useI18n();
  const [services, setServices] = useState<Service[] | null>(null);

  useEffect(() => {
    apiFetch<{ services: Service[] }>("/api/services").then((r) => setServices(r.services));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-3xl">{t("nav.services")}</h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {services === null && <p className="text-[#a8a6a0]">{t("common.loading")}</p>}
        {services?.map((s) => (
          <div key={s.id} className="rounded-lg border border-[#2a2a2e] bg-[#141416] p-6">
            <div className="mb-4 h-40 rounded-md bg-gradient-to-br from-[#2a2a2e] to-[#1c1c1f]" />
            <h2 className="font-display text-xl">{lang === "me" ? s.nameMe : s.nameEn}</h2>
            <p className="mt-2 text-sm text-[#a8a6a0]">{lang === "me" ? s.descriptionMe : s.descriptionEn}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[#c8a24a]">
                {s.priceMin}
                {s.priceMax ? `–${s.priceMax}` : "+"} €
              </span>
              <span className="text-[#a8a6a0]">
                {s.durationMinutes} {t("common.min")}
              </span>
            </div>
            <Link
              href={`/customer/requests/new?serviceId=${s.id}`}
              className="mt-5 inline-block rounded-full border border-[#c8a24a] px-5 py-2 text-xs text-[#c8a24a] transition hover:bg-[#c8a24a] hover:text-black"
            >
              {t("customer.heroCta")}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
