// Created by Claude Code on 2025-09-27
// Preload script for secure IPC communication between main and renderer processes
// Purpose: Expose safe APIs to renderer process with context isolation

// IMPORTANT: Preload scripts can ONLY require 'electron' module
// Cannot import from other files when context isolation is enabled
// Updated 2025-09-28: Added getProjectPath API for project-based config management
const { contextBridge, ipcRenderer } = require('electron');

console.log('PRELOAD: Preload script starting...');
console.log('PRELOAD: contextBridge available:', !!contextBridge);
console.log('PRELOAD: ipcRenderer available:', !!ipcRenderer);

// Define IPC channels inline (cannot import from external files)
const IPC_CHANNELS = {
  READ_CLAUDE_CONFIG: 'read-claude-config',
  WRITE_CLAUDE_CONFIG: 'write-claude-config',
  GET_CLAUDE_CONFIG_PATH: 'get-claude-config-path',
  CHECK_CONFIG_MODIFIED: 'check-config-modified',
  RESOLVE_MODIFICATION_CONFLICT: 'resolve-modification-conflict',
  GET_PROJECT_PATH: 'get-project-path',
  READ_GLOBAL_CONFIG: 'read-global-config',
  WRITE_GLOBAL_CONFIG: 'write-global-config',
  GET_CURRENT_SCOPE: 'get-current-scope',
  TEST_MCP_SERVER: 'test-mcp-server',
  ADD_MCP_SERVER: 'add-mcp-server',
  UPDATE_MCP_SERVER: 'update-mcp-server',
  DELETE_MCP_SERVER: 'delete-mcp-server',
  TOGGLE_MCP_SERVER: 'toggle-mcp-server',
};

console.log('PRELOAD: IPC_CHANNELS:', IPC_CHANNELS);

// Type definitions must be inline (cannot import)
export interface ElectronAPI {
  readClaudeConfig: () => Promise<any>;
  // eslint-disable-next-line no-unused-vars
  writeClaudeConfig: (config: any, lastModified: Date) => Promise<void>;
  getClaudeConfigPath: () => Promise<string>;
  // eslint-disable-next-line no-unused-vars
  checkConfigModified: (lastModified: Date, scope?: string) => Promise<boolean>;
  getProjectPath: () => Promise<string>;
  readGlobalConfig: () => Promise<any>;
  // eslint-disable-next-line no-unused-vars
  writeGlobalConfig: (config: any, lastModified: Date) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  testServer: (serverName: string, serverConfig: any) => Promise<any>;
  // eslint-disable-next-line no-unused-vars
  addServer: (serverName: string, serverConfig: any, scope?: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  updateServer: (oldServerName: string, newServerName: string, serverConfig: any, scope?: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteServer: (serverName: string, scope?: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  toggleServer: (serverName: string, scope?: string) => Promise<void>;
}

const electronAPI = {
  readClaudeConfig: () => {
    console.log('PRELOAD: readClaudeConfig called');
    return ipcRenderer.invoke(IPC_CHANNELS.READ_CLAUDE_CONFIG);
  },
  writeClaudeConfig: (config: any, lastModified: any) => {
    console.log('PRELOAD: writeClaudeConfig called');
    return ipcRenderer.invoke(IPC_CHANNELS.WRITE_CLAUDE_CONFIG, config, lastModified);
  },
  getClaudeConfigPath: () => {
    console.log('PRELOAD: getClaudeConfigPath called');
    return ipcRenderer.invoke(IPC_CHANNELS.GET_CLAUDE_CONFIG_PATH);
  },
  checkConfigModified: (lastModified: any, scope: any) => {
    console.log('PRELOAD: checkConfigModified called');
    return ipcRenderer.invoke(IPC_CHANNELS.CHECK_CONFIG_MODIFIED, lastModified, scope);
  },
  getProjectPath: () => {
    console.log('PRELOAD: getProjectPath called');
    return ipcRenderer.invoke(IPC_CHANNELS.GET_PROJECT_PATH);
  },
  readGlobalConfig: () => {
    console.log('PRELOAD: readGlobalConfig called');
    return ipcRenderer.invoke(IPC_CHANNELS.READ_GLOBAL_CONFIG);
  },
  writeGlobalConfig: (config: any, lastModified: any) => {
    console.log('PRELOAD: writeGlobalConfig called');
    return ipcRenderer.invoke(IPC_CHANNELS.WRITE_GLOBAL_CONFIG, config, lastModified);
  },
  testServer: (serverName: string, serverConfig: any) => {
    console.log('PRELOAD: testServer called for:', serverName);
    return ipcRenderer.invoke(IPC_CHANNELS.TEST_MCP_SERVER, serverName, serverConfig);
  },
  addServer: (serverName: string, serverConfig: any, scope: any) => {
    console.log('PRELOAD: addServer called for:', serverName, 'scope:', scope);
    return ipcRenderer.invoke(IPC_CHANNELS.ADD_MCP_SERVER, serverName, serverConfig, scope);
  },
  updateServer: (oldServerName: string, newServerName: string, serverConfig: any, scope: any) => {
    console.log('PRELOAD: updateServer called for:', oldServerName, '->', newServerName, 'scope:', scope);
    return ipcRenderer.invoke(IPC_CHANNELS.UPDATE_MCP_SERVER, oldServerName, newServerName, serverConfig, scope);
  },
  deleteServer: (serverName: string, scope: any) => {
    console.log('PRELOAD: deleteServer called for:', serverName, 'scope:', scope);
    return ipcRenderer.invoke(IPC_CHANNELS.DELETE_MCP_SERVER, serverName, scope);
  },
  toggleServer: (serverName: string, scope: any) => {
    console.log('PRELOAD: toggleServer called for:', serverName, 'scope:', scope);
    return ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_MCP_SERVER, serverName, scope);
  },
};

console.log('PRELOAD: About to expose electronAPI to main world');

try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  console.log('PRELOAD: Successfully exposed electronAPI to main world');
} catch (error) {
  console.error('PRELOAD: Error exposing electronAPI:', error);
}

console.log('PRELOAD: Preload script finished');
