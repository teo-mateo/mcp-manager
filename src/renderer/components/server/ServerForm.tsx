// Created by Claude Code on 2025-09-27
// ServerForm component for MCP Manager UI
// Purpose: Form for adding/editing server configurations

import React, { useState, useEffect } from 'react';
import TextInput from '../common/TextInput';
import ArrayInput from '../common/ArrayInput';
import KeyValueInput, { KeyValuePair } from '../common/KeyValueInput';
import Button from '../common/Button';
import { ServerData } from './ServerCard';

interface ServerFormProps {
  initialData?: ServerData;
  onSave: (serverData: ServerData) => void;
  onCancel: () => void;
  onDelete?: (serverName: string) => void;
  isEdit?: boolean;
  className?: string;
}

interface FormData {
  name: string;
  command: string;
  args: string[];
  env: KeyValuePair[];
}

const ServerForm: React.FC<ServerFormProps> = ({
  initialData,
  onSave,
  onCancel,
  onDelete,
  isEdit = false,
  className = '',
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    command: '',
    args: [],
    env: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        command: initialData.command,
        args: initialData.args || [],
        env: initialData.env
          ? Object.entries(initialData.env).map(([key, value]) => ({ key, value }))
          : [],
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Server name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Server name must be 50 characters or less';
    }

    if (!formData.command.trim()) {
      newErrors.command = 'Command is required';
    } else if (formData.command.length > 255) {
      newErrors.command = 'Command must be 255 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const serverData: ServerData = {
        name: formData.name.trim(),
        command: formData.command.trim(),
        args: formData.args.filter(arg => arg.trim() !== ''),
        env: formData.env.reduce((acc, pair) => {
          if (pair.key.trim() && pair.value.trim()) {
            acc[pair.key.trim()] = pair.value.trim();
          }
          return acc;
        }, {} as Record<string, string>),
        enabled: initialData?.enabled ?? true,
      };
      onSave(serverData);
    }
  };

  const handleDelete = () => {
    if (initialData && onDelete) {
      if (confirm(`Are you sure you want to delete the server "${initialData.name}"?`)) {
        onDelete(initialData.name);
      }
    }
  };

  const addArg = () => {
    setFormData(prev => ({ ...prev, args: [...prev.args, ''] }));
  };

  const removeArg = (index: number) => {
    setFormData(prev => ({ ...prev, args: prev.args.filter((_, i) => i !== index) }));
  };

  const updateArg = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      args: prev.args.map((arg, i) => i === index ? value : arg)
    }));
  };

  const addEnvVar = () => {
    setFormData(prev => ({ ...prev, env: [...prev.env, { key: '', value: '' }] }));
  };

  const removeEnvVar = (index: number) => {
    setFormData(prev => ({ ...prev, env: prev.env.filter((_, i) => i !== index) }));
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      env: prev.env.map((pair, i) =>
        i === index ? { ...pair, [field]: value } : pair
      )
    }));
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? 'Edit Server' : 'Add New Server'}
        </h2>
      </div>

      <div className="space-y-6">
        <TextInput
          label="Server Name"
          value={formData.name}
          onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
          placeholder="e.g., searxng, vastai"
          required
          maxLength={50}
          error={errors.name}
          disabled={isEdit}
        />

        <TextInput
          label="Command"
          value={formData.command}
          onChange={(value) => setFormData(prev => ({ ...prev, command: value }))}
          placeholder="e.g., npx, node, python"
          required
          maxLength={255}
          error={errors.command}
        />

        <ArrayInput
          label="Arguments"
          items={formData.args}
          onAdd={addArg}
          onRemove={removeArg}
          onChange={updateArg}
          placeholder="e.g., -y, mcp-searxng"
        />

        <KeyValueInput
          label="Environment Variables"
          pairs={formData.env}
          onAdd={addEnvVar}
          onRemove={removeEnvVar}
          onChange={updateEnvVar}
          keyPlaceholder="Variable name"
          valuePlaceholder="Variable value"
        />

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <div>
            {isEdit && onDelete && (
              <Button
                variant="danger"
                onClick={handleDelete}
                className="px-4 py-2"
              >
                Delete Server
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
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
              {isEdit ? 'Save Changes' : 'Add Server'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerForm;