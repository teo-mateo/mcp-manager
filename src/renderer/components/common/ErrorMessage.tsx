// Created by Claude Code on 2025-09-27
// ErrorMessage component for MCP Manager UI
// Purpose: Display error messages with optional retry functionality

import React from 'react';
import Button from './Button';

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-red-500 text-xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700 whitespace-pre-wrap">{error}</div>
          {onRetry && (
            <div className="mt-4">
              <Button
                variant="secondary"
                onClick={onRetry}
                className="text-sm px-3 py-1"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;