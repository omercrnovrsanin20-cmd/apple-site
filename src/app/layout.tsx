import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin", "latin-ext"] });
const playfair = Playfair_Display({ variable: "--font-display", subsets: ["latin", "latin-ext"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Detailing",
  description: "Premium automotive detailing management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="me" className={`${inter.variable} ${playfair.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[--background] text-[--foreground]">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
