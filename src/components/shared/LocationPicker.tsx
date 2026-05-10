"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search, Loader2, MapPin, Globe, Map as MapIcon, Plus, Minus } from "lucide-react";

// تصميم الدبوس الفخم والمخصص بألوان المنصة
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

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultLat?: number;
  defaultLng?: number;
  readOnly?: boolean;
}

export default function LocationPicker({ 
  onLocationSelect, 
  defaultLat = 34.8, 
  defaultLng = 38.0,
  readOnly = false 
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([defaultLat, defaultLng]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('satellite');
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (defaultLat !== position[0] || defaultLng !== position[1]) {
      const newPos: [number, number] = [defaultLat, defaultLng];
      setPosition(newPos);
      if (mapRef.current) {
        mapRef.current.flyTo(newPos, readOnly ? 15 : 12);
      }
    }
  }, [defaultLat, defaultLng, readOnly]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search + " سوريا")}&limit=1`);
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setPosition([lat, lon]);
        onLocationSelect(lat, lon);
        if (mapRef.current) mapRef.current.flyTo([lat, lon], 14);
      } else {
        alert("لم نتمكن من العثور على المكان، يرجى سحب الدبوس يدوياً على الخريطة لتحديده.");
      }
    } finally {
      setLoading(false);
    }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        if (readOnly) return;
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });

    const eventHandlers = useMemo(() => ({
      dragend(e: any) {
        if (readOnly) return;
        const marker = e.target;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition([latLng.lat, latLng.lng]);
          onLocationSelect(latLng.lat, latLng.lng);
        }
      },
    }), [readOnly, onLocationSelect]);

    return <Marker draggable={!readOnly} eventHandlers={eventHandlers} position={position} icon={elegantIcon} />;
  }

  const tileUrl = mapType === 'streets' 
    ? "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=ar" 
    : "https://mt1.google.com/vt/lyrs=y,h&x={x}&y={y}&z={z}&hl=ar";

  const handleZoomIn = () => mapRef.current && mapRef.current.zoomIn();
  const handleZoomOut = () => mapRef.current && mapRef.current.zoomOut();

  return (
    <div className="space-y-4 w-full flex flex-col relative z-0">
      {!readOnly && (
        <div className="flex gap-2 relative z-10">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن مدينة أو منطقة لتقريب الخريطة..."
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#C8A75A] outline-none text-sm font-medium transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#073D35] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#052e28] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "بحث"}
          </button>
        </div>
      )}

      <div className={`relative h-[400px] w-full rounded-2xl overflow-hidden border-2 border-[#C8A75A]/30 shadow-lg z-0 ${readOnly ? 'opacity-90' : ''}`}>
        
        <div className="absolute top-4 right-4 z-[1000] flex bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-xl border border-gray-200">
          <button 
            type="button"
            onClick={() => setMapType('satellite')} 
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${mapType === 'satellite' ? 'bg-[#073D35] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Globe className="w-3.5 h-3.5" /> قمر صناعي
          </button>
          <button 
            type="button"
            onClick={() => setMapType('streets')} 
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${mapType === 'streets' ? 'bg-[#073D35] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <MapIcon className="w-3.5 h-3.5" /> شوارع
          </button>
        </div>

        <div className="absolute bottom-6 left-4 z-[1000] flex flex-col bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <button type="button" onClick={handleZoomIn} className="p-2 hover:bg-gray-100 text-[#073D35] border-b border-gray-100 transition-colors"><Plus className="w-5 h-5"/></button>
          <button type="button" onClick={handleZoomOut} className="p-2 hover:bg-gray-100 text-[#073D35] transition-colors"><Minus className="w-5 h-5"/></button>
        </div>

        <MapContainer 
          center={position} 
          zoom={readOnly ? 14 : 6} 
          ref={mapRef} 
          style={{ height: "100%", width: "100%" }} 
          scrollWheelZoom={true}
          attributionControl={false}
          zoomControl={false}
        >
          <TileLayer url={tileUrl} />
          <LocationMarker />
        </MapContainer>
        
        {!readOnly && (
          <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-[#C8A75A]/30 flex items-center gap-2 pointer-events-none">
            <MapPin className="w-4 h-4 text-[#C8A75A]" />
            <p className="text-xs text-[#073D35] font-bold">انقر أو اسحب الدبوس للموقع الدقيق</p>
          </div>
        )}
      </div>
    </div>
  );
}