export function FormField({
  label,
  children,
  dim = "text-[#a8a6a0]",
}: {
  label: string;
  children: React.ReactNode;
  dim?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${dim}`}>
      {label}
      {children}
    </label>
  );
}
