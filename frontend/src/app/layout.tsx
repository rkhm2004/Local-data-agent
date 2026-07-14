import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeriGuard Framework Terminal",
  description: "Autonomous Agent UI Module",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-brand-black text-white selection:bg-brand-orange selection:text-black">
      <body>{children}</body>
    </html>
  );
}