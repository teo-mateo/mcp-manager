// Created by Claude Code on 2025-09-27
// Header component for MCP Manager UI
// Purpose: Application header with title and breadcrumb navigation

import React from 'react';

interface HeaderProps {
  title: string;
  breadcrumb?: string[];
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  breadcrumb,
  className = '',
}) => {
  return (
    <header className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex mt-1" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                {breadcrumb.map((item, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;