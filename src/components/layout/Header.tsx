import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-[#073D35]" />
          <span className="font-bold text-lg text-gray-900">منصة الفعاليات السورية</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-[#C8A75A] transition-colors">الرئيسية</Link>
          <Link href="/events" className="hover:text-[#C8A75A] transition-colors">الفعاليات</Link>
          <Link 
            href="/create-request" 
            className="bg-[#073D35] hover:bg-[#073D35]/90 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm font-bold"
          >
            إنشاء طلب
          </Link>
        </nav>
      </div>
    </header>
  );
}