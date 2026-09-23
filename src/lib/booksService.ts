import { Book, Order, OrderItem, StageId, PrintingManifestItem, OrderStatus } from '@/types/books';
import { INITIAL_BOOKS } from './booksData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_BOOKS_KEY = 'thanawya_books_catalog_v1';
const LOCAL_STORAGE_ORDERS_KEY = 'thanawya_books_orders_v1';

// دالة حساب مصاريف التوصيل المعتمدة:
// 1 كتاب = 0 ج.م
// 2 - 3 كتب = 10 ج.م
// 4 كتب فأكثر = 15 ج.م
export function calculateDeliveryFee(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 0;
  if (count <= 3) return 10;
  return 15;
}

// دالة جلب قائمة الكتب
export async function getBooks(): Promise<Book[]> {
  try {
    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const booksList: Book[] = data.map((b: any) => ({
          id: b.id,
          title: b.title,
          subject: b.subject,
          stage: b.stage as StageId,
          term: b.term,
          price: Number(b.price),
          pdfUrl: b.pdf_url,
          samplePdfUrl: b.sample_pdf_url || b.pdf_url,
          coverImage: b.cover_image,
          description: b.description,
          pagesCount: b.pages_count,
          isActive: b.is_active,
          createdAt: b.created_at,
        }));

        // مزامنة الكاش المحلي مع قاعدة البيانات
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(booksList));
        }

        return booksList;
      }

      if (error) {
        console.error('Supabase getBooks error:', error);
      }
    }
  } catch (err) {
    console.warn('Supabase fetch books error, falling back to local cache:', err);
  }

  // في حال تعطل الاتصال بالإنترنت، يتم القراءة من الكاش المحلي
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing cached books', e);
      }
    }
    // حفظ الكتب الرسمية في الكاش
    localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(INITIAL_BOOKS));
  }

  return INITIAL_BOOKS;
}

// دالة حفظ أو تحديث كتاب (للأدمن)
export async function saveBook(book: Book): Promise<Book> {
  try {
    if (supabase && isSupabaseConfigured) {
      const dbPayload = {
        id: book.id,
        title: book.title,
        subject: book.subject,
        stage: book.stage,
        term: book.term,
        price: book.price,
        pdf_url: book.pdfUrl || null,
        sample_pdf_url: book.samplePdfUrl || book.pdfUrl || null,
        description: book.description || '',
        is_active: book.isActive ?? true,
      };

      const { error } = await supabase.from('books').upsert(dbPayload);
      if (error) {
        console.error('Supabase upsert book error:', error);
        throw new Error(`فشل حفظ الكتاب: ${error.message}`);
      }
    }
  } catch (err) {
    console.error('saveBook error:', err);
    throw err;
  }

  // Save to localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY);
      const currentBooks: Book[] = raw ? JSON.parse(raw) : [];
      const index = currentBooks.findIndex((b) => b.id === book.id);
      let updated: Book[];
      if (index >= 0) {
        updated = [...currentBooks];
        updated[index] = book;
      } else {
        updated = [book, ...currentBooks];
      }
      localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  return book;
}

// دالة حذف كتاب
export async function deleteBook(bookId: string): Promise<boolean> {
  try {
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.from('books').delete().eq('id', bookId);
      if (error) {
        console.error('Supabase deleteBook error:', error);
        throw new Error(`فشل حذف الكتاب: ${error.message}`);
      }
    }
  } catch (err) {
    console.error('deleteBook error:', err);
    throw err;
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY);
      if (raw) {
        const currentBooks: Book[] = JSON.parse(raw);
        const filtered = currentBooks.filter((b) => b.id !== bookId);
        localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error(e);
    }
  }

  return true;
}

// دالة تسجيل طلب جديد للطالب
export async function createOrder(params: {
  studentName: string;
  phone: string;
  studentClass: string;
  stage: StageId;
  notes?: string;
  selectedBooks: Book[];
}): Promise<Order> {
  const { studentName, phone, studentClass, stage, notes, selectedBooks } = params;

  const totalBooks = selectedBooks.length;
  const booksPrice = selectedBooks.reduce((acc, b) => acc + b.price, 0);
  const deliveryFee = calculateDeliveryFee(totalBooks);
  const totalPrice = booksPrice + deliveryFee;

  // توليد كود طلب مختصر وسهل
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderCode = `THN-${randomSuffix}`;
  const now = new Date().toISOString();

  const items: OrderItem[] = selectedBooks.map((b) => ({
    bookId: b.id,
    bookTitle: b.title,
    subject: b.subject,
    stage: b.stage,
    term: b.term,
    price: b.price,
  }));

  const newOrder: Order = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ord_${Date.now()}`,
    orderCode,
    studentName,
    phone,
    studentClass,
    stage,
    notes,
    totalBooks,
    booksPrice,
    deliveryFee,
    totalPrice,
    status: 'pending',
    items,
    createdAt: now,
  };

  try {
    if (supabase) {
      const dbPayload = {
        order_code: newOrder.orderCode,
        student_name: newOrder.studentName,
        phone: newOrder.phone,
        student_class: newOrder.studentClass,
        stage: newOrder.stage,
        notes: newOrder.notes || '',
        total_books: newOrder.totalBooks,
        books_price: newOrder.booksPrice,
        delivery_fee: newOrder.deliveryFee,
        total_price: newOrder.totalPrice,
        status: newOrder.status,
        created_at: newOrder.createdAt,
      };

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert(dbPayload)
        .select()
        .single();

      if (!orderErr && orderData) {
        newOrder.id = orderData.id;

        const orderItemsPayload = items.map((it) => ({
          order_id: orderData.id,
          book_id: it.bookId,
          book_title: it.bookTitle,
          subject: it.subject,
          stage: it.stage,
          term: it.term,
          price: it.price,
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsPayload);
        if (itemsErr) {
          console.error('Supabase insert order_items error:', itemsErr);
        }
      } else {
        console.error('Supabase insert order error:', orderErr);
      }
    }
  } catch (err) {
    console.error('Supabase createOrder error, saving locally:', err);
  }

  // Backup to localStorage
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    const existingOrders: Order[] = raw ? JSON.parse(raw) : [];
    existingOrders.unshift(newOrder);
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(existingOrders));
  }

  return newOrder;
}

// دالة جلب كافة الطلبات (للأدمن)
export async function getOrders(): Promise<Order[]> {
  try {
    if (supabase && isSupabaseConfigured) {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && ordersData) {
        const mappedOrders: Order[] = ordersData.map((o: any) => {
          const isPaid = o.status === 'printing' || o.status === 'ready' || o.status === 'delivered';
          let customPaidAmount: number | undefined;
          if (o.notes) {
            const match = o.notes.match(/(?:paid:|مدفوع:\s*)(\d+(?:\.\d+)?)/i);
            if (match) {
              customPaidAmount = Number(match[1]);
            }
          }
          const paidAmount = isPaid
            ? (customPaidAmount !== undefined ? customPaidAmount : Number(o.total_price))
            : 0;

          return {
            id: o.id,
            orderCode: o.order_code,
            studentName: o.student_name,
            phone: o.phone || '',
            studentClass: o.student_class || o.parent_phone || '',
            stage: o.stage as StageId,
            notes: o.notes,
            totalBooks: o.total_books,
            booksPrice: Number(o.books_price),
            deliveryFee: Number(o.delivery_fee),
            totalPrice: Number(o.total_price),
            status: o.status as OrderStatus,
            isPaid,
            paidAmount,
            createdAt: o.created_at,
            items: (o.order_items || []).map((it: any) => ({
              id: it.id,
              orderId: it.order_id,
              bookId: it.book_id,
              bookTitle: it.book_title,
              subject: it.subject,
              stage: it.stage as StageId,
              term: it.term,
              price: Number(it.price),
            })),
          };
        });

        // مزامنة الكاش المحلي مع قاعدة البيانات
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(mappedOrders));
        }

        return mappedOrders;
      }

      if (error) {
        console.error('Supabase getOrders error:', error);
      }
    }
  } catch (err) {
    console.warn('Supabase getOrders error:', err);
  }

  // Fallback to localStorage only if network failed or offline
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing orders cache', e);
      }
    }
  }

  return [];
}

// دالة تحديث حالة الطلب (الأدمن)
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    if (supabase) {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    }
  } catch (err) {
    console.warn('Supabase updateOrderStatus error:', err);
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (raw) {
      const list: Order[] = JSON.parse(raw);
      const idx = list.findIndex((o) => o.id === orderId);
      if (idx >= 0) {
        list[idx].status = status;
        localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(list));
      }
    }
  }

  return true;
}

// دالة تبديل حالة الدفع والمبلغ المدفوع (للأدمن)
export async function toggleOrderPayment(
  orderId: string,
  isPaid: boolean,
  customPaidAmount?: number
): Promise<{ success: boolean; isPaid: boolean; paidAmount: number }> {
  const newStatus: OrderStatus = isPaid ? 'printing' : 'pending';

  try {
    if (supabase) {
      if (customPaidAmount !== undefined) {
        const { data: current } = await supabase
          .from('orders')
          .select('notes, total_price')
          .eq('id', orderId)
          .single();

        let baseNotes = (current?.notes || '').replace(/\[مدفوع:[^\]]*\]/g, '').trim();
        const finalNotes = isPaid
          ? (baseNotes ? `${baseNotes} [مدفوع: ${customPaidAmount} ج]` : `[مدفوع: ${customPaidAmount} ج]`)
          : baseNotes;

        await supabase
          .from('orders')
          .update({
            status: newStatus,
            notes: finalNotes,
          })
          .eq('id', orderId);
      } else {
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      }
    }
  } catch (err) {
    console.warn('Supabase toggleOrderPayment error:', err);
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (raw) {
      const list: Order[] = JSON.parse(raw);
      const idx = list.findIndex((o) => o.id === orderId);
      if (idx >= 0) {
        list[idx].status = newStatus;
        list[idx].isPaid = isPaid;
        list[idx].paidAmount = isPaid
          ? (customPaidAmount !== undefined ? customPaidAmount : list[idx].totalPrice)
          : 0;
        localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(list));
      }
    }
  }

  return {
    success: true,
    isPaid,
    paidAmount: isPaid ? (customPaidAmount !== undefined ? customPaidAmount : 0) : 0,
  };
}

// دالة حذف طلب بالكامل (الأدمن)
export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    if (supabase) {
      await supabase.from('order_items').delete().eq('order_id', orderId);
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) {
        console.warn('Supabase deleteOrder warning:', error.message);
      }
    }
  } catch (err) {
    console.warn('Supabase deleteOrder error:', err);
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (raw) {
      const list: Order[] = JSON.parse(raw);
      const filtered = list.filter((o) => o.id !== orderId);
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(filtered));
    }
  }

  return true;
}

// دالة تعديل بيانات الطلب بالكامل والكتب الخاصة به (الأدمن)
export async function updateOrder(order: Order): Promise<boolean> {
  try {
    if (supabase) {
      const { error: orderErr } = await supabase
        .from('orders')
        .update({
          student_name: order.studentName,
          phone: order.phone,
          student_class: order.studentClass,
          stage: order.stage,
          notes: order.notes || '',
          total_books: order.totalBooks,
          books_price: order.booksPrice,
          delivery_fee: order.deliveryFee,
          total_price: order.totalPrice,
          status: order.status,
        })
        .eq('id', order.id);

      if (orderErr) {
        console.warn('Supabase updateOrder error:', orderErr.message);
      }

      // Re-sync order_items
      await supabase.from('order_items').delete().eq('order_id', order.id);
      if (order.items && order.items.length > 0) {
        const payload = order.items.map((it) => ({
          order_id: order.id,
          book_id: it.bookId,
          book_title: it.bookTitle,
          subject: it.subject,
          stage: it.stage,
          term: it.term,
          price: it.price,
        }));
        await supabase.from('order_items').insert(payload);
      }
    }
  } catch (err) {
    console.warn('Supabase updateOrder error:', err);
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (raw) {
      const list: Order[] = JSON.parse(raw);
      const idx = list.findIndex((o) => o.id === order.id);
      if (idx >= 0) {
        list[idx] = order;
        localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(list));
      }
    }
  }

  return true;
}

// دالة توليد تقرير المطبعة المجمع (Printing Press Manifest)
export function generatePrintingManifest(orders: Order[]): PrintingManifestItem[] {
  // تجميع الطلبات غير الملغية فقط
  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const countsMap = new Map<string, PrintingManifestItem>();

  for (const order of validOrders) {
    for (const item of order.items) {
      const key = `${item.bookId || item.bookTitle}_${item.term}_${item.stage}`;
      const existing = countsMap.get(key);

      if (existing) {
        existing.quantity += 1;
        existing.totalAmount += item.price;
      } else {
        countsMap.set(key, {
          bookId: item.bookId,
          bookTitle: item.bookTitle,
          subject: item.subject,
          stage: item.stage,
          term: item.term,
          quantity: 1,
          unitPrice: item.price,
          totalAmount: item.price,
        });
      }
    }
  }

  return Array.from(countsMap.values()).sort((a, b) => {
    // الترتيب حسب المرحلة ثم المادة
    if (a.stage !== b.stage) {
      const order = { junior: 1, wheeler: 2, senior: 3 };
      return (order[a.stage] || 0) - (order[b.stage] || 0);
    }
    return b.quantity - a.quantity;
  });
}

// دالة صياغة رسالة الواتساب الجاهزة لصاحب المطبعة
export function formatPrintingPressWhatsAppMessage(
  manifest: PrintingManifestItem[],
  studentNames?: string[]
): string {
  if (manifest.length === 0) return 'لا توجد طلبات طباعة حالياً.';

  const totalCopies = manifest.reduce((acc, m) => acc + m.quantity, 0);
  const nowStr = new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' });

  const stageNames: Record<StageId, string> = {
    junior: 'جونيور (الصف الأول الثانوي)',
    wheeler: 'ويلر (الصف الثاني الثانوي)',
    senior: 'سينيور (الصف الثالث الثانوي)',
  };

  const termNames: Record<string, string> = {
    term_1: 'ترم أول',
    term_2: 'ترم ثاني',
    full_year: 'سنة كاملة',
  };

  let message = `السلام عليكم ورحمة الله وبركاته،\n`;
  message += `📄 *طلبية الطباعة المجمعة لمذكرات وكتب الثانوية*\n`;
  message += `📅 التاريخ: ${nowStr}\n`;
  message += `📦 إجمالي عدد النسخ المطلوبة: *${totalCopies} نسخة*\n`;
  message += `----------------------------------------\n\n`;

  // تقسيم حسب المراحل
  const stages: StageId[] = ['senior', 'wheeler', 'junior'];
  for (const st of stages) {
    const stageItems = manifest.filter((m) => m.stage === st);
    if (stageItems.length === 0) continue;

    const stageTotal = stageItems.reduce((acc, it) => acc + it.quantity, 0);
    message += `🎓 *${stageNames[st]}* (الإجمالي: ${stageTotal} نسخة):\n`;
    stageItems.forEach((it, idx) => {
      message += `  ${idx + 1}. ${it.bookTitle} [${termNames[it.term] || it.term}] 👈 *${it.quantity} نسخة*\n`;
    });
    message += `\n`;
  }

  if (studentNames && studentNames.length > 0) {
    message += `👥 *الطلاب المشمولين في هذا الإرسال (${studentNames.length} طالب):*\n`;
    message += studentNames.map((name, i) => `  ${i + 1}. ${name}`).join('\n');
    message += `\n\n`;
  }

  message += `----------------------------------------\n`;
  message += `يرجى تأكيد الاستلام والبدء في التجهيز. شكراً جزيلاً!`;

  return message;
}

// دالة رفع ملف الـ PDF إلى مساحة تخزين Supabase Storage
export async function uploadBookPdf(file: File): Promise<string> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${Date.now()}_${cleanName}`;
  const filePath = `books/${fileName}`;

  if (!supabase) {
    throw new Error('قاعدة بيانات Supabase غير متصلة.');
  }

  const { data, error } = await supabase.storage
    .from('books_pdfs')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/pdf',
    });

  if (error) {
    console.error('Supabase upload error:', error);
    if (error.message?.includes('Bucket not found') || (error as any).code === 'NoSuchBucket') {
      throw new Error('مساحة التخزين books_pdfs لم يتم إنشاؤها بعد في Supabase. يرجى تشغيل كود SQL لإنشاء الـ Bucket.');
    }
    throw new Error(`فشل رفع ملف الـ PDF: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('books_pdfs')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
