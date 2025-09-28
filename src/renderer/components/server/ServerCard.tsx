// Created by Claude Code on 2025-09-27
// ServerCard component for MCP Manager UI
// Purpose: Display individual server information with action buttons

import React from 'react';
import Button from '../common/Button';
import { TestResult, TestStatus } from '../../../shared/mcpTypes';

interface ServerData {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
}

interface ServerCardProps {
  server: ServerData;
  onEdit: (serverName: string) => void;
  onToggle: (serverName: string) => void;
  onDelete: (serverName: string) => void;
  onTest: (serverName: string) => void;
  onShowTestResults: (serverName: string) => void;
  testStatus?: TestStatus;
  testResult?: TestResult | null;
  className?: string;
}

const ServerCard: React.FC<ServerCardProps> = ({
  server,
  onEdit,
  onToggle,
  onDelete,
  onTest,
  onShowTestResults,
  testStatus = 'untested',
  testResult,
  className = '',
}) => {
  const statusColor = server.enabled ? 'text-green-600' : 'text-red-600';
  const statusBg = server.enabled ? 'bg-green-50' : 'bg-red-50';
  const statusText = server.enabled ? 'Active' : 'Disabled';

  const getTestStatusInfo = () => {
    switch (testStatus) {
      case 'testing':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Testing...', icon: '⏳' };
      case 'passed':
        return { color: 'text-green-600', bg: 'bg-green-50', text: 'Passed', icon: '✓' };
      case 'failed':
        return { color: 'text-red-600', bg: 'bg-red-50', text: 'Failed', icon: '✗' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', text: 'Untested', icon: '?' };
    }
  };

  const testInfo = getTestStatusInfo();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900 mr-3">{server.name}</h3>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor} ${statusBg}`}>
                {statusText}
              </span>
              <button
                onClick={() => testStatus !== 'untested' ? onShowTestResults(server.name) : undefined}
                className={`px-2 py-1 text-xs font-medium rounded-full ${testInfo.color} ${testInfo.bg} ${
                  testStatus !== 'untested' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                }`}
                disabled={testStatus === 'testing'}
              >
                {testInfo.icon} {testInfo.text}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Command:</span>{' '}
              <span className="font-mono">
                <span className="bg-gray-100 inline-block px-2 py-1 rounded text-xs font-bold">
                  {server.command}
                </span>
                {server.args && server.args.length > 0 && (
                  <>
                    {server.args.map((arg, index) => (
                      <span key={index} className="bg-gray-100 inline-block px-2 py-1 rounded text-xs ml-2">
                        {arg}
                      </span>
                    ))}
                  </>
                )}
              </span>
            </div>

            {server.env && Object.keys(server.env).length > 0 && (
              <div>
                <span className="font-medium">Environment:</span>
                <div className="ml-4 mt-1">
                  {Object.entries(server.env).map(([key, value]) => (
                    <div key={key} className="text-xs mb-1">
                      <span className="font-mono bg-gray-100 px-1 rounded">{key}</span>
                      <span className="mx-1">=</span>
                      <span className="font-mono bg-gray-100 px-1 rounded">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          <Button
            variant="primary"
            onClick={() => onTest(server.name)}
            disabled={testStatus === 'testing'}
            className="text-sm px-3 py-1"
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onEdit(server.name)}
            className="text-sm px-3 py-1"
          >
            Edit
          </Button>
          <Button
            variant={server.enabled ? "secondary" : "primary"}
            onClick={() => onToggle(server.name)}
            className="text-sm px-3 py-1"
          >
            {server.enabled ? 'Disable' : 'Enable'}
          </Button>
          <Button
            variant="danger"
            onClick={() => onDelete(server.name)}
            className="text-sm px-3 py-1"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServerCard;
export type { ServerData };