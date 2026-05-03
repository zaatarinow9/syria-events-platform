import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const thmanyah = localFont({
  src: [
    { path: "../fonts/thmanyah-regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/thmanyah-medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/thmanyah-semibold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/thmanyah-bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-thmanyah",
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصة الفعاليات المدنية السورية",
  description: "منصة مدنية مستقلة تساعد المنظمين على تجهيز طلبات الفعاليات والتجمعات السلمية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className={`${thmanyah.variable} bg-[#F9FAFB] text-[#111827] antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}