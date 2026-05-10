// ID: SYRIA_MAP_PICKER_LOGIC
"use client";

import { useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search, Loader2, MapPin } from "lucide-react";

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
}

export default function LocationPicker({ onLocationSelect, defaultLat = 34.8, defaultLng = 38.0 }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([defaultLat, defaultLng]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<any>(null);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search + " سوريا")}&limit=1`);
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const newPos: [number, number] = [lat, lon];
        setPosition(newPos);
        onLocationSelect(lat, lon);
        if (mapRef.current) {
          mapRef.current.flyTo(newPos, 14);
        }
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
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        onLocationSelect(newPos[0], newPos[1]);
      },
    });

    const eventHandlers = useMemo(
      () => ({
        dragend(e: any) {
          const marker = e.target;
          if (marker != null) {
            const newPos: [number, number] = [marker.getLatLng().lat, marker.getLatLng().lng];
            setPosition(newPos);
            onLocationSelect(newPos[0], newPos[1]);
          }
        },
      }),
      []
    );

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        icon={customIcon}
      />
    );
  }

  return (
    <div className="space-y-4 w-full flex flex-col">
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

      <div className="relative h-[350px] w-full rounded-xl overflow-hidden border-2 border-[#C8A75A]/30 shadow-inner z-0">
        <MapContainer center={position} zoom={6} ref={mapRef} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
        <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 pointer-events-none">
          <MapPin className="w-5 h-5 text-[#C8A75A]" />
          <p className="text-xs text-[#073D35] font-bold">انقر أو اسحب الدبوس للموقع الدقيق</p>
        </div>
      </div>
    </div>
  );
}