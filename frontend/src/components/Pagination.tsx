"use client";

import { PaginationInfo } from "@/types";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, total_pages, total, has_next, has_prev } = pagination;

  if (total_pages <= 1) return null;

  // Generate page numbers to display
  const pages: (number | "...")[] = [];
  const maxVisible = 5;

  if (total_pages <= maxVisible + 2) {
    for (let i = 1; i <= total_pages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(total_pages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < total_pages - 2) pages.push("...");
    pages.push(total_pages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
      {/* Info */}
      <p className="text-xs text-muted order-2 sm:order-1">
        Showing page <span className="text-white font-medium">{page}</span> of{" "}
        <span className="text-white font-medium">{total_pages}</span>
        <span className="mx-1.5 text-border">·</span>
        <span className="text-white font-medium">{total}</span> total players
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!has_prev}
          className="px-3 py-2 rounded-lg text-xs font-medium
                     border border-border hover:border-border-hover
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:bg-card-hover transition-all duration-200"
          aria-label="Previous page"
        >
          ← Prev
        </button>

        {/* Page Numbers */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-muted text-xs">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-xs font-medium transition-all duration-200
                ${
                  p === page
                    ? "bg-white text-black"
                    : "border border-border hover:border-border-hover hover:bg-card-hover"
                }`}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
          className="px-3 py-2 rounded-lg text-xs font-medium
                     border border-border hover:border-border-hover
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:bg-card-hover transition-all duration-200"
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
