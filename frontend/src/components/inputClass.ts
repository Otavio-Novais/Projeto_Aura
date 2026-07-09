export function inputClass(error?: string) {
  return `w-full bg-gray-800 border rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
    error
      ? 'border-red-500 focus:border-red-400'
      : 'border-gray-700 focus:border-purple-500'
  }`;
}
