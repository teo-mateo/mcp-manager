// Created by Claude Code on 2025-09-27
// Main React component for MCP Manager application
// Purpose: Main application with server list and modal-based editing
// Updated 2025-09-30: Simplified to use modal-based add/edit instead of screen navigation

import React from 'react';
import type { ElectronAPI } from '../main/preload';
import Layout from './components/layout/Layout';
import ServerListScreen from './screens/ServerListScreen';
import './styles/globals.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const App: React.FC = () => {
  return (
    <Layout
      currentScreen="servers"
      onNavigate={() => {}} // No navigation needed anymore
      headerTitle="MCP Servers"
    >
      <ServerListScreen />
    </Layout>
  );
};

export default App;
