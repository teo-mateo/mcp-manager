// Created by Claude Code on 2025-09-27
// Preload script for secure IPC communication between main and renderer processes
// Purpose: Expose safe APIs to renderer process with context isolation

import { contextBridge, ipcRenderer } from 'electron';
import { ClaudeConfig, IPC_CHANNELS } from '../shared/types';

export interface ElectronAPI {
  readClaudeConfig: () => Promise<ClaudeConfig>;
  // eslint-disable-next-line no-unused-vars
  writeClaudeConfig: (config: ClaudeConfig) => Promise<boolean>;
  getClaudeConfigPath: () => Promise<string>;
}

contextBridge.exposeInMainWorld('electronAPI', {
  readClaudeConfig: () => ipcRenderer.invoke(IPC_CHANNELS.READ_CLAUDE_CONFIG),
  writeClaudeConfig: (config: ClaudeConfig) =>
    ipcRenderer.invoke(IPC_CHANNELS.WRITE_CLAUDE_CONFIG, config),
  getClaudeConfigPath: () =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_CLAUDE_CONFIG_PATH),
} as ElectronAPI);
