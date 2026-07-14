import type { Metadata } from "next";
import "./globals.css"; // <-- THIS IS THE CRITICAL LINE

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
    <html lang="en" className="bg-[#0A0A0A] text-white selection:bg-[#FF6600] selection:text-black">
      <body>{children}</body>
    </html>
  );
}