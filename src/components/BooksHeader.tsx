"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface BooksHeaderProps {
  isAdmin?: boolean;
}

export function BooksHeader({ isAdmin = false }: BooksHeaderProps) {
  return (
    <header className="w-full bg-[#fce8dd]/60 backdrop-blur-md border-b border-[#eb842d]/20 sticky top-0 z-40 font-ibm">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        
        {/* Logo and Brand */}
        <Link 
          href="/" 
          className="flex items-center gap-2 sm:gap-3 group focus:outline-none min-w-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#eb842d] to-[#d26f1c] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-lg md:text-xl font-black text-[#332d24] tracking-tight truncate block">
              حجز كتب الثانوية
            </span>
          </div>
        </Link>

        {/* In Admin page only, show a link back to books */}
        {isAdmin && (
          <Link
            href="/"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white text-[#332d24] border border-[#eb842d]/30 text-xs font-bold hover:bg-[#eb842d]/10 transition-all shadow-2xs whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#eb842d]" />
            <span className="hidden xs:inline">صفحة الطلاب</span>
            <span className="xs:hidden">الرئيسية</span>
          </Link>
        )}

      </div>
    </header>
  );
}
