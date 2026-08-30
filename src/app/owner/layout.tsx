import { OwnerNav } from "@/components/owner/OwnerNav";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-[#0b0b0c] text-[#f4f2ec]">
      <OwnerNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
