"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  label,
  error,
  helperText,
  placeholder = "Sélectionner...",
}: MultiSelectProps) {
  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-200">{label}</label>
      )}
      
      <div className="rounded-(--radius) border border-white/15 bg-slate-950/40 p-3">
        <p className="text-xs text-slate-400 mb-2">{placeholder}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  "border focus:outline-none focus:ring-2 focus:ring-emerald-200",
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-100"
                    : "bg-slate-800/50 border-white/10 text-slate-300 hover:border-emerald-400/30"
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
                {option.label}
              </button>
            );
          })}
        </div>
        {value.length > 0 && (
          <p className="text-xs text-slate-400 mt-2">
            {value.length} sélectionné{value.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      {error && <p className="text-xs text-rose-300">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}
