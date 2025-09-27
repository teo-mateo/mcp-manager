// Created by Claude Code on 2025-09-27
// ArrayInput component for MCP Manager UI
// Purpose: Dynamic array editor with add/remove functionality for server arguments

import React from 'react';
import Button from './Button';

interface ArrayInputProps {
  label: string;
  items: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
  placeholder?: string;
  className?: string;
}

const ArrayInput: React.FC<ArrayInputProps> = ({
  label,
  items,
  onAdd,
  onRemove,
  onChange,
  placeholder = 'Enter value',
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              variant="danger"
              onClick={() => onRemove(index)}
              className="px-3 py-2"
            >
              Remove
            </Button>
          </div>
        ))}
        <div className="flex justify-start">
          <Button
            variant="secondary"
            onClick={onAdd}
            className="px-4 py-2"
          >
            + Add Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArrayInput;