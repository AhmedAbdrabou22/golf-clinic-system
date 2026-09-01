import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import type { PaginationMeta } from "@/types";

interface PaginationProps {
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;
}

function buildPageList(current: number, last: number): (number | "dots")[] {
  const pages: (number | "dots")[] = [];
  const windowSize = 1;

  for (let p = 1; p <= last; p++) {
    const isEdge = p === 1 || p === last;
    const isNearCurrent = Math.abs(p - current) <= windowSize;
    if (isEdge || isNearCurrent) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "dots") {
      pages.push("dots");
    }
  }
  return pages;
}

const Pagination = ({ meta, onPageChange }: PaginationProps) => {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page, total, from, to } = meta;
  const pages = buildPageList(current_page, last_page);

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-ink/8 pt-4 sm:flex-row">
      {total != null && (
        <p className="text-xs font-bold text-ink/45">
          عرض {from ?? 0} إلى {to ?? 0} من إجمالي {total}
        </p>
      )}

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 text-ink/60 transition hover:bg-mint-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="الصفحة السابقة"
        >
          <FiChevronRight size={16} />
        </button>

        {pages.map((p, idx) =>
          p === "dots" ? (
            <span key={`dots-${idx}`} className="px-1.5 text-ink/30">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-bold transition ${
                p === current_page ? "bg-primary-500 text-white" : "text-ink/60 hover:bg-mint-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= last_page}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 text-ink/60 transition hover:bg-mint-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="الصفحة التالية"
        >
          <FiChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;