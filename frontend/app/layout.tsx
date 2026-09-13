import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI ORGANIZATION NULL POINTERS INC.",
  description: "Virtual AI Organization Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-mono" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f4ece1] text-[#2a2521] selection:bg-amber-400 selection:text-slate-950 font-mono" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
