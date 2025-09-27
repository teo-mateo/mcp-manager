// Created by Claude Code on 2025-09-27
// Main React component for MCP Manager application
// Purpose: Basic Hello World component to test the development environment

import React, { useState, useEffect } from 'react';
import type { ElectronAPI } from '../main/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const App: React.FC = () => {
  const [configPath, setConfigPath] = useState<string>('');
  const [configExists, setConfigExists] = useState<boolean>(false);

  useEffect(() => {
    const loadConfigInfo = async () => {
      try {
        const path = await window.electronAPI.getClaudeConfigPath();
        setConfigPath(path);

        const config = await window.electronAPI.readClaudeConfig();
        setConfigExists(Object.keys(config).length > 0);
      } catch (error) {
        console.error('Error loading config info:', error);
      }
    };

    loadConfigInfo();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>MCP Manager</h1>
      <p>Welcome to the MCP Server Manager!</p>
      <div style={{ marginTop: '20px' }}>
        <h3>Configuration Status:</h3>
        <p>
          <strong>Config Path:</strong> {configPath}
        </p>
        <p>
          <strong>Config Exists:</strong> {configExists ? '✅ Yes' : '❌ No'}
        </p>
      </div>
    </div>
  );
};

export default App;
