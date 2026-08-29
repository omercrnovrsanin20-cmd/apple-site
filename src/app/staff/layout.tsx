import { StaffNav } from "@/components/staff/StaffNav";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-[#f5f6f8] text-[#12151c]">
      <StaffNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
