"use client";

import React, { useState } from 'react';
import { Book, Order, StageId, STAGES_LIST } from '@/types/books';
import { calculateDeliveryFee, createOrder } from '@/lib/booksService';
import { X, User, Phone, School, Loader2, Sparkles, ChevronDown, Check, AlertCircle } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBooks: Book[];
  stage: StageId;
  onSuccess: (order: Order) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  selectedBooks,
  stage,
  onSuccess,
}: CheckoutModalProps) {
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  
  // Available classes based on selected stage:
  // Junior: J1 .. J6
  // Wheeler: W1 .. W6
  // Senior: S1 .. S6
  const getClassesForStage = (st: StageId): string[] => {
    switch (st) {
      case 'junior':
        return ['J1', 'J2', 'J3', 'J4', 'J5', 'J6'];
      case 'wheeler':
        return ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
      case 'senior':
        return ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
    }
  };

  const availableClasses = getClassesForStage(stage);
  const [studentClass, setStudentClass] = useState(availableClasses[0] || 'J1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Group books by ID (HOOK MUST BE AT TOP OF COMPONENT BEFORE ANY RETURN)
  const groupedBooks = React.useMemo(() => {
    const map = new Map<string, { book: Book; count: number; sumPrice: number }>();
    for (const b of selectedBooks) {
      const existing = map.get(b.id);
      if (existing) {
        existing.count += 1;
        existing.sumPrice += b.price;
      } else {
        map.set(b.id, { book: b, count: 1, sumPrice: b.price });
      }
    }
    return Array.from(map.values());
  }, [selectedBooks]);

  // Sync class when stage changes
  React.useEffect(() => {
    const classes = getClassesForStage(stage);
    if (!classes.includes(studentClass)) {
      setStudentClass(classes[0] || 'J1');
    }
  }, [stage, studentClass]);

  if (!isOpen) return null;

  const count = selectedBooks.length;
  const subtotal = selectedBooks.reduce((acc, b) => acc + b.price, 0);
  const deliveryFee = calculateDeliveryFee(count);
  const total = subtotal + deliveryFee;

  const currentStageInfo = STAGES_LIST.find((s) => s.id === stage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim() || studentName.trim().length < 3) {
      setErrorMessage('يرجى إدخال اسم الطالب ثلاثي على الأقل');
      return;
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('يرجى إدخال رقم هاتف واتساب صحيح');
      return;
    }

    if (!studentClass) {
      setErrorMessage('يرجى اختيار فصلك الدراسي');
      return;
    }

    try {
      setIsSubmitting(true);
      const order = await createOrder({
        studentName: studentName.trim(),
        phone: cleanPhone,
        studentClass: studentClass,
        stage,
        selectedBooks,
      });

      setIsSubmitting(false);
      onSuccess(order);
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMessage('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#332d24]/60 backdrop-blur-sm font-ibm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg flex flex-col shadow-2xl border border-[#eb842d]/30 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#fce8dd] border-b border-[#eb842d]/20 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#332d24]">
              تأكيد حجز كتب {currentStageInfo?.nameAr}
            </h3>
            <p className="text-xs text-[#332d24]/70">
              أدخل بياناتك لتسليم الكتب لك في المدرسة
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-[#332d24] flex items-center justify-center border border-[#eb842d]/30 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className="leading-snug">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="w-7 h-7 rounded-xl text-red-400 hover:text-red-700 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-[#332d24] mb-1.5">
              اسم الطالب ثلاثي <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#eb842d] absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="أحمد محمد علي"
                className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-sm text-[#332d24] focus:outline-none focus:ring-2 focus:ring-[#eb842d]"
              />
            </div>
          </div>

          {/* Phone & Class in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-[#332d24] mb-1.5">
                رقم الواتساب <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#eb842d] absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  dir="ltr"
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-sm text-[#332d24] text-right focus:outline-none focus:ring-2 focus:ring-[#eb842d]"
                />
              </div>
            </div>

            {/* Custom Class selection */}
            <div>
              <label className="block text-xs font-bold text-[#332d24] mb-1.5">
                الفصل الدراسي <span className="text-red-500">*</span>
              </label>
              
              <div className="relative">
                {/* Custom Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsClassDropdownOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#fffaf6] border border-[#eb842d]/35 text-sm font-bold text-[#332d24] hover:border-[#eb842d] focus:ring-2 focus:ring-[#eb842d] transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-[#eb842d]" />
                    <span>فصل {studentClass}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#eb842d] transition-transform duration-200 ${
                      isClassDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Custom Dropdown Menu */}
                {isClassDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsClassDropdownOpen(false)}
                    />
                    <div className="absolute right-0 left-0 top-full mt-1.5 z-40 bg-white rounded-2xl border-2 border-[#eb842d]/30 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      {availableClasses.map((cls) => {
                        const isSelected = studentClass === cls;
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => {
                              setStudentClass(cls);
                              setIsClassDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#eb842d] text-white shadow-xs'
                                : 'text-[#332d24] hover:bg-[#fce8dd]/60 hover:text-[#eb842d]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isSelected ? 'bg-white' : 'bg-[#eb842d]/40'
                                }`}
                              />
                              <span>فصل {cls}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Quick Class Chips */}
              <div className="flex items-center gap-1 pt-2 flex-wrap">
                {availableClasses.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      setStudentClass(cls);
                      setIsClassDropdownOpen(false);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      studentClass === cls
                        ? 'bg-[#eb842d] text-white shadow-2xs font-black'
                        : 'bg-[#fffaf6] border border-[#eb842d]/25 text-[#332d24]/75 hover:bg-[#fce8dd]'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Books Order Summary Card */}
          <div className="bg-[#fff9f4] rounded-2xl p-4 border border-[#eb842d]/25">
            <div className="text-xs font-bold text-[#332d24] mb-2 flex items-center justify-between">
              <span>الكتب المختارة ({count} {count === 1 ? 'كتاب' : 'كتب'}):</span>
              <span className="text-[#eb842d] font-bold">فصل {studentClass}</span>
            </div>
            
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {groupedBooks.map(({ book, count: bookCount, sumPrice }) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-[#eb842d]/10 last:border-0"
                >
                  <span className="text-[#332d24] truncate max-w-[75%] font-medium flex items-center gap-1.5">
                    <span>• {book.title}</span>
                    {bookCount > 1 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#eb842d] text-white font-bold text-[10px]">
                        × {bookCount}
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-[#332d24]">{sumPrice} ج.م</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-3 pt-3 border-t border-[#eb842d]/20 space-y-1 text-xs">
              <div className="flex justify-between text-[#332d24]/75">
                <span>سعر الكتب:</span>
                <span>{subtotal} ج.م</span>
              </div>
              <div className="flex justify-between text-[#332d24]/75">
                <span>مصاريف التوصيل:</span>
                <span className="font-bold text-[#eb842d]">
                  {deliveryFee === 0 ? 'مجاناً' : `${deliveryFee} ج.م`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#332d24] pt-1.5 border-t border-[#eb842d]/15">
                <span>الإجمالي المطلوب:</span>
                <span className="text-base text-[#eb842d]">{total} ج.م</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#eb842d] to-[#d26f1c] hover:from-[#d26f1c] hover:to-[#b95d13] text-white font-extrabold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري التسجيل...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>تأكيد الحجز ({total} ج.م)</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
