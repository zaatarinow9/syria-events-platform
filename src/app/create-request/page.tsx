"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  User,
  CalendarDays,
  Users,
  CheckSquare,
  Printer,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  permitRequestSchema,
  type PermitRequestFormValues,
  type PledgeFieldName,
} from "@/lib/validations/permitRequestSchema";
import { GOVERNORATES } from "@/lib/constants/governorates";
import { EVENT_TYPES } from "@/lib/constants/eventTypes";

const pledges: Array<{ name: PledgeFieldName; text: string }> = [
  {
    name: "pledgeTrueInfo",
    text: "أتعهد بأن كافة المعلومات المدخلة صحيحة ودقيقة.",
  },
  {
    name: "pledgePeaceful",
    text: "أتعهد بأن الفعالية ذات طابع سلمي بحت.",
  },
  {
    name: "pledgeCommitment",
    text: "أتعهد بالالتزام بالمكان والوقت المحددين في هذا الطلب.",
  },
  {
    name: "pledgeNoMisleading",
    text: "أتعهد بعدم نشر أي معلومات مضللة حول الفعالية.",
  },
  {
    name: "pledgeAcknowledgment",
    text: "أقر بأن المنصة لا تمنح ترخيصاً وأن التقديم للجهات المختصة هو مسؤوليتي.",
  },
];

function InputError({ error }: { error?: string }) {
  if (!error) return null;

  return <p className="mt-1.5 text-xs font-bold text-red-500">{error}</p>;
}

function generateRequestNumber() {
  return `SY-EVT-${new Date().getFullYear()}-${Math.floor(
    Math.random() * 100000
  )
    .toString()
    .padStart(5, "0")}`;
}

export default function CreateRequestPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const [formData, setFormData] = useState<PermitRequestFormValues | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PermitRequestFormValues>({
    resolver: zodResolver(permitRequestSchema),
  });

  const onSubmit = async (data: PermitRequestFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const generatedNumber = generateRequestNumber();

    setRequestNumber(generatedNumber);
    setFormData(data);
    setIsSubmitted(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isSubmitted && formData) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-12" dir="rtl">
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }

            .no-print {
              display: none !important;
            }

            #print-area, #print-area * {
              visibility: visible;
            }

            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              font-family: var(--font-thmanyah), system-ui, sans-serif !important;
              color: #000000 !important;
            }

            body {
              background: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            @page {
              size: A4 portrait;
              margin: 12mm;
            }

            /* إخفاء رابط الصفحة والتاريخ الافتراضي اللي بيحطه المتصفح */
            @page {
              @top-left { content: none; }
              @top-right { content: none; }
              @bottom-left { content: none; }
              @bottom-right { content: none; }
            }
          }
        `}</style>

        <div className="container mx-auto max-w-3xl px-4 no-print">
          <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-lg md:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#073D35]/20 bg-[#073D35]/10">
              <CheckCircle2 className="h-10 w-10 text-[#073D35]" />
            </div>

            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              تم تجهيز الطلب بنجاح
            </h2>

            <p className="mb-8 text-gray-500">
              رقم طلبك المرجعي في المنصة هو:
            </p>

            <div className="mb-10 inline-block rounded-xl border border-[#C8A75A]/30 bg-[#FDFBF7] px-8 py-4 font-mono text-2xl font-bold tracking-wider text-[#C8A75A]">
              {requestNumber}
            </div>

            <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#073D35] px-8 py-4 font-bold text-white shadow-md shadow-[#073D35]/20 transition-all hover:bg-[#052e28]"
              >
                <Printer className="h-5 w-5" />
                طباعة الطلب / حفظ PDF
              </button>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 font-bold text-gray-700 transition-all hover:bg-gray-50"
              >
                العودة للرئيسية
              </Link>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-5 text-right text-sm text-blue-800">
              <Info className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="leading-relaxed">
                <strong>خطوتك القادمة:</strong> قم بطباعة هذا المستند وتوقيعه
                من قبل رئيس اللجنة، ثم قدمه للجهات الإدارية المختصة في
                محافظتك. بعد حصولك على الموافقة، تواصل معنا برقم الطلب لنشر
                فعاليتك.
              </p>
            </div>
          </div>
        </div>

        {/* تصميم الـ PDF الجاهز للطباعة */}
        <div
          id="print-area"
          className="hidden bg-white text-black relative"
          dir="rtl"
        >
          {/* ترويسة المستند (Header) */}
          <div className="mb-6 flex items-end justify-between border-b-2 border-[#073D35] pb-4">
            <div className="text-[10pt] text-gray-600 space-y-1 font-medium">
              <p>رقم الطلب المرجعي: <span className="font-bold text-black">{requestNumber}</span></p>
              <p>تاريخ الإنشاء: <span className="font-bold text-black">{new Date().toLocaleDateString("ar-SY")}</span></p>
            </div>
            <div className="text-center">
              <h1 className="text-[14pt] font-bold text-[#073D35]">طلب ترخيص تجمع / فعالية مدنية</h1>
              <p className="text-[9pt] text-gray-500 mt-1">وثيقة تنظيمية مخصصة للتقديم للجهات الإدارية المختصة</p>
            </div>
            <div className="text-[10pt] text-gray-600 text-left">
              <p>المرفقات: ( &nbsp; &nbsp; &nbsp; &nbsp; )</p>
            </div>
          </div>

          {/* مقدمة المعروض */}
          <div className="mb-4">
            <h2 className="mb-2 text-[11pt] font-bold">
              السيد محافظ {formData.governorate} المحترم،
            </h2>
            <p className="text-[10pt] text-justify leading-relaxed font-medium">
              نحن اللجنة المنظمة المذكورة تفاصيلها أدناه، نتقدم لمقامكم بطلب
              الموافقة على تنظيم <strong>({formData.eventType})</strong> تحت عنوان{" "}
              <strong>&quot;{formData.eventTitle}&quot;</strong>، وذلك وفقاً
              للبيانات والتعهدات المدونة في هذا المستند، راجين موافقتكم الكريمة للإيعاز لمن يلزم.
            </p>
          </div>

          {/* جدول بيانات الفعالية */}
          <div className="mb-5 overflow-hidden rounded-lg border border-gray-400">
            <div className="border-b border-gray-400 bg-gray-100 px-3 py-1.5 text-[10pt] font-bold">
              أولاً: بيانات وتفاصيل الفعالية
            </div>
            <table className="w-full text-[10pt]">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="w-[120px] bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">اسم الفعالية</td>
                  <td className="px-3 py-1.5">{formData.eventTitle}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">نوع الفعالية</td>
                  <td className="px-3 py-1.5">{formData.eventType}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">المكان</td>
                  <td className="px-3 py-1.5 font-medium">
                    {formData.governorate} - {formData.city} - {formData.location}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">التاريخ والوقت</td>
                  <td className="px-3 py-1.5">
                    بتاريخ {formData.eventDate} | من الساعة {formData.startTime} إلى {formData.endTime}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">العدد المتوقع</td>
                  <td className="px-3 py-1.5">{formData.expectedAttendees} شخص</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">الهدف من الفعالية</td>
                  <td className="px-3 py-1.5 leading-relaxed">{formData.eventGoal}</td>
                </tr>
                {formData.route && (
                  <tr>
                    <td className="bg-gray-50 px-3 py-1.5 font-bold border-l border-gray-300">خط السير</td>
                    <td className="px-3 py-1.5">{formData.route}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* جدول بيانات اللجنة */}
          <div className="mb-5 overflow-hidden rounded-lg border border-gray-400">
            <div className="border-b border-gray-400 bg-gray-100 px-3 py-1.5 text-[10pt] font-bold">
              ثانياً: بيانات اللجنة المنظمة
            </div>
            <table className="w-full text-[10pt] text-center">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="border-l border-gray-300 px-2 py-1.5">الصفة</th>
                  <th className="border-l border-gray-300 px-2 py-1.5">الاسم الثلاثي</th>
                  <th className="border-l border-gray-300 px-2 py-1.5">رقم الهاتف</th>
                  <th className="px-2 py-1.5">التوقيع الشخصي</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="border-l border-gray-300 px-2 py-2 font-bold bg-gray-50">رئيس اللجنة</td>
                  <td className="border-l border-gray-300 px-2 py-2">{formData.committeeHeadName}</td>
                  <td className="border-l border-gray-300 px-2 py-2" dir="ltr">{formData.committeeHeadPhone}</td>
                  <td className="px-2 py-2 text-gray-300">.......................</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="border-l border-gray-300 px-2 py-2 font-bold bg-gray-50">عضو لجنة (1)</td>
                  <td className="border-l border-gray-300 px-2 py-2">{formData.member1Name}</td>
                  <td className="border-l border-gray-300 px-2 py-2" dir="ltr">{formData.member1Phone || "-"}</td>
                  <td className="px-2 py-2 text-gray-300">.......................</td>
                </tr>
                <tr>
                  <td className="border-l border-gray-300 px-2 py-2 font-bold bg-gray-50">عضو لجنة (2)</td>
                  <td className="border-l border-gray-300 px-2 py-2">{formData.member2Name}</td>
                  <td className="border-l border-gray-300 px-2 py-2" dir="ltr">{formData.member2Phone || "-"}</td>
                  <td className="px-2 py-2 text-gray-300">.......................</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* التعهدات */}
          <div className="mb-8">
            <h3 className="mb-2 text-[10pt] font-bold">ثالثاً: التعهدات والإقرارات القانونية</h3>
            <div className="rounded-lg border border-gray-300 p-3 bg-gray-50/50">
              <ul className="list-inside list-disc space-y-1 text-[10pt] font-medium leading-relaxed">
                <li>نتعهد كعناصر لجنة منظمة بأن كافة المعلومات والبيانات المدونة أعلاه صحيحة ودقيقة، ونتحمل مسؤوليتها.</li>
                <li>نتعهد بالالتزام التام بالطابع السلمي والقانوني للفعالية وعدم المساس بالممتلكات العامة أو الخاصة.</li>
                <li>نتعهد بالالتزام الدقيق بالمكان والزمان المحددين وعدم الإخلال بالأمن أو الآداب العامة.</li>
              </ul>
            </div>
          </div>

          {/* التواقيع (في الأسفل) */}
          <div className="mt-8 flex items-start justify-between border-t-2 border-dashed border-gray-400 pt-6 px-10">
            <div className="text-center w-1/3">
              <p className="mb-6 text-[10pt] font-bold">توقيع رئيس اللجنة المنظمة</p>
              <p className="text-gray-400">.............................................</p>
            </div>
            <div className="text-center w-1/3">
              <p className="mb-6 text-[10pt] font-bold">تاريخ التقديم</p>
              <p className="text-[10pt] font-medium">....... / ....... / 202...</p>
            </div>
          </div>

          {/* تذييل المنصة (صغير جداً وأنيق في أسفل الورقة) */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 pt-2 flex justify-between items-center opacity-60">
            <p className="text-[8pt] font-bold text-[#073D35]">منصة الفعاليات المدنية السورية</p>
            <p className="text-[7pt] text-gray-500">تم تجهيز هذا المستند إلكترونياً لتسهيل الإجراءات التنظيمية</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12" dir="rtl">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link
            href="/"
            className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-[#C8A75A]"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Link>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#073D35]/10 px-4 py-2 text-sm font-bold text-[#073D35]">
            <FileText className="h-4 w-4" />
            نموذج إلكتروني
          </div>

          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            إنشاء طلب ترخيص فعالية
          </h1>

          <p className="max-w-xl text-gray-500">
            يرجى تعبئة البيانات التالية بدقة. سيقوم النظام بتنسيقها في مستند
            PDF رسمي جاهز للطباعة والتقديم المباشر للجهات المعنية.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold text-[#073D35]">
              <User className="h-6 w-6 text-[#C8A75A]" />
              أولاً: بيانات مقدم الطلب
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  {...register("fullName")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                  placeholder="الاسم الثلاثي"
                />
                <InputError error={errors.fullName?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                  placeholder="example@domain.com"
                  dir="ltr"
                />
                <InputError error={errors.email?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                  placeholder="09xxxxxx"
                  dir="ltr"
                />
                <InputError error={errors.phone?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  الصفة في التنظيم *
                </label>
                <input
                  type="text"
                  {...register("submitterRole")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                  placeholder="مثال: رئيس اللجنة، منسق..."
                />
                <InputError error={errors.submitterRole?.message} />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  اسم الجهة المنظمة اختياري
                </label>
                <input
                  type="text"
                  {...register("organizationName")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                  placeholder="إن وجدت جهة راعية أو منظمة"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold text-[#073D35]">
              <CalendarDays className="h-6 w-6 text-[#C8A75A]" />
              ثانياً: بيانات الفعالية المخطط لها
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  عنوان الفعالية *
                </label>
                <input
                  type="text"
                  {...register("eventTitle")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                  placeholder="العنوان الرسمي الذي سيظهر في المستند"
                />
                <InputError error={errors.eventTitle?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  نوع الفعالية *
                </label>
                <select
                  {...register("eventType")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                >
                  <option value="">اختر النوع...</option>
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <InputError error={errors.eventType?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  المحافظة *
                </label>
                <select
                  {...register("governorate")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                >
                  <option value="">اختر المحافظة...</option>
                  {GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
                <InputError error={errors.governorate?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  المدينة / المنطقة *
                </label>
                <input
                  type="text"
                  {...register("city")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                  placeholder="الناحية أو المدينة"
                />
                <InputError error={errors.city?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  مكان التجمع الدقيق *
                </label>
                <input
                  type="text"
                  {...register("location")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                  placeholder="الساحة، الحديقة، المركز..."
                />
                <InputError error={errors.location?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  تاريخ الفعالية *
                </label>
                <input
                  type="date"
                  {...register("eventDate")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                />
                <InputError error={errors.eventDate?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  العدد المتوقع للحضور *
                </label>
                <input
                  type="number"
                  min={1}
                  {...register("expectedAttendees", { valueAsNumber: true })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                  placeholder="رقم تقريبي"
                />
                <InputError error={errors.expectedAttendees?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  وقت البداية *
                </label>
                <input
                  type="time"
                  {...register("startTime")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                />
                <InputError error={errors.startTime?.message} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  وقت النهاية *
                </label>
                <input
                  type="time"
                  {...register("endTime")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                />
                <InputError error={errors.endTime?.message} />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  خط السير اختياري
                </label>
                <textarea
                  {...register("route")}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                  placeholder="اكتب خط السير إن وجد..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  هدف الفعالية *
                </label>
                <textarea
                  {...register("eventGoal")}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-[#C8A75A] focus:ring-2 focus:ring-[#C8A75A]/50"
                  placeholder="اشرح الهدف بشكل رسمي وواضح لتقديمه في الطلب..."
                />
                <InputError error={errors.eventGoal?.message} />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold text-[#073D35]">
              <Users className="h-6 w-6 text-[#C8A75A]" />
              ثالثاً: تشكيل اللجنة المنظمة
            </h2>

            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] p-5">
                <h3 className="mb-4 font-bold text-gray-900">رئيس اللجنة</h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <input
                      type="text"
                      {...register("committeeHeadName")}
                      placeholder="الاسم الثلاثي *"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A]"
                    />
                    <InputError error={errors.committeeHeadName?.message} />
                  </div>

                  <div>
                    <input
                      type="tel"
                      {...register("committeeHeadPhone")}
                      placeholder="رقم الهاتف *"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A]"
                      dir="ltr"
                    />
                    <InputError error={errors.committeeHeadPhone?.message} />
                  </div>

                  <div className="md:col-span-2">
                    <input
                      type="email"
                      {...register("committeeHeadEmail")}
                      placeholder="البريد الإلكتروني *"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A]"
                      dir="ltr"
                    />
                    <InputError error={errors.committeeHeadEmail?.message} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] p-5">
                  <h3 className="mb-4 font-bold text-gray-900">العضو الأول</h3>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        {...register("member1Name")}
                        placeholder="الاسم الثلاثي *"
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A]"
                      />
                      <InputError error={errors.member1Name?.message} />
                    </div>

                    <input
                      type="tel"
                      {...register("member1Phone")}
                      placeholder="رقم الهاتف اختياري"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A]"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] p-5">
                  <h3 className="mb-4 font-bold text-gray-900">العضو الثاني</h3>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        {...register("member2Name")}
                        placeholder="الاسم الثلاثي *"
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A]"
                      />
                      <InputError error={errors.member2Name?.message} />
                    </div>

                    <input
                      type="tel"
                      {...register("member2Phone")}
                      placeholder="رقم الهاتف اختياري"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-[#C8A75A]"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold text-[#073D35]">
              <CheckSquare className="h-6 w-6 text-[#C8A75A]" />
              رابعاً: التعهدات والإقرارات
            </h2>

            <div className="space-y-4">
              {pledges.map((pledge) => (
                <label
                  key={pledge.name}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    {...register(pledge.name)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-[#073D35] focus:ring-[#073D35]"
                  />

                  <div>
                    <span className="block font-medium text-gray-700">
                      {pledge.text}
                    </span>
                    <InputError error={errors[pledge.name]?.message} />
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-col items-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#073D35] px-12 py-5 text-lg font-bold text-white shadow-xl shadow-[#073D35]/20 transition-all hover:bg-[#052e28] disabled:cursor-not-allowed disabled:bg-[#073D35]/50 md:w-auto"
            >
              {isSubmitting ? "جاري تجهيز الطلب والمستند..." : "تأكيد وإنشاء الطلب"}
              {!isSubmitting && <ArrowRight className="h-5 w-5 rotate-180" />}
            </button>

            <p className="mt-4 text-sm text-gray-400">
              بالضغط على تأكيد، سيتم توليد مستند PDF جاهز للطباعة.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}