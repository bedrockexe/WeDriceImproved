import React from 'react';
import { Search } from 'lucide-react';


export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}) {
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>}
        <input className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm ${icon ? 'pl-10' : 'pl-3'} py-2 border ${error ? 'border-red-300' : 'border-gray-300'} ${className}`} {...props} />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>;
}