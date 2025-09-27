// Created by Claude Code on 2025-09-27
// TextArea component for MCP Manager UI
// Purpose: Reusable textarea component for multi-line text input (commands, JSON)

import React from 'react';

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  rows = 4,
  className = '',
}) => {
  const textareaClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 resize-vertical
    ${error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={textareaClasses}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default TextArea;