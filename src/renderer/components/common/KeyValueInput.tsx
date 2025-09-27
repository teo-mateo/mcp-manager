// Created by Claude Code on 2025-09-27
// KeyValueInput component for MCP Manager UI
// Purpose: Dynamic key-value pair editor for environment variables

import React from 'react';
import Button from './Button';

interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueInputProps {
  label: string;
  pairs: KeyValuePair[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: 'key' | 'value', value: string) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  className?: string;
}

const KeyValueInput: React.FC<KeyValueInputProps> = ({
  label,
  pairs,
  onAdd,
  onRemove,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {pairs.map((pair, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={pair.key}
              onChange={(e) => onChange(index, 'key', e.target.value)}
              placeholder={keyPlaceholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">=</span>
            <input
              type="text"
              value={pair.value}
              onChange={(e) => onChange(index, 'value', e.target.value)}
              placeholder={valuePlaceholder}
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
            + Add Variable
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KeyValueInput;
export type { KeyValuePair };