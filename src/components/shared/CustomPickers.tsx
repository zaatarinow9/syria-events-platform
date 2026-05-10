"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarDays, Clock, ChevronRight, ChevronLeft, X, CheckCircle2 } from "lucide-react";

// ----------------------------------------------------
// 1. مكون اختيار التاريخ الاحترافي (Custom Date Picker)
// ----------------------------------------------------
export function CustomDatePicker({ value, onChange, placeholder = "اختر التاريخ", error }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const popupRef = useRef<HTMLDivElement>(null);

  // إغلاق النافذة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const weekDays = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={popupRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3.5 rounded-xl border bg-gray-50 cursor-pointer transition-all ${isOpen ? 'border-[#C8A75A] ring-2 ring-[#C8A75A]/20 bg-white' : 'border-gray-200 hover:border-[#C8A75A]/50'}`}
      >
        <span className={value ? "text-gray-900 font-bold" : "text-gray-400 font-medium"}>
          {value || placeholder}
        </span>
        <CalendarDays className={`w-5 h-5 transition-colors ${isOpen ? 'text-[#C8A75A]' : 'text-gray-400'}`} />
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-2 w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] p-5 right-0 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6 bg-gray-50 p-2 rounded-xl border border-gray-100">
            <button type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-white rounded-lg text-[#073D35] shadow-sm"><ChevronRight className="w-5 h-5"/></button>
            <div className="font-bold text-[#073D35] text-lg">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
            <button type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-white rounded-lg text-[#073D35] shadow-sm"><ChevronLeft className="w-5 h-5"/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-3">
            {weekDays.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedCurrent = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === formattedCurrent;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all mx-auto ${isSelected ? 'bg-[#073D35] text-[#C8A75A] shadow-md shadow-[#073D35]/20 scale-110' : 'text-gray-700 hover:bg-[#C8A75A]/10 hover:text-[#073D35]'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs font-bold text-red-500">{error}</p>}
    </div>
  );
}

// ----------------------------------------------------
// 2. مكون اختيار الوقت الاحترافي (Custom Time Picker)
// ----------------------------------------------------
export function CustomTimePicker({ value, onChange, placeholder = "اختر التوقيت", error }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // تحويل الوقت من 24 إلى 12 ليتمكن من قراءته
  const parseTime = (val: string) => {
    if (!val) return { h: "12", m: "00", ampm: "AM" };
    let [hours, minutes] = val.split(":");
    let h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return { h: String(h).padStart(2, '0'), m: minutes, ampm };
  };

  const [time, setTime] = useState(parseTime(value));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirm = () => {
    let h24 = parseInt(time.h);
    if (time.ampm === "PM" && h24 !== 12) h24 += 12;
    if (time.ampm === "AM" && h24 === 12) h24 = 0;
    const formatted = `${String(h24).padStart(2, '0')}:${time.m}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const displayValue = value ? `${time.h}:${time.m} ${time.ampm === "AM" ? "صباحاً" : "مساءً"}` : "";

  return (
    <div className="relative w-full" ref={popupRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3.5 rounded-xl border bg-gray-50 cursor-pointer transition-all ${isOpen ? 'border-[#C8A75A] ring-2 ring-[#C8A75A]/20 bg-white' : 'border-gray-200 hover:border-[#C8A75A]/50'}`}
      >
        <span className={value ? "text-gray-900 font-bold" : "text-gray-400 font-medium"} dir="ltr">
          {displayValue || placeholder}
        </span>
        <Clock className={`w-5 h-5 transition-colors ${isOpen ? 'text-[#C8A75A]' : 'text-gray-400'}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] p-5 right-0 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
            <h4 className="font-bold text-[#073D35] text-lg">تحديد التوقيت</h4>
            <button type="button" onClick={() => setIsOpen(false)} className="bg-gray-100 p-1.5 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"><X className="w-4 h-4 text-gray-500"/></button>
          </div>
          
          <div className="flex gap-4 mb-6" dir="ltr">
            {/* الساعات */}
            <div className="flex-1 bg-gray-50 rounded-xl p-2 border border-gray-100">
              <p className="text-center text-xs font-bold text-gray-400 mb-2">الساعة</p>
              <div className="h-40 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                {Array.from({ length: 12 }).map((_, i) => {
                  const val = String(i + 1).padStart(2, '0');
                  return (
                    <button 
                      key={`h-${val}`} 
                      type="button" 
                      onClick={() => setTime({...time, h: val})}
                      className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${time.h === val ? 'bg-[#073D35] text-[#C8A75A] shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center font-bold text-gray-300 text-2xl">:</div>

            {/* الدقائق */}
            <div className="flex-1 bg-gray-50 rounded-xl p-2 border border-gray-100">
              <p className="text-center text-xs font-bold text-gray-400 mb-2">الدقيقة</p>
              <div className="h-40 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                  <button 
                    key={`m-${m}`} 
                    type="button" 
                    onClick={() => setTime({...time, m})}
                    className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${time.m === m ? 'bg-[#073D35] text-[#C8A75A] shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* صباحاً ومساءً */}
            <div className="w-16 flex flex-col justify-center gap-2">
              <button type="button" onClick={() => setTime({...time, ampm: "AM"})} className={`flex-1 rounded-xl text-sm font-bold transition-all border ${time.ampm === "AM" ? 'bg-[#C8A75A]/20 border-[#C8A75A] text-[#073D35] shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'}`}>ص</button>
              <button type="button" onClick={() => setTime({...time, ampm: "PM"})} className={`flex-1 rounded-xl text-sm font-bold transition-all border ${time.ampm === "PM" ? 'bg-[#C8A75A]/20 border-[#C8A75A] text-[#073D35] shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'}`}>م</button>
            </div>
          </div>

          <button type="button" onClick={handleConfirm} className="w-full bg-[#073D35] text-white font-bold py-3.5 rounded-xl hover:bg-[#052e28] transition-all shadow-md shadow-[#073D35]/20 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#C8A75A]" /> اعتماد التوقيت
          </button>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs font-bold text-red-500">{error}</p>}
    </div>
  );
}