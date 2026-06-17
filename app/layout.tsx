import type { Metadata } from "next";
import { QueryProvider } from "@/providers/query-provider";
import { MswProvider } from "@/providers/msw-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgileFlow",
  description: "Agile project management for modern teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <MswProvider>
          <QueryProvider>{children}</QueryProvider>
        </MswProvider>
      </body>
    </html>
  );
}
