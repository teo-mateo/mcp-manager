// Created by Claude Code on 2025-09-27
// Configuration API service for renderer process
// Purpose: Provide wrapper for IPC calls and error handling for config operations

import { ClaudeConfig, FileState } from '../../shared/types';
import { ElectronAPI } from '../../main/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export class ConfigAPI {
  static async readConfig(): Promise<FileState> {
    try {
      return await window.electronAPI.readClaudeConfig();
    } catch (error) {
      console.error('Failed to read config:', error);
      throw new Error(`Failed to read configuration: ${error}`);
    }
  }

  static async writeConfig(config: ClaudeConfig, lastModified: Date): Promise<void> {
    try {
      await window.electronAPI.writeClaudeConfig(config, lastModified);
    } catch (error) {
      console.error('Failed to write config:', error);
      throw new Error(`Failed to save configuration: ${error}`);
    }
  }

  static async getConfigPath(): Promise<string> {
    try {
      return await window.electronAPI.getClaudeConfigPath();
    } catch (error) {
      console.error('Failed to get config path:', error);
      throw new Error(`Failed to get configuration path: ${error}`);
    }
  }

  static async checkForModifications(lastModified: Date): Promise<boolean> {
    try {
      return await window.electronAPI.checkConfigModified(lastModified);
    } catch (error) {
      console.error('Failed to check modifications:', error);
      throw new Error(`Failed to check for modifications: ${error}`);
    }
  }
}