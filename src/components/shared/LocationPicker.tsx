// ID: SYRIA_MAP_PICKER_PRO_V3
"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search, Loader2, MapPin, Globe, Map as MapIcon } from "lucide-react";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        onLocationSelect(newPos[0], newPos[1]);
      },
    });

    const eventHandlers = useMemo(
      () => ({
        dragend(e: any) {
          if (readOnly) return;
          const marker = e.target;
          if (marker != null) {
            const newPos: [number, number] = [marker.getLatLng().lat, marker.getLatLng().lng];
            setPosition(newPos);
            onLocationSelect(newPos[0], newPos[1]);
          }
        },
      }),
      [readOnly, onLocationSelect]
    );

    return <Marker draggable={!readOnly} eventHandlers={eventHandlers} position={position} icon={customIcon} />;
  }

  // روابط خرائط جوجل للحصول على تفاصيل باللغة العربية مع أسماء المناطق
  const tileUrl = mapType === 'streets' 
    ? "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=ar" // خريطة الشوارع
    : "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=ar"; // قمر صناعي هجين (صور + نصوص)

  return (
    <div className="space-y-4 w-full flex flex-col">
      {!readOnly && (
        <div className="flex gap-2">
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

      <div className={`relative h-[400px] w-full rounded-2xl overflow-hidden border-2 border-[#C8A75A]/30 shadow-inner z-0 ${readOnly ? 'opacity-90' : ''}`}>
        
        {/* أزرار التبديل الاحترافية */}
        <div className="absolute top-4 left-4 z-[1000] flex bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-xl border border-[#C8A75A]/20">
          <button 
            type="button"
            onClick={() => setMapType('satellite')} 
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${mapType === 'satellite' ? 'bg-[#073D35] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Globe className="w-3.5 h-3.5" /> قمر صناعي
          </button>
          <button 
            type="button"
            onClick={() => setMapType('streets')} 
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${mapType === 'streets' ? 'bg-[#073D35] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <MapIcon className="w-3.5 h-3.5" /> شوارع
          </button>
        </div>

        <MapContainer 
          center={position} 
          zoom={readOnly ? 14 : 6} 
          ref={mapRef} 
          style={{ height: "100%", width: "100%" }} 
          scrollWheelZoom={true}
          attributionControl={false}
        >
          <TileLayer url={tileUrl} />
          <LocationMarker />
        </MapContainer>
        
        {!readOnly && (
          <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-[#C8A75A]/30 flex flex-col gap-1 pointer-events-none">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C8A75A]" />
              <p className="text-xs text-[#073D35] font-bold">انقر أو اسحب الدبوس للموقع الدقيق</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}