"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { STATUS_MAP } from "@/lib/constants/admin";

export default function RequestFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") || "";
  const currentStatus = searchParams.get("status") || "";

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    
    const params = new URLSearchParams(searchParams);
    if (q) params.set("q", q);
    else params.delete("q");
    
    router.push(`/admin/requests?${params.toString()}`);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (status) params.set("status", status);
    else params.delete("status");
    
    router.push(`/admin/requests?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/admin/requests");
  };

  const hasFilters = currentSearch || currentStatus;

  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 mb-6" dir="rtl">
      
      <form onSubmit={handleSearch} className="flex-1 relative">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          name="q"
          defaultValue={currentSearch}
          placeholder="بحث برقم الطلب، اسم الفعالية، المحافظة..."
          className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm focus:border-[#C8A75A] focus:ring-1 focus:ring-[#C8A75A] outline-none transition-all font-medium"
        />
      </form>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:w-56">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-10 pl-4 text-sm focus:border-[#C8A75A] focus:ring-1 focus:ring-[#C8A75A] outline-none appearance-none font-medium cursor-pointer"
          >
            <option value="">جميع الحالات</option>
            {Object.entries(STATUS_MAP).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 transition-colors"
            title="مسح الفلاتر"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}