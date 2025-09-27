// Created by Claude Code on 2025-09-27
// AddServerJSONScreen component for MCP Manager UI
// Purpose: Screen for adding new MCP servers with JSON editor mode

import React, { useState } from 'react';
import TextArea from '../components/common/TextArea';
import Button from '../components/common/Button';
import { ServerData } from '../components/server/ServerCard';

interface AddServerJSONScreenProps {
  onSave: (serverData: ServerData) => void;
  onCancel: () => void;
  onSwitchToForm: () => void;
  className?: string;
}

const AddServerJSONScreen: React.FC<AddServerJSONScreenProps> = ({
  onSave,
  onCancel,
  onSwitchToForm,
  className = '',
}) => {
  const [jsonContent, setJsonContent] = useState('{\n  "command": "",\n  "args": [],\n  "env": {}\n}');
  const [jsonError, setJsonError] = useState('');
  const [serverName, setServerName] = useState('');
  const [nameError, setNameError] = useState('');

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

  const handleSave = () => {
    let isValid = true;

    // Validate server name
    if (!serverName.trim()) {
      setNameError('Server name is required');
      isValid = false;
    } else if (serverName.length > 50) {
      setNameError('Server name must be 50 characters or less');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate JSON
    if (!validateAndFormatJSON()) {
      isValid = false;
    }

    if (isValid) {
      try {
        const serverConfig = JSON.parse(jsonContent);

        // Validate required fields
        if (!serverConfig.command) {
          setJsonError('Command field is required in JSON');
          return;
        }

        const serverData: ServerData = {
          name: serverName.trim(),
          command: serverConfig.command,
          args: serverConfig.args || [],
          env: serverConfig.env || {},
          enabled: true,
        };

        onSave(serverData);
      } catch (error) {
        setJsonError(`Error parsing server configuration: ${(error as Error).message}`);
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
    },
    {
      name: 'VastAI Server',
      config: {
        command: 'node',
        args: ['/path/to/vastai/index.js'],
        env: {
          'NODE_ENV': 'production'
        }
      }
    }
  ];

  const loadExample = (config: any) => {
    setJsonContent(JSON.stringify(config, null, 2));
    setJsonError('');
  };

  return (
    <div className={className}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Server (JSON Mode)</h1>
          <p className="text-gray-600 mt-1">Configure a new MCP server using JSON</p>
        </div>
        <Button
          variant="secondary"
          onClick={onSwitchToForm}
          className="px-4 py-2"
        >
          Switch to Form Mode
        </Button>
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Example Configurations</h3>
            <div className="space-y-4">
              {exampleConfigs.map((example, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{example.name}</h4>
                  <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                    {JSON.stringify(example.config, null, 2)}
                  </pre>
                  <Button
                    variant="secondary"
                    onClick={() => loadExample(example.config)}
                    className="mt-2 text-sm px-3 py-1"
                  >
                    Load Example
                  </Button>
                </div>
              ))}
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
            className="px-4 py-2"
          >
            Add Server
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddServerJSONScreen;