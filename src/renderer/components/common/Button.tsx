// Created by Claude Code on 2025-09-27
// Button component for MCP Manager UI
// Purpose: Reusable button component with different variants (primary, secondary, danger)

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const baseClasses = 'px-4 py-2 font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

  const variantClasses = {
    primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  const classes = `${baseClasses} ${variantClasses[variant]} ${disabled ? disabledClasses : ''} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;