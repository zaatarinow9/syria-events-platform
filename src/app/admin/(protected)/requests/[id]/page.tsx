import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import RequestActions from "@/components/admin/RequestActions";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  FileCheck,
  Clock,
  Trophy,
  Navigation,
  Image as ImageIcon
} from "lucide-react";
import LocationPickerWrapper from "@/components/shared/LocationPickerWrapper";

export default async function RequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: request, error } = await supabase
    .from("permit_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !request) return notFound();

  const approvalDocs = request.approval_documents || [];

  const imageUrls = approvalDocs.map((path: string) => {
    if (path.startsWith("http")) return path;
    return supabase.storage.from("request-files").getPublicUrl(path).data.publicUrl;
  });

  // معالجة رابط الشعار المرفوع (إن وجد)
  let campaignLogoUrl = null;
  if (request.campaign_image) {
    if (request.campaign_image.startsWith("http")) {
      campaignLogoUrl = request.campaign_image;
    } else {
      campaignLogoUrl = supabase.storage.from("request-files").getPublicUrl(request.campaign_image).data.publicUrl;
    }
  }

  const mapsLink =
    request.latitude && request.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=$${request.latitude},${request.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=$${encodeURIComponent(
          `${request.location || ""} ${request.governorate || ""}`
        )}`;

  // استخدام الصيغة الصحيحة للأرقام الإنجليزية
  const formattedDate = new Date(request.event_date).toLocaleDateString('ar-SY-u-nu-latn', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div dir="rtl" className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/requests"
            className="flex items-center gap-2 text-gray-500 hover:text-[#073D35] mb-4 font-bold"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للطلبات
          </Link>

          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {request.event_title}
            </h1>
            <StatusBadge status={request.status} />
          </div>

          <p className="text-gray-500 mt-1 font-medium">
            رقم المرجع:{" "}
            <span className="font-mono text-[#C8A75A] font-bold" dir="ltr">
              {request.request_number}
            </span>
          </p>
        </div>

        <RequestActions
          requestId={request.id}
          currentStatus={request.status}
          isPublic={request.is_public}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* قسم شعار الحملة (يظهر فقط إذا قام المستخدم برفعه) */}
          {campaignLogoUrl && (
            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-1/3 h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0 relative group">
                <img 
                  src={campaignLogoUrl} 
                  alt="شعار الحملة" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <a href={campaignLogoUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-all text-sm">
                  تكبير الصورة
                </a>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#073D35] mb-2 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#C8A75A]"/> شعار / صورة الفعالية المرفقة
                </h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  هذه الصورة قام برفعها منظم الفعالية لتكون غلافاً رئيسياً للحملة عند عرضها للجمهور.
                </p>
              </div>
            </section>
          )}

          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-[#073D35] mb-6 flex items-center gap-2 border-b pb-4">
              <Trophy className="w-5 h-5 text-[#C8A75A]" />
              تفاصيل الفعالية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
              <InfoItem
                icon={Calendar}
                label="تاريخ الفعالية"
                value={formattedDate}
                isLTR
              />

              <InfoItem
                icon={Clock}
                label="التوقيت"
                value={`من ${request.start_time} إلى ${request.end_time}`}
                isLTR
              />

              <InfoItem
                icon={MapPin}
                label="الموقع والنطاق"
                value={`${request.governorate} - ${request.city}`}
              />

              <InfoItem
                icon={Users}
                label="العدد المتوقع"
                value={`${request.expected_attendees} شخص`}
                isLTR
              />

              <InfoItem
                icon={FileCheck}
                label="نوع الفعالية"
                value={request.event_type}
              />

              <div className="flex items-start gap-3 md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
                <div className="p-2 bg-[#073D35]/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-[#073D35]" />
                </div>

                <div className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-bold text-gray-400">
                      مكان التجمع الدقيق
                    </p>

                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#073D35] hover:bg-[#052e28] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      فتح في خرائط جوجل
                    </a>
                  </div>

                  <p className="text-sm font-bold text-gray-800 mb-4">
                    {request.location}
                  </p>

                  {request.latitude && request.longitude ? (
                    <div className="pointer-events-none opacity-90 h-[250px] w-full overflow-hidden rounded-xl border border-gray-200">
                      <LocationPickerWrapper
                        defaultLat={Number(request.latitude)}
                        defaultLng={Number(request.longitude)}
                        readOnly={true}
                      />
                    </div>
                  ) : (
                    <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg border border-yellow-200 text-sm font-bold">
                      مقدم الطلب لم يقم بتحديد موقع دقيق على الخريطة.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">الهدف:</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
                {request.event_goal}
              </p>
            </div>

            {request.route && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <h3 className="font-bold text-gray-900 mb-2">خط السير:</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
                  {request.route}
                </p>
              </div>
            )}
          </section>

          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-[#073D35] mb-6 border-b pb-4">
              الوثائق المرفوعة (الموافقات)
            </h2>

            {imageUrls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {imageUrls.map((url: string, idx: number) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group block aspect-[3/4] overflow-hidden rounded-2xl border border-gray-200"
                  >
                    <img
                      src={url}
                      alt={`وثيقة ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity">
                      فتح الوثيقة للتكبير
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">
                لا توجد وثائق بعد. (ينتظر أن يقوم المنظم برفع الموافقة).
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-[#073D35] mb-6 border-b pb-4">
              مقدم الطلب / اللجنة المنظمة
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-xs text-gray-400 font-bold mb-1">الاسم الكامل</p>
                <p className="text-sm font-bold text-gray-900">{request.full_name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-bold mb-1">رقم الهاتف</p>
                <p className="text-sm font-bold text-gray-900 font-sans" dir="ltr">{request.phone}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-bold mb-1">البريد الإلكتروني</p>
                <p className="text-sm font-bold text-gray-900 font-sans" dir="ltr">{request.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-bold mb-1">الصفة والتنظيم</p>
                <p className="text-sm font-bold text-gray-900">
                  {request.submitter_role} 
                  {request.organization_name && ` (${request.organization_name})`}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// دالة مساعدة لعرض العناصر بشكل موحد
function InfoItem({
  icon: Icon,
  label,
  value,
  isLTR = false
}: {
  icon: any;
  label: string;
  value: string | number;
  isLTR?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-[#073D35]/5 rounded-lg shrink-0">
        <Icon className="w-5 h-5 text-[#073D35]" />
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 mb-0.5">{label}</p>
        <p className={`text-sm font-bold text-gray-800 ${isLTR ? 'font-sans' : ''}`} dir={isLTR ? "ltr" : "rtl"}>
          {value}
        </p>
      </div>
    </div>
  );
}