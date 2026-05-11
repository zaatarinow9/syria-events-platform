"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowLeft,
  SlidersHorizontal,
  X,
  Loader2,
  Image as ImageIcon
} from "lucide-react";

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

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGov, setSelectedGov] = useState("الكل");
  const [selectedType, setSelectedType] = useState("الكل");
  const supabase = createClient();

  // جلب البيانات من Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('permit_requests')
        .select('*')
        .eq('status', 'published')
        .order('event_date', { ascending: true });

      if (data) {
        const formatted = data.map((req: any) => {
          // استخراج مسار الصورة وتحويلها لرابط عام إن وجدت
          let imageUrl = null;
          if (req.campaign_image) {
            const { data: publicUrlData } = supabase.storage.from("request-files").getPublicUrl(req.campaign_image);
            imageUrl = publicUrlData.publicUrl;
          }

          return {
            id: req.id,
            title: req.event_title,
            location: `${req.governorate} - ${req.city || req.location}`,
            date: new Date(req.event_date).toLocaleDateString('ar-SY-u-nu-latn', { day: '2-digit', month: 'long', year: 'numeric' }),
            isoDate: req.event_date,
            time: `${req.start_time} - ${req.end_time}`,
            type: req.event_type,
            status: req.status,
            coordinates: req.latitude && req.longitude ? [req.latitude, req.longitude] : (GOV_COORDINATES[req.governorate] || [34.8, 38.0]),
            imageUrl: imageUrl
          };
        });
        setEvents(formatted);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [supabase]);

  // استخراج المحافظات وأنواع الفعاليات تلقائياً للفلتر
  const governorates = useMemo(() => {
    const govs = events.map(e => e.location.split(" - ")[0]);
    return ["الكل", ...Array.from(new Set(govs))];
  }, [events]);

  const eventTypes = useMemo(() => {
    const types = events.map(e => e.type);
    return ["الكل", ...Array.from(new Set(types))];
  }, [events]);

  // دالة الفلترة الشاملة
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGov = selectedGov === "الكل" || event.location.startsWith(selectedGov);
      const matchesType = selectedType === "الكل" || event.type === selectedType;

      return matchesSearch && matchesGov && matchesType;
    });
  }, [events, searchQuery, selectedGov, selectedType]);

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

        {loading ? (
          <div className="flex justify-center items-center py-24"><Loader2 className="w-12 h-12 animate-spin text-[#073D35]" /></div>
        ) : filteredEvents.length > 0 ? (
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
                  <div className={`h-1.5 w-full z-10 ${statusStyle.bg.replace('/10', '')} transition-colors group-hover:bg-[#C8A75A]`}></div>
                  
                  {/* قسم الصورة إن وجدت */}
                  {event.imageUrl && (
                    <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* الحالة تظهر فوق الصورة */}
                      <div className="absolute top-4 right-4 z-20">
                         <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-white/90 backdrop-blur-sm ${statusStyle.color} ${statusStyle.border}`}>
                          <span className={`w-2 h-2 rounded-full ${statusStyle.pulse} ${statusStyle.pulse === 'bg-[#ef4444]' ? 'animate-pulse' : ''}`}></span>
                          <span className="text-[10px] font-bold">{statusStyle.label}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6 flex-1 flex flex-col relative z-20 bg-white">
                    {/* إذا لم تكن هناك صورة، نعرض الحالة هنا */}
                    {!event.imageUrl && (
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-block px-3 py-1.5 bg-[#F5F8F7] text-[#073D35] text-xs font-bold rounded-lg border border-[#E8F0EE]">
                          {event.type}
                        </span>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-white ${statusStyle.color} ${statusStyle.border}`}>
                          <span className={`w-2 h-2 rounded-full ${statusStyle.pulse} ${statusStyle.pulse === 'bg-[#ef4444]' ? 'animate-pulse' : ''}`}></span>
                          <span className="text-[10px] font-bold">{statusStyle.label}</span>
                        </div>
                      </div>
                    )}

                    {/* إذا كان هناك صورة، نعرض النوع فقط بدون الحالة لتجنب التكرار */}
                    {event.imageUrl && (
                       <div className="mb-3 mt-[-40px] z-30">
                        <span className="inline-block px-3 py-1.5 bg-white text-[#073D35] text-xs font-bold rounded-lg shadow-sm border border-gray-100">
                          {event.type}
                        </span>
                      </div>
                    )}
                    
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد فعاليات منشورة حالياً</h3>
            <p className="text-gray-500 mb-6 max-w-md text-center">
              لم نتمكن من العثور على أي فعاليات. سيتم عرض الفعاليات هنا بمجرد الموافقة عليها من قبل الإدارة.
            </p>
            {(searchQuery || selectedGov !== "الكل" || selectedType !== "الكل") && (
              <button 
                onClick={clearFilters}
                className="bg-[#073D35] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#073D35]/90 transition-colors"
              >
                مسح جميع الفلاتر
              </button>
            )}
          </div>
        )}
      </section>

    </div>
  );
}