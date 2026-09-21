"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Book,
  Order,
  StageId,
  SemesterTerm,
  OrderStatus,
  STAGES_LIST,
  PrintingManifestItem,
} from '@/types/books';
import {
  getBooks,
  getOrders,
  saveBook,
  deleteBook,
  updateOrderStatus,
  generatePrintingManifest,
  formatPrintingPressWhatsAppMessage,
} from '@/lib/booksService';
import { BooksHeader } from '@/components/BooksHeader';
import {
  Printer,
  Package,
  BookPlus,
  Copy,
  Check,
  Search,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  Truck,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Layers,
  X,
  FileText,
} from 'lucide-react';

export default function AdminPage() {
  // Authentication PIN state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'manifest' | 'orders' | 'books'>('manifest');

  // Data states
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedManifest, setCopiedManifest] = useState(false);

  // Filters
  const [manifestStageFilter, setManifestStageFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStageFilter, setOrderStageFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Book Add/Edit Modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    subject: '',
    stage: 'senior' as StageId,
    term: 'term_1' as SemesterTerm,
    price: 90,
    pdfUrl: '',
    description: '',
    pagesCount: 150,
  });

  // Verify PIN or check cached session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('thanawya_admin_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234
    if (enteredPin === '1234' || enteredPin === '2026') {
      setIsAuthenticated(true);
      setPinError(false);
      sessionStorage.setItem('thanawya_admin_auth', 'true');
    } else {
      setPinError(true);
    }
  };

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedBooks, fetchedOrders] = await Promise.all([getBooks(), getOrders()]);
      setBooks(fetchedBooks);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Generate Printing Press Manifest
  const fullManifest = useMemo(() => {
    return generatePrintingManifest(orders);
  }, [orders]);

  // Filtered manifest
  const filteredManifest = useMemo(() => {
    if (manifestStageFilter === 'all') return fullManifest;
    return fullManifest.filter((m) => m.stage === manifestStageFilter);
  }, [fullManifest, manifestStageFilter]);

  // Summary counts for press
  const totalCopiesToPrint = useMemo(() => {
    return fullManifest.reduce((acc, m) => acc + m.quantity, 0);
  }, [fullManifest]);

  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.totalPrice, 0);
  }, [orders]);

  // Copy WhatsApp manifest message
  const handleCopyManifest = () => {
    const text = formatPrintingPressWhatsAppMessage(filteredManifest);
    navigator.clipboard.writeText(text);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2500);
  };

  // Print manifest (A4)
  const handlePrint = () => {
    window.print();
  };

  // Handle Order Status change
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Handle Book Save
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title.trim() || !bookForm.subject.trim()) return;

    const bookId = editingBook ? editingBook.id : `book_${Date.now()}`;
    const newBook: Book = {
      id: bookId,
      title: bookForm.title.trim(),
      subject: bookForm.subject.trim(),
      stage: bookForm.stage,
      term: bookForm.term,
      price: Number(bookForm.price),
      pdfUrl: bookForm.pdfUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      samplePdfUrl: bookForm.pdfUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: bookForm.description.trim(),
      pagesCount: Number(bookForm.pagesCount) || 100,
      isActive: true,
    };

    await saveBook(newBook);
    setIsBookModalOpen(false);
    setEditingBook(null);
    setBookForm({
      title: '',
      subject: '',
      stage: 'senior',
      term: 'term_1',
      price: 90,
      pdfUrl: '',
      description: '',
      pagesCount: 150,
    });
    loadData();
  };

  // Handle Delete Book
  const handleDeleteBook = async (bookId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكتاب من القائمة؟')) {
      await deleteBook(bookId);
      loadData();
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStageFilter !== 'all' && o.stage !== orderStageFilter) return false;
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim();
        const matchName = o.studentName.toLowerCase().includes(q);
        const matchPhone = o.phone.includes(q);
        const matchCode = o.orderCode.toLowerCase().includes(q);
        const matchClass = (o.studentClass || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchCode || matchClass;
      }
      return true;
    });
  }, [orders, orderStageFilter, orderStatusFilter, orderSearchQuery]);

  // Stage name helper
  const getStageNameAr = (st: StageId) => {
    const found = STAGES_LIST.find((s) => s.id === st);
    return found ? `${found.nameAr} (${found.gradeAr})` : st;
  };

  // -------------------------------------------------------------
  // PIN Verification Screen
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fffbf8] font-ibm flex flex-col justify-between">
        <BooksHeader isAdmin={true} />
        
        <div className="max-w-md mx-auto px-4 py-16 w-full text-center">
          <div className="bg-white rounded-3xl p-8 border-2 border-[#eb842d]/30 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#fce8dd] text-[#eb842d] flex items-center justify-center mx-auto mb-4 border border-[#eb842d]/30 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-[#332d24] mb-2">
              لوحة تحكم المشرف والمطبعة
            </h2>
            <p className="text-xs text-[#332d24]/70 mb-6">
              يرجى إدخال الرقم السري للوصول لتقارير المطبعة وإدارة الطلبات والكتب
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  autoFocus
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="أدخل رمز الدخول (الافتراضي: 1234)"
                  className="w-full text-center tracking-widest text-lg py-3 px-4 rounded-xl bg-[#fffaf6] border border-[#eb842d]/40 text-[#332d24] focus:outline-none focus:ring-2 focus:ring-[#eb842d] transition-all"
                />
              </div>

              {pinError && (
                <p className="text-xs text-red-600 font-bold">
                  رمز المرور غير صحيح، يرجى المحاولة مرة أخرى
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-[#eb842d] hover:bg-[#d26f1c] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
              >
                تسجيل الدخول للوحة التحكم
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#eb842d]/15 text-[11px] text-[#332d24]/50">
              💡 الرمز الافتراضي للتجربة السريعة: <strong>1234</strong>
            </div>
          </div>
        </div>

        <footer className="text-center py-6 text-xs text-[#332d24]/50">
          منصة حجز وطباعة مذكرات الثانوية • 2025/2026
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Authenticated Admin Dashboard
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#fffbf8] font-ibm pb-20">
      <BooksHeader isAdmin={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header & Fast Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#eb842d]/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eb842d]/15 text-[#eb842d]">
                لوحة الإشراف المركزية
              </span>
              <span className="text-xs text-[#332d24]/50">مزامنة حية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#332d24]">
              إدارة طلبات الطباعة ومذكرات الثانوية
            </h1>
          </div>

          {/* Quick Refresh and Print Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#eb842d]/30 text-xs font-bold text-[#332d24] hover:bg-[#fce8dd]/40 transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#eb842d] ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('thanawya_admin_auth');
                setIsAuthenticated(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>قفل اللوحة</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#eb842d]/25 shadow-sm">
            <div className="text-xs font-bold text-[#332d24]/60 mb-1">إجمالي النسخ للمطبعة</div>
            <div className="text-3xl font-black text-[#eb842d]">{totalCopiesToPrint}</div>
            <div className="text-[11px] text-[#332d24]/60 mt-1">نسخة مطلوب طباعتها حالياً</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#eb842d]/25 shadow-sm">
            <div className="text-xs font-bold text-[#332d24]/60 mb-1">إجمالي طلبات الطلاب</div>
            <div className="text-3xl font-black text-[#332d24]">{orders.length}</div>
            <div className="text-[11px] text-[#332d24]/60 mt-1">طلب مسجل على النظام</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#eb842d]/25 shadow-sm">
            <div className="text-xs font-bold text-[#332d24]/60 mb-1">إجمالي المبيعات المحصلة</div>
            <div className="text-3xl font-black text-emerald-700">{totalRevenue} <span className="text-xs font-bold">ج.م</span></div>
            <div className="text-[11px] text-[#332d24]/60 mt-1">شاملة مصاريف التوصيل</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#eb842d]/25 shadow-sm">
            <div className="text-xs font-bold text-[#332d24]/60 mb-1">الكتب والمذكرات المتاحة</div>
            <div className="text-3xl font-black text-[#332d24]">{books.length}</div>
            <div className="text-[11px] text-[#332d24]/60 mt-1">مذكرات مفعلة لجميع المراحل</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b-2 border-[#eb842d]/20 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('manifest')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all cursor-pointer ${
              activeTab === 'manifest'
                ? 'bg-[#eb842d] text-white shadow-md shadow-[#eb842d]/25 scale-[1.02]'
                : 'bg-white/80 hover:bg-white text-[#332d24] border border-[#eb842d]/20'
            }`}
          >
            <Printer className="w-5 h-5" />
            <span>تقرير المطبعة المجمع (أمر الطباعة)</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 text-white font-extrabold">
              {totalCopiesToPrint}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#eb842d] text-white shadow-md shadow-[#eb842d]/25 scale-[1.02]'
                : 'bg-white/80 hover:bg-white text-[#332d24] border border-[#eb842d]/20'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>طلبات الطلاب</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 text-white font-extrabold">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all cursor-pointer ${
              activeTab === 'books'
                ? 'bg-[#eb842d] text-white shadow-md shadow-[#eb842d]/25 scale-[1.02]'
                : 'bg-white/80 hover:bg-white text-[#332d24] border border-[#eb842d]/20'
            }`}
          >
            <BookPlus className="w-5 h-5" />
            <span>إدارة الكتب والـ PDF</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 text-white font-extrabold">
              {books.length}
            </span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: PRINTING PRESS MANIFEST (تقرير المطبعة الذكي)          */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'manifest' && (
          <div className="space-y-6">
            
            {/* Control Bar: Filters & Print/Copy Buttons */}
            <div className="bg-white rounded-2xl p-5 border border-[#eb842d]/25 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Stage Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-bold text-[#332d24]/60 ml-2">تصفية المرحلة:</span>
                {[
                  { id: 'all', label: 'كافة المراحل' },
                  { id: 'senior', label: 'سينيور (3 ثانوي)' },
                  { id: 'wheeler', label: 'ويلر (2 ثانوي)' },
                  { id: 'junior', label: 'جونيور (1 ثانوي)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setManifestStageFilter(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      manifestStageFilter === s.id
                        ? 'bg-[#eb842d] text-white shadow-xs'
                        : 'bg-[#fce8dd]/60 text-[#332d24] hover:bg-[#fce8dd]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Action Buttons: Copy WhatsApp & Print */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyManifest}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebd5b] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer"
                  title="نسخ صيغة الواتساب لإرسالها لمسؤول المطبعة"
                >
                  {copiedManifest ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>تم نسخ الرسالة! جاهزة للواتساب</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ تقرير المطبعة للواتساب</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#eb842d]/30 text-[#332d24] hover:bg-[#fce8dd]/40 text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#eb842d]" />
                  <span>طباعة A4</span>
                </button>
              </div>

            </div>

            {/* Aggregated Manifest Table */}
            <div className="bg-white rounded-3xl border border-[#eb842d]/25 shadow-sm overflow-hidden" id="printable-manifest">
              
              {/* Manifest Header */}
              <div className="p-6 bg-[#fce8dd]/60 border-b border-[#eb842d]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-black text-[#332d24]">
                    بيان أمر الطباعة المجمع للمطبعة (Press Manifest)
                  </h3>
                  <p className="text-xs text-[#332d24]/70">
                    هذا الكشف يجمع كل الكتب المطلوبة من جميع الطلاب مع حصر الكمية المطلوبة بدقة لكل مادة
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-[#332d24]/60">إجمالي النسخ:</span>
                  <div className="text-2xl font-black text-[#eb842d]">
                    {filteredManifest.reduce((acc, m) => acc + m.quantity, 0)} نسخة
                  </div>
                </div>
              </div>

              {filteredManifest.length === 0 ? (
                <div className="py-16 text-center">
                  <Printer className="w-12 h-12 text-[#eb842d]/40 mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#332d24]/70">
                    لا توجد طلبات طباعة مسجلة حتى الآن
                  </p>
                  <p className="text-xs text-[#332d24]/50 mt-1">
                    بمجرد قيام أي طالب بطلب كتب من واجهة الحجز، ستظهر هنا مجمعة تلقائياً
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#fce8dd]/30 border-b border-[#eb842d]/15 text-[#332d24]/80 font-bold">
                        <th className="py-3.5 px-4 sm:px-6">#</th>
                        <th className="py-3.5 px-4 sm:px-6">اسم الكتاب والمذكرة</th>
                        <th className="py-3.5 px-4">المادة</th>
                        <th className="py-3.5 px-4">المرحلة الدراسية</th>
                        <th className="py-3.5 px-4">الفصل</th>
                        <th className="py-3.5 px-4 text-center">الكمية المطلوبة (نسخ)</th>
                        <th className="py-3.5 px-4 text-left">سعر النسخة</th>
                        <th className="py-3.5 px-6 text-left">إجمالي القيمة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eb842d]/10">
                      {filteredManifest.map((item, index) => {
                        const termLabel =
                          item.term === 'term_1'
                            ? 'ترم أول'
                            : item.term === 'term_2'
                            ? 'ترم ثاني'
                            : 'سنة كاملة';
                        const stageLabel =
                          item.stage === 'junior'
                            ? 'جونيور'
                            : item.stage === 'wheeler'
                            ? 'ويلر'
                            : 'سينيور';

                        return (
                          <tr key={item.bookId || index} className="hover:bg-[#fff9f4] transition-colors">
                            <td className="py-3.5 px-4 sm:px-6 font-bold text-[#332d24]/50">
                              {index + 1}
                            </td>
                            <td className="py-3.5 px-4 sm:px-6 font-bold text-[#332d24]">
                              {item.bookTitle}
                            </td>
                            <td className="py-3.5 px-4 text-[#332d24]/80">
                              <span className="px-2 py-0.5 rounded-md bg-[#fce8dd] text-[#eb842d] font-bold text-xs">
                                {item.subject}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-[#332d24]">
                              {stageLabel}
                            </td>
                            <td className="py-3.5 px-4 text-[#332d24]/75">
                              {termLabel}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-block px-3 py-1 rounded-xl bg-[#eb842d] text-white font-black text-sm shadow-xs">
                                {item.quantity} نسخة
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-left font-semibold text-[#332d24]/80">
                              {item.unitPrice} ج.م
                            </td>
                            <td className="py-3.5 px-6 text-left font-black text-[#eb842d]">
                              {item.totalAmount} ج.م
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#fce8dd]/50 border-t-2 border-[#eb842d]/30 font-black text-sm sm:text-base">
                        <td colSpan={5} className="py-4 px-6 text-[#332d24]">
                          الإجمالي الكلي لأوامر الطباعة:
                        </td>
                        <td className="py-4 px-4 text-center text-[#eb842d] text-lg">
                          {filteredManifest.reduce((acc, m) => acc + m.quantity, 0)} نسخة
                        </td>
                        <td></td>
                        <td className="py-4 px-6 text-left text-lg text-[#eb842d]">
                          {filteredManifest.reduce((acc, m) => acc + m.totalAmount, 0)} ج.م
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: ORDERS MANAGEMENT (إدارة طلبات الطلاب)                  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-5 border border-[#eb842d]/25 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#332d24]/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="ابحث باسم الطالب أو رقم الهاتف أو كود الطلب..."
                  className="w-full pr-10 pl-3 py-2 text-xs sm:text-sm rounded-xl bg-[#fffaf6] border border-[#eb842d]/25 text-[#332d24] focus:outline-none focus:ring-2 focus:ring-[#eb842d]"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={orderStageFilter}
                  onChange={(e) => setOrderStageFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-xs font-bold text-[#332d24] focus:outline-none"
                >
                  <option value="all">كافة المراحل</option>
                  <option value="senior">سينيور</option>
                  <option value="wheeler">ويلر</option>
                  <option value="junior">جونيور</option>
                </select>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-xs font-bold text-[#332d24] focus:outline-none"
                >
                  <option value="all">كافة الحالات</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="printing">قيد الطباعة</option>
                  <option value="ready">جاهز للاستلام</option>
                  <option value="delivered">تم التسليم</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>

            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#eb842d]/20">
                <Package className="w-12 h-12 text-[#eb842d]/40 mx-auto mb-3" />
                <h4 className="text-base font-bold text-[#332d24]">لم يتم العثور على طلبات</h4>
                <p className="text-xs text-[#332d24]/60 mt-1">تأكد من شروط البحث أو الفلاتر المختارة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const stageInfo = STAGES_LIST.find((s) => s.id === order.stage);
                  
                  // WhatsApp direct chat url
                  const cleanPhone = order.phone.replace(/[^0-9]/g, '');
                  const formattedPhone = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
                  const studentWhatsAppUrl = `https://wa.me/${formattedPhone}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-[#eb842d]/25 shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      {/* Top Bar: Code, Date, Stage, Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eb842d]/15">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-xl bg-[#eb842d]/15 text-[#eb842d] font-black text-sm tracking-wider">
                            {order.orderCode}
                          </span>
                          <span className="text-xs font-semibold text-[#332d24]/60">
                            {new Date(order.createdAt).toLocaleString('ar-EG', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-lg bg-[#fce8dd] text-[#332d24] font-bold text-xs">
                            {stageInfo?.nameAr || order.stage}
                          </span>

                          {/* Status Dropdown */}
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : order.status === 'printing'
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : order.status === 'ready'
                                ? 'bg-blue-50 text-blue-700 border-blue-300'
                                : order.status === 'cancelled'
                                ? 'bg-red-50 text-red-700 border-red-300'
                                : 'bg-[#fffaf6] text-[#eb842d] border-[#eb842d]/40'
                            }`}
                          >
                            <option value="pending">⏳ قيد الانتظار</option>
                            <option value="printing">🖨️ قيد الطباعة</option>
                            <option value="ready">📦 جاهز للاستلام</option>
                            <option value="delivered">✅ تم التسليم</option>
                            <option value="cancelled">❌ ملغي</option>
                          </select>
                        </div>
                      </div>

                      {/* Student Details and Contact */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base font-black text-[#332d24]">
                              {order.studentName}
                            </span>
                            {order.studentClass && (
                              <span className="px-2.5 py-0.5 rounded-md bg-[#eb842d] text-white font-black text-xs shadow-2xs">
                                فصل {order.studentClass}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#332d24]/75">
                            <span className="flex items-center gap-1 font-semibold">
                              <Phone className="w-3.5 h-3.5 text-[#eb842d]" />
                              {order.phone}
                            </span>
                            {order.notes && (
                              <span className="bg-[#fff9f4] px-2 py-0.5 rounded border border-[#eb842d]/20 text-[#eb842d]">
                                📍 {order.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Direct WhatsApp Action with Student */}
                        <div>
                          <a
                            href={studentWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1ebd5b] text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                            <span>محادثة واتساب</span>
                          </a>
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div className="bg-[#fffaf6] rounded-xl p-3 border border-[#eb842d]/15">
                        <div className="text-xs font-bold text-[#332d24]/70 mb-2">
                          الكتب المطلوبة ({order.totalBooks} كتب):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((it, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#eb842d]/25 text-xs text-[#332d24] font-medium"
                            >
                              📖 {it.bookTitle} ({it.price} ج)
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="flex items-center justify-between text-xs pt-1 text-[#332d24]">
                        <div className="space-x-3 space-x-reverse text-[#332d24]/70">
                          <span>سعر الكتب: {order.booksPrice} ج</span>
                          <span>•</span>
                          <span>
                            التوصيل: {order.deliveryFee === 0 ? 'مجاناً' : `${order.deliveryFee} ج`}
                          </span>
                        </div>
                        <div className="font-black text-sm sm:text-base text-[#eb842d]">
                          الإجمالي: {order.totalPrice} جنيه مصري
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: BOOK MANAGEMENT (إدارة وتعديل وإضافة الكتب)            */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            
            {/* Header & Add Button */}
            <div className="bg-white rounded-2xl p-5 border border-[#eb842d]/25 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#332d24]">
                  دليل الكتب والمذكرات المسجلة
                </h3>
                <p className="text-xs text-[#332d24]/70">
                  يمكنك إضافة كتاب جديد وتحديد المرحلة والترم وسعر النسخة ورابط الـ PDF للمعاينة
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingBook(null);
                  setBookForm({
                    title: '',
                    subject: '',
                    stage: 'senior',
                    term: 'term_1',
                    price: 90,
                    pdfUrl: '',
                    description: '',
                    pagesCount: 150,
                  });
                  setIsBookModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#eb842d] hover:bg-[#d26f1c] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>إضافة كتاب جديد</span>
              </button>
            </div>

            {/* Books Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {books.map((book) => {
                const stageInfo = STAGES_LIST.find((s) => s.id === book.stage);
                const termLabel =
                  book.term === 'term_1'
                    ? 'ترم أول'
                    : book.term === 'term_2'
                    ? 'ترم ثاني'
                    : 'سنة كاملة';

                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl p-5 border border-[#eb842d]/25 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#fce8dd] text-[#eb842d] font-bold text-xs">
                          {book.subject}
                        </span>
                        <span className="text-[11px] font-semibold text-[#332d24]/60">
                          {stageInfo?.nameAr} • {termLabel}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#332d24] mb-2 leading-snug">
                        {book.title}
                      </h4>

                      {book.description && (
                        <p className="text-xs text-[#332d24]/70 line-clamp-2 mb-3">
                          {book.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-[#332d24]/60 pt-2 border-t border-[#eb842d]/10">
                        <span>السعر: <strong className="text-sm font-black text-[#eb842d]">{book.price} ج.م</strong></span>
                        {book.pagesCount && <span>{book.pagesCount} صفحة</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#eb842d]/15">
                      {book.pdfUrl && (
                        <a
                          href={book.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#eb842d] hover:underline font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>معاينة الـ PDF</span>
                        </a>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBook(book);
                            setBookForm({
                              title: book.title,
                              subject: book.subject,
                              stage: book.stage,
                              term: book.term,
                              price: book.price,
                              pdfUrl: book.pdfUrl || '',
                              description: book.description || '',
                              pagesCount: book.pagesCount || 100,
                            });
                            setIsBookModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#fffaf6] border border-[#eb842d]/30 text-[#332d24] hover:bg-[#eb842d]/10 transition-colors"
                          title="تعديل الكتاب"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#eb842d]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                          title="حذف الكتاب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT BOOK (إضافة أو تعديل كتاب)                  */}
      {/* ------------------------------------------------------------- */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#332d24]/60 backdrop-blur-sm font-ibm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl w-full max-w-lg flex flex-col shadow-2xl border border-[#eb842d]/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#fce8dd] border-b border-[#eb842d]/20 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-[#332d24]">
                {editingBook ? 'تعديل بيانات الكتاب' : 'إضافة كتاب أو مذكرة جديدة'}
              </h3>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/80 text-[#332d24] flex items-center justify-center hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-[#332d24] mb-1">
                  عنوان الكتاب أو المذكرة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="مثال: مذكرة الفيزياء الحديثة - الشرح والمسائل"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-[#332d24] focus:outline-none focus:ring-2 focus:ring-[#eb842d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#332d24] mb-1">
                    اسم المادة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bookForm.subject}
                    onChange={(e) => setBookForm({ ...bookForm, subject: e.target.value })}
                    placeholder="فيزياء، كيمياء..."
                    className="w-full px-3 py-2 text-sm rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-[#332d24] focus:outline-none focus:ring-2 focus:ring-[#eb842d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#332d24] mb-1">
                    سعر النسخة (ج.م) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={bookForm.price}
                    onChange={(e) => setBookForm({ ...bookForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-[#332d24] focus:outline-none focus:ring-2 focus:ring-[#eb842d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#332d24] mb-1">
                    المرحلة الدراسية <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={bookForm.stage}
                    onChange={(e) => setBookForm({ ...bookForm, stage: e.target.value as StageId })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-[#332d24] focus:outline-none"
                  >
                    <option value="junior">جونيور (1 ثانوي)</option>
                    <option value="wheeler">ويلر (2 ثانوي)</option>
                    <option value="senior">سينيور (3 ثانوي)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#332d24] mb-1">
                    الفصل الدراسي <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={bookForm.term}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, term: e.target.value as SemesterTerm })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-[#332d24] focus:outline-none"
                  >
                    <option value="term_1">ترم أول</option>
                    <option value="term_2">ترم ثاني</option>
                    <option value="full_year">منهج كامل (سنة كاملة)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332d24] mb-1">
                  رابط ملف الـ PDF للمعاينة (URL أو رابط Google Drive)
                </label>
                <input
                  type="url"
                  value={bookForm.pdfUrl}
                  onChange={(e) => setBookForm({ ...bookForm, pdfUrl: e.target.value })}
                  placeholder="https://... رابط الـ PDF المباشر"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-[#332d24] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#332d24] mb-1">
                    عدد الصفحات التقريبي
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={bookForm.pagesCount}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, pagesCount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-[#332d24] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#332d24] mb-1">
                    وصف مختصر
                  </label>
                  <input
                    type="text"
                    value={bookForm.description}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, description: e.target.value })
                    }
                    placeholder="شرح وتدريبات وفق النظام الحديث"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-[#fffaf6] border border-[#eb842d]/30 text-[#332d24] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#eb842d] hover:bg-[#d26f1c] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
                >
                  {editingBook ? 'حفظ التعديلات' : 'إضافة الكتاب وتفعيله فوراً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
