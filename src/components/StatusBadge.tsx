"use client";

import { useI18n } from "@/lib/i18n";

const COLORS: Record<string, string> = {
  REQUESTED: "bg-amber-500/15 text-amber-400",
  UNDER_REVIEW: "bg-blue-500/15 text-blue-400",
  CONFIRMED: "bg-emerald-500/15 text-emerald-400",
  DECLINED: "bg-red-500/15 text-red-400",
  COMPLETED: "bg-violet-500/15 text-violet-400",
  CANCELLED: "bg-zinc-500/15 text-zinc-400",
  CAR_ARRIVED: "bg-cyan-500/15 text-cyan-400",
  IN_PROGRESS: "bg-blue-500/15 text-blue-400",
  QUALITY_CHECK: "bg-orange-500/15 text-orange-400",
  READY: "bg-emerald-500/15 text-emerald-400",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${COLORS[status] ?? "bg-zinc-500/15 text-zinc-400"}`}>
      {t(`statuses.${status}`)}
    </span>
  );
}
