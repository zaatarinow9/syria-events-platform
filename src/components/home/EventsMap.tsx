"use client";

import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Calendar, Clock, Navigation, Globe, Map as MapIcon, Plus, Minus, ArrowUpLeft } from "lucide-react";
import Link from "next/link";

// تصميم الدبوس الفخم والمخصص بألوان المنصة (بدون صورة، بل SVG نقي وعالي الدقة)
const elegantIcon = L.divIcon({
  className: 'bg-transparent border-0',
  html: `
    <div class="relative flex flex-col items-center justify-center drop-shadow-xl transition-transform hover:scale-110">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="#073D35" stroke="#C8A75A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10.3333C20 15.8571 12 22 12 22C12 22 4 15.8571 4 10.3333C4 8.21015 4.84285 6.17387 6.34315 4.67357C7.84344 3.17327 9.87971 2.33333 12 2.33333C14.1203 2.33333 16.1566 3.17327 17.6569 4.67357C19.1571 6.17387 20 8.21015 20 10.3333Z"></path>
        <circle cx="12" cy="10" r="3.5" fill="#C8A75A" stroke="none"></circle>
      </svg>
      <div class="w-4 h-1.5 bg-black/20 blur-[2px] rounded-full mt-[-6px]"></div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 40],
  popupAnchor: [0, -40],
});

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

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  return (
    <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden z-0">
      <div className="absolute top-4 left-4 z-[1000] flex bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-gray-200">
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
        <button onClick={handleZoomIn} className="p-2.5 hover:bg-gray-100 text-[#073D35] border-b border-gray-100 transition-colors"><Plus className="w-5 h-5"/></button>
        <button onClick={handleZoomOut} className="p-2.5 hover:bg-gray-100 text-[#073D35] transition-colors"><Minus className="w-5 h-5"/></button>
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
        
        {events.map((event) => (
          <Marker key={event.id} position={event.coordinates} icon={elegantIcon}>
            <Popup className="custom-popup" closeButton={false}>
              <div className="p-4 w-64 arabic-premium-text" dir="rtl">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold text-[#073D35] bg-[#073D35]/10 px-2.5 py-1 rounded-md border border-[#073D35]/10">
                    {event.type}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-3">
                  {event.title}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-[#C8A75A] shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-[#C8A75A]" />
                    <span className="font-sans" dir="ltr">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-[#C8A75A]" />
                    <span className="font-sans" dir="ltr">{event.time}</span>
                  </div>
                </div>
                <Link 
                  href={`/events/${event.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-[#073D35] hover:bg-[#052e28] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#073D35]/20"
                >
                  التفاصيل والمشاركة <ArrowUpLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}