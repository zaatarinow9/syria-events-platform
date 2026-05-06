import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import RequestFilters from "@/components/admin/RequestFilters";
import { Eye, MapPin, SearchX, ShieldAlert } from "lucide-react";

const arabicDateFormatter = new Intl.DateTimeFormat("ar", { day: "2-digit", month: "short", year: "numeric" });

interface SearchParams {
  q?: string;
  status?: string;
}

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

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  
  // بناء استعلام البحث والفلترة
  let query = supabase
    .from("permit_requests")
    .select("id, request_number, event_title, full_name, governorate, status, is_public, created_at")
    .order("created_at", { ascending: false });

  if (searchParams.q) {
    query = query.or(`request_number.ilike.%${searchParams.q}%,event_title.ilike.%${searchParams.q}%,governorate.ilike.%${searchParams.q}%`);
  }

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data: requests, error } = await query;

  return (
    <div dir="rtl" className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الطلبات</h1>
          <p className="text-gray-500 font-medium">استعرض كافة طلبات التراخيص، فلترها، وعدّل حالاتها.</p>
        </div>
      </div>

      {/* مكون الفلترة */}
      <RequestFilters />

      {/* الجدول */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-bold whitespace-nowrap">رقم الطلب</th>
                <th className="p-4 font-bold">الفعالية / المُقدم</th>
                <th className="p-4 font-bold whitespace-nowrap">الموقع</th>
                <th className="p-4 font-bold">تاريخ التقديم</th>
                <th className="p-4 font-bold">الحالة</th>
                <th className="p-4 font-bold text-center">الرؤية العامة</th>
                <th className="p-4 font-bold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests && requests.length > 0 ? (
                (requests as PermitRequest[]).map((req) => (
                  <tr key={req.id} className="hover:bg-[#F4F7F6] transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold text-gray-600 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        {req.request_number}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900 mb-1 line-clamp-1">{req.event_title}</p>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <UserIcon className="w-3 h-3" /> {req.full_name}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg inline-flex border border-gray-100">
                        <MapPin className="w-3.5 h-3.5 text-[#C8A75A]" />
                        {req.governorate}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium whitespace-nowrap">
                      {arabicDateFormatter.format(new Date(req.created_at))}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="p-4 text-center">
                      {req.is_public ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 border border-green-200" title="منشور للعامة">
                          <Eye className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 border border-gray-200" title="مخفي">
                          <ShieldAlert className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-left whitespace-nowrap">
                      <Link 
                        href={`/admin/requests/${req.id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#073D35] hover:bg-[#052e28] rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                      >
                        <Eye className="w-4 h-4" />
                        مراجعة
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <SearchX className="w-10 h-10 text-gray-300" />
                      </div>
                      <p className="text-lg font-bold text-gray-700 mb-1">لا توجد طلبات مطابقة</p>
                      <p className="text-sm">لم نعثر على أي طلبات تطابق شروط البحث أو الفلترة الحالية.</p>
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

// ايقونة صغيرة للمستخدم استخدمت داخل الجدول مع تعريف نوع صحيح
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}