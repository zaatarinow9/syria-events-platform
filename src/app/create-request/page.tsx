// ID: CREATE_REQUEST_GEO_INTEGRATION
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  FileText,
  User,
  CalendarDays,
  Users,
  CheckSquare,
  Info,
  CheckCircle2,
  Download,
  MapPin
} from "lucide-react";
import {
  permitRequestSchema,
  type PermitRequestFormValues,
  type PledgeFieldName,
} from "@/lib/validations/permitRequestSchema";
import { GOVERNORATES } from "@/lib/constants/governorates";
import { EVENT_TYPES } from "@/lib/constants/eventTypes";

// استدعاء الخريطة بشكل ديناميكي لتجنب أخطاء السيرفر
const LocationPicker = dynamic(() => import("@/components/shared/LocationPicker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-50 animate-pulse rounded-xl border border-gray-100 flex items-center justify-center">جاري تحميل الخريطة...</div>
});

const pledges: Array<{ name: PledgeFieldName; text: string }> = [
  { name: "pledgeTrueInfo", text: "أتعهد بأن كافة المعلومات المدخلة صحيحة ودقيقة." },
  { name: "pledgePeaceful", text: "أتعهد بأن الفعالية ذات طابع سلمي بحت." },
  { name: "pledgeCommitment", text: "أتعهد بالالتزام بالمكان والوقت المحددين في هذا الطلب." },
  { name: "pledgeNoMisleading", text: "أتعهد بعدم نشر أي معلومات مضللة حول الفعالية." },
  { name: "pledgeAcknowledgment", text: "أقر بأن المنصة لا تمنح ترخيصاً وأن التقديم للجهات المختصة هو مسؤوليتي." },
];

function InputError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-1.5 text-xs font-bold text-red-500">{error}</p>;
}

const EnglishNumber = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontFamily: "Arial, Helvetica, sans-serif" }} dir="ltr">{children}</span>
);

export default function CreateRequestPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const [formData, setFormData] = useState<PermitRequestFormValues | null>(null);
  
  // حالة لحفظ الإحداثيات من الخريطة
  const [coordinates, setCoordinates] = useState({ lat: 34.8, lng: 38.0 });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PermitRequestFormValues>({
    resolver: zodResolver(permitRequestSchema),
  });

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setCoordinates({ lat, lng });
    // يمكننا وضع العنوان المقترح في حقل الموقع إذا كان فارغاً
  };

  const onSubmit = async (data: PermitRequestFormValues) => {
    try {
      // دمج الإحداثيات مع البيانات المرسلة
      const payload = {
        ...data,
        latitude: coordinates.lat,
        longitude: coordinates.lng
      };

      const response = await fetch("/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error("فشل إرسال الطلب");
      
      const resData = await response.json();
      setRequestNumber(resData.request_number);
      setFormData(data);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.");
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (isSubmitted && formData) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-12 arabic-premium-text print-reset" dir="rtl">
        <style jsx global>{`
          .print-only { display: none; }
          @media print {
            .no-print { display: none !important; }
            .print-reset { min-height: 0 !important; padding: 0 !important; background-color: white !important; }
            .print-only {
              display: block !important;
              width: 100%;
              color: #000000 !important;
              background-color: #ffffff !important;
              padding: 10mm 15mm !important;
              box-sizing: border-box !important;
            }
            body { background-color: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0 !important; padding: 0 !important; }
            @page { size: A4 portrait; margin: 0mm !important; }
          }
        `}</style>

        <div className="container mx-auto max-w-3xl px-4 no-print">
          <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-lg md:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#073D35]/20 bg-[#073D35]/10">
              <CheckCircle2 className="h-10 w-10 text-[#073D35]" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-gray-900">تم تسجيل طلبك وتجهيز المستند</h2>
            <p className="mb-8 text-gray-500 font-medium">
              هذا هو الكود المرجعي الخاص بك. احتفظ به جيداً لتتمكن من تتبع طلبك وإرفاق الصور لاحقاً:
            </p>
            <div className="mb-10 inline-block rounded-xl border border-[#C8A75A]/30 bg-[#FDFBF7] px-10 py-5 font-mono text-3xl font-bold tracking-[0.2em] text-[#C8A75A]">
              {requestNumber}
            </div>
            <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#073D35] px-8 py-4 font-bold text-white shadow-md shadow-[#073D35]/20 transition-all hover:bg-[#052e28]"
              >
                <Download className="h-5 w-5" /> تحميل وطباعة الـ PDF
              </button>
              <Link
                href="/track"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#073D35] bg-white px-8 py-4 font-bold text-[#073D35] transition-all hover:bg-gray-50"
              >
                تتبع الطلب الآن
              </Link>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-5 text-right text-sm text-blue-800">
              <Info className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="leading-relaxed">
                <strong>الخطوة القادمة:</strong> قم بطباعة المستند، احصل على الموافقة من المحافظة، ثم ادخل لصفحة "تتبع الطلب" وادخل الكود لرفع صورة الموافقة.
              </p>
            </div>
          </div>
        </div>

        <div id="print-area" className="print-only bg-white text-black relative" dir="rtl">
          <div className="mb-4 text-center border-b-[2px] border-black pb-2 pt-2">
            <h1 className="text-[14pt] font-bold underline decoration-2 underline-offset-4 mb-1">طلب ترخيص تجمع / فعالية مدنية</h1>
            <p className="text-[10pt] font-bold text-gray-800">نموذج تصريح رسمي مخصص للتقديم للجهات الإدارية المختصة</p>
          </div>
          <div className="mb-4">
            <h2 className="mb-1 text-[11pt] font-bold">السيد محافظ {formData.governorate} المحترم،</h2>
            <p className="text-[10pt] text-justify leading-[1.5] font-medium">نحن اللجنة المنظمة المذكورة تفاصيلها أدناه، نتقدم لمقامكم بطلب الموافقة على تنظيم <strong>({formData.eventType})</strong> تحت عنوان <strong>"{formData.eventTitle}"</strong>، وذلك وفقاً للبيانات والتعهدات المدونة في هذا المستند، راجين موافقتكم الكريمة للإيعاز لمن يلزم.</p>
          </div>
          <div className="mb-4 overflow-hidden rounded-lg border border-gray-400">
            <div className="border-b border-gray-400 bg-gray-100 px-3 py-1.5 text-[10pt] font-bold">أولاً: بيانات وتفاصيل الفعالية</div>
            <table className="w-full text-[9.5pt] border-collapse">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="w-[110px] bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">اسم الفعالية</td>
                  <td className="px-3 py-1.5 font-bold">{formData.eventTitle}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">نوع الفعالية</td>
                  <td className="px-3 py-1.5">{formData.eventType}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">المكان</td>
                  <td className="px-3 py-1.5 font-medium">{formData.governorate} - {formData.city} - {formData.location}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">التاريخ والوقت</td>
                  <td className="px-3 py-1.5">بتاريخ <EnglishNumber>{formData.eventDate}</EnglishNumber> | من الساعة <EnglishNumber>{formData.startTime}</EnglishNumber> إلى <EnglishNumber>{formData.endTime}</EnglishNumber></td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">العدد المتوقع</td>
                  <td className="px-3 py-1.5 font-bold"><EnglishNumber>{formData.expectedAttendees}</EnglishNumber> شخص</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">الهدف من الفعالية</td>
                  <td className="px-3 py-1.5 leading-[1.4]">{formData.eventGoal}</td>
                </tr>
                {formData.route && (
                  <tr>
                    <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">خط السير</td>
                    <td className="px-3 py-1.5 leading-[1.4]">{formData.route}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mb-4 overflow-hidden rounded-lg border border-gray-400">
            <div className="border-b border-gray-400 bg-gray-100 px-3 py-1.5 text-[10pt] font-bold">ثانياً: بيانات اللجنة المنظمة (مُقدّمي الطلب)</div>
            <table className="w-full text-[9.5pt] text-center border-collapse">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="border-l border-gray-300 px-2 py-1.5 font-bold">الصفة</th>
                  <th className="border-l border-gray-300 px-2 py-1.5 font-bold">الاسم الثلاثي</th>
                  <th className="border-l border-gray-300 px-2 py-1.5 font-bold">رقم الهاتف</th>
                  <th className="px-2 py-1.5 font-bold w-[100px]">التوقيع الشخصي</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="border-l border-gray-300 px-2 py-1.5 font-bold bg-gray-50">رئيس اللجنة</td>
                  <td className="border-l border-gray-300 px-2 py-1.5 font-bold">{formData.committeeHeadName}</td>
                  <td className="border-l border-gray-300 px-2 py-1.5 font-bold"><EnglishNumber>{formData.committeeHeadPhone}</EnglishNumber></td>
                  <td className="px-2 py-1.5 text-gray-300">.................</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="border-l border-gray-300 px-2 py-1.5 font-bold bg-gray-50">عضو لجنة (1)</td>
                  <td className="border-l border-gray-300 px-2 py-1.5 font-bold">{formData.member1Name}</td>
                  <td className="border-l border-gray-300 px-2 py-1.5 font-bold"><EnglishNumber>{formData.member1Phone || "---"}</EnglishNumber></td>
                  <td className="px-2 py-1.5 text-gray-300">.................</td>
                </tr>
                <tr>
                  <td className="border-l border-gray-300 px-2 py-1.5 font-bold bg-gray-50">عضو لجنة (2)</td>
                  <td className="border-l border-gray-300 px-2 py-1.5 font-bold">{formData.member2Name}</td>
                  <td className="border-l border-gray-300 px-2 py-1.5 font-bold"><EnglishNumber>{formData.member2Phone || "---"}</EnglishNumber></td>
                  <td className="px-2 py-1.5 text-gray-300">.................</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mb-6">
            <h3 className="mb-2 text-[11pt] font-bold">التعهدات والإقرارات القانونية</h3>
            <div className="rounded-lg border border-gray-300 p-2.5 bg-gray-50">
              <ul className="list-inside list-disc space-y-1 text-[9.5pt] font-medium leading-[1.4]">
                <li>نتعهد كعناصر لجنة منظمة بأن كافة المعلومات والبيانات المدونة أعلاه صحيحة ودقيقة، ونتحمل مسؤوليتها.</li>
                <li>نتعهد بالالتزام التام بالطابع السلمي والقانوني للفعالية وعدم المساس بالممتلكات العامة أو الخاصة.</li>
                <li>نتعهد بالالتزام الدقيق بالمكان والزمان المحددين وعدم الإخلال بالأمن أو الآداب العامة.</li>
              </ul>
            </div>
          </div>
          <div className="flex items-start justify-around border-t border-black pt-4 px-4 mt-4">
            <div className="text-center w-1/3">
              <p className="mb-6 text-[10pt] font-bold">توقيع رئيس اللجنة المنظمة</p>
              <p className="text-gray-400">....................................</p>
            </div>
            <div className="text-center w-1/3">
              <p className="mb-6 text-[10pt] font-bold">تاريخ التقديم</p>
              <p className="text-[10pt] font-bold"><EnglishNumber>........ / ........ / 202...</EnglishNumber></p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-300 pt-1.5 flex justify-between items-center opacity-70">
            <p className="text-[9pt] font-bold text-[#073D35]">منصة الفعاليات المدنية السورية</p>
            <p className="text-[8pt] font-bold text-gray-600">تم تجهيز هذا المستند إلكترونياً لتسهيل الإجراءات التنظيمية</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 arabic-premium-text" dir="rtl">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link href="/" className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-[#C8A75A]">
            <ArrowRight className="h-4 w-4" /> العودة للرئيسية
          </Link>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#073D35]/10 px-4 py-2 text-sm font-bold text-[#073D35]">
            <FileText className="h-4 w-4" /> نموذج إلكتروني
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">إنشاء طلب ترخيص فعالية</h1>
          <p className="max-w-xl text-gray-500 font-medium">يرجى تعبئة البيانات التالية بدقة. سيقوم النظام بتنسيقها في مستند PDF رسمي جاهز للطباعة والتقديم المباشر للجهات المعنية.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold text-[#073D35]">
              <User className="h-6 w-6 text-[#C8A75A]" /> أولاً: بيانات مقدم الطلب
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">الاسم الكامل *</label>
                <input type="text" {...register("fullName")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" placeholder="الاسم الثلاثي" />
                <InputError error={errors.fullName?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">البريد الإلكتروني *</label>
                <input type="email" {...register("email")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" placeholder="example@domain.com" dir="ltr" />
                <InputError error={errors.email?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">رقم الهاتف *</label>
                <input type="tel" {...register("phone")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" placeholder="09xxxxxx" dir="ltr" />
                <InputError error={errors.phone?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">الصفة في التنظيم *</label>
                <input type="text" {...register("submitterRole")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" placeholder="مثال: رئيس اللجنة، منسق..." />
                <InputError error={errors.submitterRole?.message} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">اسم الجهة المنظمة اختياري</label>
                <input type="text" {...register("organizationName")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" placeholder="إن وجدت جهة راعية أو منظمة" />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold text-[#073D35]">
              <CalendarDays className="h-6 w-6 text-[#C8A75A]" /> ثانياً: بيانات الفعالية والموقع
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">عنوان الفعالية *</label>
                <input type="text" {...register("eventTitle")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" placeholder="العنوان الرسمي الذي سيظهر في المستند" />
                <InputError error={errors.eventTitle?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">نوع الفعالية *</label>
                <select {...register("eventType")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium">
                  <option value="">اختر النوع...</option>
                  {EVENT_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
                </select>
                <InputError error={errors.eventType?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">المحافظة *</label>
                <select {...register("governorate")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium">
                  <option value="">اختر المحافظة...</option>
                  {GOVERNORATES.map((gov) => (<option key={gov} value={gov}>{gov}</option>))}
                </select>
                <InputError error={errors.governorate?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">المدينة / المنطقة *</label>
                <input type="text" {...register("city")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" placeholder="الناحية أو المدينة" />
                <InputError error={errors.city?.message} />
              </div>
              
              {/* قسم الخريطة الجديد */}
              <div className="md:col-span-2 border border-[#C8A75A]/20 bg-[#FDFBF7] p-5 rounded-2xl my-4">
                <h3 className="text-md font-bold text-[#073D35] mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C8A75A]"/> تحديد الموقع على الخريطة (لتسهيل الوصول)
                </h3>
                <p className="text-xs text-gray-500 mb-4 font-medium">يرجى البحث عن الموقع أو سحب الخريطة والنقر لتحديد مكان الفعالية بدقة لتسهيل وصول المشاركين إليه.</p>
                <LocationPicker onLocationSelect={handleLocationSelect} defaultLat={34.8} defaultLng={38.0} />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">مكان التجمع الدقيق (الوصف النصي) *</label>
                <input type="text" {...register("location")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" placeholder="الساحة، الحديقة، المركز..." />
                <InputError error={errors.location?.message} />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">تاريخ الفعالية *</label>
                <input type="date" {...register("eventDate")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" />
                <InputError error={errors.eventDate?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">العدد المتوقع للحضور *</label>
                <input type="number" min={1} {...register("expectedAttendees", { valueAsNumber: true })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" placeholder="رقم تقريبي" />
                <InputError error={errors.expectedAttendees?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">وقت البداية *</label>
                <input type="time" {...register("startTime")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" />
                <InputError error={errors.startTime?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">وقت النهاية *</label>
                <input type="time" {...register("endTime")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" />
                <InputError error={errors.endTime?.message} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">خط السير اختياري</label>
                <textarea {...register("route")} rows={2} className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" placeholder="اكتب خط السير إن وجد..." />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">هدف الفعالية *</label>
                <textarea {...register("eventGoal")} rows={3} className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50 font-medium" placeholder="اشرح الهدف بشكل رسمي وواضح لتقديمه في الطلب..." />
                <InputError error={errors.eventGoal?.message} />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold text-[#073D35]">
              <Users className="h-6 w-6 text-[#C8A75A]" /> ثالثاً: تشكيل اللجنة المنظمة
            </h2>
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] p-5">
                <h3 className="mb-4 font-bold text-gray-900">رئيس اللجنة</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <input type="text" {...register("committeeHeadName")} placeholder="الاسم الثلاثي *" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A] font-medium" />
                    <InputError error={errors.committeeHeadName?.message} />
                  </div>
                  <div>
                    <input type="tel" {...register("committeeHeadPhone")} placeholder="رقم الهاتف *" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A] font-medium" dir="ltr" />
                    <InputError error={errors.committeeHeadPhone?.message} />
                  </div>
                  <div className="md:col-span-2">
                    <input type="email" {...register("committeeHeadEmail")} placeholder="البريد الإلكتروني *" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A] font-medium" dir="ltr" />
                    <InputError error={errors.committeeHeadEmail?.message} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] p-5">
                  <h3 className="mb-4 font-bold text-gray-900">العضو الأول</h3>
                  <div className="space-y-4">
                    <div>
                      <input type="text" {...register("member1Name")} placeholder="الاسم الثلاثي *" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A] font-medium" />
                      <InputError error={errors.member1Name?.message} />
                    </div>
                    <input type="tel" {...register("member1Phone")} placeholder="رقم الهاتف اختياري" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A] font-medium" dir="ltr" />
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] p-5">
                  <h3 className="mb-4 font-bold text-gray-900">العضو الثاني</h3>
                  <div className="space-y-4">
                    <div>
                      <input type="text" {...register("member2Name")} placeholder="الاسم الثلاثي *" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A] font-medium" />
                      <InputError error={errors.member2Name?.message} />
                    </div>
                    <input type="tel" {...register("member2Phone")} placeholder="رقم الهاتف اختياري" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A] font-medium" dir="ltr" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold text-[#073D35]">
              <CheckSquare className="h-6 w-6 text-[#C8A75A]" /> رابعاً: التعهدات والإقرارات
            </h2>
            <div className="space-y-4">
              {pledges.map((pledge) => (
                <label key={pledge.name} className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                  <input type="checkbox" {...register(pledge.name)} className="mt-1 h-5 w-5 rounded border-gray-300 text-[#073D35] focus:ring-[#073D35]" />
                  <div>
                    <span className="block font-bold text-gray-700">{pledge.text}</span>
                    <InputError error={errors[pledge.name]?.message} />
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-col items-center pt-4">
            <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#073D35] px-12 py-5 text-lg font-bold text-white shadow-xl shadow-[#073D35]/20 transition-all hover:bg-[#052e28] disabled:cursor-not-allowed disabled:bg-[#073D35]/50 md:w-auto">
              {isSubmitting ? "جاري تجهيز وإرسال الطلب..." : "تأكيد وإنشاء الطلب"}
              {!isSubmitting && <ArrowRight className="h-5 w-5 rotate-180" />}
            </button>
            <p className="mt-4 text-sm font-medium text-gray-400">بالضغط على تأكيد، سيتم إنشاء كود مرجعي خاص بك لتتمكن من تتبع طلبك.</p>
          </div>
        </form>
      </div>
    </div>
  );
}