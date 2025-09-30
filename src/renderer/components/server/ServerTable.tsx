// Created by Claude Code on 2025-09-30
// ServerTable component for MCP Manager UI
// Purpose: Compact table view for displaying MCP servers with expandable rows

import React, { useState } from 'react';
import Button from '../common/Button';
import { TestResult, TestStatus } from '../../../shared/mcpTypes';
import { ServerData } from './ServerCard';

interface ServerTableProps {
  servers: ServerData[];
  onEdit: (serverName: string, serverData: ServerData) => void;
  onToggle: (serverName: string) => void;
  onDelete: (serverName: string) => void;
  onTest: (serverName: string) => void;
  onShowTestResults: (serverName: string) => void;
  testStatuses: Map<string, TestStatus>;
  testResults: Map<string, TestResult>;
  className?: string;
}

const ServerTable: React.FC<ServerTableProps> = ({
  servers,
  onEdit,
  onToggle,
  onDelete,
  onTest,
  onShowTestResults,
  testStatuses,
  testResults,
  className = '',
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [copiedRow, setCopiedRow] = useState<string | null>(null);

  const toggleRowExpansion = (serverName: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(serverName)) {
      newExpanded.delete(serverName);
    } else {
      newExpanded.add(serverName);
    }
    setExpandedRows(newExpanded);
  };

  const handleCopyJson = (server: ServerData) => {
    const jsonConfig = {
      command: server.command,
      ...(server.args && server.args.length > 0 && { args: server.args }),
      ...(server.env && Object.keys(server.env).length > 0 && { env: server.env }),
    };
    navigator.clipboard.writeText(JSON.stringify(jsonConfig, null, 2));
    setCopiedRow(server.name);
    setTimeout(() => setCopiedRow(null), 2000);
  };

  const getTestStatusInfo = (status: TestStatus) => {
    switch (status) {
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

  const getCommandPreview = (server: ServerData): string => {
    const parts = [server.command];
    if (server.args && server.args.length > 0) {
      parts.push(...server.args.slice(0, 2));
      if (server.args.length > 2) {
        parts.push('...');
      }
    }
    return parts.join(' ');
  };

  if (servers.length === 0) {
    return null;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="w-8 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {/* Expand icon column */}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Test
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Command
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {servers.map((server, index) => {
            const isExpanded = expandedRows.has(server.name);
            const testStatus = testStatuses.get(server.name) || 'untested';
            const testResult = testResults.get(server.name) || null;
            const testInfo = getTestStatusInfo(testStatus);
            const statusColor = server.enabled ? 'text-green-600' : 'text-red-600';
            const statusBg = server.enabled ? 'bg-green-50' : 'bg-red-50';
            const statusText = server.enabled ? 'Active' : 'Disabled';

            return (
              <React.Fragment key={server.name}>
                <tr
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  {/* Expand/Collapse Button */}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => toggleRowExpansion(server.name)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRowExpansion(server.name)}
                      className="font-medium text-gray-900 hover:text-blue-600 text-left"
                    >
                      {server.name}
                    </button>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColor} ${statusBg}`}>
                      {statusText}
                    </span>
                  </td>

                  {/* Test Status Badge */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${testInfo.color} ${testInfo.bg}`}>
                      {testInfo.icon} {testInfo.text}
                      {testStatus === 'passed' && testResult && (
                        <button
                          onClick={() => onShowTestResults(server.name)}
                          className="ml-1 text-blue-600 hover:text-blue-800 underline"
                          title="View test results"
                        >
                          details
                        </button>
                      )}
                    </span>
                  </td>

                  {/* Command Preview */}
                  <td className="px-4 py-3 font-mono text-sm text-gray-600" title={getCommandPreview(server)}>
                    <div className="max-w-md truncate">
                      {getCommandPreview(server)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end items-center space-x-2">
                      <button
                        onClick={() => onTest(server.name)}
                        disabled={testStatus === 'testing'}
                        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title="Test server"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onEdit(server.name, server)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Edit server"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onToggle(server.name)}
                        className={server.enabled ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                        title={server.enabled ? 'Disable server' : 'Enable server'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(server.name)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete server"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row Details */}
                {isExpanded && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="space-y-4 max-w-4xl">
                        {/* Command Details */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Command & Arguments</h4>
                          <div className="font-mono text-sm text-gray-900 bg-white p-3 rounded border">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">
                              {server.command}
                            </span>
                            {server.args && server.args.map((arg, idx) => (
                              <span key={idx} className="bg-gray-100 px-2 py-1 rounded ml-2">
                                {arg}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Environment Variables */}
                        {server.env && Object.keys(server.env).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Environment Variables</h4>
                            <div className="bg-white p-3 rounded border">
                              {Object.entries(server.env).map(([key, value]) => (
                                <div key={key} className="text-sm mb-1 font-mono">
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{key}</span>
                                  <span className="mx-2 text-gray-500">=</span>
                                  <span className="bg-gray-100 px-2 py-1 rounded">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Raw JSON */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Raw JSON Configuration</h4>
                            <button
                              onClick={() => handleCopyJson(server)}
                              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                              title={copiedRow === server.name ? 'Copied!' : 'Copy JSON'}
                            >
                              {copiedRow === server.name ? (
                                <>
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="text-green-600">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(
                                {
                                  command: server.command,
                                  ...(server.args && server.args.length > 0 && { args: server.args }),
                                  ...(server.env && Object.keys(server.env).length > 0 && { env: server.env }),
                                },
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ServerTable;