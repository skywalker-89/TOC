"use client";

import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  totalResults: number;
}

export default function SearchBar({
  value,
  onChange,
  totalResults,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(val);
    }, 300);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-xl mx-auto animate-fade-in-up opacity-0 stagger-3">
      <div className="relative group">
        {/* Search Icon */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted
                     group-focus-within:text-white transition-colors duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder="Search by name, position, or nationality..."
          className="w-full pl-12 pr-12 py-4 bg-card border border-border rounded-2xl
                     text-white placeholder:text-muted text-sm
                     focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-border-hover
                     transition-all duration-300 hover:border-border-hover"
          id="search-input"
        />

        {/* Clear Button */}
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6
                       flex items-center justify-center rounded-full
                       bg-border hover:bg-border-hover text-muted hover:text-white
                       transition-all duration-200"
            aria-label="Clear search"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Result Count */}
      {localValue && (
        <p className="text-xs text-muted mt-2 ml-1 animate-fade-in">
          {totalResults} player{totalResults !== 1 ? "s" : ""} found
        </p>
      )}
    </div>
  );
}
