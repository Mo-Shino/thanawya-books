"use client";

import React from 'react';
import { SemesterTerm } from '@/types/books';
import { Search, CheckSquare, Square, Filter } from 'lucide-react';

interface TermFilterProps {
  selectedTerm: string;
  onSelectTerm: (term: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectAllVisible: () => void;
  onDeselectAllVisible: () => void;
  allVisibleSelected: boolean;
  visibleCount: number;
}

export function TermFilter({
  selectedTerm,
  onSelectTerm,
  searchQuery,
  onSearchChange,
  onSelectAllVisible,
  onDeselectAllVisible,
  allVisibleSelected,
  visibleCount,
}: TermFilterProps) {
  const terms = [
    { id: 'all', label: 'جميع الكتب' },
    { id: 'term_1', label: 'ترم أول' },
    { id: 'term_2', label: 'ترم ثاني' },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[#eb842d]/20 shadow-sm font-ibm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Term Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-[#332d24]/60 ml-2 hidden sm:inline-flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#eb842d]" />
            الفصل:
          </span>
          {terms.map((t) => {
            const isActive = selectedTerm === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTerm(t.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#eb842d] text-white shadow-sm'
                    : 'bg-[#fce8dd]/60 text-[#332d24] hover:bg-[#fce8dd]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search & Bulk Select */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#332d24]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن مادة (فيزياء، كيمياء...)"
              className="w-full pr-10 pl-3 py-2 text-xs sm:text-sm rounded-xl bg-[#fffaf6] border border-[#eb842d]/25 text-[#332d24] placeholder:text-[#332d24]/40 focus:outline-none focus:ring-2 focus:ring-[#eb842d]/30 focus:border-[#eb842d] transition-all"
            />
          </div>

          {/* Select All button */}
          <button
            type="button"
            onClick={allVisibleSelected ? onDeselectAllVisible : onSelectAllVisible}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer whitespace-nowrap ${
              allVisibleSelected
                ? 'bg-[#332d24] text-white border-[#332d24]'
                : 'bg-white text-[#eb842d] border-[#eb842d]/40 hover:bg-[#eb842d]/10'
            }`}
          >
            {allVisibleSelected ? (
              <>
                <Square className="w-4 h-4" />
                <span>إلغاء تحديد الكل ({visibleCount})</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 text-[#eb842d]" />
                <span>تحديد الكل ({visibleCount})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
