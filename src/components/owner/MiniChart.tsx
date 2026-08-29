"use client";

interface Point {
  date: string;
  value: number;
}

export function MiniLineChart({ data, color = "#4fd1c5" }: { data: Point[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 600;
  const h = 140;
  const step = w / Math.max(1, data.length - 1);

  const points = data.map((d, i) => `${i * step},${h - (d.value / max) * (h - 10) - 5}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} />
      {data.map((d, i) => (
        <circle key={d.date} cx={i * step} cy={h - (d.value / max) * (h - 10) - 5} r={2} fill={color} />
      ))}
    </svg>
  );
}

export function MiniBarChart({ data, color = "#8b7cf6" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2 text-xs">
          <span className="w-32 truncate text-[#8a94a3]">{d.label}</span>
          <div className="h-3 flex-1 rounded bg-[#1b2330]">
            <div className="h-3 rounded" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
          <span className="w-10 text-right text-[#eef2f6]">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
