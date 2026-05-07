"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { UploadCloud, FileImage, Loader2, CheckCircle2, ArrowRight, User, Calendar, MapPin, Clock, FileCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function TrackDetailsPage() {
  const params = useParams();
  const code = params?.code as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3);
      setFiles(selectedFiles);
    }
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const xhr = new XMLHttpRequest();
    
    // تتبع نسبة الرفع المباشرة
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    });

    // عند الانتهاء بنجاح
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          if (result.success) {
            setUploadSuccess(true);
            setUploadProgress(100);
          } else {
            alert(result.error || "فشل الرفع");
          }
        } catch (e) {
          alert("خطأ في الاستجابة من الخادم");
        }
      } else {
        alert("حدث خطأ أثناء الرفع");
      }
      setUploading(false);
    });

    // عند حدوث خطأ
    xhr.addEventListener("error", () => {
      alert("خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
      setUploading(false);
      setUploadProgress(0);
    });

    xhr.open("POST", `/api/requests/track/${code}/upload`, true);
    xhr.send(formData);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><Loader2 className="w-10 h-10 animate-spin text-[#073D35]" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold bg-[#F9FAFB]" dir="rtl">{error}</div>;

  // التحقق من تفعيل زر الرفع (يجب أن يكون هناك ملفات، ولا يجب أن يكون قيد الرفع)
  const isUploadDisabled = files.length === 0 || uploading;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 arabic-premium-text" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <Link href="/track" className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#C8A75A] transition-colors w-fit">
          <ArrowRight className="h-4 w-4" /> العودة للبحث
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* القسم الأيمن: معلومات الطلب الأساسية */}
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <div className="mb-6 border-b border-gray-100 pb-6">
              <span className="inline-block bg-[#FDFBF7] border border-[#C8A75A]/30 text-[#C8A75A] px-4 py-1.5 rounded-lg font-mono text-lg font-bold uppercase mb-3">
                {data?.request_number}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{data?.event_title}</h1>
            </div>
            
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#C8A75A]" /> المعلومات الأساسية للطلب
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <User className="w-5 h-5 text-[#073D35] mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-400">مقدم الطلب</p>
                  <p className="text-sm font-bold text-gray-800">{data?.full_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <MapPin className="w-5 h-5 text-[#073D35] mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-400">الموقع</p>
                  <p className="text-sm font-bold text-gray-800">{data?.governorate} - {data?.city} ({data?.location})</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <Calendar className="w-5 h-5 text-[#073D35] mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-gray-400">التاريخ</p>
                    <p className="text-sm font-bold text-gray-800">{data?.event_date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <Clock className="w-5 h-5 text-[#073D35] mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-gray-400">التوقيت</p>
                    <p className="text-sm font-bold text-gray-800">{data?.start_time}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* القسم الأيسر: رفع الموافقة */}
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 flex flex-col justify-center">
            
            <div className="mb-6 p-4 bg-[#C8A75A]/10 border border-[#C8A75A]/20 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-[#C8A75A] shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-gray-800 leading-relaxed">
                باقي رفع الموافقة الصادرة عن المحافظة أو المركز الأمني ليتم نشر فعاليتك بشكل رسمي على منصة وينكم.
              </p>
            </div>

            {uploadSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-2xl text-center">
                <CheckCircle2 className="w-14 h-14 mb-4 text-green-500 mx-auto" />
                <h4 className="font-bold text-xl mb-2">تم استلام الموافقة بنجاح!</h4>
                <p className="text-sm font-medium">سيتم مراجعة الوثيقة من قبل الإدارة ونشر الفعالية قريباً.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${files.length > 0 ? 'border-[#073D35] bg-[#073D35]/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#C8A75A]'}`}>
                  <UploadCloud className={`w-12 h-12 mb-3 ${files.length > 0 ? 'text-[#073D35]' : 'text-gray-400'}`} />
                  <span className="text-sm font-bold text-gray-700">اضغط لاختيار صورة الموافقة</span>
                  <span className="text-xs text-gray-500 mt-1 font-medium">الحد الأقصى 3 صور (PNG, JPG)</span>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} disabled={uploading} />
                </label>

                {files.length > 0 && (
                  <div className="space-y-3">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                        <FileImage className="w-5 h-5 text-[#C8A75A]" />
                        <span className="text-sm font-bold text-gray-700 line-clamp-1">{f.name}</span>
                      </div>
                    ))}

                    {/* شريط التحميل يظهر عند بدء الرفع */}
                    {uploading && (
                      <div className="w-full mt-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-[#073D35]">جاري الرفع...</span>
                          <span className="text-xs font-bold text-[#073D35]">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
                          <div 
                            className="bg-[#073D35] h-2.5 rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={handleUpload} 
                      disabled={isUploadDisabled} 
                      className={`w-full font-bold py-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 mt-4 
                        ${isUploadDisabled 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                          : 'bg-[#073D35] hover:bg-[#052e28] text-white shadow-[#073D35]/20'
                        }`}
                    >
                      {uploading ? (
                        <>جاري الرفع... <Loader2 className="w-5 h-5 animate-spin" /></>
                      ) : (
                        "تأكيد وإرسال صورة الموافقة"
                      )}
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