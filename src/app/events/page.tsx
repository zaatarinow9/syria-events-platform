"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowLeft,
  SlidersHorizontal,
  X
} from "lucide-react";

// بيانات الفعاليات (نفس الداتا لضمان التطابق)
const MOCK_EVENTS = [
  { id: "1", title: "حملة تشجير وتجميل المرافق العامة", location: "دمشق - حديقة تشرين", date: "15 أيار 2026", isoDate: "2026-05-08", time: "09:00 ص - 02:00 م", type: "حملة تطوعية", status: "مقبول للنشر", coordinates: [33.5138, 36.2765] },
  { id: "2", title: "ندوة حوارية حول التنمية المستدامة", location: "حلب - المركز الثقافي", date: "22 أيار 2026", isoDate: "2026-05-12", time: "05:00 م - 08:00 م", type: "ندوة / لقاء", status: "مقبول للنشر", coordinates: [36.2021, 37.1343] },
  { id: "3", title: "تجمع سلمي لدعم حقوق العمال", location: "حمص - ساحة المحافظة", date: "01 حزيران 2026", isoDate: "2026-06-01", time: "10:00 ص - 01:00 م", type: "وقفة سلمية", status: "مقبول للنشر", coordinates: [34.7324, 36.7137] },
  { id: "4", title: "نشاط ثقافي للأطفال الأيتام", location: "اللاذقية - الكورنيش الجنوبي", date: "10 حزيران 2026", isoDate: "2026-06-10", time: "04:00 م - 07:00 م", type: "نشاط ثقافي", status: "مقبول للنشر", coordinates: [35.5132, 35.7863] },
  { id: "5", title: "وقفة للمطالبة بالحقوق المدنية", location: "السويداء - ساحة الكرامة", date: "20 أيار 2026", isoDate: "2026-05-20", time: "11:00 ص - 01:00 م", type: "وقفة سلمية", status: "مقبول للنشر", coordinates: [32.7090, 36.5684] },
  { id: "6", title: "مظاهرة سلمية لتحسين الواقع المعيشي", location: "درعا - ساحة الجامع العمري", date: "25 أيار 2026", isoDate: "2026-05-25", time: "01:00 م - 03:00 م", type: "مظاهرة", status: "مقبول للنشر", coordinates: [32.6247, 36.1052] },
  { id: "7", title: "لقاء تشاوري حول تمكين المرأة اقتصادياً", location: "حماة - حديقة أم الحسن", date: "30 أيار 2026", isoDate: "2026-05-30", time: "10:00 ص - 12:00 م", type: "ندوة / لقاء", status: "مقبول للنشر", coordinates: [35.1318, 36.7578] },
  { id: "8", title: "حملة تنظيف الشاطئ العام", location: "طرطوس - الكورنيش البحري", date: "05 حزيران 2026", isoDate: "2026-06-05", time: "08:00 ص - 12:00 م", type: "حملة تطوعية", status: "مقبول للنشر", coordinates: [34.8890, 35.8866] },
  { id: "9", title: "مهرجان إحياء التراث الفراتي", location: "دير الزور - المركز الثقافي", date: "12 حزيران 2026", isoDate: "2026-06-12", time: "05:00 م - 09:00 م", type: "نشاط ثقافي", status: "مقبول للنشر", coordinates: [35.3288, 40.1408] },
  { id: "10", title: "وقفة سلمية لدعم حقوق المزارعين", location: "الرقة - ساحة المحافظة", date: "18 حزيران 2026", isoDate: "2026-06-18", time: "09:00 ص - 11:00 ص", type: "وقفة سلمية", status: "مقبول للنشر", coordinates: [35.9528, 39.0152] },
  { id: "11", title: "مظاهرة للمطالبة بتوفير مياه الشرب", location: "الحسكة - حديقة الشعب", date: "20 حزيران 2026", isoDate: "2026-06-20", time: "04:00 م - 06:00 م", type: "مظاهرة", status: "مقبول للنشر", coordinates: [36.4984, 40.7486] },
  { id: "12", title: "ندوة حول التعايش السلمي وبناء السلام", location: "القامشلي - المركز الثقافي", date: "25 حزيران 2026", isoDate: "2026-06-25", time: "06:00 م - 08:00 م", type: "ندوة / لقاء", status: "مقبول للنشر", coordinates: [37.0463, 41.2263] },
  { id: "13", title: "تجمع لدعم قطاع التعليم وحقوق المعلمين", location: "إدلب - ساحة الساعة", date: "01 تموز 2026", isoDate: "2026-07-01", time: "10:00 ص - 12:00 م", type: "وقفة سلمية", status: "مقبول للنشر", coordinates: [35.9306, 36.6339] },
  { id: "14", title: "مظاهرة سلمية ضد الاحتكار وغلاء الأسعار", location: "دمشق - ساحة الأمويين", date: "05 تموز 2026", isoDate: "2026-07-05", time: "12:00 م - 02:00 م", type: "مظاهرة", status: "مقبول للنشر", coordinates: [33.5115, 36.2760] },
  { id: "15", title: "وقفة تضامنية لدعم الصناعة الوطنية", location: "حلب - ساحة سعد الله الجابري", date: "10 تموز 2026", isoDate: "2026-07-10", time: "05:00 م - 07:00 م", type: "وقفة سلمية", status: "مقبول للنشر", coordinates: [36.2085, 37.1350] },
  { id: "16", title: "معرض الكتاب المفتوح لتبادل المعرفة", location: "حمص - شارع الحضارة", date: "15 تموز 2026", isoDate: "2026-07-15", time: "04:00 م - 10:00 م", type: "نشاط ثقافي", status: "مقبول للنشر", coordinates: [34.7300, 36.7100] },
  { id: "17", title: "ندوة التكنولوجيا ومستقبل الشباب", location: "اللاذقية - جامعة تشرين", date: "20 تموز 2026", isoDate: "2026-07-20", time: "11:00 ص - 01:00 م", type: "ندوة / لقاء", status: "مقبول للنشر", coordinates: [35.5200, 35.7900] },
  { id: "18", title: "أمسية شعرية مفتوحة للشباب", location: "السويداء - المركز الثقافي", date: "22 تموز 2026", isoDate: "2026-07-22", time: "06:00 م - 08:00 م", type: "نشاط ثقافي", status: "مقبول للنشر", coordinates: [32.7100, 36.5700] },
  { id: "19", title: "وقفة سلمية للمطالبة بتحسين الخدمات الطبية", location: "درعا - المجمع الحكومي", date: "25 تموز 2026", isoDate: "2026-07-25", time: "09:00 ص - 11:00 ص", type: "وقفة سلمية", status: "مقبول للنشر", coordinates: [32.6200, 36.1000] },
  { id: "20", title: "حملة تطوعية لترميم جدران الأحياء القديمة", location: "طرطوس - المدينة القديمة", date: "28 تموز 2026", isoDate: "2026-07-28", time: "08:00 ص - 04:00 م", type: "حملة تطوعية", status: "مقبول للنشر", coordinates: [34.8900, 35.8800] }
];

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

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGov, setSelectedGov] = useState("الكل");
  const [selectedType, setSelectedType] = useState("الكل");

  // استخراج المحافظات وأنواع الفعاليات تلقائياً للفلتر
  const governorates = useMemo(() => {
    const govs = MOCK_EVENTS.map(e => e.location.split(" - ")[0]);
    return ["الكل", ...Array.from(new Set(govs))];
  }, []);

  const eventTypes = useMemo(() => {
    const types = MOCK_EVENTS.map(e => e.type);
    return ["الكل", ...Array.from(new Set(types))];
  }, []);

  // دالة الفلترة الشاملة
  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter((event) => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGov = selectedGov === "الكل" || event.location.startsWith(selectedGov);
      const matchesType = selectedType === "الكل" || event.type === selectedType;

      return matchesSearch && matchesGov && matchesType;
    });
  }, [searchQuery, selectedGov, selectedType]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGov("الكل");
    setSelectedType("الكل");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col arabic-premium-text" dir="rtl">
      
      {/* رأس الصفحة */}
      <section className="bg-[#073D35] relative py-16 overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z' fill='%23ffffff' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">كافة الفعاليات والتجمعات</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            تصفح، ابحث، وشارك في الأنشطة المدنية والمجتمعية القادمة في مختلف المحافظات السورية.
          </p>
        </div>
      </section>

      {/* قسم الفلترة */}
      <section className="container mx-auto px-4 -mt-8 relative z-20 mb-12">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 md:p-6 flex flex-col lg:flex-row gap-4">
          
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث عن فعالية، محافظة، أو منطقة..."
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-12 pl-4 text-gray-900 focus:border-[#C8A75A] focus:ring-1 focus:ring-[#C8A75A] focus:bg-white transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 lg:w-[500px]">
            <div className="flex-1 relative">
              <select
                className="appearance-none block w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 px-4 pr-10 text-gray-900 focus:border-[#C8A75A] focus:ring-1 focus:ring-[#C8A75A] focus:bg-white transition-all outline-none font-medium cursor-pointer"
                value={selectedGov}
                onChange={(e) => setSelectedGov(e.target.value)}
              >
                {governorates.map(gov => (
                  <option key={gov} value={gov}>{gov === "الكل" ? "كل المحافظات" : gov}</option>
                ))}
              </select>
              <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex-1 relative">
              <select
                className="appearance-none block w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 px-4 pr-10 text-gray-900 focus:border-[#C8A75A] focus:ring-1 focus:ring-[#C8A75A] focus:bg-white transition-all outline-none font-medium cursor-pointer"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type === "الكل" ? "كل الأنواع" : type}</option>
                ))}
              </select>
              <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {(searchQuery || selectedGov !== "الكل" || selectedType !== "الكل") && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center p-3.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              title="مسح الفلاتر"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      {/* عرض الفعاليات */}
      <section className="container mx-auto px-4 pb-24 flex-1">
        
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            النتائج ({filteredEvents.length})
          </h2>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const statusStyle = getEventStatusStyle(event.isoDate);
              
              return (
                <Link 
                  href={`/events/${event.id}`} 
                  key={event.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-[#073D35]/30 transition-all duration-300 flex flex-col relative"
                >
                  {/* الشريط اللوني العلوي للحالة */}
                  <div className={`h-1.5 w-full ${statusStyle.bg.replace('/10', '')} transition-colors group-hover:bg-[#C8A75A]`}></div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-block px-3 py-1.5 bg-[#F5F8F7] text-[#073D35] text-xs font-bold rounded-lg border border-[#E8F0EE]">
                        {event.type}
                      </span>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-white ${statusStyle.text} ${statusStyle.border}`}>
                        <span className={`w-2 h-2 rounded-full ${statusStyle.pulse} ${statusStyle.pulse === 'bg-[#ef4444]' ? 'animate-pulse' : ''}`}></span>
                        <span className="text-[10px] font-bold">{statusStyle.label}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4 leading-snug group-hover:text-[#073D35] transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="mt-auto space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                          <MapPin className="w-4 h-4 text-gray-500 group-hover:text-[#C8A75A] transition-colors" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium pt-1.5">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 border-t border-gray-50 pt-3 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{event.date}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span dir="ltr">{event.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-[#073D35] group-hover:bg-[#073D35] group-hover:text-white transition-colors">
                    عرض التفاصيل كاملة
                    <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج مطابقة</h3>
            <p className="text-gray-500 mb-6 max-w-md text-center">
              لم نتمكن من العثور على أي فعاليات تطابق شروط البحث الخاصة بك. حاول تغيير الفلاتر أو استخدام كلمات بحث مختلفة.
            </p>
            <button 
              onClick={clearFilters}
              className="bg-[#073D35] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#073D35]/90 transition-colors"
            >
              مسح جميع الفلاتر
            </button>
          </div>
        )}
      </section>

    </div>
  );
}