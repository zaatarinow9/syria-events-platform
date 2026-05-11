"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, FileText, User, CalendarDays, Users, CheckSquare, Info, CheckCircle2, Download, MapPin, Loader2, Globe, UploadCloud, ImageIcon } from "lucide-react";
import { permitRequestSchema, type PermitRequestFormValues, type PledgeFieldName } from "@/lib/validations/permitRequestSchema";
import { GOVERNORATES } from "@/lib/constants/governorates";
import { EVENT_TYPES } from "@/lib/constants/eventTypes";
import { CustomDatePicker, CustomTimePicker } from "@/components/shared/CustomPickers";

const LocationPicker = dynamic(() => import("@/components/shared/LocationPicker"), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-50 animate-pulse rounded-2xl border border-gray-200 flex items-center justify-center font-bold text-[#073D35]">جاري تحميل خرائط الأقمار الصناعية...</div>
});

const GOV_CENTERS: Record<string, [number, number]> = {
  "دمشق": [33.5138, 36.2765], "ريف دمشق": [33.5130, 36.3000], "حلب": [36.2021, 37.1343],
  "حمص": [34.7324, 36.7137], "حماة": [35.1318, 36.7578], "اللاذقية": [35.5132, 35.7863],
  "طرطوس": [34.8890, 35.8866], "إدلب": [35.9306, 36.6339], "الرقة": [35.9528, 39.0152],
  "دير الزور": [35.3288, 40.1408], "الحسكة": [36.4984, 40.7486], "درعا": [32.6247, 36.1052],
  "السويداء": [32.7090, 36.5684], "القنيطرة": [33.1256, 35.8215]
};

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
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 34.8, lng: 38.0 });
  const [submitError, setSubmitError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  
  // حالة صورة الشعار
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<PermitRequestFormValues>({
    resolver: zodResolver(permitRequestSchema),
  });

  const selectedGov = useWatch({ control, name: "governorate" });

  useEffect(() => {
    if (selectedGov && GOV_CENTERS[selectedGov]) {
      const center = GOV_CENTERS[selectedGov];
      setMapCoordinates({ lat: center[0], lng: center[1] });
    }
  }, [selectedGov]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setMapCoordinates({ lat, lng });
  };

  const onSubmit = async (data: PermitRequestFormValues) => {
    setSubmitError("");
    try {
      // تحويل الصورة إلى Base64 إن وُجدت
      let logoBase64 = null;
      if (logoFile) {
        logoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(logoFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      }

      const payload = {
        ...data,
        latitude: mapCoordinates.lat,
        longitude: mapCoordinates.lng,
        campaignLogo: logoBase64
      };

      const response = await fetch("/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.error || "حدث خطأ غير معروف في الخادم");
      }
      
      setRequestNumber(resData.request_number);
      setFormData(data);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      setSubmitError(error.message || "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.");
    }
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    const element = document.getElementById("pdf-content-area");
    
    if (!element) {
      setIsDownloading(false);
      return;
    }

    const processPDF = () => {
      element.style.display = "block";
      setTimeout(() => {
        const opt = {
          margin:       10,
          filename:     `طلب-ترخيص-${requestNumber}.pdf`,
          image:        { type: 'jpeg', quality: 1 },
          html2canvas:  { scale: 2, useCORS: true, windowWidth: 800 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        (window as any).html2pdf().set(opt).from(element).save()
          .then(() => {
            element.style.display = "none";
            setIsDownloading(false);
          })
          .catch((error: any) => {
            console.error("PDF Error:", error);
            alert("حدث خطأ أثناء تحميل الملف. يرجى المحاولة مرة أخرى.");
            element.style.display = "none";
            setIsDownloading(false);
          });
      }, 100);
    };

    if (!(window as any).html2pdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => processPDF();
      script.onerror = () => {
        alert("فشل في الاتصال بخادم الـ PDF، يرجى التحقق من اتصال الإنترنت.");
        setIsDownloading(false);
      };
      document.body.appendChild(script);
    } else {
      processPDF();
    }
  };

  if (isSubmitted && formData) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-12 arabic-premium-text print-reset overflow-x-hidden relative" dir="rtl">
        <div className="container mx-auto max-w-3xl px-4 no-print relative z-10">
          <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-lg md:p-12">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-green-500/20 bg-green-500/10">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-gray-900">تم تسجيل طلبك وتجهيز المستند</h2>
            <p className="mb-8 text-gray-500 font-medium leading-relaxed">لتتمكن من نشر طلبك بشكل كامل على منصّة وينكم نطلب منك حفظ هذا الرقم المرجعي لتتمكن من إرفاق صورة الموافقة بعد الحصول عليها من المحافظة المسؤولة وبعد التأكّد من صحة الموافقة يتم نشر فعاليتك بشكل رسمي على منصّة وينكم.</p> 
            <div className="mb-10 inline-block rounded-xl border border-[#C8A75A]/30 bg-[#FDFBF7] px-12 py-6 font-mono text-4xl font-bold tracking-[0.2em] text-[#C8A75A]">
              {requestNumber}
            </div>
            <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
              <button 
                onClick={handleDownloadPDF} 
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#073D35] px-8 py-4 font-bold text-white shadow-md shadow-[#073D35]/20 transition-all hover:bg-[#052e28] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} 
                {isDownloading ? 'جاري التحميل...' : 'تحميل الطلب كـ PDF'}
              </button>
              <Link href="/track" className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#073D35] bg-white px-8 py-4 font-bold text-[#073D35] transition-all hover:bg-gray-50">
                تتبع الطلب الآن
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-full flex justify-center z-[-1000] opacity-0 pointer-events-none" aria-hidden="true">
          <div id="pdf-content-area" className="bg-white text-black text-right p-8 w-[210mm] min-h-[297mm]" dir="rtl">
            <div className="mb-6 text-center border-b-[2px] border-black pb-4 pt-2">
              <h1 className="text-[16pt] font-bold underline decoration-2 underline-offset-4 mb-2">طلب ترخيص تجمع / فعالية مدنية</h1>
              <p className="text-[11pt] font-bold text-gray-800">نموذج تصريح رسمي مخصص للتقديم للجهات الإدارية المختصة</p>
            </div>
            <div className="mb-6">
              <h2 className="mb-2 text-[12pt] font-bold">السيد محافظ {formData.governorate} المحترم،</h2>
              <p className="text-[11pt] text-justify leading-[1.6] font-medium">نحن اللجنة المنظمة المذكورة تفاصيلها أدناه، نتقدم لمقامكم بطلب الموافقة على تنظيم <strong>({formData.eventType})</strong> تحت عنوان <strong>"{formData.eventTitle}"</strong>، وذلك وفقاً للبيانات والتعهدات المدونة في هذا المستند، راجين موافقتكم الكريمة للإيعاز لمن يلزم.</p>
            </div>
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-400">
              <div className="border-b border-gray-400 bg-gray-100 px-4 py-2 text-[11pt] font-bold">أولاً: بيانات وتفاصيل الفعالية</div>
              <table className="w-full text-[10pt] border-collapse">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="w-[120px] bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300">اسم الفعالية</td>
                    <td className="px-4 py-2.5 font-bold">{formData.eventTitle}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300">نوع الفعالية</td>
                    <td className="px-4 py-2.5">{formData.eventType}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300">المكان</td>
                    <td className="px-4 py-2.5 font-medium">{formData.governorate} - {formData.city} - {formData.location}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300">التاريخ والوقت</td>
                    <td className="px-4 py-2.5">بتاريخ <EnglishNumber>{formData.eventDate}</EnglishNumber> | من الساعة <EnglishNumber>{formData.startTime}</EnglishNumber> إلى <EnglishNumber>{formData.endTime}</EnglishNumber></td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300">العدد المتوقع</td>
                    <td className="px-4 py-2.5 font-bold"><EnglishNumber>{formData.expectedAttendees}</EnglishNumber> شخص</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300 align-top">الهدف من الفعالية</td>
                    <td className="px-4 py-2.5 leading-[1.6] whitespace-pre-wrap break-words">{formData.eventGoal}</td>
                  </tr>
                  {formData.route && (
                    <tr>
                      <td className="bg-gray-50 px-4 py-2.5 font-bold border-l border-gray-300 align-top">خط السير</td>
                      <td className="px-4 py-2.5 leading-[1.6] whitespace-pre-wrap break-words">{formData.route}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-400">
              <div className="border-b border-gray-400 bg-gray-100 px-4 py-2 text-[11pt] font-bold">ثانياً: بيانات اللجنة المنظمة (مُقدّمي الطلب)</div>
              <table className="w-full text-[10pt] text-center border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th className="border-l border-gray-300 px-3 py-2 font-bold">الصفة</th>
                    <th className="border-l border-gray-300 px-3 py-2 font-bold">الاسم الثلاثي</th>
                    <th className="border-l border-gray-300 px-3 py-2 font-bold">رقم الهاتف</th>
                    <th className="px-3 py-2 font-bold w-[120px]">التوقيع الشخصي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="border-l border-gray-300 px-3 py-2.5 font-bold bg-gray-50">رئيس اللجنة</td>
                    <td className="border-l border-gray-300 px-3 py-2.5 font-bold">{formData.committeeHeadName}</td>
                    <td className="border-l border-gray-300 px-3 py-2.5 font-bold"><EnglishNumber>{formData.committeeHeadPhone}</EnglishNumber></td>
                    <td className="px-3 py-2.5 text-gray-300">.................</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="border-l border-gray-300 px-3 py-2.5 font-bold bg-gray-50">عضو لجنة (1)</td>
                    <td className="border-l border-gray-300 px-3 py-2.5 font-bold">{formData.member1Name}</td>
                    <td className="border-l border-gray-300 px-3 py-2.5 font-bold"><EnglishNumber>{formData.member1Phone || "---"}</EnglishNumber></td>
                    <td className="px-3 py-2.5 text-gray-300">.................</td>
                  </tr>
                  <tr>
                    <td className="border-l border-gray-300 px-3 py-2.5 font-bold bg-gray-50">عضو لجنة (2)</td>
                    <td className="border-l border-gray-300 px-3 py-2.5 font-bold">{formData.member2Name}</td>
                    <td className="border-l border-gray-300 px-3 py-2.5 font-bold"><EnglishNumber>{formData.member2Phone || "---"}</EnglishNumber></td>
                    <td className="px-3 py-2.5 text-gray-300">.................</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mb-8">
              <h3 className="mb-3 text-[11pt] font-bold">التعهدات والإقرارات القانونية</h3>
              <div className="rounded-lg border border-gray-300 p-4 bg-gray-50">
                <ul className="list-inside list-disc space-y-2 text-[10pt] font-medium leading-[1.5]">
                  <li>نتعهد كعناصر لجنة منظمة بأن كافة المعلومات والبيانات المدونة أعلاه صحيحة ودقيقة، ونتحمل مسؤوليتها.</li>
                  <li>نتعهد بالالتزام التام بالطابع السلمي والقانوني للفعالية وعدم المساس بالممتلكات العامة أو الخاصة.</li>
                  <li>نتعهد بالالتزام الدقيق بالمكان والزمان المحددين وعدم الإخلال بالأمن أو الآداب العامة.</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start justify-around border-t border-black pt-6 px-4 mt-6">
              <div className="text-center w-1/3">
                <p className="mb-8 text-[11pt] font-bold">توقيع رئيس اللجنة المنظمة</p>
                <p className="text-gray-400">....................................</p>
              </div>
              <div className="text-center w-1/3">
                <p className="mb-8 text-[11pt] font-bold">تاريخ التقديم</p>
                <p className="text-[11pt] font-bold"><EnglishNumber>........ / ........ / 202...</EnglishNumber></p>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-300 pt-3 flex justify-between items-center opacity-70">
              <p className="text-[10pt] font-bold text-[#073D35]">منصة الفعاليات المدنية السورية</p>
              <p className="text-[9pt] font-bold text-gray-600">تم تجهيز هذا المستند إلكترونياً لتسهيل الإجراءات التنظيمية</p>
            </div>
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
          <p className="max-w-xl text-gray-500 font-medium">يرجى تعبئة البيانات التالية بدقة، وتحديد الموقع على الخريطة لتسهيل وصول المشاركين.</p>
        </div>

        {submitError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-bold text-center flex items-center justify-center gap-2">
            <Info className="w-5 h-5"/> {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold text-[#073D35]">
              <User className="h-6 w-6 text-[#C8A75A]" /> أولاً: بيانات مقدم الطلب
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">الاسم الكامل *</label>
                <input type="text" {...register("fullName")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium" placeholder="الاسم الثلاثي" />
                <InputError error={errors.fullName?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">البريد الإلكتروني *</label>
                <input type="email" {...register("email")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium" placeholder="example@domain.com" dir="ltr" />
                <InputError error={errors.email?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">رقم الهاتف *</label>
                <input type="tel" {...register("phone")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium" placeholder="09xxxxxx" dir="ltr" />
                <InputError error={errors.phone?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">الصفة في التنظيم *</label>
                <input type="text" {...register("submitterRole")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium" placeholder="مثال: رئيس اللجنة، منسق..." />
                <InputError error={errors.submitterRole?.message} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">اسم الجهة المنظمة اختياري</label>
                <input type="text" {...register("organizationName")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium" placeholder="إن وجدت جهة راعية أو منظمة" />
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
                <input type="text" {...register("eventTitle")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium" placeholder="العنوان الرسمي الذي سيظهر في المستند" />
                <InputError error={errors.eventTitle?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">نوع الفعالية *</label>
                <select {...register("eventType")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium">
                  <option value="">اختر النوع...</option>
                  {EVENT_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
                </select>
                <InputError error={errors.eventType?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">المحافظة *</label>
                <select {...register("governorate")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium">
                  <option value="">اختر المحافظة...</option>
                  {GOVERNORATES.map((gov) => (<option key={gov} value={gov}>{gov}</option>))}
                </select>
                <InputError error={errors.governorate?.message} />
              </div>
              
              <div className="md:col-span-2 bg-[#FDFBF7] p-6 rounded-3xl border-2 border-[#C8A75A]/20 mt-4 mb-2 shadow-sm">
                <div className="mb-4">
                  <h3 className="font-bold text-[#073D35] flex items-center gap-2 mb-1 text-lg">
                    <Globe className="w-5 h-5 text-[#C8A75A]" /> تحديد الموقع عبر القمر الصناعي (إلزامي)
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">اسحب الدبوس بيدك وضعه في مكان التجمع الدقيق ليتمكن المشاركون من الوصول إليه مباشرة.</p>
                </div>
                <LocationPicker onLocationSelect={handleLocationSelect} defaultLat={mapCoordinates.lat} defaultLng={mapCoordinates.lng} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">المدينة / المنطقة *</label>
                <input type="text" {...register("city")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium" placeholder="الناحية أو المدينة" />
                <InputError error={errors.city?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">مكان التجمع (وصف نصي) *</label>
                <input type="text" {...register("location")} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium" placeholder="الساحة، الحديقة، المركز..." />
                <InputError error={errors.location?.message} />
              </div>

              {/* قسم إضافة شعار الحملة (اختياري) */}
              <div className="md:col-span-2 mt-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">شعار أو صورة معبرة عن الحملة (اختياري)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#C8A75A] transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {logoFile ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                          <p className="text-sm font-bold text-gray-700">{logoFile.name}</p>
                          <p className="text-xs text-green-600 font-bold mt-1">تم إرفاق الصورة بنجاح</p>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                          <p className="text-sm font-bold text-gray-600 mb-1">اضغط هنا لاختيار صورة، أو اسحبها وأفلتها</p>
                          <p className="text-xs text-gray-400 font-medium">يُفضل رفع شعار الحملة (PNG أو JPG)</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setLogoFile(e.target.files[0]);
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">تاريخ الفعالية *</label>
                <Controller 
                  name="eventDate" 
                  control={control} 
                  render={({ field }) => <CustomDatePicker value={field.value} onChange={field.onChange} error={errors.eventDate?.message} />} 
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">العدد المتوقع للحضور *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-[#C8A75A]" />
                  </div>
                  <input type="number" min={1} {...register("expectedAttendees", { valueAsNumber: true })} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-12 pl-4 outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium" placeholder="رقم تقريبي" />
                </div>
                <InputError error={errors.expectedAttendees?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">وقت البداية *</label>
                <Controller 
                  name="startTime" 
                  control={control} 
                  render={({ field }) => <CustomTimePicker value={field.value} onChange={field.onChange} error={errors.startTime?.message} />} 
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">وقت النهاية *</label>
                <Controller 
                  name="endTime" 
                  control={control} 
                  render={({ field }) => <CustomTimePicker value={field.value} onChange={field.onChange} error={errors.endTime?.message} />} 
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">خط السير اختياري</label>
                <textarea {...register("route")} rows={2} className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium" placeholder="اكتب خط السير إن وجد..." />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">هدف الفعالية *</label>
                <textarea {...register("eventGoal")} rows={3} className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[#C8A75A] text-base md:text-sm font-medium" placeholder="اشرح الهدف بشكل رسمي وواضح لتقديمه في الطلب..." />
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
                    <input type="text" {...register("committeeHeadName")} placeholder="الاسم الثلاثي *" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 outline-none focus:border-[#C8A75A] text-base md:text-sm font-medium" />
                    <InputError error={errors.committeeHeadName?.message} />
                  </div>
                  <div>
                    <input type="tel" {...register("committeeHeadPhone")} placeholder="رقم الهاتف *" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 outline-none focus:border-[#C8A75A] text-base md:text-sm font-medium" dir="ltr" />
                    <InputError error={errors.committeeHeadPhone?.message} />
                  </div>
                  <div className="md:col-span-2">
                    <input type="email" {...register("committeeHeadEmail")} placeholder="البريد الإلكتروني *" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 outline-none focus:border-[#C8A75A] text-base md:text-sm font-medium" dir="ltr" />
                    <InputError error={errors.committeeHeadEmail?.message} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] p-5">
                  <h3 className="mb-4 font-bold text-gray-900">العضو الأول</h3>
                  <div className="space-y-4">
                    <div>
                      <input type="text" {...register("member1Name")} placeholder="الاسم الثلاثي *" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 outline-none focus:border-[#C8A75A] text-base md:text-sm font-medium" />
                      <InputError error={errors.member1Name?.message} />
                    </div>
                    <input type="tel" {...register("member1Phone")} placeholder="رقم الهاتف اختياري" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 outline-none focus:border-[#C8A75A] text-base md:text-sm font-medium" dir="ltr" />
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] p-5">
                  <h3 className="mb-4 font-bold text-gray-900">العضو الثاني</h3>
                  <div className="space-y-4">
                    <div>
                      <input type="text" {...register("member2Name")} placeholder="الاسم الثلاثي *" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 outline-none focus:border-[#C8A75A] text-base md:text-sm font-medium" />
                      <InputError error={errors.member2Name?.message} />
                    </div>
                    <input type="tel" {...register("member2Phone")} placeholder="رقم الهاتف اختياري" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 outline-none focus:border-[#C8A75A] text-base md:text-sm font-medium" dir="ltr" />
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
                <label key={pledge.name} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-colors hover:bg-gray-100 hover:border-[#C8A75A]/30">
                  <input type="checkbox" {...register(pledge.name)} className="mt-1 h-5 w-5 rounded border-gray-300 text-[#073D35] focus:ring-[#073D35]" />
                  <div>
                    <span className="block font-bold text-gray-800">{pledge.text}</span>
                    <InputError error={errors[pledge.name]?.message} />
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-col items-center pt-4">
            <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#073D35] px-12 py-5 text-lg font-bold text-white shadow-xl shadow-[#073D35]/20 transition-all hover:bg-[#052e28] hover:-translate-y-1 disabled:cursor-not-allowed disabled:bg-[#073D35]/50 md:w-auto">
              {isSubmitting ? <><Loader2 className="animate-spin" /> جاري معالجة الطلب...</> : <>تأكيد وإنشاء الطلب <ArrowRight className="h-5 w-5 rotate-180" /></>}
            </button>
            <p className="mt-4 text-sm font-medium text-gray-400">بالضغط على تأكيد، سيتم إنشاء كود مرجعي خاص بك لتتمكن من تتبع طلبك.</p>
          </div>
        </form>
      </div>
    </div>
  );
}