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
  Clock
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
    isoDate: "2026-05-08",
    time: "09:00 ص - 02:00 م",
    type: "حملة تطوعية",
    status: "مقبول للنشر",
    coordinates: [33.5138, 36.2765] as [number, number]
  },
  {
    id: "2",
    title: "ندوة حوارية حول التنمية المستدامة",
    location: "حلب - المركز الثقافي",
    date: "22 أيار 2026",
    isoDate: "2026-05-12",
    time: "05:00 م - 08:00 م",
    type: "ندوة / لقاء",
    status: "مقبول للنشر",
    coordinates: [36.2021, 37.1343] as [number, number]
  },
  {
    id: "3",
    title: "تجمع سلمي لدعم حقوق العمال",
    location: "حمص - ساحة المحافظة",
    date: "01 حزيران 2026",
    isoDate: "2026-06-01",
    time: "10:00 ص - 01:00 م",
    type: "وقفة سلمية",
    status: "مقبول للنشر",
    coordinates: [34.7324, 36.7137] as [number, number]
  },
  {
    id: "4",
    title: "نشاط ثقافي للأطفال الأيتام",
    location: "اللاذقية - الكورنيش الجنوبي",
    date: "10 حزيران 2026",
    isoDate: "2026-06-10",
    time: "04:00 م - 07:00 م",
    type: "نشاط ثقافي",
    status: "مقبول للنشر",
    coordinates: [35.5132, 35.7863] as [number, number]
  },
  {
    id: "5",
    title: "وقفة للمطالبة بالحقوق المدنية",
    location: "السويداء - ساحة الكرامة",
    date: "20 أيار 2026",
    isoDate: "2026-05-20",
    time: "11:00 ص - 01:00 م",
    type: "وقفة سلمية",
    status: "مقبول للنشر",
    coordinates: [32.7090, 36.5684] as [number, number]
  },
  {
    id: "6",
    title: "مظاهرة سلمية لتحسين الواقع المعيشي",
    location: "درعا - ساحة الجامع العمري",
    date: "25 أيار 2026",
    isoDate: "2026-05-25",
    time: "01:00 م - 03:00 م",
    type: "مظاهرة",
    status: "مقبول للنشر",
    coordinates: [32.6247, 36.1052] as [number, number]
  },
  {
    id: "7",
    title: "لقاء تشاوري حول تمكين المرأة اقتصادياً",
    location: "حماة - حديقة أم الحسن",
    date: "30 أيار 2026",
    isoDate: "2026-05-30",
    time: "10:00 ص - 12:00 م",
    type: "ندوة / لقاء",
    status: "مقبول للنشر",
    coordinates: [35.1318, 36.7578] as [number, number]
  },
  {
    id: "8",
    title: "حملة تنظيف الشاطئ العام",
    location: "طرطوس - الكورنيش البحري",
    date: "05 حزيران 2026",
    isoDate: "2026-06-05",
    time: "08:00 ص - 12:00 م",
    type: "حملة تطوعية",
    status: "مقبول للنشر",
    coordinates: [34.8890, 35.8866] as [number, number]
  },
  {
    id: "9",
    title: "مهرجان إحياء التراث الفراتي",
    location: "دير الزور - المركز الثقافي",
    date: "12 حزيران 2026",
    isoDate: "2026-06-12",
    time: "05:00 م - 09:00 م",
    type: "نشاط ثقافي",
    status: "مقبول للنشر",
    coordinates: [35.3288, 40.1408] as [number, number]
  },
  {
    id: "10",
    title: "وقفة سلمية لدعم حقوق المزارعين",
    location: "الرقة - ساحة المحافظة",
    date: "18 حزيران 2026",
    isoDate: "2026-06-18",
    time: "09:00 ص - 11:00 ص",
    type: "وقفة سلمية",
    status: "مقبول للنشر",
    coordinates: [35.9528, 39.0152] as [number, number]
  },
  {
    id: "11",
    title: "مظاهرة للمطالبة بتوفير مياه الشرب",
    location: "الحسكة - حديقة الشعب",
    date: "20 حزيران 2026",
    isoDate: "2026-06-20",
    time: "04:00 م - 06:00 م",
    type: "مظاهرة",
    status: "مقبول للنشر",
    coordinates: [36.4984, 40.7486] as [number, number]
  },
  {
    id: "12",
    title: "ندوة حول التعايش السلمي وبناء السلام",
    location: "القامشلي - المركز الثقافي",
    date: "25 حزيران 2026",
    isoDate: "2026-06-25",
    time: "06:00 م - 08:00 م",
    type: "ندوة / لقاء",
    status: "مقبول للنشر",
    coordinates: [37.0463, 41.2263] as [number, number]
  },
  {
    id: "13",
    title: "تجمع لدعم قطاع التعليم وحقوق المعلمين",
    location: "إدلب - ساحة الساعة",
    date: "01 تموز 2026",
    isoDate: "2026-07-01",
    time: "10:00 ص - 12:00 م",
    type: "وقفة سلمية",
    status: "مقبول للنشر",
    coordinates: [35.9306, 36.6339] as [number, number]
  },
  {
    id: "14",
    title: "مظاهرة سلمية ضد الاحتكار وغلاء الأسعار",
    location: "دمشق - ساحة الأمويين",
    date: "05 تموز 2026",
    isoDate: "2026-07-05",
    time: "12:00 م - 02:00 م",
    type: "مظاهرة",
    status: "مقبول للنشر",
    coordinates: [33.5115, 36.2760] as [number, number]
  },
  {
    id: "15",
    title: "وقفة تضامنية لدعم الصناعة الوطنية",
    location: "حلب - ساحة سعد الله الجابري",
    date: "10 تموز 2026",
    isoDate: "2026-07-10",
    time: "05:00 م - 07:00 م",
    type: "وقفة سلمية",
    status: "مقبول للنشر",
    coordinates: [36.2085, 37.1350] as [number, number]
  },
  {
    id: "16",
    title: "معرض الكتاب المفتوح لتبادل المعرفة",
    location: "حمص - شارع الحضارة",
    date: "15 تموز 2026",
    isoDate: "2026-07-15",
    time: "04:00 م - 10:00 م",
    type: "نشاط ثقافي",
    status: "مقبول للنشر",
    coordinates: [34.7300, 36.7100] as [number, number]
  },
  {
    id: "17",
    title: "ندوة التكنولوجيا ومستقبل الشباب",
    location: "اللاذقية - جامعة تشرين",
    date: "20 تموز 2026",
    isoDate: "2026-07-20",
    time: "11:00 ص - 01:00 م",
    type: "ندوة / لقاء",
    status: "مقبول للنشر",
    coordinates: [35.5200, 35.7900] as [number, number]
  },
  {
    id: "18",
    title: "أمسية شعرية مفتوحة للشباب",
    location: "السويداء - المركز الثقافي",
    date: "22 تموز 2026",
    isoDate: "2026-07-22",
    time: "06:00 م - 08:00 م",
    type: "نشاط ثقافي",
    status: "مقبول للنشر",
    coordinates: [32.7100, 36.5700] as [number, number]
  },
  {
    id: "19",
    title: "وقفة سلمية للمطالبة بتحسين الخدمات الطبية",
    location: "درعا - المجمع الحكومي",
    date: "25 تموز 2026",
    isoDate: "2026-07-25",
    time: "09:00 ص - 11:00 ص",
    type: "وقفة سلمية",
    status: "مقبول للنشر",
    coordinates: [32.6200, 36.1000] as [number, number]
  },
  {
    id: "20",
    title: "حملة تطوعية لترميم جدران الأحياء القديمة",
    location: "طرطوس - المدينة القديمة",
    date: "28 تموز 2026",
    isoDate: "2026-07-28",
    time: "08:00 ص - 04:00 م",
    type: "حملة تطوعية",
    status: "مقبول للنشر",
    coordinates: [34.8900, 35.8800] as [number, number]
  }
];

const DEFAULT_CENTER: [number, number] = [34.8, 38.0];
const DEFAULT_ZOOM = 6;

const getEventStatusStyle = (isoDate: string) => {
  const today = new Date();
  const eventDate = new Date(isoDate);
  const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

  if (diffDays <= 3) {
    return { color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", border: "border-[#ef4444]/20", pulse: "bg-[#ef4444]", label: "قريب جداً" };
  } else if (diffDays <= 7) {
    return { color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/20", pulse: "bg-[#f59e0b]", label: "هذا الأسبوع" };
  } else {
    return { color: "text-[#2F9E6D]", bg: "bg-[#2F9E6D]/10", border: "border-[#2F9E6D]/20", pulse: "bg-[#2F9E6D]", label: "مجدول" };
  }
};

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
    <div className="flex flex-col w-full arabic-premium-text">
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
                  filteredEvents.map((event) => {
                    const statusStyle = getEventStatusStyle(event.isoDate);
                    return (
                      <div 
                        key={event.id}
                        onClick={() => handleEventClick(event.coordinates)}
                        className="p-4 rounded-xl border border-gray-100 hover:border-[#073D35]/30 bg-gray-50 hover:bg-white cursor-pointer transition-all group shadow-sm hover:shadow-md relative overflow-hidden"
                      >
                        <div className={`absolute top-0 right-0 bottom-0 w-1 ${statusStyle.pulse}`}></div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold text-[#073D35] bg-[#073D35]/10 px-2.5 py-1 rounded-md border border-[#073D35]/10">
                            {event.type}
                          </span>
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.pulse} ${statusStyle.pulse === 'bg-[#ef4444]' ? 'animate-pulse' : ''}`}></span>
                            <span className={`text-[9px] font-bold ${statusStyle.color}`}>{statusStyle.label}</span>
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-3 group-hover:text-[#C8A75A] transition-colors text-sm leading-tight pr-1">
                          {event.title}
                        </h3>
                        
                        <div className="text-xs text-gray-500 space-y-2 pr-1">
                          <div className="flex items-center justify-between gap-1.5 w-full">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${event.coordinates[0]},${event.coordinates[1]}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] font-bold text-[#C8A75A] bg-[#C8A75A]/10 hover:bg-[#C8A75A]/20 border border-[#C8A75A]/20 px-2 py-1 rounded flex items-center gap-1 transition-colors shrink-0"
                              title="الذهاب عبر خرائط جوجل"
                            >
                              <Navigation className="w-3 h-3" />
                              مسار
                            </a>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span dir="ltr">{event.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
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