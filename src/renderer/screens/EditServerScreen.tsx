// Created by Claude Code on 2025-09-27
// EditServerScreen component for MCP Manager UI
// Purpose: Screen for editing existing MCP server configurations

import React from 'react';
import ServerForm from '../components/server/ServerForm';
import { ServerData } from '../components/server/ServerCard';

interface EditServerScreenProps {
  server: ServerData;
  onSave: (serverData: ServerData) => void;
  onCancel: () => void;
  onDelete: (serverName: string) => void;
  className?: string;
}

const EditServerScreen: React.FC<EditServerScreenProps> = ({
  server,
  onSave,
  onCancel,
  onDelete,
  className = '',
}) => {
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
        onSave={onSave}
        onCancel={onCancel}
        onDelete={onDelete}
        isEdit={true}
      />
    </div>
  );
};

export default EditServerScreen;