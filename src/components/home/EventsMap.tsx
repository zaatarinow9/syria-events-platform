"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

// تصميم دبوس احترافي، خفيف، ولطيف
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

const customIcon = new L.DivIcon({
  html: customMarkerHtml,
  className: "bg-transparent",
  iconSize: [44, 56],
  iconAnchor: [22, 56],
  popupAnchor: [0, -50],
});

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);
  return null;
}

interface EventsMapProps {
  events: any[];
  center: [number, number];
  zoom: number;
}

export default function EventsMap({ events, center, zoom }: EventsMapProps) {
  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm z-0 bg-[#f8f9fa]">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        
        {events.map((event) => (
          <Marker key={event.id} position={event.coordinates} icon={customIcon}>
            <Popup className="font-sans">
              <div className="flex flex-col w-full bg-white" dir="rtl">
                <div className="p-5 pb-4">
                  <span className="inline-block px-2.5 py-1 bg-[#F5F8F7] text-[#073D35] text-[10px] font-bold rounded-md border border-[#E8F0EE] mb-3">
                    {event.type}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base mb-4 leading-tight">{event.title}</h3>
                  <div className="space-y-3 text-xs text-gray-600 font-medium">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span>{event.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-5 pb-5 pt-2">
                  <Link 
                    href={`/events/${event.id}`}
                    className="w-full bg-[#073D35] hover:bg-[#052e28] text-white flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md shadow-[#073D35]/20"
                  >
                    عرض التفاصيل
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}