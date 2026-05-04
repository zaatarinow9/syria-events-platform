"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Calendar, ArrowLeft, Clock, Navigation } from "lucide-react";

// حدود سوريا التقريبية (مربع الإحاطة) لمنع سحب الخريطة خارجها
const SYRIA_BOUNDS = L.latLngBounds(
  L.latLng(32.3, 35.5), // الجنوب الغربي
  L.latLng(37.5, 42.5)  // الشمال الشرقي
);

const customMarkerHtml = `
  <div class="relative flex flex-col items-center justify-center group -mt-4 cursor-pointer">
    <div class="relative w-11 h-11 bg-white rounded-full shadow-md flex items-center justify-center z-10 border border-gray-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
      <div class="w-8 h-8 bg-[#073D35] rounded-full flex items-center justify-center shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A75A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    </div>
    <div class="w-1.5 h-1.5 bg-[#073D35] rounded-full mt-1.5 transition-all duration-300 group-hover:translate-y-1"></div>
    <div class="absolute -bottom-1 w-6 h-1 bg-black/15 rounded-[100%] blur-[1.5px] transition-all duration-300 group-hover:scale-75 group-hover:opacity-50"></div>
  </div>
`;

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [center, zoom, map]);
  return null;
}

interface EventsMapProps {
  events: any[];
  center: [number, number];
  zoom: number;
}

const getEventStatusColor = (isoDate: string) => {
  const today = new Date();
  const eventDate = new Date(isoDate);
  const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  if (diffDays <= 3) return { bg: "bg-[#ef4444]", text: "text-[#ef4444]", label: "قريب جداً" };
  if (diffDays <= 7) return { bg: "bg-[#f59e0b]", text: "text-[#f59e0b]", label: "هذا الأسبوع" };
  return { bg: "bg-[#2F9E6D]", text: "text-[#2F9E6D]", label: "مجدول" };
};

export default function EventsMap({ events, center, zoom }: EventsMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const customIcon = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new L.DivIcon({
      html: customMarkerHtml,
      className: "bg-transparent",
      iconSize: [44, 56],
      iconAnchor: [22, 56],
      popupAnchor: [0, -50],
    });
  }, []);

  if (!mounted || !customIcon) {
    return (
      <div className="w-full h-full bg-gray-50 animate-pulse rounded-2xl flex flex-col items-center justify-center text-gray-400 border border-gray-100 italic">
        جاري تهيئة الخريطة...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm z-0 bg-[#f8f9fa] arabic-premium-text">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        minZoom={6}
        maxZoom={16}
        maxBounds={SYRIA_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png" />
        
        <MapUpdater center={center} zoom={zoom} />
        
        {events.map((event) => {
          const status = getEventStatusColor(event.isoDate);
          return (
            <Marker key={event.id} position={event.coordinates} icon={customIcon}>
              <Popup className="arabic-premium-text">
                <div className="flex flex-col w-[290px] bg-white overflow-hidden" dir="rtl" style={{ fontFamily: 'var(--font-thmanyah), sans-serif' }}>
                  <div className="p-6 pb-4 relative">
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${status.bg}`}></div>
                    
                    <div className="flex justify-between items-center mt-2 mb-4">
                      <span className="inline-block px-2.5 py-1 bg-[#F5F8F7] text-[#073D35] text-[10px] font-bold rounded-md border border-[#E8F0EE]">
                        {event.type}
                      </span>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-white ${status.text} border-current`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.bg} ${status.bg === 'bg-[#ef4444]' ? 'animate-pulse' : ''}`}></span>
                        <span className="text-[9px] font-bold">{status.label}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 text-[17px] mb-5 leading-tight">{event.title}</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                          <MapPin className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold mb-0.5">الموقع</span>
                          <span className="text-xs text-gray-700 font-medium truncate max-w-[180px]">{event.location}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-50 mt-4">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C8A75A]" />
                          <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-bold">التاريخ</span>
                            <span className="text-[11px] text-gray-700 font-bold">{event.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-3.5 h-3.5 text-[#C8A75A]" />
                          <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-bold">التوقيت</span>
                            <span className="text-[10px] text-gray-700 font-bold" dir="ltr">{event.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6 pt-3 flex gap-3">
                    {/* استبدلنا Link بـ a tag تقليدي لمنع خطأ appendChild */}
                    <a 
                      href={`/events/${event.id}`}
                      className="flex-1 bg-[#073D35] hover:bg-[#052e28] !text-white flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#073D35]/20"
                    >
                      التفاصيل
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${event.coordinates[0]},${event.coordinates[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-11 bg-[#C8A75A]/10 hover:bg-[#C8A75A]/20 !text-[#C8A75A] flex items-center justify-center rounded-xl transition-colors border border-[#C8A75A]/20 shrink-0"
                      title="فتح الاتجاهات"
                    >
                      <Navigation className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}