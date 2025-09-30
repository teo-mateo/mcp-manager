// Created by Claude Code on 2025-09-27
// Main React component for MCP Manager application
// Purpose: Main application with navigation and all UI screens

import React, { useState } from 'react';
import type { ElectronAPI } from '../main/preload';
import Layout from './components/layout/Layout';
import ServerListScreen from './screens/ServerListScreen';
import AddServerJSONScreen from './screens/AddServerJSONScreen';
import EditServerScreen from './screens/EditServerScreen';
import { ServerData } from './components/server/ServerCard';
import './styles/globals.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

type Screen = 'servers' | 'add-server' | 'edit-server';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('servers');
  const [selectedServer, setSelectedServer] = useState<ServerData | null>(null);


  const handleSave = () => {
    setCurrentScreen('servers');
    setSelectedServer(null);
  };

  const handleCancel = () => {
    setCurrentScreen('servers');
    setSelectedServer(null);
  };

  const handleEdit = (serverName: string, serverData: ServerData) => {
    setSelectedServer(serverData);
    setCurrentScreen('edit-server');
  };

  const handleToggle = async (serverName: string) => {
    // Note: This is a placeholder implementation - ideally we'd pass scope context
    // For now, we'll let the ServerListScreen handle toggle operations
    alert(`Toggle functionality should be handled by the server list screen. This will be implemented when we add proper state management.`);
  };

  const handleDelete = async (serverName: string) => {
    // Note: This is a placeholder implementation - ideally we'd pass scope context
    // For now, we'll let the ServerListScreen handle delete operations
    alert(`Delete functionality should be handled by the server list screen. This will be implemented when we add proper state management.`);
  };

  const handleAddServer = () => {
    setCurrentScreen('add-server');
  };


  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'servers': return 'MCP Servers';
      case 'add-server': return 'Add Server';
      case 'edit-server': return 'Edit Server';
      default: return 'MCP Manager';
    }
  };

  const getBreadcrumb = () => {
    switch (currentScreen) {
      case 'add-server': return ['Servers', 'Add Server'];
      case 'edit-server': return ['Servers', 'Edit Server', selectedServer?.name || ''];
      default: return undefined;
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'servers':
        return (
          <ServerListScreen
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onAddServer={handleAddServer}
          />
        );
      case 'add-server':
        return (
          <AddServerJSONScreen
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      case 'edit-server':
        return selectedServer ? (
          <EditServerScreen
            server={selectedServer}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No server selected for editing</p>
          </div>
        );
      default:
        return <div>Unknown screen</div>;
    }
  };

  return (
    <Layout
      currentScreen={currentScreen}
      onNavigate={(screen) => setCurrentScreen(screen as Screen)}
      headerTitle={getHeaderTitle()}
      breadcrumb={getBreadcrumb()}
    >
      {renderCurrentScreen()}
    </Layout>
  );
};

export default App;
