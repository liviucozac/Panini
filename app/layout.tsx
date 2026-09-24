import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const font = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = { title: "Sandvișuri de sâmbătă", description: "Comenzi de sandvișuri pentru drumeție" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#22402B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className={font.className}>{children}</body>
    </html>
  );
}
