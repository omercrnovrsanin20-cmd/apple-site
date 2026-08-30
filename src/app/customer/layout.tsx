import { CustomerNav } from "@/components/customer/CustomerNav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-[#0b0b0c] text-[#f4f2ec]">
      <CustomerNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[#2a2a2e] px-6 py-8 text-center text-xs text-[#6f6d68]">
        © {new Date().getFullYear()} Detailing — Montenegro
      </footer>
    </div>
  );
}
