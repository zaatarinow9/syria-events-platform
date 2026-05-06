import Link from "next/link";

export default function AdminRequestsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#F9FAFB] p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الطلبات</h1>
            <p className="mt-2 text-gray-500">
              هذه الصفحة مخصصة لعرض ومراجعة طلبات الفعاليات.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl bg-[#073D35] px-5 py-3 text-sm font-bold text-white hover:bg-[#052e28]"
          >
            العودة للوحة التحكم
          </Link>
        </div>

        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-[#073D35]">
            جدول الطلبات
          </h2>

          <p className="text-gray-600">
            سيتم هنا عرض الطلبات بعد ربط صفحة الطلبات بقاعدة بيانات Supabase.
          </p>
        </section>
      </div>
    </main>
  );
}