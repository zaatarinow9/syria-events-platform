// ID: LOCATION_PICKER_WRAPPER
"use client";

import dynamic from "next/dynamic";

// الاستدعاء الديناميكي هنا مسموح لأن الملف يبدأ بـ "use client"
const LocationPicker = dynamic(() => import("@/components/shared/LocationPicker"), { 
  ssr: false,
  loading: () => (
    <div className="h-[250px] w-full bg-gray-50 animate-pulse rounded-xl border border-gray-100 flex items-center justify-center font-bold text-gray-400">
      جاري تحميل الخريطة...
    </div>
  )
});

interface LocationPickerWrapperProps {
  defaultLat?: number;
  defaultLng?: number;
  readOnly?: boolean;
}

export default function LocationPickerWrapper({ defaultLat, defaultLng, readOnly }: LocationPickerWrapperProps) {
  return (
    <LocationPicker 
      onLocationSelect={() => {}} 
      defaultLat={defaultLat} 
      defaultLng={defaultLng} 
      readOnly={readOnly} 
    />
  );
}