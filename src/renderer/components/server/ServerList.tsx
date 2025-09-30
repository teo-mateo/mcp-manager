// Created by Claude Code on 2025-09-27
// ServerList component for MCP Manager UI
// Purpose: Display list of servers separated by active/disabled status

import React from 'react';
import ServerCard, { ServerData } from './ServerCard';
import Button from '../common/Button';
import { TestResult, TestStatus } from '../../../shared/mcpTypes';

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
  const activeServers = servers.filter(server => server.enabled);
  const disabledServers = servers.filter(server => !server.enabled);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">MCP Servers</h2>
        <Button
          variant="primary"
          onClick={onAddServer}
          className="px-4 py-2"
        >
          + Add Server
        </Button>
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
      ) : (
        <div className="space-y-8">
          {activeServers.length > 0 && (
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Active Servers ({activeServers.length})
              </h3>
              <div className="space-y-4">
                {activeServers.map((server) => (
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
            </section>
          )}

          {disabledServers.length > 0 && (
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Disabled Servers ({disabledServers.length})
              </h3>
              <div className="space-y-4">
                {disabledServers.map((server) => (
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
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default ServerList;