import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'حجز كتب ومذكرات الثانوية | جونيور • ويلر • سينيور',
  description: 'النظام الإلكتروني لحجز وطباعة كتب ومذكرات الثانوية العامة (أولى، ثانية، ثالثة ثانوي) بأعلى جودة وتوصيل مباشر في المدرسة.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#fffbf8] text-[#332d24] font-ibm antialiased selection:bg-[#eb842d]/25 selection:text-[#332d24]">
        {children}
      </body>
    </html>
  );
}
