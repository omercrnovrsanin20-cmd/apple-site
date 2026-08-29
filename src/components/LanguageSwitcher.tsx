"use client";

import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { lang, setLang } = useI18n();

  const base = "flex items-center rounded-full border text-xs font-medium overflow-hidden";
  const theme =
    variant === "dark"
      ? "border-white/15 bg-white/5"
      : "border-black/10 bg-black/[.02]";

  return (
    <div className={`${base} ${theme}`} role="group" aria-label="Language">
      <button
        onClick={() => setLang("me")}
        className={`px-3 py-1.5 transition ${lang === "me" ? "bg-[#c8a24a] text-black" : ""}`}
      >
        🇲🇪 CG
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 transition ${lang === "en" ? "bg-[#c8a24a] text-black" : ""}`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
