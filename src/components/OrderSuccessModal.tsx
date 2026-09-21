"use client";

import React from 'react';
import { Order } from '@/types/books';
import { CheckCircle2 } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderSuccessModal({ order, isOpen, onClose }: OrderSuccessModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#332d24]/60 backdrop-blur-sm font-ibm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl border border-[#eb842d]/30 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Check Icon */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 shadow-xs border border-emerald-200">
          <CheckCircle2 className="w-11 h-11 stroke-[2.5]" />
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-black text-[#332d24] mb-2">
          تم استلام طلبك بنجاح!
        </h3>
        
        <p className="text-xs sm:text-sm text-[#332d24]/75 mb-6 leading-relaxed">
          شكراً لك، تم تسجيل طلبك وسيتم تجهيز كتبك وتسليمها لك في المدرسة قريباً إن شاء الله.
        </p>

        {/* Chic Summary Box */}
        <div className="w-full text-xs sm:text-sm space-y-2.5 mb-6 bg-[#fffaf6] p-5 rounded-2xl border border-[#eb842d]/20 text-right">
          <div className="flex justify-between items-center py-1 border-b border-[#eb842d]/10">
            <span className="text-[#332d24]/60">اسم الطالب:</span>
            <span className="font-bold text-[#332d24]">{order.studentName}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#eb842d]/10">
            <span className="text-[#332d24]/60">الفصل الدراسي:</span>
            <span className="font-black text-[#eb842d] bg-[#fce8dd] px-2.5 py-0.5 rounded-lg">
              فصل {order.studentClass}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#eb842d]/10">
            <span className="text-[#332d24]/60">عدد الكتب المطلوبة:</span>
            <span className="font-bold text-[#332d24]">{order.totalBooks} كتب</span>
          </div>

          <div className="flex justify-between items-center pt-2 font-black text-sm sm:text-base text-[#332d24]">
            <span>المبلغ المطلوب عند الاستلام:</span>
            <span className="text-base sm:text-lg text-[#eb842d]">{order.totalPrice} جنيه مصري</span>
          </div>
        </div>

        {/* Single Clean Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#eb842d] hover:bg-[#d26f1c] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          تم
        </button>

      </div>
    </div>
  );
}
