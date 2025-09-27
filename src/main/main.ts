// Created by Claude Code on 2025-09-27
// Main process entry point for MCP Manager Electron application
// Purpose: Initialize Electron app, create main window, and set up IPC communication

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { ClaudeConfig, FileState, IPC_CHANNELS } from '../shared/types';
import { ConfigFileManager } from './services/ConfigFileManager';

let mainWindow: BrowserWindow | null = null;

const isDevelopment = process.env.NODE_ENV === 'development';

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDevelopment) {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const configManager = new ConfigFileManager();

// Set up IPC handlers
function setupIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.READ_CLAUDE_CONFIG, async (): Promise<FileState> => {
    try {
      return await configManager.readConfig();
    } catch (error) {
      console.error('Error reading Claude config:', error);
      throw error;
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.WRITE_CLAUDE_CONFIG,
    async (_, config: ClaudeConfig, lastModified: Date): Promise<void> => {
      try {
        await configManager.writeConfig(config, lastModified);
      } catch (error) {
        console.error('Error writing Claude config:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.GET_CLAUDE_CONFIG_PATH, (): string => {
    return configManager.getFilePath();
  });

  ipcMain.handle(
    IPC_CHANNELS.CHECK_CONFIG_MODIFIED,
    async (_, lastModified: Date): Promise<boolean> => {
      try {
        return await configManager.checkForModifications(lastModified);
      } catch (error) {
        console.error('Error checking config modifications:', error);
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
