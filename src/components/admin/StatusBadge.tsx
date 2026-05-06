import { STATUS_MAP } from "@/lib/constants/admin";

export default function StatusBadge({ status }: { status: string }) {
  const statusInfo = STATUS_MAP[status] || { label: 'غير معروف', color: 'bg-gray-100 text-gray-800 border-gray-200' };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${statusInfo.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-70`}></span>
      {statusInfo.label}
    </span>
  );
}