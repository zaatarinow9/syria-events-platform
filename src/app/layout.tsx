import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

// استدعاء خط كايرو الرسمي لضمان دعمه على كل الأجهزة
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصة وينكم للفعاليات المدنية",
  description: "المنصة المستقلة الأولى لتنظيم ونشر الفعاليات المدنية في سوريا",
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
      {/* تطبيق الخط كلاسياً يمنع مشاكل الجوالات */}
      <body className={`${cairo.className} bg-[#F9FAFB] text-[#111827] antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}