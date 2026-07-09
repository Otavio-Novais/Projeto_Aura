import type { ReactNode } from 'react';

interface SortableThProps {
  field: string;
  ordering: string;
  onToggle: (field: string) => void;
  children: ReactNode;
  className?: string;
}

export default function SortableTh({
  field,
  ordering,
  onToggle,
  children,
  className,
}: SortableThProps) {
  const isActive = ordering === field || ordering === `-${field}`;
  const isDesc = ordering === `-${field}`;

  return (
    <th
      className={`text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 cursor-pointer select-none hover:text-gray-300 transition-colors ${className ?? ''}`}
      onClick={() => onToggle(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {isActive && (
          <span className="text-purple-400 text-xs">{isDesc ? '↓' : '↑'}</span>
        )}
      </span>
    </th>
  );
}
