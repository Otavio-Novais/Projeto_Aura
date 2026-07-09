import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export default function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
