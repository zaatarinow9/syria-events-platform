"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Files, 
  LogOut, 
  Menu, 
  X, 
  AlertTriangle 
} from "lucide-react";

export default function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
    { href: "/admin/requests", label: "إدارة الطلبات", icon: Files },
  ];

  return (
    <>
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40 shadow-sm" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#073D35] rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-[#C8A75A] font-bold text-lg leading-none mt-1">و</span>
                </div>
                <span className="text-gray-900 font-bold text-xl tracking-tight hidden sm:block">
                  إدارة <span className="text-[#073D35]">وينكم؟</span>
                </span>
              </Link>
              
              <nav className="hidden md:flex gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                        isActive
                          ? "bg-[#073D35]/10 text-[#073D35] shadow-sm border border-[#073D35]/10"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="hidden md:flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl transition-colors border border-red-100"
              >
                <LogOut className="w-4 h-4" />
                تسجيل خروج
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-[#073D35] transition-colors bg-gray-50 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="p-4 flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    isActive ? "bg-[#073D35]/10 text-[#073D35]" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
            <div className="h-px bg-gray-100 my-2"></div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsLogoutModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 w-full text-red-600 bg-red-50 px-4 py-3 rounded-xl font-bold"
            >
              <LogOut className="w-5 h-5" />
              تسجيل خروج
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-gray-100 transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-red-50/50">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">تسجيل الخروج</h3>
            <p className="text-center text-gray-500 mb-8 font-medium">
              هل أنت متأكد أنك تريد تسجيل الخروج من لوحة الإدارة؟ ستحتاج لإدخال بياناتك مرة أخرى للعودة.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                disabled={isLoggingOut}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoggingOut ? "جاري الخروج..." : "نعم، خروج"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}