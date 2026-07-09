interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({
  message = 'Nenhum registro encontrado.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <span className="text-4xl mb-3">📭</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
