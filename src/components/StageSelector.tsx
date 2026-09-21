"use client";

import React from 'react';
import { StageId, STAGES_LIST, Book } from '@/types/books';
import { GraduationCap, Award, Compass, CheckCircle2 } from 'lucide-react';

interface StageSelectorProps {
  selectedStage: StageId;
  onSelectStage: (stage: StageId) => void;
  books: Book[];
}

export function StageSelector({ selectedStage, onSelectStage, books }: StageSelectorProps) {
  const getStageIcon = (id: StageId) => {
    switch (id) {
      case 'junior':
        return Compass;
      case 'wheeler':
        return Award;
      case 'senior':
        return GraduationCap;
    }
  };

  return (
    <div className="w-full font-ibm">
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#eb842d]/15 text-[#eb842d] mb-2">
          الخطوة 1: حدد سنتك الدراسية
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#332d24]">
          اختر مرحلتك لعرض الكتب المقررة
        </h2>
        <p className="text-sm text-[#332d24]/70 mt-1 max-w-lg mx-auto">
          اختر مرحلتك (جونيور، ويلر، أو سينيور) لمعاينة مذكرات الترم الأول والثاني واختيار ما تحتاجه
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {STAGES_LIST.map((stage) => {
          const isSelected = selectedStage === stage.id;
          const Icon = getStageIcon(stage.id);
          const stageBooksCount = books.filter((b) => b.stage === stage.id).length;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelectStage(stage.id)}
              className={`group relative text-right p-5 sm:p-6 rounded-2xl transition-all duration-300 border-2 cursor-pointer focus:outline-none flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#eb842d] shadow-[0_12px_28px_rgba(235,132,45,0.18)] scale-[1.02] ring-2 ring-[#eb842d]/20'
                  : 'bg-white/70 hover:bg-white border-[#eb842d]/20 hover:border-[#eb842d]/50 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Active checkmark indicator */}
              <div className="flex items-start justify-between w-full mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#eb842d] text-white shadow-md'
                      : 'bg-[#fce8dd] text-[#eb842d] group-hover:bg-[#eb842d] group-hover:text-white'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isSelected
                        ? 'bg-[#eb842d]/15 text-[#eb842d]'
                        : 'bg-[#332d24]/5 text-[#332d24]/70'
                    }`}
                  >
                    {stageBooksCount} كتب متاحة
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-6 h-6 text-[#eb842d] fill-[#eb842d]/20" />
                  )}
                </div>
              </div>

              {/* Text Info */}
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-[#332d24]">
                    {stage.nameAr}
                  </h3>
                  <span className="text-sm font-semibold text-[#eb842d] tracking-wide uppercase">
                    ({stage.name})
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#332d24]/80 mb-1.5">
                  {stage.gradeAr}
                </div>
                <p className="text-xs text-[#332d24]/65 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              {/* Bottom selection bar accent */}
              <div
                className={`mt-4 pt-3 border-t text-xs font-bold flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'border-[#eb842d]/20 text-[#eb842d]'
                    : 'border-transparent text-[#332d24]/50 group-hover:text-[#eb842d]'
                }`}
              >
                <span>{isSelected ? 'المرحلة المحددة حالياً' : 'اضغط لاختيار المرحلة'}</span>
                <span className="text-lg">←</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
