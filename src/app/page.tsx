import Link from "next/link";

export default function GatewayPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#0b0b0c] text-[#f4f2ec] px-6 py-24">
      <p className="text-xs uppercase tracking-[0.35em] text-[#c8a24a]">Lustro Detailing</p>
      <h1 className="font-display mt-4 text-center text-4xl sm:text-5xl">Business Management Platform</h1>
      <p className="mt-4 max-w-xl text-center text-[#a8a6a0]">
        Three connected portals sharing one backend and one database.
      </p>
      <div className="mt-12 grid gap-4 sm:grid-cols-3 w-full max-w-3xl">
        <PortalCard href="/customer" title="Customer Portal" desc="Book appointments, manage vehicles, track jobs." />
        <PortalCard href="/staff" title="Staff Portal" desc="Review requests, run the calendar and work orders." />
        <PortalCard href="/owner" title="Owner Portal" desc="Business dashboard, analytics and settings." />
      </div>
    </div>
  );
}

function PortalCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-[#2a2a2e] bg-[#141416] p-6 transition hover:border-[#c8a24a]"
    >
      <h2 className="font-display text-xl text-[#f4f2ec] group-hover:text-[#c8a24a]">{title}</h2>
      <p className="mt-2 text-sm text-[#a8a6a0]">{desc}</p>
    </Link>
  );
}
