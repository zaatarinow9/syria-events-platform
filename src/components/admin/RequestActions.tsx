"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { STATUS_MAP } from "@/lib/constants/admin";

export default function RequestActions({ requestId, currentStatus, isPublic }: any) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (updates: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        router.refresh(); // لتحديث البيانات في السيرفر فوراً
      } else {
        alert("حدث خطأ أثناء التحديث");
      }
    } catch (error) {
      alert("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* تغيير الحالة */}
      <div className="relative group">
        <select
          value={currentStatus}
          disabled={loading}
          onChange={(e) => handleUpdate({ status: e.target.value })}
          className="appearance-none bg-white border border-gray-200 px-6 py-3 pr-10 rounded-xl font-bold text-sm outline-none focus:border-[#C8A75A] cursor-pointer shadow-sm hover:bg-gray-50 transition-colors"
        >
          {Object.entries(STATUS_MAP).map(([key, val]: any) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Check className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* زر النشر/الإخفاء */}
      <button
        onClick={() => handleUpdate({ is_public: !isPublic })}
        disabled={loading}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
          isPublic 
            ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100" 
            : "bg-green-600 text-white hover:bg-green-700 shadow-green-600/20"
        }`}
      >
        {isPublic ? (
          <><EyeOff className="w-4 h-4" /> إخفاء عن العامة</>
        ) : (
          <><Eye className="w-4 h-4" /> نشر للجمهور</>
        )}
      </button>
    </div>
  );
}