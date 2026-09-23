export type StageId = 'junior' | 'wheeler' | 'senior';

export interface StageInfo {
  id: StageId;
  name: string;
  nameAr: string;
  gradeAr: string;
  description: string;
  badge: string;
  color: string;
}

export type SemesterTerm = 'term_1' | 'term_2' | 'full_year';

export interface Book {
  id: string;
  title: string;
  subject: string;
  stage: StageId;
  term: SemesterTerm;
  price: number;
  pdfUrl?: string;
  samplePdfUrl?: string;
  coverImage?: string;
  description?: string;
  pagesCount?: number;
  isActive: boolean;
  createdAt?: string;
}

export type OrderStatus = 'pending' | 'printing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  id?: string;
  orderId?: string;
  bookId: string;
  bookTitle: string;
  subject: string;
  stage: StageId;
  term: SemesterTerm;
  price: number;
}

export interface Order {
  id: string;
  orderCode: string;
  studentName: string;
  phone: string;
  studentClass: string;
  stage: StageId;
  notes?: string;
  totalBooks: number;
  booksPrice: number;
  deliveryFee: number;
  totalPrice: number;
  status: OrderStatus;
  isPaid?: boolean;
  paidAmount?: number;
  items: OrderItem[];
  createdAt: string;
}

export interface PrintingManifestItem {
  bookId: string;
  bookTitle: string;
  subject: string;
  stage: StageId;
  term: SemesterTerm;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export const STAGES_LIST: StageInfo[] = [
  {
    id: 'junior',
    name: 'Junior',
    nameAr: 'جونيور',
    gradeAr: 'الصف الأول الثانوي',
    description: 'كتب أولى ثانوي لغات وعربي - ترم أول وثاني',
    badge: '1 ثانوي',
    color: '#eb842d',
  },
  {
    id: 'wheeler',
    name: 'Wheeler',
    nameAr: 'ويلر',
    gradeAr: 'الصف الثاني الثانوي',
    description: 'كتب ثانية ثانوي علمي وأدبي - ترم أول وثاني',
    badge: '2 ثانوي',
    color: '#eb842d',
  },
  {
    id: 'senior',
    name: 'Senior',
    nameAr: 'سينيور',
    gradeAr: 'الصف الثالث الثانوي',
    description: 'كتب ومذكرات الثانوية العامة النهائية والمراجعات',
    badge: '3 ثانوي',
    color: '#eb842d',
  },
];
