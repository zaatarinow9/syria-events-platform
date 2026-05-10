"use client";

import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () => import("@/components/shared/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] w-full bg-gray-50 animate-pulse rounded-xl border border-gray-100 flex items-center justify-center font-bold text-gray-400">
        جاري تحميل الخريطة...
      </div>
    ),
  }
);

interface LocationPickerWrapperProps {
  defaultLat?: number;
  defaultLng?: number;
  readOnly?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function LocationPickerWrapper({
  defaultLat,
  defaultLng,
  readOnly = false,
  onLocationSelect,
}: LocationPickerWrapperProps) {
  return (
    <LocationPicker
      onLocationSelect={onLocationSelect || (() => {})}
      defaultLat={defaultLat}
      defaultLng={defaultLng}
      readOnly={readOnly}
    />
  );
}