import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import RequestActions from "@/components/admin/RequestActions";
import { ArrowRight, User, Calendar, MapPin, Users, FileCheck, Clock, Mail, Phone, Building2, Trophy } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: request, error } = await supabase
    .from("permit_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !request) return notFound();

  // تعديل منطق روابط الصور
  const approvalDocs = request.approval_documents || [];
  const imageUrls = approvalDocs.map((path: string) => {
    // نستخدم الملف الخام إذا كان رابطاً كاملاً، أو نولده من Supabase
    if (path.startsWith('http')) return path;
    return supabase.storage.from("request-files").getPublicUrl(path).data.publicUrl;
  });

  return (
    <div dir="rtl" className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin/requests" className="flex items-center gap-2 text-gray-500 hover:text-[#073D35] mb-4 font-bold">
            <ArrowRight className="w-4 h-4" /> العودة للطلبات
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{request.event_title}</h1>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-gray-500 mt-1 font-medium">رقم المرجع: <span className="font-mono text-[#C8A75A] font-bold">{request.request_number}</span></p>
        </div>
        <RequestActions requestId={request.id} currentStatus={request.status} isPublic={request.is_public} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-[#073D35] mb-6 flex items-center gap-2 border-b pb-4">
              <Trophy className="w-5 h-5 text-[#C8A75A]" /> تفاصيل الفعالية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
              <InfoItem icon={Calendar} label="تاريخ الفعالية" value={format(new Date(request.event_date), "dd MMMM yyyy", { locale: ar })} />
              <InfoItem icon={Clock} label="التوقيت" value={`من ${request.start_time} إلى ${request.end_time}`} />
              <InfoItem icon={MapPin} label="الموقع" value={`${request.governorate} - ${request.city}`} />
              <InfoItem icon={Building2} label="مكان التجمع" value={request.location} />
              <InfoItem icon={Users} label="العدد المتوقع" value={`${request.expected_attendees} شخص`} />
              <InfoItem icon={FileCheck} label="نوع الفعالية" value={request.event_type} />
            </div>
            <div className="mt-8 pt-6 border-t border-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">الهدف:</h3>
              <p className="text-gray-600 leading-relaxed">{request.event_goal}</p>
            </div>
          </section>

          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-[#073D35] mb-6 border-b pb-4">الوثائق المرفوعة</h2>
            {imageUrls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {imageUrls.map((url: string, idx: number) => (
                  <a key={idx} href={url} target="_blank" className="relative group block aspect-[3/4] overflow-hidden rounded-2xl border border-gray-200">
                    <img src={url} alt="وثيقة" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity">فتح الوثيقة</div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">لا توجد وثائق بعد</div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-[#073D35] mb-6 border-b pb-4">مقدم الطلب</h2>
            <div className="space-y-4 font-bold">
              <p className="text-sm text-gray-500">الاسم: <span className="text-gray-900">{request.full_name}</span></p>
              <p className="text-sm text-gray-500">الهاتف: <span className="text-gray-900">{request.phone}</span></p>
              <p className="text-sm text-gray-500">الإيميل: <span className="text-gray-900">{request.email}</span></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-[#073D35]/5 rounded-lg"><Icon className="w-4 h-4 text-[#073D35]" /></div>
      <div>
        <p className="text-xs font-bold text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}