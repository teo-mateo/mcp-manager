// Created by Claude Code on 2025-09-30
// ServerEditorModal component for MCP Manager UI
// Purpose: Unified modal for adding/editing MCP servers with JSON and Form modes

import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import TextArea from './common/TextArea';
import TextInput from './common/TextInput';
import ArrayInput from './common/ArrayInput';
import KeyValueInput, { KeyValuePair } from './common/KeyValueInput';
import { ServerData } from './server/ServerCard';
import { McpServer, ConfigScope } from '../../shared/types';

interface ServerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serverName: string, config: McpServer, oldServerName?: string) => Promise<void>;
  onDelete?: (serverName: string) => Promise<void>;
  server?: ServerData | null;
  scope: ConfigScope;
}

type EditorMode = 'json' | 'form';

interface FormData {
  name: string;
  command: string;
  args: string[];
  env: KeyValuePair[];
}

const ServerEditorModal: React.FC<ServerEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  server,
  scope,
}) => {
  const isEditMode = !!server;
  const [editorMode, setEditorMode] = useState<EditorMode>(isEditMode ? 'form' : 'json');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // JSON mode state
  const [jsonContent, setJsonContent] = useState('{\n  "command": "",\n  "args": [],\n  "env": {}\n}');
  const [jsonError, setJsonError] = useState('');
  const [serverName, setServerName] = useState('');
  const [nameError, setNameError] = useState('');

  // Form mode state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    command: '',
    args: [],
    env: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize data when modal opens or server changes
  useEffect(() => {
    if (isOpen) {
      if (server) {
        // Edit mode - initialize with server data
        setServerName(server.name);
        setFormData({
          name: server.name,
          command: server.command,
          args: server.args || [],
          env: server.env
            ? Object.entries(server.env).map(([key, value]) => ({ key, value }))
            : [],
        });

        const jsonConfig = {
          command: server.command,
          ...(server.args && server.args.length > 0 && { args: server.args }),
          ...(server.env && Object.keys(server.env).length > 0 && { env: server.env }),
        };
        setJsonContent(JSON.stringify(jsonConfig, null, 2));
        setEditorMode('form');
      } else {
        // Add mode - reset to defaults
        setServerName('');
        setFormData({
          name: '',
          command: '',
          args: [],
          env: [],
        });
        setJsonContent('{\n  "command": "",\n  "args": [],\n  "env": {}\n}');
        setEditorMode('json');
      }
      setJsonError('');
      setNameError('');
      setFormErrors({});
    }
  }, [isOpen, server]);

  // Sync form to JSON when switching modes
  useEffect(() => {
    if (editorMode === 'json' && formData.command) {
      const jsonConfig: any = {
        command: formData.command,
      };
      if (formData.args.length > 0) {
        jsonConfig.args = formData.args.filter(arg => arg.trim() !== '');
      }
      if (formData.env.length > 0) {
        const envObj = formData.env.reduce((acc, pair) => {
          if (pair.key.trim() && pair.value.trim()) {
            acc[pair.key.trim()] = pair.value.trim();
          }
          return acc;
        }, {} as Record<string, string>);
        if (Object.keys(envObj).length > 0) {
          jsonConfig.env = envObj;
        }
      }
      setJsonContent(JSON.stringify(jsonConfig, null, 2));
    }
  }, [editorMode]);

  if (!isOpen) return null;

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

  const validateServerName = (name: string): boolean => {
    if (!name.trim()) {
      setNameError('Server name is required');
      return false;
    } else if (name.length > 50) {
      setNameError('Server name must be 50 characters or less');
      return false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(name.trim())) {
      setNameError('Server name can only contain letters, numbers, hyphens, and underscores');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Server name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Server name must be 50 characters or less';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name.trim())) {
      newErrors.name = 'Server name can only contain letters, numbers, hyphens, and underscores';
    }

    if (!formData.command.trim()) {
      newErrors.command = 'Command is required';
    } else if (formData.command.length > 255) {
      newErrors.command = 'Command must be 255 characters or less';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveJSON = async () => {
    let isValid = true;

    // Validate server name (only for add mode, in edit mode name is read-only)
    if (!isEditMode) {
      isValid = validateServerName(serverName);
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
          type: serverConfig.type, // Optional type field
        };

        await onSave(
          isEditMode ? server!.name : serverName.trim(),
          mcpServer,
          isEditMode ? server!.name : undefined
        );
        onClose();
      } catch (error) {
        setJsonError(`Error saving server: ${(error as Error).message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSaveForm = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const mcpServer: McpServer = {
          command: formData.command.trim(),
          args: formData.args.filter(arg => arg.trim() !== ''),
          env: formData.env.reduce((acc, pair) => {
            if (pair.key.trim() && pair.value.trim()) {
              acc[pair.key.trim()] = pair.value.trim();
            }
            return acc;
          }, {} as Record<string, string>),
        };

        await onSave(
          formData.name.trim(),
          mcpServer,
          isEditMode ? server!.name : undefined
        );
        onClose();
      } catch (error) {
        setFormErrors({ ...formErrors, submit: `Error saving server: ${(error as Error).message}` });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async () => {
    if (server && onDelete) {
      if (confirm(`Are you sure you want to delete the server "${server.name}"? This action cannot be undone.`)) {
        try {
          await onDelete(server.name);
          onClose();
        } catch (error) {
          alert(`Error deleting server: ${(error as Error).message}`);
        }
      }
    }
  };

  const loadExample = () => {
    const example = {
      command: 'npx',
      args: ['-y', 'mcp-searxng'],
      env: {
        SEARXNG_URL: 'http://localhost:8888',
      },
    };
    setJsonContent(JSON.stringify(example, null, 2));
    setJsonError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? `Edit Server: ${server.name}` : 'Add MCP Server'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Scope: <span className="font-medium">{scope === 'global' ? 'Global' : 'Project'}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setEditorMode('json')}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    editorMode === 'json'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setEditorMode('form')}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    editorMode === 'form'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Form
                </button>
              </div>
              <Button variant="secondary" onClick={onClose} className="text-sm">
                Close
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {editorMode === 'json' ? (
            // JSON Editor Mode
            <div className="space-y-4">
              {!isEditMode && (
                <div>
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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      nameError
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Server Configuration (JSON)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  placeholder="Enter JSON configuration..."
                  rows={15}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    jsonError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {jsonError && <p className="mt-1 text-sm text-red-600">{jsonError}</p>}
              </div>

              <div className="flex space-x-3">
                <Button variant="secondary" onClick={validateAndFormatJSON} className="px-4 py-2">
                  Format JSON
                </Button>
                {!isEditMode && (
                  <Button variant="secondary" onClick={loadExample} className="px-4 py-2">
                    Load Example
                  </Button>
                )}
              </div>

              {!isEditMode && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Example: SearXNG Server</h4>
                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`{
  "command": "npx",
  "args": ["-y", "mcp-searxng"],
  "env": {
    "SEARXNG_URL": "http://localhost:8888"
  }
}`}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            // Form Editor Mode
            <div className="space-y-6">
              <TextInput
                label="Server Name"
                value={formData.name}
                onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
                placeholder="e.g., searxng, vastai"
                required
                maxLength={50}
                error={formErrors.name}
                disabled={isEditMode}
              />

              <TextInput
                label="Command"
                value={formData.command}
                onChange={(value) => setFormData((prev) => ({ ...prev, command: value }))}
                placeholder="e.g., npx, node, python"
                required
                maxLength={255}
                error={formErrors.command}
              />

              <ArrayInput
                label="Arguments"
                items={formData.args}
                onAdd={() => setFormData((prev) => ({ ...prev, args: [...prev.args, ''] }))}
                onRemove={(index) =>
                  setFormData((prev) => ({ ...prev, args: prev.args.filter((_, i) => i !== index) }))
                }
                onChange={(index, value) =>
                  setFormData((prev) => ({
                    ...prev,
                    args: prev.args.map((arg, i) => (i === index ? value : arg)),
                  }))
                }
                placeholder="e.g., -y, mcp-searxng"
              />

              <KeyValueInput
                label="Environment Variables"
                pairs={formData.env}
                onAdd={() => setFormData((prev) => ({ ...prev, env: [...prev.env, { key: '', value: '' }] }))}
                onRemove={(index) =>
                  setFormData((prev) => ({ ...prev, env: prev.env.filter((_, i) => i !== index) }))
                }
                onChange={(index, field, value) =>
                  setFormData((prev) => ({
                    ...prev,
                    env: prev.env.map((pair, i) => (i === index ? { ...pair, [field]: value } : pair)),
                  }))
                }
                keyPlaceholder="Variable name"
                valuePlaceholder="Variable value"
              />

              {formErrors.submit && (
                <div className="text-sm text-red-600">{formErrors.submit}</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <div>
              {isEditMode && onDelete && (
                <Button variant="danger" onClick={handleDelete} className="px-4 py-2">
                  Delete Server
                </Button>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={onClose} className="px-4 py-2" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={editorMode === 'json' ? handleSaveJSON : handleSaveForm}
                disabled={isSubmitting}
                className="px-4 py-2"
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Server'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerEditorModal;