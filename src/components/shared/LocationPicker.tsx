// ID: SYRIA_MAP_PICKER_PRO_V2
"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl } from "react-leaflet";
import L from "leaflet";
import { Search, Loader2, MapPin, Globe } from "lucide-react";

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
  const mapRef = useRef<any>(null);

  // تحديث الموقع عند تغيير المحافظة من الأب
  useEffect(() => {
    if (defaultLat !== position[0] || defaultLng !== position[1]) {
      const newPos: [number, number] = [defaultLat, defaultLng];
      setPosition(newPos);
      if (mapRef.current) {
        mapRef.current.flyTo(newPos, readOnly ? 15 : 12);
      }
    }
  }, [defaultLat, defaultLng]);

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
        alert("لم يتم العثور على الموقع، جرب البحث باسم الحي أو المنطقة.");
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
    }), []);

    return <Marker draggable={!readOnly} eventHandlers={eventHandlers} position={position} icon={customIcon} />;
  }

  return (
    <div className="space-y-4 w-full flex flex-col">
      {!readOnly && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن منطقة، حي، أو شارع..."
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#C8A75A] outline-none text-sm font-bold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            />
          </div>
          <button type="button" onClick={handleSearch} disabled={loading} className="bg-[#073D35] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#052e28] transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "بحث"}
          </button>
        </div>
      )}

      <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border-2 border-[#C8A75A]/20 shadow-lg z-0">
        <MapContainer 
          center={position} 
          zoom={6} 
          ref={mapRef} 
          style={{ height: "100%", width: "100%" }} 
          attributionControl={false} // حذف شعار Leaflet والعلم الأوكراني
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="خريطة الشوارع">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="قمر صناعي (Satellite)">
              <TileLayer 
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          <LocationMarker />
        </MapContainer>
        
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-[#C8A75A]/30 flex items-center gap-2 pointer-events-none">
          <Globe className="w-5 h-5 text-[#C8A75A]" />
          <p className="text-[11px] text-[#073D35] font-bold">يمكنك التبديل لرؤية القمر الصناعي من الأعلى</p>
        </div>
      </div>
    </div>
  );
}