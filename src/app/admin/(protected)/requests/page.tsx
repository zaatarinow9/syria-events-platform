import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import RequestFilters from "@/components/admin/RequestFilters";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Eye, MapPin, SearchX, ShieldAlert, User } from "lucide-react";

interface PermitRequest {
  id: string;
  request_number: string;
  event_title: string;
  full_name: string;
  governorate: string;
  status: string;
  is_public: boolean;
  created_at: string;
}

export default async function AdminRequestsPage({ searchParams }: any) {
  // فك الوعود لتتوافق مع Next.js 15 بشكل سليم
  const params = await searchParams;
  const q = params?.q;
  const status = params?.status;

  const supabase = await createClient();
  
  // بناء الاستعلام وجلب الطلبات من قاعدة البيانات
  let query = supabase
    .from("permit_requests")
    .select("id, request_number, event_title, full_name, governorate, status, is_public, created_at")
    .order("created_at", { ascending: false });

  if (q && typeof q === 'string') {
    query = query.or(`request_number.ilike.%${q}%,event_title.ilike.%${q}%,governorate.ilike.%${q}%`);
  }

  if (status && typeof status === 'string') {
    query = query.eq("status", status);
  }

  const { data: requests } = await query;

  return (
    <div dir="rtl" className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الطلبات</h1>
          <p className="text-gray-500 font-medium">استعرض كافة طلبات التراخيص، فلترها، وعدّل حالاتها.</p>
        </div>
      </div>

      <RequestFilters />

      <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-5 font-bold whitespace-nowrap">رقم الطلب</th>
                <th className="p-5 font-bold">الفعالية / المُقدم</th>
                <th className="p-5 font-bold">الموقع</th>
                <th className="p-5 font-bold">تاريخ التقديم</th>
                <th className="p-5 font-bold">الحالة</th>
                <th className="p-5 font-bold text-center">النشر</th>
                <th className="p-5 font-bold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests && requests.length > 0 ? (
                requests.map((req: PermitRequest) => (
                  <tr key={req.id} className="hover:bg-[#F4F7F6]/50 transition-colors">
                    <td className="p-5">
                      <span className="font-mono text-sm font-bold text-[#073D35] bg-[#073D35]/5 px-3 py-1.5 rounded-xl border border-[#073D35]/10">
                        {req.request_number}
                      </span>
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-gray-900 mb-1 line-clamp-1">
                        {req.event_title}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <User className="w-3.5 h-3.5 text-[#C8A75A]" />
                        <span>{req.full_name}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {req.governorate}
                      </div>
                    </td>
                    <td className="p-5 text-sm text-gray-600 font-medium whitespace-nowrap">
                      {format(new Date(req.created_at), "dd MMM yyyy", { locale: ar })}
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="p-5 text-center">
                      {req.is_public ? (
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-50 text-green-600 border border-green-200 shadow-sm" title="منشور للعامة">
                          <Eye className="w-5 h-5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 text-gray-400 border border-gray-200" title="مخفي عن العامة">
                          <ShieldAlert className="w-5 h-5" />
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-left whitespace-nowrap">
                      <Link 
                        href={`/admin/requests/${req.id}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#073D35] hover:bg-[#052e28] rounded-xl shadow-lg shadow-[#073D35]/10 transition-all hover:-translate-y-0.5"
                      >
                        <Eye className="w-4 h-4" />
                        مراجعة
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                        <SearchX className="w-12 h-12 text-gray-300" />
                      </div>
                      <p className="text-xl font-bold text-gray-700 mb-2">لا توجد طلبات حالياً</p>
                      <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        بمجرد أن يقوم شخص بإرسال طلب جديد، سيظهر هنا مباشرة.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}