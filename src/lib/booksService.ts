import { Book, Order, OrderItem, StageId, PrintingManifestItem, OrderStatus } from '@/types/books';
import { INITIAL_BOOKS } from './booksData';
import { supabase } from './supabaseClient';

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
    if (supabase) {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((b: any) => ({
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
      }
    }
  } catch (err) {
    console.warn('Supabase fetch books error, falling back to local store:', err);
  }

  // Fallback to localStorage or INITIAL_BOOKS
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Error parsing cached books', e);
      }
    }
    // Initialize localStorage with INITIAL_BOOKS
    localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(INITIAL_BOOKS));
  }

  return INITIAL_BOOKS;
}

// دالة حفظ أو تحديث كتاب (للأدمن)
export async function saveBook(book: Book): Promise<Book> {
  try {
    if (supabase) {
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
        pages_count: book.pagesCount || 100,
        is_active: book.isActive ?? true,
      };

      const { error } = await supabase.from('books').upsert(dbPayload);
      if (error) {
        console.warn('Supabase upsert book warning:', error);
      }
    }
  } catch (err) {
    console.warn('Supabase saveBook error:', err);
  }

  // Save to localStorage
  if (typeof window !== 'undefined') {
    const currentBooks = await getBooks();
    const index = currentBooks.findIndex((b) => b.id === book.id);
    let updated: Book[];
    if (index >= 0) {
      updated = [...currentBooks];
      updated[index] = book;
    } else {
      updated = [book, ...currentBooks];
    }
    localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(updated));
  }

  return book;
}

// دالة حذف كتاب
export async function deleteBook(bookId: string): Promise<boolean> {
  try {
    if (supabase) {
      await supabase.from('books').delete().eq('id', bookId);
    }
  } catch (err) {
    console.warn('Supabase deleteBook error:', err);
  }

  if (typeof window !== 'undefined') {
    const currentBooks = await getBooks();
    const filtered = currentBooks.filter((b) => b.id !== bookId);
    localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(filtered));
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
    if (supabase) {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && ordersData) {
        return ordersData.map((o: any) => ({
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
        }));
      }
    }
  } catch (err) {
    console.warn('Supabase getOrders error:', err);
  }

  // Fallback to localStorage
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
export function formatPrintingPressWhatsAppMessage(manifest: PrintingManifestItem[]): string {
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

  message += `----------------------------------------\n`;
  message += `يرجى تأكيد الاستلام والبدء في التجهيز. شكراً جزيلاً!`;

  return message;
}
