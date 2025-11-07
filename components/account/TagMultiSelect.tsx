'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';

interface TagMultiSelectProps {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
}

/**
 * Multi-select component with chips/bubbles UI.
 * Shows selected items as removable chips, allows adding via dropdown with checkboxes.
 */
export function TagMultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  label
}: TagMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const removeChip = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && value.length > 0) {
      // Remove last chip on backspace
      onChange(value.slice(0, -1));
    } else if (e.key === 'Enter' && searchTerm && filteredOptions.length > 0) {
      e.preventDefault();
      const firstMatch = filteredOptions.find((opt) => !value.includes(opt));
      if (firstMatch) {
        toggleOption(firstMatch);
        setSearchTerm('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-200">{label}</label>
      )}

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-200 border border-emerald-400/30"
            >
              {item}
              <button
                type="button"
                onClick={() => removeChip(item)}
                className="hover:text-emerald-100 transition-colors"
                aria-label={`Retirer ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input with dropdown */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : 'Ajouter...'}
          className="w-full rounded-lg border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />

        {/* Dropdown with checkboxes */}
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 mt-2 w-full rounded-lg border border-white/15 bg-slate-900 shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => {
              const isSelected = value.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleOption(option)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-200'
                      : 'text-slate-300 hover:bg-white/5'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded border',
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/20'
                        : 'border-white/20'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-emerald-400" />}
                  </div>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Tape pour chercher, Entrée pour ajouter, Backspace pour retirer
      </p>
    </div>
  );
}
