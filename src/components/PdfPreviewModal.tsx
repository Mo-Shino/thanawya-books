"use client";

import React, { useState, useEffect } from 'react';
import { Book } from '@/types/books';
import { X, Maximize2, Minimize2, FileText, Check, Plus, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

interface PdfPreviewModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected?: boolean;
  onToggleSelect?: (book: Book) => void;
}

export function PdfPreviewModal({
  book,
  isOpen,
  onClose,
  isSelected = false,
  onToggleSelect,
}: PdfPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isFullscreen]);

  if (!isOpen || !book) return null;

  const pdfUrl = book.pdfUrl || book.samplePdfUrl || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#332d24]/75 backdrop-blur-md font-ibm animate-in fade-in duration-200">
      
      {/* Modal Box with strict viewport containment */}
      <div 
        className={`bg-white flex flex-col shadow-2xl border border-[#eb842d]/30 overflow-hidden relative transition-all duration-200 ${
          isFullscreen 
            ? 'w-full h-full rounded-none fixed inset-0 z-50' 
            : 'w-[calc(100vw-16px)] sm:w-full max-w-5xl h-[92vh] max-h-[92vh] rounded-2xl sm:rounded-3xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Bar Header */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#fff3eb] to-[#fce8dd] border-b border-[#eb842d]/25 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#eb842d] text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#eb842d]/15 text-[#eb842d] text-[10px] sm:text-xs font-black whitespace-nowrap">
                  {book.subject}
                </span>
                <span className="text-[11px] font-bold text-[#332d24]/60 hidden md:inline">
                  معاينة مدمجة داخل الصفحة
                </span>
              </div>
              <h3 className="text-xs sm:text-base md:text-lg font-black text-[#332d24] truncate mt-0.5 max-w-[170px] xs:max-w-[240px] sm:max-w-md">
                {book.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Fullscreen Toggle within page */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-[#fff7f0] text-[#332d24] border border-[#eb842d]/30 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              title={isFullscreen ? 'تصغير النافذة' : 'تكبير ملء الشاشة'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#eb842d]" />
                  <span className="hidden sm:inline">تصغير</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#eb842d]" />
                  <span className="hidden sm:inline">ملء الشاشة</span>
                </>
              )}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white hover:bg-red-50 text-[#332d24] flex items-center justify-center border border-[#eb842d]/30 hover:border-red-200 hover:text-red-600 transition-colors shadow-2xs cursor-pointer shrink-0"
              title="إغلاق المعاينة"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Notice bar */}
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#fffaf6] border-b border-[#eb842d]/15 text-[10px] sm:text-xs text-[#332d24]/80 flex items-center justify-between gap-2 overflow-hidden shrink-0">
          <span className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-[#eb842d] shrink-0" />
            <span className="truncate">معاينة حية للمحتوى - تصفح الفهرس والصفحات مباشرة</span>
          </span>
          <span className="font-extrabold text-[#eb842d] shrink-0 whitespace-nowrap">
            السعر: {book.price} ج.م
          </span>
        </div>

        {/* PDF Viewer Body - 100% In-App */}
        <div className="flex-1 bg-[#262626] relative w-full h-full overflow-hidden flex items-center justify-center">
          {pdfUrl ? (
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full border-0"
            >
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title={`معاينة ${book.title}`}
              />
            </object>
          ) : (
            <div className="text-white/60 text-xs font-bold p-6 text-center">
              ملف الـ PDF غير متوفر حالياً
            </div>
          )}
        </div>

        {/* Footer Actions - Responsive Mobile First (No squished words!) */}
        <div className="p-3 sm:px-6 sm:py-3.5 bg-white border-t border-[#eb842d]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shrink-0">
          
          {/* Row 1 on mobile: Price & Quick Close */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-[#332d24]/60 font-semibold whitespace-nowrap">سعر النسخة:</span>
              <span className="text-xl sm:text-2xl font-black text-[#eb842d]">{book.price}</span>
              <span className="text-xs font-bold text-[#332d24]">ج.م</span>
            </div>

            {/* Mobile-only Close / Back button */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden px-3 py-1.5 rounded-xl text-xs font-bold text-[#332d24]/75 hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              متابعة التصفح
            </button>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Desktop-only Close button */}
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-bold text-[#332d24]/80 hover:text-[#332d24] hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              إغلاق
            </button>

            {onToggleSelect && (
              <button
                type="button"
                onClick={() => onToggleSelect(book)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#332d24] text-white hover:bg-black'
                    : 'bg-[#eb842d] text-white hover:bg-[#d26f1c]'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4 text-[#eb842d] stroke-[2.5]" />
                    <span className="whitespace-nowrap">تمت الإضافة (إلغاء)</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span className="whitespace-nowrap">إضافة هذا الكتاب لطلبي</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
