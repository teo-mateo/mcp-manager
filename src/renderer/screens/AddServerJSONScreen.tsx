// Created by Claude Code on 2025-09-27
// AddServerJSONScreen component for MCP Manager UI
// Purpose: Screen for adding new MCP servers with JSON editor mode

import React, { useState } from 'react';
import TextArea from '../components/common/TextArea';
import Button from '../components/common/Button';
import { useConfigScope } from '../hooks/useConfigScope';
import { McpServer } from '../../shared/types';

interface AddServerJSONScreenProps {
  onSave: () => void;
  onCancel: () => void;
  className?: string;
}

const AddServerJSONScreen: React.FC<AddServerJSONScreenProps> = ({
  onSave,
  onCancel,
  className = '',
}) => {
  const { addServer } = useConfigScope('project');
  const [jsonContent, setJsonContent] = useState('{\n  "command": "",\n  "args": [],\n  "env": {}\n}');
  const [jsonError, setJsonError] = useState('');
  const [serverName, setServerName] = useState('');
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAndFormatJSON = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonContent(formatted);
      setJsonError('');
      return true;
    } catch (error) {
      setJsonError(`Invalid JSON: ${(error as Error).message}`);
      return false;
    }
  };

  const handleSave = async () => {
    let isValid = true;

    // Validate server name
    if (!serverName.trim()) {
      setNameError('Server name is required');
      isValid = false;
    } else if (serverName.length > 50) {
      setNameError('Server name must be 50 characters or less');
      isValid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(serverName.trim())) {
      setNameError('Server name can only contain letters, numbers, hyphens, and underscores');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate JSON
    if (!validateAndFormatJSON()) {
      isValid = false;
    }

    if (isValid) {
      setIsSubmitting(true);
      try {
        const serverConfig = JSON.parse(jsonContent);

        // Validate required fields
        if (!serverConfig.command) {
          setJsonError('Command field is required in JSON');
          setIsSubmitting(false);
          return;
        }

        const mcpServer: McpServer = {
          command: serverConfig.command,
          args: serverConfig.args || [],
          env: serverConfig.env || {},
          type: serverConfig.type // Optional type field
        };

        await addServer(serverName.trim(), mcpServer);
        onSave(); // Notify parent to navigate back
      } catch (error) {
        setJsonError(`Error saving server: ${(error as Error).message}`);
        setIsSubmitting(false);
      }
    }
  };

  const exampleConfigs = [
    {
      name: 'SearXNG Server',
      config: {
        command: 'npx',
        args: ['-y', 'mcp-searxng'],
        env: {
          'SEARXNG_URL': 'http://localhost:8888'
        }
      }
    }
  ];

  const loadExample = (config: unknown) => {
    setJsonContent(JSON.stringify(config, null, 2));
    setJsonError('');
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Server</h1>
        <p className="text-gray-600 mt-1">Configure a new MCP server using JSON</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Server Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="e.g., searxng, vastai"
                maxLength={50}
                className={`
                  w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${nameError
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }
                `}
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600">{nameError}</p>
              )}
            </div>

            <TextArea
              label="Server Configuration (JSON)"
              value={jsonContent}
              onChange={setJsonContent}
              placeholder="Enter JSON configuration..."
              rows={12}
              error={jsonError}
              required
            />

            <div className="flex space-x-3 mt-4">
              <Button
                variant="secondary"
                onClick={validateAndFormatJSON}
                className="px-4 py-2"
              >
                Format JSON
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Example Configuration</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{exampleConfigs[0].name}</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                {JSON.stringify(exampleConfigs[0].config, null, 2)}
              </pre>
              <Button
                variant="secondary"
                onClick={() => loadExample(exampleConfigs[0].config)}
                className="mt-2 text-sm px-3 py-1"
              >
                Load Example
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2"
          >
            {isSubmitting ? 'Adding Server...' : 'Add Server'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddServerJSONScreen;