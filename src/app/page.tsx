"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Book, StageId, Order, STAGES_LIST } from '@/types/books';
import { getBooks } from '@/lib/booksService';
import { BookCard } from '@/components/BookCard';
import { OrderSummaryBar } from '@/components/OrderSummaryBar';
import { PdfPreviewModal } from '@/components/PdfPreviewModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { Compass, Award, GraduationCap, ArrowRight, CheckSquare, Square } from 'lucide-react';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected stage: null initially so the student sees ONLY the 3 stage cards!
  const [selectedStage, setSelectedStage] = useState<StageId | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookQuantities, setBookQuantities] = useState<Record<string, number>>({});
  
  // Modals state
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Load books
  useEffect(() => {
    async function load() {
      try {
        const data = await getBooks();
        setBooks(data);
      } catch (err) {
        console.error('Failed to load books:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter books for current view
  const visibleBooks = useMemo(() => {
    if (!selectedStage) return [];
    return books.filter((b) => {
      if (b.stage !== selectedStage) return false;
      if (selectedTerm !== 'all' && b.term !== selectedTerm && b.term !== 'full_year') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return b.title.toLowerCase().includes(q) || b.subject.toLowerCase().includes(q);
      }
      return true;
    });
  }, [books, selectedStage, selectedTerm, searchQuery]);

  // Selected books array with duplicates to reflect quantity
  const selectedBooksList = useMemo(() => {
    const list: Book[] = [];
    for (const book of books) {
      const qty = bookQuantities[book.id] || 0;
      for (let i = 0; i < qty; i++) {
        list.push(book);
      }
    }
    return list;
  }, [books, bookQuantities]);

  // Increase book quantity
  const handleIncrease = (book: Book) => {
    setBookQuantities((prev) => ({
      ...prev,
      [book.id]: (prev[book.id] || 0) + 1,
    }));
  };

  // Decrease book quantity
  const handleDecrease = (book: Book) => {
    setBookQuantities((prev) => {
      const current = prev[book.id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[book.id];
        return next;
      }
      return {
        ...prev,
        [book.id]: current - 1,
      };
    });
  };

  // Toggle single book selection
  const handleToggleSelect = (book: Book) => {
    if ((bookQuantities[book.id] || 0) > 0) {
      handleDecrease(book);
    } else {
      handleIncrease(book);
    }
  };

  // Select all visible
  const handleSelectAllVisible = () => {
    setBookQuantities((prev) => {
      const next = { ...prev };
      for (const b of visibleBooks) {
        if (!next[b.id] || next[b.id] === 0) {
          next[b.id] = 1;
        }
      }
      return next;
    });
  };

  // Deselect all visible
  const handleDeselectAllVisible = () => {
    setBookQuantities((prev) => {
      const next = { ...prev };
      for (const b of visibleBooks) {
        delete next[b.id];
      }
      return next;
    });
  };

  const allVisibleSelected =
    visibleBooks.length > 0 && visibleBooks.every((b) => (bookQuantities[b.id] || 0) > 0);

  const currentStageInfo = STAGES_LIST.find((s) => s.id === selectedStage);

  return (
    <div className="min-h-screen pb-32 font-ibm bg-[#fffbf8] text-[#332d24]">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        
        {/* ============================================================ */}
        {/* 1. INITIAL SCREEN: ONLY THE 3 STAGES                         */}
        {/* ============================================================ */}
        {!selectedStage ? (
          <div className="py-6 sm:py-12 text-center max-w-2xl mx-auto animate-in fade-in duration-300">
            <h1 className="text-2xl sm:text-4xl font-black text-[#332d24] mb-3">
              اختر سنتك الدراسية
            </h1>
            <p className="text-sm text-[#332d24]/60 mb-8">
              اضغط على مرحلتك لعرض الكتب والمذكرات المقررة
            </p>

            {/* The 3 Stage Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Junior */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStage('junior');
                  setSelectedTerm('all');
                }}
                className="group p-6 rounded-3xl bg-white border-2 border-[#eb842d]/20 hover:border-[#eb842d] hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center text-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#fce8dd] text-[#eb842d] group-hover:bg-[#eb842d] group-hover:text-white transition-colors flex items-center justify-center mb-4 shadow-xs">
                  <Compass className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-[#332d24] mb-1">
                  جونيور
                </h2>
                <span className="text-xs font-bold text-[#eb842d]">
                  الصف الأول الثانوي (J)
                </span>
              </button>

              {/* Wheeler */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStage('wheeler');
                  setSelectedTerm('all');
                }}
                className="group p-6 rounded-3xl bg-white border-2 border-[#eb842d]/20 hover:border-[#eb842d] hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center text-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#fce8dd] text-[#eb842d] group-hover:bg-[#eb842d] group-hover:text-white transition-colors flex items-center justify-center mb-4 shadow-xs">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-[#332d24] mb-1">
                  ويلر
                </h2>
                <span className="text-xs font-bold text-[#eb842d]">
                  الصف الثاني الثانوي (W)
                </span>
              </button>

              {/* Senior */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStage('senior');
                  setSelectedTerm('all');
                }}
                className="group p-6 rounded-3xl bg-white border-2 border-[#eb842d]/20 hover:border-[#eb842d] hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center text-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#fce8dd] text-[#eb842d] group-hover:bg-[#eb842d] group-hover:text-white transition-colors flex items-center justify-center mb-4 shadow-xs">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-[#332d24] mb-1">
                  سينيور
                </h2>
                <span className="text-xs font-bold text-[#eb842d]">
                  الصف الثالث الثانوي (S)
                </span>
              </button>

            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* 2. STAGE SELECTED: SHOW ITS BOOKS CLEANLY                   */
          /* ============================================================ */
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Stage Bar with Back button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[#eb842d]/20">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedStage(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#eb842d]/30 text-xs font-bold text-[#332d24] hover:bg-[#fce8dd] transition-all cursor-pointer whitespace-nowrap"
                >
                  <ArrowRight className="w-4 h-4 text-[#eb842d]" />
                  <span>تغيير المرحلة</span>
                </button>

                <h1 className="text-xl sm:text-2xl font-black text-[#332d24]">
                  كتب {currentStageInfo?.nameAr} <span className="text-xs sm:text-sm font-bold text-[#eb842d]">({currentStageInfo?.gradeAr})</span>
                </h1>
              </div>

              {/* Quick stage switch tabs */}
              <div className="flex items-center gap-1 bg-[#fce8dd]/60 p-1 rounded-xl border border-[#eb842d]/20 overflow-x-auto no-scrollbar shrink-0">
                {(['junior', 'wheeler', 'senior'] as StageId[]).map((st) => {
                  const info = STAGES_LIST.find((s) => s.id === st);
                  const isCurrent = selectedStage === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setSelectedStage(st);
                        setSelectedTerm('all');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isCurrent
                          ? 'bg-[#eb842d] text-white shadow-xs'
                          : 'text-[#332d24]/70 hover:text-[#332d24]'
                      }`}
                    >
                      {info?.nameAr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter by Term & Select All Bar */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#eb842d]/20 shadow-xs flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
              
              {/* Term buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'term_1', label: 'ترم أول' },
                  { id: 'term_2', label: 'ترم ثاني' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTerm(t.id)}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedTerm === t.id
                        ? 'bg-[#eb842d] text-white'
                        : 'bg-[#fffaf6] text-[#332d24] hover:bg-[#fce8dd]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Select All / Deselect All Button */}
              <div>
                <button
                  type="button"
                  onClick={allVisibleSelected ? handleDeselectAllVisible : handleSelectAllVisible}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    allVisibleSelected
                      ? 'bg-[#332d24] text-white border-[#332d24]'
                      : 'bg-white text-[#eb842d] border-[#eb842d]/40 hover:bg-[#eb842d]/10'
                  }`}
                >
                  {allVisibleSelected ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>إلغاء تحديد الكل ({visibleBooks.length})</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-[#eb842d]" />
                      <span>تحديد الكل ({visibleBooks.length})</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Books Grid */}
            {loading ? (
              <div className="py-20 text-center text-xs font-bold text-[#332d24]/60">
                جاري التحميل...
              </div>
            ) : visibleBooks.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-[#eb842d]/20 p-6">
                <p className="text-sm font-bold text-[#332d24]">لا توجد كتب مطابقة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleBooks.map((book) => {
                  const qty = bookQuantities[book.id] || 0;
                  return (
                    <BookCard
                      key={book.id}
                      book={book}
                      quantity={qty}
                      isSelected={qty > 0}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                      onToggleSelect={handleToggleSelect}
                      onPreviewPdf={(b) => setPreviewBook(b)}
                    />
                  );
                })}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Sticky Order Bar */}
      {selectedStage && (
        <OrderSummaryBar
          selectedBooks={selectedBooksList}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
        />
      )}

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        book={previewBook}
        isOpen={!!previewBook}
        onClose={() => setPreviewBook(null)}
        isSelected={previewBook ? (bookQuantities[previewBook.id] || 0) > 0 : false}
        onToggleSelect={handleToggleSelect}
      />

      {/* Checkout Modal */}
      {selectedStage && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          selectedBooks={selectedBooksList}
          stage={selectedStage}
          onSuccess={(createdOrder) => {
            setIsCheckoutOpen(false);
            setBookQuantities({});
            setCompletedOrder(createdOrder);
          }}
        />
      )}

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={completedOrder}
        isOpen={!!completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
}
