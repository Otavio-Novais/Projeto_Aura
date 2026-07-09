interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (n: number) => void;
}

export default function PaginationBar({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-gray-500">
        {totalCount} registro{totalCount !== 1 ? 's' : ''}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((n) => {
            if (totalPages <= 7) return true;
            if (n === 1 || n === totalPages) return true;
            if (Math.abs(n - page) <= 1) return true;
            return false;
          })
          .map((n, i, arr) => {
            const showEllipsis = i > 0 && n - arr[i - 1] > 1;
            return (
              <span key={n} className="flex items-center">
                {showEllipsis && (
                  <span className="px-1 text-gray-600">...</span>
                )}
                <button
                  onClick={() => onPageChange(n)}
                  className={`px-2 py-1 rounded min-w-[2rem] text-center transition-colors ${
                    n === page
                      ? 'bg-purple-600 text-white font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  {n}
                </button>
              </span>
            );
          })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}
