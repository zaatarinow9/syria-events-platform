"use client";

import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Calendar, Clock, Globe, Map as MapIcon, Plus, Minus, ArrowUpLeft } from "lucide-react";
import Link from "next/link";

// قاموس الألوان الهادئة حسب نوع الفعالية
const EVENT_COLORS: Record<string, string> = {
  "وقفة احتجاجية": "#ef4444",    // أحمر هادئ
  "ندوة ثقافية": "#3b82f6",      // أزرق احترافي
  "توزيع مساعدات": "#10b981",    // أخضر مريح
  "نشاط رياضي": "#f59e0b",       // برتقالي دافئ
  "مبادرة تطوعية": "#8b5cf6",    // بنفسجي لطيف
  "اجتماع عام": "#6366f1",       // نيلي
  "أخرى": "#073D35",             // اللون الأساسي للمنصة
};

// دالة لتوليد الدبوس الفخم بلون ديناميكي
const createElegantIcon = (color: string) => {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div class="relative flex flex-col items-center justify-center drop-shadow-lg transition-transform hover:scale-110">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21s-8-7.333-8-11.5C4 5.806 7.582 2.5 12 2.5s8 3.306 8 8c0 4.167-8 11.5-8 11.5Z" stroke="white" stroke-width="1.2" />
          <circle cx="12" cy="10.5" r="3" fill="white" />
        </svg>
        <div class="w-3 h-1 bg-black/10 blur-[1.5px] rounded-full mt-[-4px]"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
    popupAnchor: [0, -35],
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
      {/* التحكم بنوع الخريطة */}
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

      {/* أزرار التقريب */}
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
        
        {events.map((event) => {
          const eventColor = EVENT_COLORS[event.type] || EVENT_COLORS["أخرى"];
          const dynamicIcon = createElegantIcon(eventColor);

          return (
            <Marker key={event.id} position={event.coordinates} icon={dynamicIcon}>
              <Popup className="custom-popup" closeButton={false}>
                <div className="p-4 w-64 arabic-premium-text" dir="rtl">
                  <div className="flex justify-between items-start mb-3">
                    <span 
                      style={{ color: eventColor, backgroundColor: `${eventColor}15`, borderColor: `${eventColor}30` }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-md border"
                    >
                      {event.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-3">
                    {event.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-sans" dir="ltr">{event.date}</span>
                    </div>
                  </div>
                  
                  {/* الزر الديناميكي الملون بنص أبيض */}
                  <Link 
                    href={`/events/${event.id}`}
                    style={{ backgroundColor: eventColor }}
                    className="w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:brightness-90 active:scale-[0.98]"
                  >
                    التفاصيل والمشاركة <ArrowUpLeft className="w-3.5 h-3.5" />
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