"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Search, MapPin, Navigation, Calendar, ArrowUpLeft, ShieldAlert, FileText, FileCheck, Send, CheckCircle2, Clock, Loader2 } from "lucide-react";

const EventsMap = dynamic(() => import("@/components/home/EventsMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-gray-400">جاري تحميل الخريطة...</div>
});

const DEFAULT_CENTER: [number, number] = [34.8, 38.0];
const DEFAULT_ZOOM = 6;

const GOV_COORDINATES: Record<string, [number, number]> = {
  "دمشق": [33.5138, 36.2765], "ريف دمشق": [33.5130, 36.3000], "حلب": [36.2021, 37.1343],
  "حمص": [34.7324, 36.7137], "حماة": [35.1318, 36.7578], "اللاذقية": [35.5132, 35.7863],
  "طرطوس": [34.8890, 35.8866], "إدلب": [35.9306, 36.6339], "الرقة": [35.9528, 39.0152],
  "دير الزور": [35.3288, 40.1408], "الحسكة": [36.4984, 40.7486], "درعا": [32.6247, 36.1052],
  "السويداء": [32.7090, 36.5684], "القنيطرة": [33.1256, 35.8215]
};

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("permit_requests").select("*").eq("status", "published");
      if (data) {
        const formatted = data.map((req: any) => ({
          id: req.id,
          title: req.event_title,
          location: `${req.governorate} - ${req.city || req.location}`,
          date: new Date(req.event_date).toLocaleDateString("ar-SY", { day: "2-digit", month: "long" }),
          isoDate: req.event_date,
          time: `${req.start_time} - ${req.end_time}`,
          type: req.event_type,
          coordinates: GOV_COORDINATES[req.governorate] || [34.8, 38.0]
        }));
        setEvents(formatted);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    return events.filter(e => e.title.includes(searchQuery) || e.location.includes(searchQuery));
  }, [events, searchQuery]);

  return (
    <div className="flex flex-col w-full arabic-premium-text">
      <section className="relative w-full bg-[#073D35] text-white overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z' fill='%23ffffff' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
        <div className="container mx-auto px-4 py-20 relative z-10 flex flex-col items-center text-center">
          <span className="px-4 py-1.5 bg-white/10 text-[#C8A75A] font-bold rounded-full mb-6">المنصة المدنية المستقلة الأولى</span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">نَظِّـــم فَعَّالِيَّتَكَ القَادِمَـــة <br className="hidden md:block" /><span className="text-[#C8A75A]">بِكُـــلِّ احْتِرَافِيَّـــةٍ وَمَوْثُوقِيَّـــة</span></h1>
          <p className="text-white/80 text-lg max-w-2xl mb-10">تساعدك المنصة على تجهيز طلبات التجمعات السلمية والأنشطة المدنية بصيغة PDF رسمية جاهزة للتقديم.</p>
          <div className="flex gap-4">
            <Link href="/create-request" className="bg-[#C8A75A] text-[#073D35] px-8 py-4 font-bold rounded-xl flex items-center gap-2">إنشاء طلب ترخيص <ArrowUpLeft className="w-5 h-5" /></Link>
          </div>
        </div>
      </section>

      <section id="explore-section" className="relative w-full bg-white border-b border-gray-100 py-16">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8 lg:h-[650px]">
          <div className="w-full lg:w-1/3 flex flex-col h-full space-y-6">
            <div><h2 className="text-2xl font-bold text-gray-900 mb-2">استكشف الفعاليات</h2></div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex-1 flex flex-col overflow-hidden">
              <div className="space-y-3 mb-4 border-b pb-4">
                <div className="relative">
                  <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input type="text" placeholder="بحث عن فعالية..." className="w-full rounded-xl border bg-gray-50 py-3 pr-10 pl-4 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {loading ? <Loader2 className="animate-spin mx-auto mt-10 text-[#073D35]" /> : filteredEvents.map((event) => (
                  <div key={event.id} onClick={() => { setMapCenter(event.coordinates); setMapZoom(14); }} className="p-4 rounded-xl border bg-gray-50 cursor-pointer hover:bg-white transition-all">
                    <span className="text-[10px] font-bold text-[#073D35] bg-[#073D35]/10 px-2 py-1 rounded">{event.type}</span>
                    <h3 className="font-bold text-sm mt-2 mb-2">{event.title}</h3>
                    <div className="text-xs text-gray-500 space-y-2">
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{event.location}</div>
                      <div className="flex gap-4"><div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{event.date}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-2/3 h-[450px] lg:h-full p-1.5 bg-white rounded-3xl border relative">
            <EventsMap events={filteredEvents} center={mapCenter} zoom={mapZoom} />
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#F9FAFB]">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-12">خطوات بسيطة لتنظيم فعاليتك</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{ icon: FileText, title: "1. تعبئة النموذج" }, { icon: FileCheck, title: "2. توليد المستند" }, { icon: Send, title: "3. التقديم والنشر" }].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border shadow-sm"><item.icon className="w-10 h-10 text-[#073D35] mx-auto mb-4" /><h3 className="font-bold">{item.title}</h3></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}