"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, MapPin, Calendar, Clock, ArrowLeft, SlidersHorizontal, X, Loader2 
} from "lucide-react";

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
          date: new Date(req.event_date).toLocaleDateString('ar-SY', { day: '2-digit', month: 'long', year: 'numeric' }),
          isoDate: req.event_date,
          time: `${req.start_time} - ${req.end_time}`,
          type: req.event_type,
          status: req.status,
          coordinates: GOV_COORDINATES[req.governorate] || [34.8, 38.0]
        }));
        setEvents(formatted);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const governorates = useMemo(() => {
    const govs = events.map(e => e.location.split(" - ")[0]);
    return ["الكل", ...Array.from(new Set(govs))];
  }, [events]);

  const eventTypes = useMemo(() => {
    const types = events.map(e => e.type);
    return ["الكل", ...Array.from(new Set(types))];
  }, [events]);

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
      <section className="bg-[#073D35] relative py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z' fill='%23ffffff' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">كافة الفعاليات والتجمعات</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">تصفح، ابحث، وشارك في الأنشطة المدنية والمجتمعية القادمة في مختلف المحافظات السورية.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-8 relative z-20 mb-12">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 md:p-6 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث عن فعالية، محافظة..."
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-12 pl-4 text-gray-900 focus:border-[#C8A75A] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 lg:w-[500px]">
            <div className="flex-1 relative">
              <select className="appearance-none block w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 px-4 pr-10 outline-none" value={selectedGov} onChange={(e) => setSelectedGov(e.target.value)}>
                {governorates.map(gov => <option key={gov} value={gov}>{gov === "الكل" ? "كل المحافظات" : gov}</option>)}
              </select>
              <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex-1 relative">
              <select className="appearance-none block w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 px-4 pr-10 outline-none" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                {eventTypes.map(type => <option key={type} value={type}>{type === "الكل" ? "كل الأنواع" : type}</option>)}
              </select>
              <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {(searchQuery || selectedGov !== "الكل" || selectedType !== "الكل") && (
            <button onClick={clearFilters} className="p-3.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50"><X className="w-5 h-5" /></button>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-[#073D35]" /></div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const statusStyle = getEventStatusStyle(event.isoDate);
              return (
                <Link href={`/events/${event.id}`} key={event.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col relative">
                  <div className={`h-1.5 w-full ${statusStyle.bg.replace('/10', '')} group-hover:bg-[#C8A75A]`}></div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1.5 bg-[#F5F8F7] text-[#073D35] text-xs font-bold rounded-lg">{event.type}</span>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-white ${statusStyle.color} ${statusStyle.border}`}>
                        <span className={`w-2 h-2 rounded-full ${statusStyle.pulse}`}></span>
                        <span className="text-[10px] font-bold">{statusStyle.label}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#073D35] transition-colors">{event.title}</h3>
                    <div className="mt-auto space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                        <span className="text-sm text-gray-600 font-medium">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-4 border-t border-gray-50 pt-3 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium"><Calendar className="w-4 h-4 text-gray-400" /><span>{event.date}</span></div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium"><Clock className="w-4 h-4 text-gray-400" /><span dir="ltr">{event.time}</span></div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500"><Search className="w-10 h-10 text-gray-300 mb-4" /><p>لا توجد فعاليات منشورة حالياً</p></div>
        )}
      </section>
    </div>
  );
}