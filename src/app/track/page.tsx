"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ShieldCheck, Fingerprint } from "lucide-react";
import Link from "next/link";

export default function TrackPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 6) {
      router.push(`/track/${code.toUpperCase()}`);
    } else {
      alert("يرجى إدخال كود الطلب الصحيح المكون من 6 أحرف أو أرقام.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4 relative overflow-hidden arabic-premium-text" dir="rtl">
      
      {/* الخلفية العلوية الفخمة المتوافقة مع الرئيسية */}
      <div className="absolute top-0 left-0 w-full h-80 bg-[#073D35] rounded-b-[3rem] md:rounded-b-[6rem] shadow-xl">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z' fill='%23ffffff' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* إضاءة ذهبية خفيفة في الخلفية */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-[#C8A75A] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>

      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-gray-100 text-center relative z-10 mt-10 transition-all hover:shadow-[#073D35]/10">
        
        {/* زر العودة للرئيسية */}
        <div className="absolute top-8 right-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#C8A75A] transition-colors">
            <ArrowRight className="w-4 h-4" /> الرئيسية
          </Link>
        </div>

        {/* أيقونة التتبع */}
        <div className="w-24 h-24 bg-gradient-to-br from-[#073D35]/5 to-[#C8A75A]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#073D35]/10 shadow-inner">
          <Fingerprint className="w-12 h-12 text-[#073D35]" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">تتبع حالة طلبك</h1>
        <p className="text-gray-500 font-medium mb-10 text-sm md:text-base leading-relaxed px-2">
          أدخل الكود المرجعي الذي حصلت عليه عند تقديم الطلب لمعرفة حالته الحالية أو لإرفاق الوثائق المطلوبة.
        </p>

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="relative group">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())} // تحويل تلقائي للأحرف الكبيرة
              placeholder="مثال: A7K9X2"
              maxLength={6}
              dir="ltr"
              // هنا تم حل المشكلة: placeholder:tracking-normal يمنع تباعد الأحرف في النص الإرشادي
              className="w-full text-center text-4xl md:text-5xl font-mono tracking-[0.3em] placeholder:tracking-normal placeholder:text-xl placeholder:font-sans placeholder:text-gray-300 uppercase px-4 py-8 rounded-2xl border-2 border-gray-100 bg-gray-50 text-[#073D35] focus:bg-white focus:border-[#C8A75A] focus:ring-4 focus:ring-[#C8A75A]/10 outline-none transition-all"
              required
            />
            <div className="absolute top-1/2 left-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Search className="w-6 h-6 text-[#C8A75A]" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#073D35] hover:bg-[#052e28] text-white font-bold text-lg py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#073D35]/20 hover:shadow-[#073D35]/40 hover:-translate-y-1"
          >
            بحث عن الطلب <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        </form>

        <div className="mt-10 pt-6 flex items-center justify-center gap-2 text-sm text-gray-500 font-bold bg-gray-50 py-4 rounded-xl border border-gray-100">
          <ShieldCheck className="w-5 h-5 text-[#C8A75A]" />
          المنصة آمنة ومخصصة لمقدمي الطلبات فقط.
        </div>
      </div>
    </div>
  );
}