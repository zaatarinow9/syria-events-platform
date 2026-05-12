"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
  Clock,
  Loader2
} from "lucide-react";

// تحميل الخريطة بشكل ديناميكي لتجنب مشاكل الـ SSR
const EventsMap = dynamic(() => import("@/components/home/EventsMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-50 animate-pulse rounded-[1.5rem] flex items-center justify-center text-gray-400 border border-gray-100">جاري تحميل الخريطة...</div>
});

const DEFAULT_CENTER: [number, number] = [34.8, 38.0];
const DEFAULT_ZOOM = 6;

// خريطة الإحداثيات الذكية للمحافظات
const GOV_COORDINATES: Record<string, [number, number]> = {
  "دمشق": [33.5138, 36.2765], "ريف دمشق": [33.5130, 36.3000], "حلب": [36.2021, 37.1343],
  "حمص": [34.7324, 36.7137], "حماة": [35.1318, 36.7578], "اللاذقية": [35.5132, 35.7863],
  "طرطوس": [34.8890, 35.8866], "إدلب": [35.9306, 36.6339], "الرقة": [35.9528, 39.0152],
  "دير الزور": [35.3288, 40.1408], "الحسكة": [36.4984, 40.7486], "درعا": [32.6247, 36.1052],
  "السويداء": [32.7090, 36.5684], "القنيطرة": [33.1256, 35.8215]
};

const getEventStatusStyle = (isoDate: string) => {
  const today = new Date();
  const eventDate = new Date(isoDate);
  const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

  if (diffDays < 0) {
    return { color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200", pulse: "bg-gray-400", label: "منتهية" };
  } else if (diffDays <= 3) {
    return { color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", border: "border-[#ef4444]/20", pulse: "bg-[#ef4444]", label: "قريب جداً" };
  } else if (diffDays <= 7) {
    return { color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/20", pulse: "bg-[#f59e0b]", label: "هذا الأسبوع" };
  } else {
    return { color: "text-[#2F9E6D]", bg: "bg-[#2F9E6D]/10", border: "border-[#2F9E6D]/20", pulse: "bg-[#2F9E6D]", label: "مجدول" };
  }
};

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [isLocating, setIsLocating] = useState(false);

  // جلب الفعاليات الحقيقية المنشورة من Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('permit_requests')
        .select('*')
        .eq('status', 'published')
        .order('event_date', { ascending: true });

      if (data) {
        const formatted = data.map((req: any) => ({
          id: req.id,
          title: req.event_title,
          location: `${req.governorate} - ${req.city || req.location}`,
          // إجبار التواريخ على الأرقام الإنجليزية عبر ar-SY-u-nu-latn
          date: new Date(req.event_date).toLocaleDateString('ar-SY-u-nu-latn', { day: '2-digit', month: 'long', year: 'numeric' }),
          isoDate: req.event_date,
          time: `${req.start_time} - ${req.end_time}`,
          type: req.event_type,
          status: req.status,
          coordinates: req.latitude && req.longitude 
            ? [req.latitude, req.longitude] 
            : (GOV_COORDINATES[req.governorate] || [34.8, 38.0])
        }));
        setEvents(formatted);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setMapZoom(12);
          setIsLocating(false);
          // عمل سكرول للخريطة على الجوال
          if (window.innerWidth < 1024) {
            document.getElementById('map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
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
    setMapZoom(15);
    
    // الحل الذكي: إذا كان حجم الشاشة أقل من lg (1024px)، قم بالتمرير للأسفل ليرى الخريطة
    if (window.innerWidth < 1024) {
      document.getElementById('map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex flex-col w-full arabic-premium-text">
      {/* القسم العلوي (البطل) */}
      <section className="relative w-full bg-[#073D35] text-white overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z' fill='%23ffffff' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C8A75A] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10 flex flex-col items-center text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-[#C8A75A] text-sm font-bold rounded-full mb-6 backdrop-blur-sm border border-white/10 shadow-[0_0_15px_rgba(200,167,90,0.1)]">
            المنصة المدنية المستقلة الأولى
          </span>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.3] mb-6 max-w-4xl tracking-wide">
            نَظِّـــم فَعَّالِيَّتَكَ القَادِمَـــة <br className="hidden md:block" />
            <span className="text-[#C8A75A] inline-block mt-2">بِكُـــلِّ احْتِرَافِيَّـــةٍ وَمَوْثُوقِيَّـــة</span>
          </h1>
          
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium">
            تساعدك المنصة على تجهيز طلبات التجمعات السلمية والأنشطة المدنية بصيغة PDF رسمية جاهزة للتقديم، مع إمكانية نشرها ومشاركتها.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/create-request"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#C8A75A] px-8 py-4 font-bold text-[#073D35] hover:bg-white transition-all shadow-lg shadow-[#C8A75A]/20"
            >
              إنشاء طلب ترخيص جديد
              <ArrowUpLeft className="w-5 h-5" />
            </Link>
            <button
              onClick={() => {
                document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-8 py-4 font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              استكشاف الخريطة
            </button>
          </div>
        </div>
      </section>

      {/* قسم الخريطة واستكشاف الفعاليات */}
      <section id="explore-section" className="relative w-full bg-[#F9FAFB] border-b border-gray-100 py-12 lg:py-16">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8 items-start h-auto lg:h-[700px]">
          
          {/* القائمة الجانبية للفعاليات */}
          <div className="w-full lg:w-1/3 flex flex-col h-[500px] lg:h-full space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">استكشف الفعاليات</h2>
              <p className="text-gray-500 text-sm font-medium">ابحث عن الأنشطة والتجمعات القريبة منك</p>
            </div>

            <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm p-5 flex-1 flex flex-col overflow-hidden">
              <div className="space-y-3 mb-5 border-b border-gray-100 pb-5 shrink-0">
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#C8A75A] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="بحث عن فعالية، محافظة، منطقة..."
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-11 pl-4 text-gray-900 text-base md:text-sm font-medium focus:border-[#C8A75A] focus:bg-white outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-[#073D35] hover:text-white hover:border-[#073D35] transition-all disabled:opacity-50"
                >
                  <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? 'جاري التحديد...' : 'تحديد موقعي الحالي'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {loading ? (
                  <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-[#073D35]" /></div>
                ) : filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => {
                    const statusStyle = getEventStatusStyle(event.isoDate);
                    return (
                      <div 
                        key={event.id}
                        onClick={() => handleEventClick(event.coordinates)}
                        className="p-4 rounded-xl border border-gray-100 bg-white hover:border-[#C8A75A]/50 cursor-pointer transition-all group shadow-sm hover:shadow-md relative overflow-hidden"
                      >
                        <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${statusStyle.pulse}`}></div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold text-[#073D35] bg-[#073D35]/5 px-2.5 py-1 rounded-lg border border-[#073D35]/10">
                            {event.type}
                          </span>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.pulse} ${statusStyle.pulse === 'bg-[#ef4444]' ? 'animate-pulse' : ''}`}></span>
                            <span className={`text-[10px] font-bold ${statusStyle.color}`}>{statusStyle.label}</span>
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-3 group-hover:text-[#073D35] transition-colors text-sm leading-tight pr-2">
                          {event.title}
                        </h3>
                        
                        <div className="text-xs text-gray-500 space-y-2 pr-2">
                          <div className="flex items-center justify-between gap-1.5 w-full">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="truncate font-medium">{event.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Calendar className="w-3.5 h-3.5 text-[#C8A75A]" />
                              <span>{event.date}</span>
                            </div>
                            <div className="w-px h-3 bg-gray-300"></div>
                            <div className="flex items-center gap-1.5 font-bold">
                              <Clock className="w-3.5 h-3.5 text-[#C8A75A]" />
                              <span dir="ltr">{event.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-400 space-y-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-500">لا توجد فعاليات مطابقة</p>
                    <p className="text-xs">جرب تغيير كلمات البحث</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* الخريطة الكبيرة (تم إعطاؤها id للتمكن من التمرير إليها على الجوال) */}
          <div id="map-container" className="w-full lg:w-2/3 h-[500px] lg:h-full p-2 bg-white rounded-[2rem] border border-gray-200 shadow-sm relative mt-8 lg:mt-0">
            <EventsMap events={filteredEvents} center={mapCenter} zoom={mapZoom} />
          </div>

        </div>
      </section>

      {/* قسم آلية العمل */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-[#C8A75A] font-bold text-sm mb-2 block">آلية العمل</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">خطوات بسيطة لتنظيم فعاليتك</h2>
            <p className="text-gray-500 font-medium">نرافقك خطوة بخطوة من إدخال البيانات وحتى صدور الملف النهائي.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent border-t border-dashed border-gray-300" />
            
            <div className="bg-[#F9FAFB] rounded-3xl p-8 border border-gray-100 shadow-sm text-center relative z-10 transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="w-16 h-16 mx-auto rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <FileText className="w-7 h-7 text-[#073D35]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1. تعبئة النموذج</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                أدخل تفاصيل الفعالية، بيانات اللجنة المنظمة، ومكان التجمع بدقة ووضوح.
              </p>
            </div>

            <div className="bg-[#F9FAFB] rounded-3xl p-8 border border-gray-100 shadow-sm text-center relative z-10 transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="w-16 h-16 mx-auto rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-[#C8A75A]/20">
                <FileCheck className="w-7 h-7 text-[#C8A75A]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">2. توليد المستند</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                يقوم النظام فوراً بتوليد ملف PDF رسمي ومنسق جاهز للطباعة.
              </p>
            </div>

            <div className="bg-[#F9FAFB] rounded-3xl p-8 border border-gray-100 shadow-sm text-center relative z-10 transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="w-16 h-16 mx-auto rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <Send className="w-7 h-7 text-[#073D35]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">3. التقديم والنشر</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                قدم الطلب للجهة المختصة وارفع صورة الموافقة لنشر الفعالية للمجتمع.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* قسم المزايا وإخلاء المسؤولية */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 bg-white border border-[#C8A75A]/20 p-10 rounded-[2.5rem] relative shadow-lg shadow-[#C8A75A]/5">
              <ShieldAlert className="w-12 h-12 text-[#D97706] mb-6 bg-[#D97706]/10 p-2.5 rounded-2xl" />
              <h4 className="text-2xl font-bold text-[#D97706] mb-4">إخلاء مسؤولية قانوني</h4>
              <p className="text-gray-600 font-medium leading-relaxed mb-6 text-sm">
                هذه المنصة هي مبادرة مدنية مستقلة ولا تمثل أي جهة حكومية أو رسمية. لا تمنح المنصة أي تراخيص أو موافقات للفعاليات بأي شكل من الأشكال.
              </p>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-800 leading-relaxed text-sm font-bold">
                  يقع على عاتق المنظمين مسؤولية تقديم المستندات المطبوعة للجهات الإدارية المختصة في محافظاتهم واستكمال كافة الإجراءات القانونية اللازمة.
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <span className="text-[#C8A75A] font-bold text-sm mb-3 block">لماذا تختارنا؟</span>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">مزايا استخدام المنصة</h2>
                <div className="space-y-6">
                  {[
                    "توليد ملفات PDF احترافية ومطابقة للمعايير المطلوبة",
                    "خريطة تفاعلية للبحث عن الفعاليات في كافة المحافظات",
                    "إمكانية رفع وثيقة التبليغ أو الموافقة بأمان تام",
                    "حماية تامة للبيانات الحساسة ومعلومات اللجان المنظمة",
                    "استخدام مجاني بالكامل لجميع المواطنين والجهات"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-0.5 bg-[#C8A75A]/10 p-1.5 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-[#073D35]" />
                      </div>
                      <p className="text-gray-800 font-bold leading-relaxed">{feature}</p>
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