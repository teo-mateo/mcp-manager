// Created by Claude Code on 2025-09-27
// Sidebar component for MCP Manager UI
// Purpose: Navigation sidebar with menu items

import React from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  onClick: () => void;
}

interface SidebarProps {
  menuItems: MenuItem[];
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  className = '',
}) => {
  return (
    <aside className={`bg-gray-50 border-r border-gray-200 w-64 flex-shrink-0 ${className}`}>
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">MCP Manager</h2>
        </div>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={item.onClick}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${item.active
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center">
                    {item.icon && (
                      <span className="mr-3">{item.icon}</span>
                    )}
                    {item.label}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
export type { MenuItem };