// Created by Claude Code on 2025-09-27
// Preload script for secure IPC communication between main and renderer processes
// Purpose: Expose safe APIs to renderer process with context isolation

import { contextBridge, ipcRenderer } from 'electron';
import { ClaudeConfig, FileState, IPC_CHANNELS } from '../shared/types';

export interface ElectronAPI {
  readClaudeConfig: () => Promise<FileState>;
  // eslint-disable-next-line no-unused-vars
  writeClaudeConfig: (config: ClaudeConfig, lastModified: Date) => Promise<void>;
  getClaudeConfigPath: () => Promise<string>;
  // eslint-disable-next-line no-unused-vars
  checkConfigModified: (lastModified: Date) => Promise<boolean>;
}

contextBridge.exposeInMainWorld('electronAPI', {
  readClaudeConfig: () => ipcRenderer.invoke(IPC_CHANNELS.READ_CLAUDE_CONFIG),
  writeClaudeConfig: (config: ClaudeConfig, lastModified: Date) =>
    ipcRenderer.invoke(IPC_CHANNELS.WRITE_CLAUDE_CONFIG, config, lastModified),
  getClaudeConfigPath: () =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_CLAUDE_CONFIG_PATH),
  checkConfigModified: (lastModified: Date) =>
    ipcRenderer.invoke(IPC_CHANNELS.CHECK_CONFIG_MODIFIED, lastModified),
} as ElectronAPI);
