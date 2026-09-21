-- ==============================================================================
-- قاعدة بيانات منصة حجز وطباعة كتب الثانوية العامة (Thanawya Print Hub)
-- جونيور (Junior) | ويلر (Wheeler) | سينيور (Senior)
-- ==============================================================================

-- 1. تفعيل امتداد توليد المعرفات الفريدة UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- جدول 1: الكتب والمذكرات (books)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('junior', 'wheeler', 'senior')),
  term TEXT NOT NULL CHECK (term IN ('term_1', 'term_2', 'full_year')),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  pdf_url TEXT,
  sample_pdf_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_books_stage ON public.books (stage);
CREATE INDEX IF NOT EXISTS idx_books_term ON public.books (term);
CREATE INDEX IF NOT EXISTS idx_books_is_active ON public.books (is_active);

-- تفعيل حماية Row Level Security (RLS)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- الصلاحيات
DROP POLICY IF EXISTS "Public can view active books" ON public.books;
CREATE POLICY "Public can view active books"
  ON public.books FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can manage books" ON public.books;
CREATE POLICY "Public can manage books"
  ON public.books FOR ALL
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- جدول 2: طلبات الطلاب (orders)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_code TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  student_class TEXT NOT NULL DEFAULT '',
  parent_phone TEXT,
  stage TEXT NOT NULL,
  notes TEXT,
  total_books INT NOT NULL DEFAULT 0,
  books_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'ready', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_class ON public.orders (student_class);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_stage ON public.orders (stage);

-- تفعيل حماية RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders"
  ON public.orders FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can update orders" ON public.orders;
CREATE POLICY "Public can update orders"
  ON public.orders FOR UPDATE
  USING (true);


-- ==============================================================================
-- جدول 3: تفاصيل الكتب لكل طلب (order_items)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  book_id TEXT,
  book_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  stage TEXT NOT NULL,
  term TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_book_id ON public.order_items (book_id);

-- تفعيل حماية RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
CREATE POLICY "Public can view order items"
  ON public.order_items FOR SELECT
  USING (true);


-- ==============================================================================
-- بذور أولية للكتب المبسطة (Seed Data)
-- ==============================================================================
INSERT INTO public.books (id, title, subject, stage, term, price, pdf_url, is_active)
VALUES
  -- جونيور (Junior)
  ('jun-eng-t1', 'كتاب الإنجليزي - ترم أول', 'إنجليزي', 'junior', 'term_1', 90, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('jun-eng-t2', 'كتاب الإنجليزي - ترم ثاني', 'إنجليزي', 'junior', 'term_2', 90, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('jun-mth-t1', 'كتاب الماث - ترم أول', 'ماث', 'junior', 'term_1', 95, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('jun-mth-t2', 'كتاب الماث - ترم ثاني', 'ماث', 'junior', 'term_2', 95, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('jun-phy-t1', 'كتاب الفيزياء - ترم أول', 'فيزياء', 'junior', 'term_1', 85, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('jun-phy-t2', 'كتاب الفيزياء - ترم ثاني', 'فيزياء', 'junior', 'term_2', 85, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('jun-chm-t1', 'كتاب الكيمياء - ترم أول', 'كيمياء', 'junior', 'term_1', 80, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('jun-chm-t2', 'كتاب الكيمياء - ترم ثاني', 'كيمياء', 'junior', 'term_2', 80, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('jun-bio-t1', 'كتاب الأحياء - ترم أول', 'أحياء', 'junior', 'term_1', 85, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('jun-bio-t2', 'كتاب الأحياء - ترم ثاني', 'أحياء', 'junior', 'term_2', 85, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('jun-arb-t1', 'كتاب العربي - ترم أول', 'عربي', 'junior', 'term_1', 100, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('jun-arb-t2', 'كتاب العربي - ترم ثاني', 'عربي', 'junior', 'term_2', 100, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),

  -- ويلر (Wheeler)
  ('whl-eng-t1', 'كتاب الإنجليزي - ترم أول', 'إنجليزي', 'wheeler', 'term_1', 95, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('whl-eng-t2', 'كتاب الإنجليزي - ترم ثاني', 'إنجليزي', 'wheeler', 'term_2', 95, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('whl-mth-t1', 'كتاب الماث - ترم أول', 'ماث', 'wheeler', 'term_1', 105, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('whl-mth-t2', 'كتاب الماث - ترم ثاني', 'ماث', 'wheeler', 'term_2', 105, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('whl-phy-t1', 'كتاب الفيزياء - ترم أول', 'فيزياء', 'wheeler', 'term_1', 95, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('whl-phy-t2', 'كتاب الفيزياء - ترم ثاني', 'فيزياء', 'wheeler', 'term_2', 95, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('whl-chm-t1', 'كتاب الكيمياء - ترم أول', 'كيمياء', 'wheeler', 'term_1', 90, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('whl-chm-t2', 'كتاب الكيمياء - ترم ثاني', 'كيمياء', 'wheeler', 'term_2', 90, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('whl-bio-t1', 'كتاب الأحياء - ترم أول', 'أحياء', 'wheeler', 'term_1', 90, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('whl-bio-t2', 'كتاب الأحياء - ترم ثاني', 'أحياء', 'wheeler', 'term_2', 90, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('whl-arb-t1', 'كتاب العربي - ترم أول', 'عربي', 'wheeler', 'term_1', 110, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('whl-arb-t2', 'كتاب العربي - ترم ثاني', 'عربي', 'wheeler', 'term_2', 110, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),

  -- سينيور (Senior)
  ('sen-phy-t1', 'كتاب الفيزياء - ترم أول', 'فيزياء', 'senior', 'term_1', 130, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-phy-t2', 'كتاب الفيزياء - ترم ثاني', 'فيزياء', 'senior', 'term_2', 130, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-chm-t1', 'كتاب الكيمياء - ترم أول', 'كيمياء', 'senior', 'term_1', 125, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-chm-t2', 'كتاب الكيمياء - ترم ثاني', 'كيمياء', 'senior', 'term_2', 125, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-mth-t1', 'كتاب الماث - ترم أول', 'ماث', 'senior', 'term_1', 135, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-mth-t2', 'كتاب الماث - ترم ثاني', 'ماث', 'senior', 'term_2', 135, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-bio-t1', 'كتاب الأحياء - ترم أول', 'أحياء', 'senior', 'term_1', 120, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-bio-t2', 'كتاب الأحياء - ترم ثاني', 'أحياء', 'senior', 'term_2', 120, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-geo-t1', 'كتاب الجيولوجيا - ترم أول', 'جيولوجيا', 'senior', 'term_1', 110, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-geo-t2', 'كتاب الجيولوجيا - ترم ثاني', 'جيولوجيا', 'senior', 'term_2', 110, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-arb-t1', 'كتاب العربي - ترم أول', 'عربي', 'senior', 'term_1', 140, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-arb-t2', 'كتاب العربي - ترم ثاني', 'عربي', 'senior', 'term_2', 140, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-eng-t1', 'كتاب الإنجليزي - ترم أول', 'إنجليزي', 'senior', 'term_1', 115, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
  ('sen-eng-t2', 'كتاب الإنجليزي - ترم ثاني', 'إنجليزي', 'senior', 'term_2', 115, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true)
ON CONFLICT (id) DO NOTHING;
