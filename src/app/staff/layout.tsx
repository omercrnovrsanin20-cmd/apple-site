import { StaffNav } from "@/components/staff/StaffNav";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-[#0b0b0c] text-[#f4f2ec]">
      <StaffNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
