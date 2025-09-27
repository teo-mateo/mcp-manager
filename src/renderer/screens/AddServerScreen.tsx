// Created by Claude Code on 2025-09-27
// AddServerScreen component for MCP Manager UI
// Purpose: Screen for adding new MCP servers with form mode

import React from 'react';
import ServerForm from '../components/server/ServerForm';
import Button from '../components/common/Button';
import { ServerData } from '../components/server/ServerCard';

interface AddServerScreenProps {
  onSave: (serverData: ServerData) => void;
  onCancel: () => void;
  onSwitchToJSON: () => void;
  className?: string;
}

const AddServerScreen: React.FC<AddServerScreenProps> = ({
  onSave,
  onCancel,
  onSwitchToJSON,
  className = '',
}) => {
  return (
    <div className={className}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Server</h1>
          <p className="text-gray-600 mt-1">Configure a new MCP server using the form below</p>
        </div>
        <Button
          variant="secondary"
          onClick={onSwitchToJSON}
          className="px-4 py-2"
        >
          Switch to JSON Mode
        </Button>
      </div>

      <ServerForm
        onSave={onSave}
        onCancel={onCancel}
        isEdit={false}
      />
    </div>
  );
};

export default AddServerScreen;