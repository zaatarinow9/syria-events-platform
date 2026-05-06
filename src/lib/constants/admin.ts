export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_review: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  waiting_approval_document: { label: 'بانتظار وثيقة الموافقة', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  submitted_by_organizer: { label: 'تم التقديم حسب المنظم', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  approved_for_publish: { label: 'جاهز للنشر', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  published: { label: 'منشور', color: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800 border-red-200' },
  cancelled: { label: 'ملغى', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  ended: { label: 'منتهي', color: 'bg-slate-200 text-slate-800 border-slate-300' },
};