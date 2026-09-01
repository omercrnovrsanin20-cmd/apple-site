"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function CustomerHome() {
  const { t } = useI18n();

  return (
    <div>
      <section className="relative overflow-hidden px-6 py-28 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-[#c8a24a]">Beograd · Srbija</p>
        <h1 className="font-display mx-auto mt-6 max-w-3xl text-4xl leading-tight sm:text-6xl">
          {t("customer.heroTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[#a8a6a0]">{t("customer.heroSubtitle")}</p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/customer/requests/new"
            className="rounded-full bg-[#c8a24a] px-8 py-3 text-sm font-medium text-black transition hover:bg-[#e8d29a]"
          >
            {t("customer.heroCta")}
          </Link>
          <Link
            href="/customer/services"
            className="rounded-full border border-[#2a2a2e] px-8 py-3 text-sm text-[#f4f2ec] transition hover:border-[#c8a24a]"
          >
            {t("nav.services")}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
        {[
          { title: "Paint Correction", titleMe: "Korekcija laka" },
          { title: "Ceramic Coating", titleMe: "Keramička zaštita" },
          { title: "Interior Detailing", titleMe: "Detailing enterijera" },
        ].map((s) => (
          <div key={s.title} className="rounded-lg border border-[#2a2a2e] bg-[#141416] p-6">
            <div className="mb-4 h-32 rounded-md bg-gradient-to-br from-[#2a2a2e] to-[#1c1c1f]" />
            <h3 className="font-display text-lg">{s.titleMe}</h3>
          </div>
        ))}
      </section>
    </div>
  );
}
