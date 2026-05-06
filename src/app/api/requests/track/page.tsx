"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function TrackPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 6) {
      router.push(`/track/${code.toUpperCase()}`);
    } else {
      alert("يرجى إدخال كود الطلب الصحيح (6 أحرف/أرقام).");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F9FAFB] p-4" dir="rtl">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 text-center">
        <div className="w-20 h-20 bg-[#073D35]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-[#073D35]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">تتبع طلبك</h1>
        <p className="text-gray-500 font-medium mb-8">
          أدخل الكود المرجعي للطلب للتحقق من الحالة وإرفاق صور الموافقة.
        </p>

        <form onSubmit={handleSearch} className="space-y-6">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="مثال: A7K9X2"
            maxLength={6}
            dir="ltr"
            className="w-full text-center text-3xl font-mono tracking-[0.5em] uppercase px-4 py-5 rounded-2xl border-2 border-gray-200 focus:border-[#C8A75A] focus:ring-4 focus:ring-[#C8A75A]/20 outline-none transition-all"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#073D35] hover:bg-[#052e28] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#073D35]/20"
          >
            بحث عن الطلب <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#C8A75A]" />
          المنصة آمنة ومخصصة لمقدمي الطلبات فقط.
        </div>
      </div>
    </div>
  );
}