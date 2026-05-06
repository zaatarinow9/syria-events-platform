"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, FileImage, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RequestData {
  request_number: string;
  event_title: string;
  governorate: string;
  status: string;
}

export default function TrackDetailsPage() {
  const { code } = useParams();
  const router = useRouter();
  const [data, setData] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/requests/track/${code}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) setError(resData.error);
        else setData(resData);
        setLoading(false);
      });
  }, [code]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3);
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return alert("الرجاء اختيار صورة واحدة على الأقل.");
    setUploading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch(`/api/requests/track/${code}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      
      if (result.success) {
        setUploadSuccess(true);
        setData(prev => prev ? { ...prev, status: "waiting_approval_document" } : null);
      } else {
        alert(result.error || "فشل الرفع");
      }
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#073D35]" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold text-xl" dir="rtl">{error} <Link href="/track" className="ml-4 underline text-blue-600">العودة</Link></div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12" dir="rtl">
      <div className="container mx-auto max-w-2xl px-4">
        <Link href="/track" className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#C8A75A]">
          <ArrowRight className="h-4 w-4" /> العودة للبحث
        </Link>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10">
          <div className="mb-8 border-b border-gray-100 pb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{data?.event_title}</h1>
            <p className="text-gray-500 font-medium mb-4">المحافظة: {data?.governorate}</p>
            <div className="inline-block bg-[#FDFBF7] border border-[#C8A75A]/30 text-[#C8A75A] px-6 py-2 rounded-xl font-mono text-xl font-bold tracking-widest uppercase">
              {data?.request_number}
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">إرفاق صور الموافقة الرسمية</h3>
            <p className="text-gray-500 text-sm font-medium mb-6">
              ارفع حتى 3 صور واضحة لوثيقة الموافقة من المحافظة ليتم مراجعتها ونشر الفعالية.
            </p>

            {uploadSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-12 h-12 mb-3 text-green-500" />
                <h4 className="font-bold text-lg">تم استلام الصور بنجاح!</h4>
                <p className="text-sm mt-1">تم تنبيه الإدارة، يرجى انتظار المراجعة.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 hover:border-[#073D35] rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="mb-1 text-sm text-gray-600 font-bold">اضغط لاختيار الصور</p>
                    <p className="text-xs text-gray-500">PNG, JPG (الحد الأقصى 3 صور)</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                </label>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-xl">
                        <FileImage className="w-6 h-6 text-[#C8A75A]" />
                        <span className="text-sm font-medium text-gray-700 line-clamp-1">{f.name}</span>
                      </div>
                    ))}
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full mt-4 bg-[#073D35] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأكيد ورفع الصور"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}