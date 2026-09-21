"use client";

import React from 'react';
import { Truck, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';
import { calculateDeliveryFee } from '@/lib/booksService';

interface DeliveryFeeBannerProps {
  selectedCount: number;
}

export function DeliveryFeeBanner({ selectedCount }: DeliveryFeeBannerProps) {
  const currentFee = calculateDeliveryFee(selectedCount);

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-[#eb842d]/25 shadow-sm font-ibm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title and Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fce8dd] text-[#eb842d] flex items-center justify-center shrink-0 border border-[#eb842d]/20">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[#332d24] flex items-center gap-2">
              <span>نظام وتكلفة التوصيل الموحدة</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#eb842d]/10 text-[#eb842d]">
                توصيل سريع لباب المنزل أو السنتر
              </span>
            </h4>
            <p className="text-xs text-[#332d24]/70">
              تكلفة التوصيل مدعومة وتتناسب مع عدد الكتب المطلوبة
            </p>
          </div>
        </div>

        {/* 3 Tier Pills */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          
          {/* Tier 1: 1 Book */}
          <div
            className={`p-2 sm:py-2.5 sm:px-3 rounded-xl border transition-all ${
              selectedCount === 1
                ? 'bg-[#eb842d] text-white border-[#eb842d] shadow-sm scale-105'
                : 'bg-[#fff9f4] border-[#eb842d]/20 text-[#332d24]'
            }`}
          >
            <div className="text-[11px] font-semibold opacity-85">كتاب واحد</div>
            <div className="text-xs sm:text-sm font-black">
              {selectedCount === 1 ? 'مجاناً 🚀' : '0 ج.م (مجاناً)'}
            </div>
          </div>

          {/* Tier 2: 2-3 Books */}
          <div
            className={`p-2 sm:py-2.5 sm:px-3 rounded-xl border transition-all ${
              selectedCount >= 2 && selectedCount <= 3
                ? 'bg-[#eb842d] text-white border-[#eb842d] shadow-sm scale-105'
                : 'bg-[#fff9f4] border-[#eb842d]/20 text-[#332d24]'
            }`}
          >
            <div className="text-[11px] font-semibold opacity-85">2 - 3 كتب</div>
            <div className="text-xs sm:text-sm font-black">10 ج.م فقط</div>
          </div>

          {/* Tier 3: 4+ Books */}
          <div
            className={`p-2 sm:py-2.5 sm:px-3 rounded-xl border transition-all ${
              selectedCount >= 4
                ? 'bg-[#eb842d] text-white border-[#eb842d] shadow-sm scale-105'
                : 'bg-[#fff9f4] border-[#eb842d]/20 text-[#332d24]'
            }`}
          >
            <div className="text-[11px] font-semibold opacity-85">4 كتب فأكثر</div>
            <div className="text-xs sm:text-sm font-black">15 ج.م فقط 🎉</div>
          </div>

        </div>

      </div>

      {/* Current selection summary feedback */}
      {selectedCount > 0 && (
        <div className="mt-3 pt-3 border-t border-[#eb842d]/15 flex items-center justify-between text-xs">
          <span className="text-[#332d24]/75">
            الكتب المحددة حتى الآن: <strong className="text-[#eb842d] font-bold">{selectedCount} كتب</strong>
          </span>
          <span className="text-[#332d24] font-bold bg-[#fce8dd]/70 px-2.5 py-1 rounded-lg">
            رسوم التوصيل لطلبك: {currentFee === 0 ? 'مجاناً (0 ج.م)' : `${currentFee} ج.م`}
          </span>
        </div>
      )}
    </div>
  );
}
