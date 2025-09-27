// Created by Claude Code on 2025-09-27
// Main process entry point for MCP Manager Electron application
// Purpose: Initialize Electron app, create main window, and set up IPC communication

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';
import { ClaudeConfig, IPC_CHANNELS } from '../shared/types';

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

function getClaudeConfigPath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.claude.json');
}

async function readClaudeConfig(): Promise<ClaudeConfig> {
  try {
    const configPath = getClaudeConfigPath();
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading Claude config:', error);
    return {};
  }
}

async function writeClaudeConfig(config: ClaudeConfig): Promise<boolean> {
  try {
    const configPath = getClaudeConfigPath();

    // Create backup
    try {
      const backupPath = configPath + '.backup';
      await fs.copyFile(configPath, backupPath);
    } catch (backupError) {
      console.warn('Could not create backup:', backupError);
    }

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing Claude config:', error);
    return false;
  }
}

// Set up IPC handlers
function setupIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.READ_CLAUDE_CONFIG, async () => {
    return await readClaudeConfig();
  });

  ipcMain.handle(
    IPC_CHANNELS.WRITE_CLAUDE_CONFIG,
    async (_, config: ClaudeConfig) => {
      return await writeClaudeConfig(config);
    }
  );

  ipcMain.handle(IPC_CHANNELS.GET_CLAUDE_CONFIG_PATH, () => {
    return getClaudeConfigPath();
  });
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
