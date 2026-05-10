"use client";

import dynamic from "next/dynamic";

// استدعاء مكون الخريطة الأساسي بشكل ديناميكي مع تعطيل الـ SSR
const LocationPicker = dynamic(() => import("@/components/shared/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] w-full bg-gray-50 animate-pulse rounded-xl border border-gray-100 flex items-center justify-center font-bold text-gray-400">
      جاري تحميل الخريطة...
    </div>
  ),
});

interface LocationPickerWrapperProps {
  defaultLat?: number;
  defaultLng?: number;
  readOnly?: boolean;
}

export default function LocationPickerWrapper({ defaultLat, defaultLng, readOnly }: LocationPickerWrapperProps) {
  return (
    <LocationPicker
      onLocationSelect={() => {}} // دالة فارغة لأننا في وضع القراءة للإدارة
      defaultLat={defaultLat}
      defaultLng={defaultLng}
      readOnly={readOnly}
    />
  );
}