"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowRight, 
  MapPin, 
  CalendarDays, 
  Clock, 
  Users, 
  Target, 
  Route, 
  Building2, 
  ShieldCheck,
  Share2,
  Link as LinkIcon,
  CheckCircle2,
  Navigation
} from "lucide-react";

const MOCK_EVENTS_DB = {
  "1": {
    id: "1",
    title: "حملة تشجير وتجميل المرافق العامة",
    type: "حملة تطوعية",
    status: "مقبول للنشر",
    governorate: "دمشق",
    city: "الربوة",
    location: "حديقة تشرين - المدخل الجنوبي",
    date: "15 أيار 2026",
    startTime: "09:00 صباحاً",
    endTime: "02:00 ظهراً",
    expectedAttendees: "150",
    goal: "تهدف هذه الحملة إلى زيادة المساحات الخضراء في الحديقة وتوعية المجتمع بأهمية الحفاظ على البيئة والمرافق العامة، بمشاركة شبابية واسعة لتنظيف وتشجير الممرات الرئيسية.",
    route: "التجمع عند الباب الجنوبي، ثم الانطلاق نحو الساحة الرئيسية وتوزع الفرق.",
    organizationName: "مبادرة دمشق الخضراء",
    submitterRole: "منسق الحملة",
    coordinates: [33.5138, 36.2765] as [number, number]
  },
  "2": {
    id: "2",
    title: "ندوة حوارية حول التنمية المستدامة",
    type: "ندوة / لقاء",
    status: "مقبول للنشر",
    governorate: "حلب",
    city: "مركز المدينة",
    location: "المركز الثقافي العربي",
    date: "22 أيار 2026",
    startTime: "05:00 عصراً",
    endTime: "08:00 مساءً",
    expectedAttendees: "200",
    goal: "مناقشة أهداف التنمية المستدامة وكيفية تطبيقها في إعادة إعمار البنية التحتية، مع استضافة خبراء ومختصين في المجال الاقتصادي والبيئي.",
    route: "",
    organizationName: "غرفة شباب حلب",
    submitterRole: "رئيس اللجنة المنظمة",
    coordinates: [36.2021, 37.1343] as [number, number]
  }
};

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const event = MOCK_EVENTS_DB[eventId as keyof typeof MOCK_EVENTS_DB];

  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 arabic-premium-text">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">الفعالية غير موجودة</h1>
        <Link href="/" className="text-[#C8A75A] font-bold hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  const shareText = `ندعوكم لحضور ${event.type}: "${event.title}" في ${event.governorate} بتاريخ ${event.date}. التفاصيل عبر الرابط:`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(currentUrl);
  const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${event.coordinates[0]},${event.coordinates[1]}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 arabic-premium-text" dir="rtl">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#C8A75A] transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة للخريطة
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#2F9E6D] bg-[#2F9E6D]/10 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border border-[#2F9E6D]/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {event.status}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#C8A75A]/10 rounded-br-full -z-0"></div>
          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 bg-[#073D35]/5 text-[#073D35] text-sm font-bold rounded-lg border border-[#073D35]/10 mb-4">
              {event.type}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {event.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-600 font-medium bg-gray-50 p-5 rounded-2xl border border-gray-100 inline-flex">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-[#C8A75A]" />
                <span>{event.governorate} - {event.city}</span>
              </div>
              <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5 text-[#C8A75A]" />
                <span>{event.date}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
              <h2 className="text-xl font-bold text-[#073D35] mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-[#C8A75A]" />
                هدف الفعالية والوصف العام
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium text-lg">
                {event.goal}
              </p>
            </section>

            {event.route && (
              <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-[#073D35] mb-6 flex items-center gap-3">
                  <Route className="w-6 h-6 text-[#C8A75A]" />
                  خط السير والتجمع
                </h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  {event.route}
                </p>
              </section>
            )}

            <section className="bg-[#FFF8EB] border border-[#FDE68A] rounded-3xl p-6 flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-[#D97706] shrink-0" />
              <div>
                <h4 className="font-bold text-[#D97706] mb-2">إخلاء مسؤولية</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  هذه الفعالية تم تنظيمها من قبل جهات مدنية مستقلة. منصة الفعاليات السورية مسؤولة فقط عن التنسيق التقني وعرض البيانات ولا تمثل أي جهة منظمة. تم إخفاء بيانات التواصل المباشرة للجنة المنظمة حفاظاً على الخصوصية.
                </p>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">الزمان والمكان</h3>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                    <Clock className="w-5 h-5 text-[#073D35]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold mb-1">الوقت المبرمج</p>
                    <p className="text-gray-900 font-medium">من {event.startTime} إلى {event.endTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                    <MapPin className="w-5 h-5 text-[#073D35]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-bold mb-1">المكان الدقيق</p>
                    <p className="text-gray-900 font-medium mb-3">{event.location}</p>
                    
                    {/* زر الاتجاهات للخرائط المباشر */}
                    <a 
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8A75A] hover:text-[#b39550] bg-[#C8A75A]/10 hover:bg-[#C8A75A]/20 px-3 py-1.5 rounded-lg transition-colors border border-[#C8A75A]/20"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      الاتجاهات للموقع عبر الخرائط
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                    <Users className="w-5 h-5 text-[#073D35]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold mb-1">العدد المتوقع</p>
                    <p className="text-gray-900 font-medium">{event.expectedAttendees} شخص</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-5 text-lg">الجهة المنظمة</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#C8A75A]/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-[#C8A75A]" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{event.organizationName || "جهة تنظيمية مستقلة"}</p>
                  <p className="text-xs text-gray-500 mt-1">المُدخل: {event.submitterRole}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#073D35] rounded-3xl p-6 text-white text-center relative overflow-hidden shadow-lg">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
              
              <Share2 className="w-8 h-8 text-[#C8A75A] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">شارك هذه الفعالية</h3>
              <p className="text-sm text-white/70 mb-6 leading-relaxed">
                ساهم في نشر هذه الفعالية المجتمعية عبر منصات التواصل لزيادة الوعي والحضور.
              </p>
              
              <div className="flex items-center justify-center gap-3 mb-6">
                <a 
                  href={`https://wa.me/?text=${encodedText} %0A ${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#25D366] flex items-center justify-center transition-colors"
                  title="مشاركة عبر واتساب"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
                
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#000000] flex items-center justify-center transition-colors border border-transparent hover:border-white/20"
                  title="مشاركة عبر تويتر / X"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.126H5.078z"/></svg>
                </a>

                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-colors"
                  title="مشاركة عبر فيسبوك"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>

              <button 
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-[#C8A75A] hover:bg-[#E0BE72] text-[#073D35] py-3 rounded-xl font-bold transition-colors"
              >
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                {copied ? "تم نسخ الرابط بنجاح!" : "نسخ رابط الفعالية"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}