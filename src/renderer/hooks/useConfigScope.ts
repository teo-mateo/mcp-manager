// Created by Claude Code on 2025-09-28
// useConfigScope hook for managing configuration scope
// Purpose: Handle switching between project and global MCP server management

import { useState, useCallback, useEffect } from 'react';
import { ConfigScope, FileState, McpServer } from '../../shared/types';
import { ConfigAPI } from '../services/configApi';
import { ServerData } from '../components/server/ServerCard';

interface ConfigScopeState {
  scope: ConfigScope;
  servers: ServerData[];
  fileState: FileState | null;
  error: string | null;
  loading: boolean;
}

export function useConfigScope(initialScope: ConfigScope = 'project') {
  const [state, setState] = useState<ConfigScopeState>({
    scope: initialScope,
    servers: [],
    fileState: null,
    error: null,
    loading: false
  });

  const loadServers = useCallback(async (scope: ConfigScope) => {
    try {
      console.log('useConfigScope: Loading servers for scope:', scope);
      setState(prev => ({ ...prev, loading: true, error: null }));

      let fileState: FileState;
      if (scope === 'global') {
        fileState = await ConfigAPI.readGlobalConfig();
      } else {
        fileState = await ConfigAPI.readConfig();
      }

      console.log('useConfigScope: Got fileState:', fileState);
      const servers = ConfigAPI.getServersList(fileState);
      console.log('useConfigScope: Converted to servers:', servers);

      setState({
        scope,
        servers,
        fileState,
        error: null,
        loading: false
      });
    } catch (error) {
      console.error('useConfigScope: Error loading servers:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      }));
    }
  }, []);

  const setScope = useCallback(async (newScope: ConfigScope) => {
    if (newScope !== state.scope) {
      console.log('useConfigScope: Changing scope to:', newScope);
      await loadServers(newScope);
    }
  }, [state.scope, loadServers]);

  const refreshServers = useCallback(async () => {
    await loadServers(state.scope);
  }, [state.scope, loadServers]);

  const addServer = useCallback(async (serverName: string, serverConfig: McpServer) => {
    try {
      console.log('useConfigScope: Adding server:', serverName, 'scope:', state.scope);
      setState(prev => ({ ...prev, loading: true, error: null }));

      await ConfigAPI.addServer(serverName, serverConfig, state.scope);

      // Refresh servers after successful addition
      await loadServers(state.scope);
    } catch (error) {
      console.error('useConfigScope: Error adding server:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      }));
      throw error; // Re-throw so the caller can handle it
    }
  }, [state.scope, loadServers]);

  // Load initial servers
  useEffect(() => {
    loadServers(initialScope);
  }, []); // Only run once on mount

  return {
    scope: state.scope,
    servers: state.servers,
    fileState: state.fileState,
    error: state.error,
    loading: state.loading,
    setScope,
    refreshServers,
    addServer
  };
}