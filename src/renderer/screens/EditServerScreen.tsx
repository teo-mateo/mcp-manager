// Created by Claude Code on 2025-09-27
// EditServerScreen component for MCP Manager UI
// Purpose: Screen for editing existing MCP server configurations

import React from 'react';
import ServerForm from '../components/server/ServerForm';
import { ServerData } from '../components/server/ServerCard';
import { ConfigAPI } from '../services/configApi';
import { useConfigScope } from '../hooks/useConfigScope';

interface EditServerScreenProps {
  server: ServerData;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
}

const EditServerScreen: React.FC<EditServerScreenProps> = ({
  server,
  onSave,
  onCancel,
  className = '',
}) => {
  const { scope, refreshServers } = useConfigScope('project');

  const handleSave = async (serverData: ServerData) => {
    try {
      // Convert ServerData to McpServer format
      const serverConfig = ConfigAPI.convertFromServerData(serverData);

      // Update the server (handle name changes)
      await ConfigAPI.updateServer(server.name, serverData.name, serverConfig, scope);

      // Refresh the server list
      await refreshServers();

      // Navigate back to server list
      onSave();
    } catch (error) {
      console.error('Error updating server:', error);
      alert(`Error updating server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (serverName: string) => {
    try {
      await ConfigAPI.deleteServer(serverName, scope);
      await refreshServers();
      onSave(); // Navigate back to server list
    } catch (error) {
      console.error('Error deleting server:', error);
      alert(`Error deleting server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  return (
    <div className={className}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Server</h1>
        <p className="text-gray-600 mt-1">
          Modify the configuration for <span className="font-medium">{server.name}</span>
        </p>
      </div>

      <ServerForm
        initialData={server}
        onSave={handleSave}
        onCancel={onCancel}
        onDelete={handleDelete}
        isEdit={true}
      />
    </div>
  );
};

export default EditServerScreen;