// Created by Claude Code on 2025-09-27
// ServerList component for MCP Manager UI
// Purpose: Display list of servers separated by active/disabled status
// Updated 2025-09-30: Added dual view mode (cards/table) with toggle

import React, { useState, useEffect } from 'react';
import ServerCard, { ServerData } from './ServerCard';
import ServerTable from './ServerTable';
import Button from '../common/Button';
import { TestResult, TestStatus } from '../../../shared/mcpTypes';

type ViewMode = 'cards' | 'table';

interface ServerListProps {
  servers: ServerData[];
  onEdit: (serverName: string, serverData: ServerData) => void;
  onToggle: (serverName: string) => void;
  onDelete: (serverName: string) => void;
  onAddServer: () => void;
  onTest: (serverName: string) => void;
  onShowTestResults: (serverName: string) => void;
  testStatuses: Map<string, TestStatus>;
  testResults: Map<string, TestResult>;
  className?: string;
}

const ServerList: React.FC<ServerListProps> = ({
  servers,
  onEdit,
  onToggle,
  onDelete,
  onAddServer,
  onTest,
  onShowTestResults,
  testStatuses,
  testResults,
  className = '',
}) => {
  // Load view mode from localStorage or default to 'cards'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('mcp-manager-view-mode');
    return (saved === 'table' ? 'table' : 'cards') as ViewMode;
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('mcp-manager-view-mode', viewMode);
  }, [viewMode]);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          MCP Servers {servers.length > 0 && `(${servers.length})`}
        </h2>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center gap-1 ${
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Card view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Table
            </button>
          </div>

          <Button
            variant="primary"
            onClick={onAddServer}
            className="px-4 py-2"
          >
            + Add Server
          </Button>
        </div>
      </div>

      {servers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No servers configured</h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first MCP server configuration.
          </p>
          <Button
            variant="primary"
            onClick={onAddServer}
            className="px-6 py-2"
          >
            Add Your First Server
          </Button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-4">
          {servers.map((server) => (
            <ServerCard
              key={server.name}
              server={server}
              onEdit={(serverName) => onEdit(serverName, server)}
              onToggle={onToggle}
              onDelete={onDelete}
              onTest={onTest}
              onShowTestResults={onShowTestResults}
              testStatus={testStatuses.get(server.name) || 'untested'}
              testResult={testResults.get(server.name) || null}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <ServerTable
          servers={servers}
          onEdit={onEdit}
          onToggle={onToggle}
          onDelete={onDelete}
          onTest={onTest}
          onShowTestResults={onShowTestResults}
          testStatuses={testStatuses}
          testResults={testResults}
        />
      )}
    </div>
  );
};

export default ServerList;