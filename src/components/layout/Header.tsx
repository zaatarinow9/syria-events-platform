"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, PlusCircle } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
  { name: "الرئيسية", href: "/" },
  { name: "الفعاليات", href: "/events" },
  { name: "تتبع الطلب", href: "/track" }, // الرابط الجديد
];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 py-3"
          : "bg-white border-b border-gray-100 py-4"
      } arabic-premium-text`}
      dir="rtl"
    >
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-14">
        
        {/* الشعار الرسمي والثابت */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-24 h-10 md:w-32 md:h-12">
            <Image
              src="/logo.png"
              alt="وينكم؟"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* القائمة الرئيسية للشاشات */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-base font-bold transition-colors ${
                  isActive 
                    ? "text-[#073D35]" 
                    : "text-gray-600 hover:text-[#C8A75A]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <Link
            href="/create-request"
            className="flex items-center gap-2 bg-[#073D35] hover:bg-[#052e28] text-white px-6 py-2.5 rounded-lg transition-colors font-bold"
          >
            <PlusCircle className="w-5 h-5" />
            إنشاء طلب ترخيص
          </Link>
        </nav>

        {/* زر قائمة الموبايل */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-800 hover:text-[#073D35] transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* قائمة الموبايل */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-4 py-6 gap-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-base font-bold p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#073D35]/10 text-[#073D35]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="w-full h-px bg-gray-100 my-2"></div>
          <Link
            href="/create-request"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-[#073D35] text-white px-4 py-3 rounded-lg font-bold"
          >
            <PlusCircle className="w-5 h-5" />
            إنشاء طلب ترخيص
          </Link>
        </div>
      </div>
    </header>
  );
}