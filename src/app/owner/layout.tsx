import { OwnerNav } from "@/components/owner/OwnerNav";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-[#0d1117] text-[#eef2f6]">
      <OwnerNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
