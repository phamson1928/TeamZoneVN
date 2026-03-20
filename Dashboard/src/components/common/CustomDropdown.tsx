import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  icon,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200/60 rounded-xl",
          "text-[13px] font-medium text-gray-700 transition-all outline-none",
          "hover:border-gray-300 active:scale-[0.98]",
          isOpen && "ring-2 ring-gray-100 border-gray-300 shadow-sm"
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-gray-400">{icon}</span>}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-[999] mt-2 w-full bg-white border border-gray-200/60 rounded-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] origin-top">
          <div className="p-1.5 max-h-[300px] overflow-y-auto overflow-x-hidden rounded-[18px] custom-scrollbar bg-white/80 backdrop-blur-2xl">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-[13px] font-medium transition-colors",
                  value === option.value
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-black/5 hover:text-gray-900"
                )}
              >
                {option.label}
                {value === option.value && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
