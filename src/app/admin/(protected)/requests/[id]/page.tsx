// ID: ADMIN_DETAILS_GEO_REVIEW
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import StatusBadge from "@/components/admin/StatusBadge";
import RequestActions from "@/components/admin/RequestActions";
import { ArrowRight, User, Calendar, MapPin, Users, FileCheck, Clock, Building2, Trophy, Navigation } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const LocationPicker = dynamic(() => import("@/components/shared/LocationPicker"), { ssr: false });

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: request, error } = await supabase.from("permit_requests").select("*").eq("id", id).single();
  if (error || !request) return notFound();

  const approvalDocs = request.approval_documents || [];
  const imageUrls = approvalDocs.map((path: string) => path.startsWith('http') ? path : supabase.storage.from("request-files").getPublicUrl(path).data.publicUrl);

  // الرابط الدقيق المضمون
  const mapsLink = request.latitude && request.longitude 
    ? `https://www.google.com/maps?q=${request.latitude},${request.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.governorate + " " + request.location)}`;

  return (
    <div dir="rtl" className="space-y-8 pb-20">
      <div className="flex justify-between gap-4">
        <div>
          <Link href="/admin/requests" className="flex items-center gap-2 text-gray-500 font-bold mb-4"><ArrowRight className="w-4 h-4" /> العودة للطلبات</Link>
          <div className="flex gap-4"><h1 className="text-3xl font-bold">{request.event_title}</h1><StatusBadge status={request.status} /></div>
        </div>
        <RequestActions requestId={request.id} currentStatus={request.status} isPublic={request.is_public} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2rem] border p-8">
            <h2 className="text-xl font-bold text-[#073D35] mb-6 flex gap-2 border-b pb-4"><Trophy className="w-5 h-5 text-[#C8A75A]" /> تفاصيل الفعالية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
              <InfoItem icon={Calendar} label="تاريخ الفعالية" value={format(new Date(request.event_date), "dd MMMM yyyy", { locale: ar })} />
              <InfoItem icon={Clock} label="التوقيت" value={`من ${request.start_time} إلى ${request.end_time}`} />
              <InfoItem icon={MapPin} label="المحافظة" value={`${request.governorate} - ${request.city}`} />
              <InfoItem icon={Users} label="العدد المتوقع" value={`${request.expected_attendees} شخص`} />
            </div>

            <div className="mt-8 border border-gray-200 rounded-xl p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">مكان التجمع الدقيق (الدبوس)</h3>
                <a href={mapsLink} target="_blank" className="flex items-center gap-2 bg-[#073D35] text-white px-4 py-2 rounded-lg text-sm font-bold"><Navigation className="w-4 h-4"/> فتح الخرائط</a>
              </div>
              <p className="text-gray-700 font-medium mb-4">الوصف النصي: {request.location}</p>
              {request.latitude && request.longitude ? (
                <div className="pointer-events-none opacity-80 h-[250px] overflow-hidden rounded-xl">
                  <LocationPicker onLocationSelect={() => {}} defaultLat={request.latitude} defaultLng={request.longitude} readOnly={true} />
                </div>
              ) : (
                <p className="text-red-500 font-bold text-sm">المستخدم لم يحدد الموقع على الخريطة.</p>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t"><h3 className="font-bold mb-2">الهدف:</h3><p>{request.event_goal}</p></div>
          </section>

          <section className="bg-white rounded-[2rem] border p-8">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">الوثائق المرفوعة</h2>
            {imageUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {imageUrls.map((url: string, i: number) => <a key={i} href={url} target="_blank" className="aspect-[3/4] block bg-gray-100 rounded-xl overflow-hidden border"><img src={url} className="w-full h-full object-cover"/></a>)}
              </div>
            ) : <div className="py-12 text-center text-gray-400 font-bold border-2 border-dashed rounded-xl">لا توجد وثائق</div>}
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-[2rem] border p-8">
            <h2 className="font-bold text-[#073D35] mb-6 border-b pb-4">مقدم الطلب</h2>
            <div className="space-y-4 font-bold">
              <p className="text-gray-500 text-sm">الاسم: <span className="text-gray-900">{request.full_name}</span></p>
              <p className="text-gray-500 text-sm">الهاتف: <span className="text-gray-900" dir="ltr">{request.phone}</span></p>
              <p className="text-gray-500 text-sm">الإيميل: <span className="text-gray-900">{request.email}</span></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex gap-3"><div className="p-2 bg-[#073D35]/5 rounded-lg"><Icon className="w-4 h-4 text-[#073D35]" /></div><div><p className="text-xs font-bold text-gray-400">{label}</p><p className="text-sm font-bold text-gray-800">{value}</p></div></div>
  );
}