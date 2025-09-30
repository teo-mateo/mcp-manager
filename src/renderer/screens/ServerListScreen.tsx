// Created by Claude Code on 2025-09-27
// ServerListScreen component for MCP Manager UI
// Purpose: Main screen displaying list of MCP servers
// Updated 2025-09-28: Added project path display and project-specific error handling
// Updated 2025-09-28: Added scope toggle for global/project MCP servers

import React, { useState } from 'react';
import ServerList from '../components/server/ServerList';
import { ServerData } from '../components/server/ServerCard';
import ErrorMessage from '../components/common/ErrorMessage';
import ScopeToggle from '../components/common/ScopeToggle';
import TestResultsModal from '../components/TestResultsModal';
import ServerEditorModal from '../components/ServerEditorModal';
import { useConfigScope } from '../hooks/useConfigScope';
import { useProjectPath } from '../hooks/useProjectPath';
import { ConfigError } from '../../shared/errors';
import { TestResult, TestStatus } from '../../shared/mcpTypes';
import { McpServer } from '../../shared/types';
import { ConfigAPI } from '../services/configApi';

interface ServerListScreenProps {
  className?: string;
}

const ServerListScreen: React.FC<ServerListScreenProps> = ({
  className = '',
}) => {
  const { scope, servers, error, loading, setScope, refreshServers } = useConfigScope('project');
  const { projectPath, loading: projectLoading, error: projectError } = useProjectPath();

  // Test state management
  const [testStatuses, setTestStatuses] = useState<Map<string, TestStatus>>(new Map());
  const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map());
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedTestServer, setSelectedTestServer] = useState<string>('');

  // Editor modal state
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<ServerData | null>(null);

  const handleTest = async (serverName: string) => {
    // Find the server config
    const server = servers.find(s => s.name === serverName);
    if (!server) return;

    // Set testing status
    setTestStatuses(prev => new Map(prev).set(serverName, 'testing'));

    try {
      // Convert ServerData to McpServer format
      const serverConfig: McpServer = {
        command: server.command,
        args: server.args,
        env: server.env,
      };

      // Call the test API
      const result = await window.electronAPI.testServer(serverName, serverConfig);

      // Update results
      console.log('Test completed for', serverName, 'Result:', result);
      setTestResults(prev => new Map(prev).set(serverName, result));
      setTestStatuses(prev => new Map(prev).set(serverName, result.success ? 'passed' : 'failed'));
    } catch (error) {
      // Handle test error
      const errorResult: TestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        duration: 0,
      };

      setTestResults(prev => new Map(prev).set(serverName, errorResult));
      setTestStatuses(prev => new Map(prev).set(serverName, 'failed'));
    }
  };

  const handleShowTestResults = (serverName: string) => {
    console.log('Opening test results for', serverName, 'Result:', testResults.get(serverName));
    setSelectedTestServer(serverName);
    setTestModalOpen(true);
  };

  const handleToggle = async (serverName: string) => {
    try {
      await ConfigAPI.toggleServer(serverName, scope);
      await refreshServers();
    } catch (error) {
      console.error('Error toggling server:', error);
      alert(`Error toggling server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (serverName: string) => {
    if (confirm(`Are you sure you want to delete the server "${serverName}"? This action cannot be undone.`)) {
      try {
        await ConfigAPI.deleteServer(serverName, scope);
        await refreshServers();
      } catch (error) {
        console.error('Error deleting server:', error);
        alert(`Error deleting server: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleAddServer = () => {
    setEditingServer(null);
    setEditorModalOpen(true);
  };

  const handleEditServer = (serverName: string, serverData: ServerData) => {
    setEditingServer(serverData);
    setEditorModalOpen(true);
  };

  const handleSaveServer = async (serverName: string, config: McpServer, oldServerName?: string) => {
    try {
      if (oldServerName && oldServerName !== serverName) {
        // Name changed - use update
        await ConfigAPI.updateServer(oldServerName, serverName, config, scope);
      } else if (oldServerName) {
        // Edit existing server (no name change)
        await ConfigAPI.updateServer(oldServerName, serverName, config, scope);
      } else {
        // Add new server
        await ConfigAPI.addServer(serverName, config, scope);
      }
      await refreshServers();
    } catch (error) {
      console.error('Error saving server:', error);
      throw error; // Re-throw to let modal handle the error display
    }
  };

  const handleDeleteFromModal = async (serverName: string) => {
    try {
      await ConfigAPI.deleteServer(serverName, scope);
      await refreshServers();
    } catch (error) {
      console.error('Error deleting server:', error);
      throw error; // Re-throw to let modal handle the error display
    }
  };

  // Check if the error is a project not found error
  const isProjectNotFound = error && error.includes('PROJECT_NOT_FOUND');

  // Don't show project not found error for global scope
  const shouldShowError = error && (scope === 'global' || !isProjectNotFound || !loading);

  if (shouldShowError) {
    return (
      <div className={className}>
        <ScopeToggle
          currentScope={scope}
          onScopeChange={setScope}
          projectPath={projectPath || undefined}
        />
        {scope === 'project' && projectPath && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Project: <span className="font-mono">{projectPath}</span>
            </div>
          </div>
        )}
        <ErrorMessage
          error={
            isProjectNotFound
              ? `Project "${projectPath}" not found in Claude configuration.\n\nPlease open this project in Claude Code first to initialize it, or switch to Global scope to manage servers that apply to all projects.`
              : error
          }
          onRetry={isProjectNotFound ? undefined : refreshServers}
        />
      </div>
    );
  }

  if (loading && !servers.length) {
    return (
      <div className={className}>
        <ScopeToggle
          currentScope={scope}
          onScopeChange={setScope}
          projectPath={projectPath || undefined}
        />
        <div className="text-center py-12">
          <p className="text-gray-500">Loading servers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ScopeToggle
        currentScope={scope}
        onScopeChange={setScope}
        projectPath={projectPath || undefined}
        className="mb-4"
      />
      {scope === 'project' && projectPath && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Managing servers for: <span className="font-mono">{projectPath}</span>
            </span>
          </div>
        </div>
      )}
      {scope === 'global' && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm text-green-700 dark:text-green-400">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Managing global servers (applies to all projects)
            </span>
          </div>
        </div>
      )}
      <ServerList
        servers={servers}
        onEdit={handleEditServer}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onAddServer={handleAddServer}
        onTest={handleTest}
        onShowTestResults={handleShowTestResults}
        testStatuses={testStatuses}
        testResults={testResults}
      />
      <TestResultsModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        serverName={selectedTestServer}
        testResult={testResults.get(selectedTestServer) || null}
      />
      <ServerEditorModal
        isOpen={editorModalOpen}
        onClose={() => setEditorModalOpen(false)}
        onSave={handleSaveServer}
        onDelete={handleDeleteFromModal}
        server={editingServer}
        scope={scope}
      />
    </div>
  );
};

export default ServerListScreen;