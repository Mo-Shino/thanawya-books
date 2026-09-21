"use client";

import React, { useEffect } from 'react';
import { Book } from '@/types/books';
import { X, ExternalLink, Download, FileText, Check, AlertCircle } from 'lucide-react';

interface PdfPreviewModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onToggleSelect: (book: Book) => void;
}

export function PdfPreviewModal({
  book,
  isOpen,
  onClose,
  isSelected,
  onToggleSelect,
}: PdfPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !book) return null;

  const pdfUrl = book.pdfUrl || book.samplePdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#332d24]/60 backdrop-blur-sm font-ibm animate-in fade-in duration-200">
      
      {/* Modal Box */}
      <div 
        className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl border border-[#eb842d]/30 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#fce8dd] border-b border-[#eb842d]/25 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#eb842d] text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-[#332d24] truncate">
                معاينة: {book.title}
              </h3>
              <p className="text-xs text-[#332d24]/70 flex items-center gap-2">
                <span>المادة: {book.subject}</span>
                <span>•</span>
                <span>السعر: {book.price} ج.م</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Open in new tab */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#332d24] border border-[#eb842d]/30 hover:bg-[#eb842d]/10 transition-colors"
              title="فتح الملف في نافذة مستقلة"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#eb842d]" />
              <span className="hidden sm:inline">نافذة كاملة</span>
            </a>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white text-[#332d24] flex items-center justify-center border border-[#eb842d]/30 hover:text-red-600 transition-colors"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice bar */}
        <div className="px-4 py-2 bg-[#fff7f0] border-b border-[#eb842d]/15 text-xs text-[#332d24]/75 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#eb842d]" />
            هذه عينة لمعاينة الفهرس وأسلوب الشرح والتنسيق قبل تأكيد طباعة النسخة الكاملة
          </span>
          <span className="font-bold text-[#eb842d] hidden md:inline">
            طباعة عالية الدقة A4 مع تغليف حراري
          </span>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-[#f5f1eb] relative w-full h-full overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full border-0"
            title={`معاينة ${book.title}`}
          />
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-white border-t border-[#eb842d]/20 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-[#332d24]/60">السعر:</span>
            <span className="text-2xl font-black text-[#332d24]">{book.price}</span>
            <span className="text-xs font-bold text-[#eb842d]">جنيه مصري</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#332d24] hover:bg-gray-100 transition-colors"
            >
              متابعة التصفح
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleSelect(book);
              }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all ${
                isSelected
                  ? 'bg-[#332d24] text-white hover:bg-black'
                  : 'bg-[#eb842d] text-white hover:bg-[#d26f1c]'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4 text-[#eb842d]" />
                  <span>تمت الإضافة (اضغط للإلغاء)</span>
                </>
              ) : (
                <>
                  <span>إضافة هذا الكتاب لطلبي</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
