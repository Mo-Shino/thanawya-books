"use client";

import React from 'react';
import { Book } from '@/types/books';
import { calculateDeliveryFee } from '@/lib/booksService';
import { ShoppingBag, ArrowLeft, Truck } from 'lucide-react';

interface OrderSummaryBarProps {
  selectedBooks: Book[];
  onOpenCheckout: () => void;
}

export function OrderSummaryBar({ selectedBooks, onOpenCheckout }: OrderSummaryBarProps) {
  if (selectedBooks.length === 0) return null;

  const count = selectedBooks.length;
  const subtotal = selectedBooks.reduce((acc, b) => acc + b.price, 0);
  const deliveryFee = calculateDeliveryFee(count);
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t-2 border-[#eb842d]/30 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] font-ibm animate-in slide-in-from-bottom-5 duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        
        {/* Count & Details */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#eb842d] text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
              {count}
            </div>
            <div>
              <div className="text-xs text-[#332d24]/70 font-semibold">
                تم اختيار {count} {count === 1 ? 'كتاب' : 'كتب'}
              </div>
              <div className="text-sm font-bold text-[#332d24]">
                مجموع الكتب: <span className="text-[#eb842d]">{subtotal} ج.م</span>
              </div>
            </div>
          </div>

          {/* Delivery fee info */}
          <div className="hidden xs:flex items-center gap-2 bg-[#fce8dd] px-3 py-1.5 rounded-xl border border-[#eb842d]/25">
            <Truck className="w-4 h-4 text-[#eb842d]" />
            <span className="text-xs font-bold text-[#332d24]">
              التوصيل: {deliveryFee === 0 ? 'مجاناً 🚀' : `${deliveryFee} ج.م`}
            </span>
          </div>
        </div>

        {/* Grand Total & Checkout Button */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-4">
          <div className="text-right shrink-0">
            <div className="text-[10px] sm:text-[11px] text-[#332d24]/60 font-semibold">
              <span className="hidden sm:inline">الإجمالي النهائي (شامل التوصيل):</span>
              <span className="sm:hidden">المجموع شامل التوصيل:</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-3xl font-black text-[#332d24]">
                {total}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#eb842d]">
                ج.م
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCheckout}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#eb842d] to-[#d26f1c] hover:from-[#d26f1c] hover:to-[#b95d13] text-white font-extrabold text-xs sm:text-base shadow-[0_8px_20px_rgba(235,132,45,0.35)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>إتمام وتأكيد الحجز</span>
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </div>
  );
}
