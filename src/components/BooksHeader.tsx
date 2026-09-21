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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eb842d] to-[#d26f1c] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold text-[#332d24] tracking-tight">
              حجز كتب ومذكرات الثانوية
            </span>
          </div>
        </Link>

        {/* In Admin page only, show a link back to books */}
        {isAdmin && (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#332d24] border border-[#eb842d]/30 text-xs font-bold hover:bg-[#eb842d]/10 transition-all shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#eb842d]" />
            <span>عرض صفحة الطلاب</span>
          </Link>
        )}

      </div>
    </header>
  );
}
