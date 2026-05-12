"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  UploadCloud, 
  FileImage, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  FileCheck, 
  ShieldAlert, 
  XCircle,
  Maximize,
  X
} from "lucide-react";
import Link from "next/link";

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'published': return { label: 'منشور وموافق عليه', color: 'bg-green-50 text-green-700 border-green-200' };
    case 'rejected': return { label: 'مرفوض', color: 'bg-red-50 text-red-700 border-red-200' };
    case 'under_review': return { label: 'الوثائق قيد المراجعة', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'waiting_approval_document': return { label: 'بانتظار رفع الموافقة', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    default: return { label: 'قيد الانتظار', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
  }
};

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

  // حالة عرض الصور المرفوعة مسبقاً
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!code) return;
    fetch(`/api/requests/track/${code}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) {
          setError(resData.error);
        } else {
          setData(resData);
          // جلب روابط الصور المرفوعة مسبقاً إن وجدت
          if (resData.approval_documents && resData.approval_documents.length > 0) {
            const urls = resData.approval_documents.map((path: string) => {
              if (path.startsWith("http")) return path;
              return supabase.storage.from("request-files").getPublicUrl(path).data.publicUrl;
            });
            setExistingImages(urls);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError("فشل في جلب البيانات");
        setLoading(false);
      });
  }, [code, supabase]);

  // منع التمرير عند فتح الصورة
  useEffect(() => {
    if (isImageModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isImageModalOpen]);

  // التحكم باختيار الملفات وتقييدها بـ 3 فقط
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      if (selectedFiles.length > 3) {
        alert("تنبيه: الحد الأقصى المسموح به هو 3 صور فقط. تم اختيار أول 3 صور.");
        setFiles(selectedFiles.slice(0, 3));
      } else {
        setFiles(selectedFiles);
      }
    }
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    if (files.length > 3) {
      alert("لا يمكن رفع أكثر من 3 صور.");
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          if (result.success) {
            setUploadSuccess(true);
            setUploadProgress(100);
            
            // توليد روابط مؤقتة لعرضها فوراً للمستخدم بدون إعادة تحميل الصفحة
            const tempUrls = files.map(file => URL.createObjectURL(file));
            setExistingImages(tempUrls);
            
            setData((prev: any) => ({ ...prev, status: 'under_review' })); 
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

    xhr.addEventListener("error", () => {
      alert("خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
      setUploading(false);
      setUploadProgress(0);
    });

    xhr.open("POST", `/api/requests/track/${code}/upload`, true);
    xhr.send(formData);
  };

  const openImageModal = (url: string) => {
    setSelectedImage(url);
    setIsImageModalOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><Loader2 className="w-10 h-10 animate-spin text-[#073D35]" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold bg-[#F9FAFB] text-xl" dir="rtl">{error}</div>;

  const isUploadDisabled = files.length === 0 || uploading || files.length > 3;
  const statusInfo = getStatusInfo(data?.status);

  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 arabic-premium-text" dir="rtl">
        <div className="container mx-auto max-w-4xl">
          <Link href="/track" className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#C8A75A] transition-colors w-fit">
            <ArrowRight className="h-4 w-4" /> العودة للبحث
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* القسم الأيمن: معلومات الطلب الأساسية */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 h-fit">
              <div className="mb-6 border-b border-gray-100 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block bg-[#FDFBF7] border border-[#C8A75A]/30 text-[#C8A75A] px-4 py-1.5 rounded-lg font-mono text-lg font-bold uppercase">
                    {data?.request_number}
                  </span>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
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
                      <p className="text-sm font-bold text-gray-800 font-sans" dir="ltr">{data?.event_date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <Clock className="w-5 h-5 text-[#073D35] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400">التوقيت</p>
                      <p className="text-sm font-bold text-gray-800 font-sans" dir="ltr">{data?.start_time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* القسم الأيسر: الإجراءات الديناميكية ومعرض الصور */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 flex flex-col min-h-[400px]">
              
              {data?.status === 'published' ? (
                <div className="text-center py-6 flex-1 flex flex-col justify-center">
                  <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6 drop-shadow-sm" />
                  <h4 className="font-bold text-2xl text-gray-900 mb-3">تمت الموافقة والنشر!</h4>
                  <p className="text-gray-500 font-medium leading-relaxed max-w-sm mx-auto mb-8">
                    تهانينا، تمت مراجعة الوثائق والموافقة على طلبك من قبل الإدارة. الفعالية الآن متاحة للعامة على المنصة.
                  </p>
                  <Link 
                    href={`/events/${data.id}`} 
                    className="inline-flex justify-center items-center gap-2 w-full bg-[#073D35] hover:bg-[#052e28] text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-[#073D35]/20 hover:-translate-y-1"
                  >
                    الذهاب لصفحة الفعالية <ArrowRight className="w-5 h-5 rotate-180" />
                  </Link>
                </div>

              ) : data?.status === 'rejected' ? (
                <div className="text-center py-6 flex-1 flex flex-col justify-center">
                  <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6 drop-shadow-sm" />
                  <h4 className="font-bold text-2xl text-gray-900 mb-3">نعتذر، تم رفض الطلب</h4>
                  <p className="text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
                    لم يتم الموافقة على طلبك من قبل الإدارة. قد يكون ذلك بسبب نقص في البيانات أو عدم مطابقة الشروط.
                  </p>
                </div>

              ) : data?.status === 'under_review' || uploadSuccess ? (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="bg-purple-50 border border-purple-100 text-purple-800 p-8 rounded-2xl text-center mb-6">
                    <Clock className="w-16 h-16 mb-4 text-purple-500 mx-auto animate-pulse" />
                    <h4 className="font-bold text-xl mb-3">وثائقك قيد المراجعة</h4>
                    <p className="text-sm font-medium leading-relaxed">
                      تم استلام صور الموافقة بنجاح. الإدارة تقوم بمراجعتها الآن وسيتم إشعارك فور الموافقة ونشر الفعالية.
                    </p>
                  </div>
                </div>

              ) : (
                <div className="space-y-5 flex-1 flex flex-col justify-center">
                  <div className="mb-2 p-4 bg-[#C8A75A]/10 border border-[#C8A75A]/20 rounded-2xl flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-[#C8A75A] shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-gray-800 leading-relaxed">
                      باقي رفع الموافقة الصادرة عن المحافظة أو المركز الأمني ليتم نشر فعاليتك بشكل رسمي على منصة وينكم. (الحد الأقصى 3 صور).
                    </p>
                  </div>

                  <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${files.length > 0 ? 'border-[#073D35] bg-[#073D35]/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#C8A75A]'}`}>
                    <UploadCloud className={`w-12 h-12 mb-3 ${files.length > 0 ? 'text-[#073D35]' : 'text-gray-400'}`} />
                    <span className="text-sm font-bold text-gray-700">اضغط لاختيار صورة الموافقة</span>
                    <span className="text-xs text-gray-500 mt-1 font-medium">الحد الأقصى 3 صور (PNG, JPG)</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      disabled={uploading} 
                    />
                  </label>

                  {files.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#073D35]">الملفات المحددة ({files.length}/3)</span>
                      </div>
                      
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                          <FileImage className="w-5 h-5 text-[#C8A75A]" />
                          <span className="text-sm font-bold text-gray-700 line-clamp-1">{f.name}</span>
                        </div>
                      ))}

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
                          "تأكيد وإرسال الصور"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* معرض الصور السابقة (يظهر فقط إذا كان هناك صور مرفوعة من قبل) */}
              {existingImages.length > 0 && data?.status !== 'waiting_approval_document' && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-[#C8A75A]" /> الوثائق المرفوعة سابقاً ({existingImages.length})
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {existingImages.map((url, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => openImageModal(url)}
                        className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-200 cursor-pointer group"
                      >
                        <img src={url} alt={`موافقة ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* نافذة التكبير (Lightbox) للصور المرفوعة */}
      {isImageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
            onClick={() => setIsImageModalOpen(false)}
            title="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img 
            src={selectedImage} 
            alt="صورة مكبرة" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
}