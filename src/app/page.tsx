"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Navigation, 
  Calendar, 
  ArrowUpLeft, 
  ShieldAlert,
  FileText,
  FileCheck,
  Send,
  CheckCircle2,
  ChevronLeft
} from "lucide-react";

const EventsMap = dynamic(() => import("@/components/home/EventsMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">جاري تحميل الخريطة...</div>
});

const MOCK_EVENTS = [
  {
    id: "1",
    title: "حملة تشجير وتجميل المرافق العامة",
    location: "دمشق - حديقة تشرين",
    date: "15 أيار 2026",
    type: "حملة تطوعية",
    status: "مقبول للنشر",
    coordinates: [33.5138, 36.2765] as [number, number]
  },
  {
    id: "2",
    title: "ندوة حوارية حول التنمية المستدامة",
    location: "حلب - المركز الثقافي",
    date: "22 أيار 2026",
    type: "ندوة / لقاء",
    status: "مقبول للنشر",
    coordinates: [36.2021, 37.1343] as [number, number]
  },
  {
    id: "3",
    title: "تجمع سلمي لدعم حقوق العمال",
    location: "حمص - ساحة المحافظة",
    date: "01 حزيران 2026",
    type: "وقفة سلمية",
    status: "مقبول للنشر",
    coordinates: [34.7324, 36.7137] as [number, number]
  },
  {
    id: "4",
    title: "نشاط ثقافي للأطفال الأيتام",
    location: "اللاذقية - الكورنيش الجنوبي",
    date: "10 حزيران 2026",
    type: "نشاط ثقافي",
    status: "مقبول للنشر",
    coordinates: [35.5132, 35.7863] as [number, number]
  }
];

const DEFAULT_CENTER: [number, number] = [34.8, 38.0];
const DEFAULT_ZOOM = 6;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [isLocating, setIsLocating] = useState(false);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_EVENTS;
    const query = searchQuery.toLowerCase();
    return MOCK_EVENTS.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setMapZoom(12);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("عذراً، لم نتمكن من تحديد موقعك. يرجى التأكد من إعطاء الصلاحيات.");
          setIsLocating(false);
        }
      );
    } else {
      alert("متصفحك لا يدعم خاصية تحديد الموقع.");
      setIsLocating(false);
    }
  };

  const handleEventClick = (coordinates: [number, number]) => {
    setMapCenter(coordinates);
    setMapZoom(14);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full bg-[#073D35] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C8A75A] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10 flex flex-col items-center text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-[#C8A75A] text-sm font-bold rounded-full mb-6 backdrop-blur-sm border border-white/10">
            المنصة المدنية المستقلة الأولى
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl">
            نظم فعاليتك القادمة <br className="hidden md:block" />
            <span className="text-[#C8A75A]">بكل احترافية وموثوقية</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium">
            تساعدك المنصة على تجهيز طلبات التجمعات السلمية والأنشطة المدنية بصيغة PDF رسمية جاهزة للتقديم، مع إمكانية نشرها ومشاركتها.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/create-request"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#C8A75A] px-8 py-4 font-bold text-[#073D35] hover:bg-white transition-all shadow-lg shadow-[#C8A75A]/20"
            >
              إنشاء طلب ترخيص جديد
              <ArrowUpLeft className="w-5 h-5" />
            </Link>
            <button
              onClick={() => {
                document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-8 py-4 font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              استكشاف الخريطة
            </button>
          </div>
        </div>
      </section>

      {/* قسم الخريطة والبحث التفاعلي */}
      <section id="explore-section" className="relative w-full bg-white border-b border-gray-100 py-16">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8 items-start h-auto lg:h-[650px]">
          
          <div className="w-full lg:w-1/3 flex flex-col h-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">استكشف الفعاليات</h2>
              <p className="text-gray-500 text-sm">ابحث عن الأنشطة والتجمعات القريبة منك</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex-1 flex flex-col overflow-hidden">
              <div className="space-y-3 mb-4 border-b border-gray-100 pb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="بحث عن فعالية أو محافظة..."
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-10 pl-4 text-gray-900 text-sm focus:border-[#C8A75A] focus:ring-1 focus:ring-[#C8A75A] focus:bg-white transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                >
                  <Navigation className={`w-4 h-4 text-[#073D35] ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? 'جاري التحديد...' : 'استخدام موقعي الحالي'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div 
                      key={event.id}
                      onClick={() => handleEventClick(event.coordinates)}
                      className="p-4 rounded-xl border border-gray-100 hover:border-[#073D35]/30 bg-gray-50 hover:bg-white cursor-pointer transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-[#073D35] bg-[#073D35]/10 px-2 py-1 rounded">
                          {event.type}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-3 group-hover:text-[#C8A75A] transition-colors text-sm leading-tight">
                        {event.title}
                      </h3>
                      <div className="text-xs text-gray-500 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {event.date}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-400 space-y-3">
                    <Search className="w-8 h-8 opacity-20" />
                    <p className="text-sm">لا توجد فعاليات مطابقة لبحثك.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3 h-[450px] lg:h-full p-1.5 bg-white rounded-3xl border border-gray-200 shadow-sm relative">
            <EventsMap events={filteredEvents} center={mapCenter} zoom={mapZoom} />
          </div>

        </div>
      </section>

      {/* قسم خطوات العمل */}
      <section className="py-24 bg-[#F9FAFB] border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-[#C8A75A] font-bold text-sm mb-2 block">آلية العمل</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">خطوات بسيطة لتنظيم فعاليتك</h2>
            <p className="text-gray-500">نرافقك خطوة بخطوة من إدخال البيانات وحتى صدور الملف النهائي.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent border-t border-dashed border-gray-300" />
            
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center relative z-10 transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#073D35]/5 flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-[#073D35]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1. تعبئة النموذج</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                أدخل تفاصيل الفعالية، بيانات اللجنة المنظمة، ومكان التجمع بدقة ووضوح.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center relative z-10 transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#C8A75A]/10 flex items-center justify-center mb-6">
                <FileCheck className="w-7 h-7 text-[#C8A75A]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">2. توليد المستند</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                يقوم النظام فوراً بتوليد ملف PDF رسمي ومنسق جاهز للطباعة.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center relative z-10 transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#073D35]/5 flex items-center justify-center mb-6">
                <Send className="w-7 h-7 text-[#073D35]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">3. التقديم والنشر</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                قدم الطلب للجهة المختصة وارفع صورة الموافقة لنشر الفعالية للمجتمع.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* قسم المميزات والتنبيه القانوني */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 bg-[#FDFBF7] border border-[#F3E8D2] p-10 rounded-[2rem] relative">
              <ShieldAlert className="w-10 h-10 text-[#D97706] mb-6" />
              <h4 className="text-xl font-bold text-[#D97706] mb-4">إخلاء مسؤولية قانوني</h4>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                هذه المنصة هي مبادرة مدنية مستقلة ولا تمثل أي جهة حكومية أو رسمية. لا تمنح المنصة أي تراخيص أو موافقات للفعاليات بأي شكل من الأشكال.
              </p>
              <div className="p-4 bg-white rounded-xl border border-[#F3E8D2]">
                <p className="text-gray-800 leading-relaxed text-sm font-bold">
                  يقع على عاتق المنظمين مسؤولية تقديم المستندات المطبوعة للجهات الإدارية المختصة في محافظاتهم واستكمال كافة الإجراءات القانونية اللازمة.
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <span className="text-[#C8A75A] font-bold text-sm mb-2 block">لماذا تختارنا؟</span>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">مزايا استخدام المنصة</h2>
                <div className="space-y-5">
                  {[
                    "توليد ملفات PDF احترافية ومطابقة للمعايير المطلوبة",
                    "خريطة تفاعلية للبحث عن الفعاليات في كافة المحافظات",
                    "إمكانية رفع وثيقة التبليغ أو الموافقة بأمان تام",
                    "حماية تامة للبيانات الحساسة ومعلومات اللجان المنظمة",
                    "استخدام مجاني بالكامل لجميع المواطنين والجهات"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1">
                        <CheckCircle2 className="w-5 h-5 text-[#C8A75A]" />
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}