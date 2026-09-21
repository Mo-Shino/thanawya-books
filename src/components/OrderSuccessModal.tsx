"use client";

import React from 'react';
import { Order, STAGES_LIST } from '@/types/books';
import { CheckCircle2, MessageCircle, Copy, Check, ArrowRight } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderSuccessModal({ order, isOpen, onClose }: OrderSuccessModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !order) return null;

  const stageInfo = STAGES_LIST.find((s) => s.id === order.stage);

  // WhatsApp Message formulation
  const buildWhatsAppText = () => {
    let msg = `مرحباً، أود تأكيد طلبي لحجز كتب الثانوية 📚\n`;
    msg += `• كود الطلب: *${order.orderCode}*\n`;
    msg += `• اسم الطالب: *${order.studentName}*\n`;
    msg += `• الفصل الدراسي: *فصل ${order.studentClass || ''}*\n`;
    msg += `• المرحلة: *${stageInfo?.nameAr || order.stage}*\n`;
    msg += `• رقم الهاتف: ${order.phone}\n`;
    msg += `\n*قائمة الكتب المطلوبة (${order.totalBooks} كتب):*\n`;
    order.items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.bookTitle} (${item.price} ج.م)\n`;
    });
    msg += `\n• تكلفة الكتب: ${order.booksPrice} ج.م\n`;
    msg += `• مصاريف التوصيل: ${order.deliveryFee === 0 ? 'مجاناً' : `${order.deliveryFee} ج.م`}\n`;
    msg += `• *المبلغ الإجمالي: ${order.totalPrice} جنيه مصري*\n\n`;
    msg += `شكراً لكم!`;
    return encodeURIComponent(msg);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${buildWhatsAppText()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#332d24]/60 backdrop-blur-sm font-ibm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl border border-[#eb842d]/30 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Animated Check Icon */}
        <div className="w-16 h-16 rounded-3xl bg-green-100 text-green-600 flex items-center justify-center mb-4 shadow-sm border border-green-200 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <h3 className="text-2xl font-black text-[#332d24] mb-1">
          تم تسجيل طلبك بنجاح! 🎉
        </h3>
        <p className="text-xs sm:text-sm text-[#332d24]/70 mb-5">
          شكراً لك، تم حفظ طلبك وإدراجه ضمن دفعة الطباعة الحالية
        </p>

        {/* Order Code Box */}
        <div className="w-full bg-[#fce8dd]/60 border border-[#eb842d]/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="text-right">
            <div className="text-[11px] font-semibold text-[#332d24]/60">كود الطلب الخاص بك:</div>
            <div className="text-xl font-black text-[#eb842d] tracking-wider">
              {order.orderCode}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#eb842d]/30 text-xs font-bold text-[#332d24] hover:bg-[#eb842d]/10 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#eb842d]" />
                <span>نسخ الكود</span>
              </>
            )}
          </button>
        </div>

        {/* Details Pill */}
        <div className="w-full text-xs space-y-2 mb-6 bg-[#fffaf6] p-4 rounded-xl border border-[#eb842d]/15 text-right">
          <div className="flex justify-between">
            <span className="text-[#332d24]/60">الطالب:</span>
            <span className="font-bold text-[#332d24]">{order.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#332d24]/60">الفصل:</span>
            <span className="font-bold text-[#eb842d]">فصل {order.studentClass}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#332d24]/60">المرحلة:</span>
            <span className="font-bold text-[#eb842d]">{stageInfo?.nameAr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#332d24]/60">عدد الكتب:</span>
            <span className="font-bold text-[#332d24]">{order.totalBooks} كتب</span>
          </div>
          <div className="flex justify-between border-t border-[#eb842d]/15 pt-2 font-bold text-sm">
            <span>المبلغ الإجمالي:</span>
            <span className="text-[#eb842d]">{order.totalPrice} جنيه مصري</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          {/* WhatsApp Direct Action */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebd5b] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>إرسال تفاصيل الحجز للمشرف عبر واتساب</span>
          </a>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#332d24]/70 hover:text-[#332d24] hover:bg-gray-100 transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>

      </div>
    </div>
  );
}
