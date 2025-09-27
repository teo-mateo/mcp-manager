// Created by Claude Code on 2025-09-27
// React hook for configuration state management
// Purpose: Provide state management and operations for Claude configuration with timestamp tracking

import { useState, useEffect, useCallback } from 'react';
import { ClaudeConfig, FileState } from '../../shared/types';
import { ConfigAPI } from '../services/ConfigAPI';

interface UseConfigResult {
  config: ClaudeConfig | null;
  lastModified: Date | null;
  filePath: string | null;
  loading: boolean;
  error: string | null;
  loadConfig: () => Promise<void>;
  saveConfig: (newConfig: ClaudeConfig) => Promise<void>;
  checkForModifications: () => Promise<boolean>;
}

export function useConfig(): UseConfigResult {
  const [fileState, setFileState] = useState<FileState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newFileState = await ConfigAPI.readConfig();
      setFileState(newFileState);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to load config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (newConfig: ClaudeConfig) => {
    if (!fileState) {
      throw new Error('No config loaded. Call loadConfig() first.');
    }

    try {
      setLoading(true);
      setError(null);

      await ConfigAPI.writeConfig(newConfig, fileState.lastModified);

      // Reload the config to get the new timestamp
      await loadConfig();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to save config:', err);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  }, [fileState, loadConfig]);

  const checkForModifications = useCallback(async (): Promise<boolean> => {
    if (!fileState) {
      throw new Error('No config loaded. Call loadConfig() first.');
    }

    try {
      return await ConfigAPI.checkForModifications(fileState.lastModified);
    } catch (err) {
      console.error('Failed to check for modifications:', err);
      throw err;
    }
  }, [fileState]);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config: fileState?.config || null,
    lastModified: fileState?.lastModified || null,
    filePath: fileState?.filePath || null,
    loading,
    error,
    loadConfig,
    saveConfig,
    checkForModifications,
  };
}