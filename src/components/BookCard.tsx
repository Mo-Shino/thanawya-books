"use client";

import React from 'react';
import { Book } from '@/types/books';
import { FileText, Plus, Minus } from 'lucide-react';

interface BookCardProps {
  book: Book;
  isSelected?: boolean;
  quantity?: number;
  onToggleSelect?: (book: Book) => void;
  onIncrease?: (book: Book) => void;
  onDecrease?: (book: Book) => void;
  onPreviewPdf: (book: Book) => void;
}

export function BookCard({
  book,
  isSelected = false,
  quantity = 0,
  onToggleSelect,
  onIncrease,
  onDecrease,
  onPreviewPdf,
}: BookCardProps) {
  const effectiveQty = quantity > 0 ? quantity : isSelected ? 1 : 0;

  const handlePlus = () => {
    if (onIncrease) {
      onIncrease(book);
    } else if (onToggleSelect) {
      onToggleSelect(book);
    }
  };

  const handleMinus = () => {
    if (onDecrease) {
      onDecrease(book);
    } else if (onToggleSelect) {
      onToggleSelect(book);
    }
  };

  const getTermLabel = (term: string) => {
    switch (term) {
      case 'term_1':
        return 'ترم أول';
      case 'term_2':
        return 'ترم ثاني';
      case 'full_year':
        return 'سنة كاملة';
      default:
        return term;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-5 transition-all border-2 flex flex-col justify-between font-ibm ${
        effectiveQty > 0
          ? 'border-[#eb842d] shadow-md ring-2 ring-[#eb842d]/20 bg-[#fffdfb]'
          : 'border-[#eb842d]/15 hover:border-[#eb842d]/40 shadow-xs'
      }`}
    >
      {/* Title & Term */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#fce8dd] text-[#eb842d]">
            {getTermLabel(book.term)}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[#332d24]">
              {book.price}
            </span>
            <span className="text-xs font-bold text-[#eb842d]">
              ج.م
            </span>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#332d24] mb-4">
          {book.title}
        </h3>
      </div>

      {/* Two Clean Buttons: PDF Preview & Add / Quantity */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#eb842d]/10 items-center">
        <button
          type="button"
          onClick={() => onPreviewPdf(book)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-[#fce8dd]/60 hover:bg-[#fce8dd] text-[#332d24] border border-[#eb842d]/30 transition-all cursor-pointer h-10 whitespace-nowrap"
        >
          <FileText className="w-3.5 h-3.5 text-[#eb842d]" />
          <span>معاينة PDF</span>
        </button>

        {effectiveQty === 0 ? (
          <button
            type="button"
            onClick={handlePlus}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white hover:bg-[#eb842d]/10 text-[#332d24] border border-[#eb842d]/40 h-10 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-[#eb842d]" />
            <span>إضافة</span>
          </button>
        ) : (
          <div className="flex items-center justify-between bg-[#eb842d] text-white rounded-xl px-1.5 py-1 h-10 shadow-xs">
            <button
              type="button"
              onClick={handleMinus}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
              title="تقليل نسخة"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <div className="font-black text-sm px-1 select-none flex items-center gap-1">
              <span>{effectiveQty}</span>
              <span className="text-[10px] opacity-80 font-normal">نسخة</span>
            </div>
            <button
              type="button"
              onClick={handlePlus}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
              title="زيادة نسخة"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
