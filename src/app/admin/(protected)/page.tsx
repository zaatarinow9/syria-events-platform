import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  MapPin
} from "lucide-react";

// تعريف نوع البيانات لتجنب أخطاء TypeScript
interface RecentRequest {
  id: string;
  request_number: string;
  event_title: string;
  governorate: string;
  status: string;
  created_at: string;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // جلب الإحصائيات عبر Promise.all لتكون سريعة جداً
  const [
    { count: totalCount },
    { count: pendingCount },
    { count: publishedCount },
    { count: rejectedCount },
    { data: recentRequests }
  ] = await Promise.all([
    supabase.from("permit_requests").select("*", { count: "exact", head: true }),
    supabase.from("permit_requests").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("permit_requests").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("permit_requests").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("permit_requests").select("id, request_number, event_title, governorate, status, created_at").order("created_at", { ascending: false }).limit(5)
  ]);

  const statCards = [
    { title: "إجمالي الطلبات", value: totalCount || 0, icon: FileText, color: "bg-blue-50 text-blue-600", borderColor: "border-blue-100" },
    { title: "قيد المراجعة", value: pendingCount || 0, icon: Clock, color: "bg-yellow-50 text-yellow-600", borderColor: "border-yellow-100" },
    { title: "الطلبات المنشورة", value: publishedCount || 0, icon: CheckCircle, color: "bg-green-50 text-green-600", borderColor: "border-green-100" },
    { title: "الطلبات المرفوضة", value: rejectedCount || 0, icon: XCircle, color: "bg-red-50 text-red-600", borderColor: "border-red-100" },
  ];

  return (
    <div dir="rtl" className="space-y-10">
      
      {/* رأس الصفحة */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بك في لوحة الإدارة 👋</h1>
        <p className="text-gray-500 font-medium">نظرة عامة على حالة طلبات الفعاليات في المنصة.</p>
      </div>

      {/* الكروت الإحصائية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-white rounded-3xl p-6 border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
              <div className={`absolute top-0 left-0 w-1.5 h-full ${stat.color.split(' ')[0]} opacity-50`}></div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-50`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-bold mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* آخر الطلبات */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">أحدث الطلبات الواردة</h2>
            <p className="text-sm text-gray-500 mt-1">آخر 5 طلبات تم إرسالها عبر المنصة.</p>
          </div>
          <Link 
            href="/admin/requests" 
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#073D35] hover:text-[#C8A75A] transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
          >
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-sm text-gray-500">
                <th className="p-4 font-bold">الرقم المرجعي</th>
                <th className="p-4 font-bold">الفعالية</th>
                <th className="p-4 font-bold">الموقع</th>
                <th className="p-4 font-bold">الحالة</th>
                <th className="p-4 font-bold text-left">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentRequests && recentRequests.length > 0 ? (
                (recentRequests as RecentRequest[]).map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                        {req.request_number}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900">{req.event_title}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {req.governorate}
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={req.status} /></td>
                    <td className="p-4 text-left">
                      <Link 
                        href={`/admin/requests/${req.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-[#073D35] bg-[#073D35]/5 hover:bg-[#073D35] hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        تفاصيل
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    لا توجد طلبات حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* زر الموبايل للذهاب لكل الطلبات */}
        <div className="p-4 border-t border-gray-100 sm:hidden">
          <Link 
            href="/admin/requests" 
            className="flex w-full items-center justify-center gap-2 text-sm font-bold text-[#073D35] bg-gray-50 px-4 py-3 rounded-xl border border-gray-200"
          >
            عرض كل الطلبات
          </Link>
        </div>
      </div>
    </div>
  );
}