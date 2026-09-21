"use client";

import React from 'react';
import { Book } from '@/types/books';
import { FileText, Check, Plus } from 'lucide-react';

interface BookCardProps {
  book: Book;
  isSelected: boolean;
  onToggleSelect: (book: Book) => void;
  onPreviewPdf: (book: Book) => void;
}

export function BookCard({ book, isSelected, onToggleSelect, onPreviewPdf }: BookCardProps) {
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
        isSelected
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

      {/* Two Clean Buttons: PDF Preview & Add */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#eb842d]/10">
        <button
          type="button"
          onClick={() => onPreviewPdf(book)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-[#fce8dd]/60 hover:bg-[#fce8dd] text-[#332d24] border border-[#eb842d]/30 transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-[#eb842d]" />
          <span>معاينة PDF</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleSelect(book)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isSelected
              ? 'bg-[#eb842d] text-white shadow-xs'
              : 'bg-white hover:bg-[#eb842d]/10 text-[#332d24] border border-[#eb842d]/40'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>محدد</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 text-[#eb842d]" />
              <span>إضافة</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
