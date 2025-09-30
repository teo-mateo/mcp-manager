// Created by Claude Code on 2025-09-27
// ConfigAPI service for renderer process
// Purpose: Wrapper around electronAPI for clean configuration file access
// Updated 2025-09-28: Updated to work with project-based configurations
// Updated 2025-09-28: Added support for global MCP servers

import { ProjectConfig, GlobalConfig, FileState, McpServer, ConfigScope } from '../../shared/types';
import { ServerData } from '../components/server/ServerCard';

export class ConfigAPI {
  static async readConfig(): Promise<FileState> {
    console.log('ConfigAPI: readConfig called');
    console.log('ConfigAPI: window object:', typeof window);
    console.log('ConfigAPI: window.electronAPI exists:', !!window.electronAPI);
    console.log('ConfigAPI: window.electronAPI:', window.electronAPI);

    // Wait for electronAPI to be available
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.electronAPI && attempts < maxAttempts) {
      console.log(`ConfigAPI: Waiting for electronAPI... attempt ${attempts + 1}`);
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.electronAPI) {
      console.error('ConfigAPI: window.electronAPI is undefined after waiting!');
      console.log('ConfigAPI: Available window properties:', Object.keys(window));
      throw new Error('electronAPI not available');
    }

    console.log('ConfigAPI: electronAPI found, proceeding with readClaudeConfig');
    const result = await window.electronAPI.readClaudeConfig();
    console.log('ConfigAPI: Got result from electronAPI:', result);
    return result;
  }

  static async writeConfig(config: ProjectConfig, lastModified: Date): Promise<void> {
    return window.electronAPI.writeClaudeConfig(config, lastModified);
  }

  static async readGlobalConfig(): Promise<FileState> {
    console.log('ConfigAPI: readGlobalConfig called');

    // Wait for electronAPI to be available
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.electronAPI && attempts < maxAttempts) {
      console.log(`ConfigAPI: Waiting for electronAPI... attempt ${attempts + 1}`);
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.electronAPI) {
      console.error('ConfigAPI: window.electronAPI is undefined after waiting!');
      throw new Error('electronAPI not available');
    }

    console.log('ConfigAPI: electronAPI found, proceeding with readGlobalConfig');
    const result = await window.electronAPI.readGlobalConfig();
    console.log('ConfigAPI: Got global result from electronAPI:', result);
    return result;
  }

  static async writeGlobalConfig(config: GlobalConfig, lastModified: Date): Promise<void> {
    return window.electronAPI.writeGlobalConfig(config, lastModified);
  }

  static async getConfigPath(): Promise<string> {
    return window.electronAPI.getClaudeConfigPath();
  }

  static async checkForModifications(lastModified: Date, scope: ConfigScope = 'project'): Promise<boolean> {
    return window.electronAPI.checkConfigModified(lastModified, scope);
  }

  static async getProjectPath(): Promise<string> {
    // Wait for electronAPI to be available
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.electronAPI && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.electronAPI) {
      throw new Error('electronAPI not available');
    }

    return window.electronAPI.getProjectPath();
  }

  static convertToServerData(serverName: string, server: McpServer, enabled: boolean): ServerData {
    return {
      name: serverName,
      command: server.command,
      args: server.args,
      env: server.env,
      enabled
    };
  }

  static convertFromServerData(serverData: ServerData): McpServer {
    return {
      command: serverData.command,
      args: serverData.args,
      env: serverData.env
    };
  }

  static getServersList(fileState: FileState): ServerData[] {
    const servers: ServerData[] = [];

    // Add active servers
    if (fileState.config.mcpServers) {
      for (const [name, server] of Object.entries(fileState.config.mcpServers)) {
        servers.push(this.convertToServerData(name, server, true));
      }
    }

    // Add disabled servers
    if (fileState.config.mcpServers_disabled) {
      for (const [name, server] of Object.entries(fileState.config.mcpServers_disabled)) {
        servers.push(this.convertToServerData(name, server, false));
      }
    }

    return servers;
  }

  static async addServer(serverName: string, serverConfig: McpServer, scope: ConfigScope = 'project'): Promise<void> {
    // Wait for electronAPI to be available
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.electronAPI && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.electronAPI) {
      throw new Error('electronAPI not available');
    }

    return window.electronAPI.addServer(serverName, serverConfig, scope);
  }

  static async updateServer(oldServerName: string, newServerName: string, serverConfig: McpServer, scope: ConfigScope = 'project'): Promise<void> {
    // Wait for electronAPI to be available
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.electronAPI && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.electronAPI) {
      throw new Error('electronAPI not available');
    }

    return window.electronAPI.updateServer(oldServerName, newServerName, serverConfig, scope);
  }

  static async deleteServer(serverName: string, scope: ConfigScope = 'project'): Promise<void> {
    // Wait for electronAPI to be available
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.electronAPI && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.electronAPI) {
      throw new Error('electronAPI not available');
    }

    return window.electronAPI.deleteServer(serverName, scope);
  }

  static async toggleServer(serverName: string, scope: ConfigScope = 'project'): Promise<void> {
    // Wait for electronAPI to be available
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.electronAPI && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.electronAPI) {
      throw new Error('electronAPI not available');
    }

    return window.electronAPI.toggleServer(serverName, scope);
  }
}