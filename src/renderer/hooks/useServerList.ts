// Created by Claude Code on 2025-09-27
// useServerList hook for managing server data from config file
// Purpose: Load and manage server list state without auto-refresh

import { useState, useCallback } from 'react';
import { ConfigAPI } from '../services/configApi';
import { ServerData } from '../components/server/ServerCard';
import { FileState } from '../../shared/types';

interface ServerListState {
  servers: ServerData[];
  fileState: FileState | null;
  error: string | null;
}

export function useServerList() {
  const [state, setState] = useState<ServerListState>({
    servers: [],
    fileState: null,
    error: null
  });

  const loadServers = useCallback(async () => {
    try {
      console.log('useServerList: loadServers called');
      setState(prev => ({ ...prev, error: null }));
      console.log('useServerList: About to call ConfigAPI.readConfig()');
      const fileState = await ConfigAPI.readConfig();
      console.log('useServerList: Got fileState:', fileState);
      const servers = ConfigAPI.getServersList(fileState);
      console.log('useServerList: Converted to servers:', servers);

      setState({
        servers,
        fileState,
        error: null
      });
    } catch (error) {
      console.error('useServerList: Error in loadServers:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, []);

  const refreshServers = useCallback(async () => {
    await loadServers();
  }, [loadServers]);

  return {
    servers: state.servers,
    fileState: state.fileState,
    error: state.error,
    loadServers,
    refreshServers
  };
}