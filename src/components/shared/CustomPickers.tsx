// ID: CUSTOM_LUXURY_PICKERS
"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarDays, Clock, ChevronRight, ChevronLeft, X } from "lucide-react";

// --- مكون اختيار التاريخ الفخم ---
export function CustomDatePicker({ value, onChange, placeholder = "اختر التاريخ", error }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const popupRef = useRef<HTMLDivElement>(null);

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
    // Format YYYY-MM-DD
    const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={popupRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3.5 rounded-xl border bg-gray-50 cursor-pointer transition-all ${isOpen ? 'border-[#C8A75A] ring-2 ring-[#C8A75A]/20' : 'border-gray-200 hover:border-[#C8A75A]/50'}`}
      >
        <span className={value ? "text-gray-900 font-bold" : "text-gray-400 font-medium"}>
          {value || placeholder}
        </span>
        <CalendarDays className={`w-5 h-5 transition-colors ${isOpen ? 'text-[#C8A75A]' : 'text-gray-400'}`} />
      </div>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronRight className="w-5 h-5"/></button>
            <div className="font-bold text-[#073D35]">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
            <button type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronLeft className="w-5 h-5"/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400">{d}</div>)}
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
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isSelected ? 'bg-[#073D35] text-[#C8A75A] shadow-md shadow-[#073D35]/20' : 'text-gray-700 hover:bg-[#C8A75A]/10 hover:text-[#073D35]'}`}
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

// --- مكون اختيار الوقت الفخم ---
export function CustomTimePicker({ value, onChange, placeholder = "اختر الوقت", error }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Parse existing HH:mm to 12-hour format
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
        className={`w-full flex items-center justify-between p-3.5 rounded-xl border bg-gray-50 cursor-pointer transition-all ${isOpen ? 'border-[#C8A75A] ring-2 ring-[#C8A75A]/20' : 'border-gray-200 hover:border-[#C8A75A]/50'}`}
      >
        <span className={value ? "text-gray-900 font-bold" : "text-gray-400 font-medium"} dir="ltr">
          {displayValue || placeholder}
        </span>
        <Clock className={`w-5 h-5 transition-colors ${isOpen ? 'text-[#C8A75A]' : 'text-gray-400'}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] p-4 right-0 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
            <h4 className="font-bold text-[#073D35]">تحديد التوقيت</h4>
            <button type="button" onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-gray-400 hover:text-red-500"/></button>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-6" dir="ltr">
            {/* Hours */}
            <select 
              value={time.h} 
              onChange={e => setTime({...time, h: e.target.value})}
              className="appearance-none bg-gray-50 border border-gray-200 text-xl font-bold rounded-xl px-3 py-2 outline-none focus:border-[#C8A75A] text-center"
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const val = String(i + 1).padStart(2, '0');
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
            <span className="font-bold text-gray-400 text-xl">:</span>
            {/* Minutes */}
            <select 
              value={time.m} 
              onChange={e => setTime({...time, m: e.target.value})}
              className="appearance-none bg-gray-50 border border-gray-200 text-xl font-bold rounded-xl px-3 py-2 outline-none focus:border-[#C8A75A] text-center"
            >
              {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {/* AM/PM */}
            <div className="flex flex-col gap-1 ml-2">
              <button type="button" onClick={() => setTime({...time, ampm: "AM"})} className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${time.ampm === "AM" ? 'bg-[#073D35] text-[#C8A75A]' : 'bg-gray-100 text-gray-500'}`}>ص</button>
              <button type="button" onClick={() => setTime({...time, ampm: "PM"})} className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${time.ampm === "PM" ? 'bg-[#073D35] text-[#C8A75A]' : 'bg-gray-100 text-gray-500'}`}>م</button>
            </div>
          </div>

          <button type="button" onClick={handleConfirm} className="w-full bg-[#C8A75A] text-[#073D35] font-bold py-2.5 rounded-xl hover:bg-[#b39550] transition-colors">
            تأكيد التوقيت
          </button>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs font-bold text-red-500">{error}</p>}
    </div>
  );
}