// Created by Claude Code on 2025-09-27
// Main process entry point for MCP Manager Electron application
// Purpose: Initialize Electron app, create main window, and set up IPC communication
// Updated 2025-09-28: Added project path detection for project-based config management

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { ProjectConfig, GlobalConfig, FileState, IPC_CHANNELS, ConfigScope, McpServer } from '../shared/types';
import { TestResult } from '../shared/mcpTypes';
import { ConfigFileManager } from './services/ConfigFileManager';
import { ServerTester } from './services/ServerTester';

let mainWindow: BrowserWindow | null = null;

const isDevelopment = process.env.NODE_ENV === 'development';

// Get project path from command line argument or use current working directory
function getProjectPath(): string {
  // Check if a path was provided as command line argument
  const args = process.argv.slice(2);
  if (args.length > 0 && args[0]) {
    return path.resolve(args[0]);
  }
  // Default to current working directory
  return process.cwd();
}

async function createWindow(): Promise<void> {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('MAIN: Creating window with preload:', preloadPath);

  mainWindow = new BrowserWindow({
    width: 1380,
    height: 920,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Required for preload script to work properly
      preload: preloadPath,
    },
  });

  if (isDevelopment) {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
    // Only open dev tools if explicitly requested via environment variable
    if (process.env.DEBUG) {
      mainWindow.webContents.openDevTools();
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize project path before creating config managers
const projectPath = getProjectPath();
console.log('MAIN: Using project path:', projectPath);

// Create separate managers for project and global scopes
const projectConfigManager = new ConfigFileManager(projectPath, 'project');
const globalConfigManager = new ConfigFileManager(projectPath, 'global');  // Project path not used for global

// Create server tester
const serverTester = new ServerTester();

// Set up IPC handlers
function setupIpcHandlers(): void {
  // Project scope handlers
  ipcMain.handle(IPC_CHANNELS.READ_CLAUDE_CONFIG, async (): Promise<FileState> => {
    try {
      console.log('IPC: Reading Claude config (project scope)...');
      const result = await projectConfigManager.readConfig();
      console.log('IPC: Config read successfully, servers found:',
        Object.keys(result.config.mcpServers || {}),
        'disabled:', Object.keys(result.config.mcpServers_disabled || {}));
      return result;
    } catch (error) {
      console.error('Error reading Claude config:', error);
      throw error;
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.WRITE_CLAUDE_CONFIG,
    async (_, config: ProjectConfig, lastModified: Date): Promise<void> => {
      try {
        await projectConfigManager.writeConfig(config, lastModified);
      } catch (error) {
        console.error('Error writing Claude config:', error);
        throw error;
      }
    }
  );

  // Global scope handlers
  ipcMain.handle(IPC_CHANNELS.READ_GLOBAL_CONFIG, async (): Promise<FileState> => {
    try {
      console.log('IPC: Reading Claude config (global scope)...');
      const result = await globalConfigManager.readConfig();
      console.log('IPC: Global config read successfully, servers found:',
        Object.keys(result.config.mcpServers || {}),
        'disabled:', Object.keys(result.config.mcpServers_disabled || {}));
      return result;
    } catch (error) {
      console.error('Error reading global Claude config:', error);
      throw error;
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.WRITE_GLOBAL_CONFIG,
    async (_, config: GlobalConfig, lastModified: Date): Promise<void> => {
      try {
        await globalConfigManager.writeConfig(config, lastModified);
      } catch (error) {
        console.error('Error writing global Claude config:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.GET_CLAUDE_CONFIG_PATH, (): string => {
    return projectConfigManager.getFilePath();
  });

  ipcMain.handle(
    IPC_CHANNELS.CHECK_CONFIG_MODIFIED,
    async (_, lastModified: Date, scope: ConfigScope = 'project'): Promise<boolean> => {
      try {
        const manager = scope === 'global' ? globalConfigManager : projectConfigManager;
        return await manager.checkForModifications(lastModified);
      } catch (error) {
        console.error('Error checking config modifications:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.GET_PROJECT_PATH, (): string => {
    return projectPath;
  });

  // MCP Server testing handler
  ipcMain.handle(
    IPC_CHANNELS.TEST_MCP_SERVER,
    async (_, serverName: string, serverConfig: McpServer): Promise<TestResult> => {
      try {
        console.log('IPC: Testing MCP server:', serverName);
        const result = await serverTester.testServer(serverName, serverConfig);
        console.log('IPC: Server test completed:', result.success ? 'success' : 'failed');
        return result;
      } catch (error) {
        console.error('Error testing MCP server:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error during testing',
          timestamp: new Date(),
          duration: 0,
        };
      }
    }
  );

  // Add MCP Server handler
  ipcMain.handle(
    IPC_CHANNELS.ADD_MCP_SERVER,
    async (_, serverName: string, serverConfig: McpServer, scope: ConfigScope = 'project'): Promise<void> => {
      try {
        console.log('IPC: Adding MCP server:', serverName, 'scope:', scope);

        const manager = scope === 'global' ? globalConfigManager : projectConfigManager;

        // Read current config
        const fileState = await manager.readConfig();

        // Check if server already exists
        const existingServers = {
          ...fileState.config.mcpServers,
          ...fileState.config.mcpServers_disabled
        };

        if (existingServers[serverName]) {
          throw new Error(`A server with the name "${serverName}" already exists`);
        }

        // Add new server to active servers
        const updatedConfig = {
          ...fileState.config,
          mcpServers: {
            ...fileState.config.mcpServers,
            [serverName]: serverConfig
          }
        };

        // Save updated config
        await manager.writeConfig(updatedConfig, fileState.lastModified);
        console.log('IPC: Server added successfully:', serverName);
      } catch (error) {
        console.error('Error adding MCP server:', error);
        throw error;
      }
    }
  );

  // Update MCP Server handler
  ipcMain.handle(
    IPC_CHANNELS.UPDATE_MCP_SERVER,
    async (_, oldServerName: string, newServerName: string, serverConfig: McpServer, scope: ConfigScope = 'project'): Promise<void> => {
      try {
        console.log('IPC: Updating MCP server:', oldServerName, '->', newServerName, 'scope:', scope);

        const manager = scope === 'global' ? globalConfigManager : projectConfigManager;

        // Read current config
        const fileState = await manager.readConfig();

        // Find the server in active or disabled servers
        let isInActive = false;
        let isInDisabled = false;

        if (fileState.config.mcpServers && fileState.config.mcpServers[oldServerName]) {
          isInActive = true;
        } else if (fileState.config.mcpServers_disabled && fileState.config.mcpServers_disabled[oldServerName]) {
          isInDisabled = true;
        } else {
          throw new Error(`Server "${oldServerName}" not found`);
        }

        // If name is changing, check if new name already exists
        if (oldServerName !== newServerName) {
          const existingServers = {
            ...fileState.config.mcpServers,
            ...fileState.config.mcpServers_disabled
          };

          if (existingServers[newServerName]) {
            throw new Error(`A server with the name "${newServerName}" already exists`);
          }
        }

        // Update the config
        const updatedConfig = { ...fileState.config };

        if (isInActive) {
          // Remove old entry and add new one
          const { [oldServerName]: removed, ...remainingServers } = updatedConfig.mcpServers || {};
          updatedConfig.mcpServers = {
            ...remainingServers,
            [newServerName]: serverConfig
          };
        } else if (isInDisabled) {
          // Remove old entry and add new one
          const { [oldServerName]: removed, ...remainingServers } = updatedConfig.mcpServers_disabled || {};
          updatedConfig.mcpServers_disabled = {
            ...remainingServers,
            [newServerName]: serverConfig
          };
        }

        // Save updated config
        await manager.writeConfig(updatedConfig, fileState.lastModified);
        console.log('IPC: Server updated successfully:', oldServerName, '->', newServerName);
      } catch (error) {
        console.error('Error updating MCP server:', error);
        throw error;
      }
    }
  );

  // Delete MCP Server handler
  ipcMain.handle(
    IPC_CHANNELS.DELETE_MCP_SERVER,
    async (_, serverName: string, scope: ConfigScope = 'project'): Promise<void> => {
      try {
        console.log('IPC: Deleting MCP server:', serverName, 'scope:', scope);

        const manager = scope === 'global' ? globalConfigManager : projectConfigManager;

        // Read current config
        const fileState = await manager.readConfig();

        // Find and remove the server from active or disabled servers
        let found = false;
        const updatedConfig = { ...fileState.config };

        if (updatedConfig.mcpServers && updatedConfig.mcpServers[serverName]) {
          const { [serverName]: removed, ...remainingServers } = updatedConfig.mcpServers;
          updatedConfig.mcpServers = remainingServers;
          found = true;
        }

        if (updatedConfig.mcpServers_disabled && updatedConfig.mcpServers_disabled[serverName]) {
          const { [serverName]: removed, ...remainingServers } = updatedConfig.mcpServers_disabled;
          updatedConfig.mcpServers_disabled = remainingServers;
          found = true;
        }

        if (!found) {
          throw new Error(`Server "${serverName}" not found`);
        }

        // Save updated config
        await manager.writeConfig(updatedConfig, fileState.lastModified);
        console.log('IPC: Server deleted successfully:', serverName);
      } catch (error) {
        console.error('Error deleting MCP server:', error);
        throw error;
      }
    }
  );

  // Toggle MCP Server enabled/disabled handler
  ipcMain.handle(
    IPC_CHANNELS.TOGGLE_MCP_SERVER,
    async (_, serverName: string, scope: ConfigScope = 'project'): Promise<void> => {
      try {
        console.log('IPC: Toggling MCP server:', serverName, 'scope:', scope);

        const manager = scope === 'global' ? globalConfigManager : projectConfigManager;

        // Read current config
        const fileState = await manager.readConfig();

        let serverConfig: McpServer;
        let isCurrentlyActive = false;

        // Find the server in active or disabled servers
        if (fileState.config.mcpServers && fileState.config.mcpServers[serverName]) {
          serverConfig = fileState.config.mcpServers[serverName];
          isCurrentlyActive = true;
        } else if (fileState.config.mcpServers_disabled && fileState.config.mcpServers_disabled[serverName]) {
          serverConfig = fileState.config.mcpServers_disabled[serverName];
          isCurrentlyActive = false;
        } else {
          throw new Error(`Server "${serverName}" not found`);
        }

        // Update the config
        const updatedConfig = { ...fileState.config };

        if (isCurrentlyActive) {
          // Move from active to disabled
          const { [serverName]: removed, ...remainingActive } = updatedConfig.mcpServers || {};
          updatedConfig.mcpServers = remainingActive;
          updatedConfig.mcpServers_disabled = {
            ...updatedConfig.mcpServers_disabled,
            [serverName]: serverConfig
          };
        } else {
          // Move from disabled to active
          const { [serverName]: removed, ...remainingDisabled } = updatedConfig.mcpServers_disabled || {};
          updatedConfig.mcpServers_disabled = remainingDisabled;
          updatedConfig.mcpServers = {
            ...updatedConfig.mcpServers,
            [serverName]: serverConfig
          };
        }

        // Save updated config
        await manager.writeConfig(updatedConfig, fileState.lastModified);
        console.log('IPC: Server toggled successfully:', serverName, isCurrentlyActive ? 'disabled' : 'enabled');
      } catch (error) {
        console.error('Error toggling MCP server:', error);
        throw error;
      }
    }
  );
}

app.whenReady().then(async () => {
  setupIpcHandlers();
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
