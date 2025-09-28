// Created by Claude Code on 2025-09-27
// Layout component for MCP Manager UI
// Purpose: Main application layout with sidebar and content area

import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  headerTitle: string;
  breadcrumb?: string[];
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentScreen,
  onNavigate,
  headerTitle,
  breadcrumb,
  className = '',
}) => {
  return (
    <div className={`flex h-screen bg-gray-100 ${className}`}>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={headerTitle} breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;