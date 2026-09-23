"use client";

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps<T extends string = string> {
  value: T;
  onChange: (val: T) => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function CustomDropdown<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'اختر...',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  icon,
  disabled = false,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#fffaf6] border border-[#eb842d]/35 text-xs sm:text-sm font-bold text-[#332d24] hover:border-[#eb842d] focus:outline-none focus:ring-2 focus:ring-[#eb842d] transition-all cursor-pointer shadow-2xs ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon ? (
            <span className="text-[#eb842d] shrink-0">{icon}</span>
          ) : selectedOption?.icon ? (
            <span className="shrink-0">{selectedOption.icon}</span>
          ) : null}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[#eb842d] shrink-0 transition-transform duration-200 mr-1 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className={`absolute right-0 left-0 top-full mt-1.5 z-50 bg-white rounded-2xl border-2 border-[#eb842d]/30 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto ${dropdownClassName}`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#eb842d] text-white shadow-xs'
                      : 'text-[#332d24] hover:bg-[#fce8dd]/60 hover:text-[#eb842d]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isSelected ? 'bg-white' : 'bg-[#eb842d]/40'
                      }`}
                    />
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 stroke-[3] shrink-0 mr-1" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
