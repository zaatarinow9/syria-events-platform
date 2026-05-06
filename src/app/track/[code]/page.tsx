"use client";

import { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, FileImage, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TrackDetailsPage() {
  const params = useParams();
  const code = params?.code as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/requests/track/${code}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) setError(resData.error);
        else setData(resData);
        setLoading(false);
      })
      .catch(() => {
        setError("فشل في جلب البيانات");
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
    if (files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch(`/api/requests/track/${code}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) setUploadSuccess(true);
      else alert(result.error || "فشل الرفع");
    } catch (err) {
      alert("خطأ في الاتصال");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#073D35]" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold" dir="rtl">{error}</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-2xl">
        <Link href="/track" className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#C8A75A]">
          <ArrowRight className="h-4 w-4" /> العودة للبحث
        </Link>
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{data?.event_title}</h1>
          <div className="inline-block bg-[#FDFBF7] border border-[#C8A75A]/30 text-[#C8A75A] px-6 py-2 rounded-xl font-mono text-xl font-bold uppercase mb-8">
            {data?.request_number}
          </div>
          {uploadSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 mb-3 text-green-500 mx-auto" />
              <h4 className="font-bold text-lg">تم الرفع بنجاح!</h4>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                <span className="text-sm font-bold text-gray-600">اختر صور الموافقة (الحد الأقصى 3)</span>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
              </label>
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <FileImage className="w-5 h-5 text-[#C8A75A]" />
                      <span className="text-sm font-medium line-clamp-1">{f.name}</span>
                    </div>
                  ))}
                  <button onClick={handleUpload} disabled={uploading} className="w-full bg-[#073D35] text-white font-bold py-4 rounded-xl disabled:opacity-50">
                    {uploading ? "جاري الرفع..." : "تأكيد الرفع"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}