"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowRight, 
  MapPin, 
  CalendarDays, 
  Clock, 
  Users, 
  Target, 
  Route, 
  ShieldCheck, 
  Share2, 
  Link as LinkIcon, 
  CheckCircle2, 
  Navigation, 
  Loader2,
  Maximize,
  X
} from "lucide-react";

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params?.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    setCurrentUrl(window.location.href);

    const fetchEventDetails = async () => {
      if (!eventId) return;
      
      const { data, error } = await supabase.from('permit_requests').select('*').eq('id', eventId).single();

      if (data && !error) {
        let imageUrl = null;
        if (data.campaign_image) {
          const { data: publicUrlData } = supabase.storage.from("request-files").getPublicUrl(data.campaign_image);
          imageUrl = publicUrlData.publicUrl;
        }

        setEvent({
          id: data.id,
          title: data.event_title,
          type: data.event_type,
          status: data.status === 'published' ? 'منشور وموافق عليه' : 'قيد المراجعة',
          governorate: data.governorate,
          city: data.city || data.location,
          location: data.location,
          date: new Date(data.event_date).toLocaleDateString('ar-SY-u-nu-latn', { day: '2-digit', month: 'long', year: 'numeric' }),
          startTime: data.start_time,
          endTime: data.end_time,
          expectedAttendees: data.expected_attendees,
          goal: data.event_goal,
          route: data.route,
          organizationName: data.organization_name,
          submitterRole: data.submitter_role,
          latitude: data.latitude,
          longitude: data.longitude,
          imageUrl: imageUrl
        });
      }
      setLoading(false);
    };
    fetchEventDetails();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsImageModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [eventId, supabase]);

  useEffect(() => {
    if (isImageModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isImageModalOpen]);

  if (loading) return <div className="min-h-screen bg-[#F9FAFB] flex justify-center items-center"><Loader2 className="w-12 h-12 animate-spin text-[#073D35]" /></div>;
  if (!event) return <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center"><h1 className="text-2xl font-bold mb-4 text-[#073D35]">الفعالية غير موجودة</h1><Link href="/" className="bg-[#C8A75A] text-[#073D35] px-6 py-2 rounded-xl font-bold">العودة للرئيسية</Link></div>;

  const shareText = `ندعوكم لحضور ${event.type}: "${event.title}" في ${event.governorate}. التفاصيل:`
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(currentUrl);

  const mapsLink = event.latitude && event.longitude 
    ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.governorate + " " + event.location)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB] py-10 arabic-premium-text" dir="rtl">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/events" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#C8A75A] transition-colors"><ArrowRight className="w-4 h-4" /> العودة للفعاليات</Link>
            <span className="text-[#2F9E6D] bg-[#2F9E6D]/10 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 border border-[#2F9E6D]/20 shadow-sm"><CheckCircle2 className="w-4 h-4" />{event.status}</span>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm mb-8 relative overflow-hidden flex flex-col group">
            {event.imageUrl ? (
              <div className="relative w-full h-[400px] md:h-[500px] bg-gray-100 flex items-end">
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                
                <button 
                  onClick={() => setIsImageModalOpen(true)}
                  className="absolute top-6 left-6 z-30 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md p-3 rounded-full shadow-lg transition-all flex items-center justify-center border border-white/10 group-hover:scale-110"
                >
                  <Maximize className="w-5 h-5" />
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-[#073D35]/95 via-[#073D35]/60 to-transparent z-10 pointer-events-none"></div>
                
                <div className="relative z-20 w-full p-8 md:p-12 text-white">
                  <span className="inline-block px-4 py-1.5 text-sm font-bold rounded-lg border mb-4 shadow-sm bg-white/20 text-white border-white/30 backdrop-blur-md">
                    {event.type}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 drop-shadow-lg">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 font-medium p-5 rounded-2xl border inline-flex shadow-sm bg-[#073D35]/60 border-white/20 backdrop-blur-md text-white">
                    <div className="flex items-center gap-2.5"><MapPin className="w-5 h-5 text-[#C8A75A]" /><span>{event.governorate} - {event.city}</span></div>
                    <div className="w-px h-6 bg-white/30 hidden sm:block"></div>
                    <div className="flex items-center gap-2.5"><CalendarDays className="w-5 h-5 text-[#C8A75A]" /><span className="font-sans" dir="ltr">{event.date}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-12 relative z-20">
                <span className="inline-block px-4 py-1.5 text-sm font-bold rounded-lg border mb-4 shadow-sm bg-[#073D35]/5 text-[#073D35] border-[#073D35]/10">
                  {event.type}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 font-medium p-5 rounded-2xl border inline-flex shadow-sm bg-gray-50 border-gray-100 text-gray-600">
                  <div className="flex items-center gap-2.5"><MapPin className="w-5 h-5 text-[#C8A75A]" /><span>{event.governorate} - {event.city}</span></div>
                  <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>
                  <div className="flex items-center gap-2.5"><CalendarDays className="w-5 h-5 text-[#C8A75A]" /><span className="font-sans" dir="ltr">{event.date}</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-[#073D35] mb-6 flex items-center gap-3"><Target className="w-6 h-6 text-[#C8A75A]" />هدف الفعالية</h2>
                <p className="text-gray-700 leading-relaxed font-medium text-lg whitespace-pre-wrap break-words">{event.goal}</p>
              </section>
              
              {event.route && (
                <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-[#073D35] mb-6 flex items-center gap-3"><Route className="w-6 h-6 text-[#C8A75A]" />خط السير</h2>
                  <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap break-words">{event.route}</p>
                </section>
              )}
              
              <section className="bg-[#FFF8EB] border border-[#FDE68A] rounded-3xl p-6 flex items-start gap-4">
                <ShieldCheck className="w-8 h-8 text-[#D97706] shrink-0" />
                <div><h4 className="font-bold text-[#D97706] mb-2">إخلاء مسؤولية</h4><p className="text-sm text-gray-700 leading-relaxed font-medium">هذه الفعالية منظمة من جهات مدنية مستقلة وتم إخفاء أرقام اللجان للحفاظ على الخصوصية والموثوقية.</p></div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-6 text-lg">الزمان والمكان</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex justify-center items-center border border-gray-100"><Clock className="w-5 h-5 text-[#073D35]" /></div>
                    <div><p className="text-sm text-gray-500 font-bold mb-1">الوقت المبرمج</p><p className="font-medium font-sans" dir="ltr">{event.startTime} - {event.endTime}</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex justify-center items-center border border-gray-100"><MapPin className="w-5 h-5 text-[#073D35]" /></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-bold mb-1">المكان الدقيق</p>
                      <p className="font-medium mb-3">{event.location}</p>
                      <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8A75A] bg-[#C8A75A]/10 px-3 py-1.5 rounded-lg border border-[#C8A75A]/20 transition-colors hover:bg-[#C8A75A]/20">
                        <Navigation className="w-3.5 h-3.5" /> الاتجاهات بدقة عبر الخرائط
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex justify-center items-center border border-gray-100"><Users className="w-5 h-5 text-[#073D35]" /></div>
                    <div><p className="text-sm text-gray-500 font-bold mb-1">العدد المتوقع</p><p className="font-medium"><span className="font-sans" dir="ltr">{event.expectedAttendees}</span> شخص</p></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-5 text-lg">الجهة المنظمة</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {event.imageUrl ? (
                    <div 
                      className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-gray-200 cursor-pointer hover:border-[#C8A75A] transition-colors shadow-sm bg-white"
                      onClick={() => setIsImageModalOpen(true)}
                    >
                      <img src={event.imageUrl} alt="شعار الجهة" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#C8A75A]/20 flex justify-center items-center shrink-0 border border-[#C8A75A]/30">
                      <Users className="w-6 h-6 text-[#C8A75A]" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 mb-1">{event.organizationName || "جهة تطوعية مستقلة"}</p>
                    <p className="text-xs text-gray-500 font-medium">المدخل: {event.submitterRole}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#073D35] rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A75A] rounded-full filter blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
                <Share2 className="w-8 h-8 text-[#C8A75A] mx-auto mb-4 relative z-10" />
                <h3 className="font-bold text-lg mb-2 relative z-10">شارك هذه الفعالية</h3>
                <div className="flex justify-center gap-3 mb-6 mt-4 relative z-10">
                  <a href={`https://wa.me/?text=${encodedText} %0A ${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex justify-center items-center border border-white/10"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex justify-center items-center border border-white/10"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.126H5.078z"/></svg></a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex justify-center items-center border border-white/10"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                </div>
                <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 bg-[#C8A75A] text-[#073D35] hover:bg-white transition-colors py-3.5 rounded-xl font-bold relative z-10"><LinkIcon className="w-5 h-5" />{copied ? "تم نسخ الرابط بنجاح!" : "نسخ رابط الفعالية"}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isImageModalOpen && event.imageUrl && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
            onClick={() => setIsImageModalOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
}