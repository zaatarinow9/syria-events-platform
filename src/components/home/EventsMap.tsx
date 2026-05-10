"use client";

import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Calendar, Clock, Globe, Map as MapIcon, Plus, Minus, ArrowUpLeft } from "lucide-react";
import Link from "next/link";

// قائمة الألوان الزاهية والمريحة للعين
const EVENT_COLORS = [
  "#073D35", 
  "#C8A75A", 
  "#3b82f6", 
  "#ef4444", 
  "#10b981", 
  "#8b5cf6", 
  "#f59e0b", 
  "#ec4899", 
  "#06b6d4", 
  "#84cc16"  
];

// دبوس مودرن احترافي بحجم أصغر وتصميم مسطح
const createElegantIcon = (color: string) => {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div class="relative flex flex-col items-center justify-center transition-transform hover:scale-110">
        <svg width="28" height="36" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37258 0 0 5.37258 0 12C0 22 12 32 12 32C12 32 24 22 24 12C24 5.37258 18.6274 0 12 0Z" fill="${color}"/>
          <circle cx="12" cy="12" r="4.5" fill="white" />
        </svg>
      </div>
    `,
    iconSize: [28, 36], // تم تصغير الحجم هنا
    iconAnchor: [14, 36], // ضبط نقطة ارتكاز الدبوس لتناسب الحجم الجديد
    popupAnchor: [0, -32], // ضبط مكان ظهور الكارد فوق الدبوس
  });
};

interface EventMapData {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  type: string;
  coordinates: [number, number];
}

interface EventsMapProps {
  events: EventMapData[];
  center: [number, number];
  zoom: number;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function EventsMap({ events, center, zoom }: EventsMapProps) {
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const mapRef = useRef<any>(null);

  const tileUrl = mapType === 'streets' 
    ? "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=ar" 
    : "https://mt1.google.com/vt/lyrs=y,h&x={x}&y={y}&z={z}&hl=ar";

  return (
    <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden z-0">
      <div className="absolute top-4 left-4 z-[1000] flex bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-gray-200">
        <button 
          onClick={() => setMapType('satellite')} 
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${mapType === 'satellite' ? 'bg-[#073D35] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Globe className="w-4 h-4" /> قمر صناعي
        </button>
        <button 
          onClick={() => setMapType('streets')} 
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${mapType === 'streets' ? 'bg-[#073D35] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <MapIcon className="w-4 h-4" /> شوارع
        </button>
      </div>

      <div className="absolute bottom-6 left-4 z-[1000] flex flex-col bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <button onClick={() => mapRef.current?.zoomIn()} className="p-2.5 hover:bg-gray-100 text-[#073D35] border-b border-gray-100"><Plus className="w-5 h-5"/></button>
        <button onClick={() => mapRef.current?.zoomOut()} className="p-2.5 hover:bg-gray-100 text-[#073D35]"><Minus className="w-5 h-5"/></button>
      </div>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        ref={mapRef} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />
        <MapUpdater center={center} zoom={zoom} />
        
        {events.map((event, index) => {
          const eventColor = EVENT_COLORS[index % EVENT_COLORS.length];
          const dynamicIcon = createElegantIcon(eventColor);

          return (
            <Marker key={event.id} position={event.coordinates} icon={dynamicIcon}>
              <Popup className="custom-popup" closeButton={false}>
                {/* تم إجبار محاذاة النص لليمين (text-right) */}
                <div className="p-4 w-64 arabic-premium-text text-right" dir="rtl">
                  <div className="flex justify-start items-start mb-3">
                    <span 
                      style={{ color: eventColor, backgroundColor: `${eventColor}15`, borderColor: `${eventColor}30` }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-md border inline-block"
                    >
                      {event.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-3 text-right">
                    {event.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-start gap-2 text-xs text-gray-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate text-right">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-start gap-2 text-xs text-gray-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-sans text-right" dir="ltr">{event.date}</span>
                    </div>
                  </div>
                  
                  {/* الزر باللون الأبيض الإجباري */}
                  <Link 
                    href={`/events/${event.id}`}
                    style={{ backgroundColor: eventColor, color: '#ffffff' }}
                    className="w-full flex items-center justify-center gap-2 !text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:brightness-90 active:scale-[0.98] no-underline"
                  >
                    <span>التفاصيل والمشاركة</span>
                    <ArrowUpLeft className="w-3.5 h-3.5 !text-white" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}