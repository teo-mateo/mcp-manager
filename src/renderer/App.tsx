// Created by Claude Code on 2025-09-27
// Main React component for MCP Manager application
// Purpose: Main application with navigation and all UI screens

import React, { useState, useEffect } from 'react';
import type { ElectronAPI } from '../main/preload';
import Layout from './components/layout/Layout';
import ServerListScreen from './screens/ServerListScreen';
import AddServerScreen from './screens/AddServerScreen';
import AddServerJSONScreen from './screens/AddServerJSONScreen';
import EditServerScreen from './screens/EditServerScreen';
import { ServerData } from './components/server/ServerCard';
import './styles/globals.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

type Screen = 'servers' | 'add-server' | 'add-server-json' | 'edit-server';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('servers');
  const [selectedServer, setSelectedServer] = useState<ServerData | null>(null);

  // Mock data for testing UI screens (as specified in task requirements)
  const [servers, setServers] = useState<ServerData[]>([
    {
      name: "searxng",
      command: "npx",
      args: ["-y", "mcp-searxng"],
      env: { "SEARXNG_URL": "http://localhost:8888" },
      enabled: true
    },
    {
      name: "vastai",
      command: "node",
      args: ["/path/to/vastai/index.js"],
      env: { "NODE_ENV": "production" },
      enabled: true
    },
    {
      name: "disabled-server",
      command: "disabled-command",
      args: [],
      env: {},
      enabled: false
    }
  ]);

  // Mock event handlers (placeholder functionality as specified in task)
  const handleSave = (serverData: ServerData) => {
    if (currentScreen === 'edit-server' && selectedServer) {
      // Update existing server
      setServers(prev => prev.map(server =>
        server.name === selectedServer.name ? serverData : server
      ));
      alert(`Server "${serverData.name}" updated successfully!`);
    } else {
      // Add new server
      setServers(prev => [...prev, serverData]);
      alert(`Server "${serverData.name}" added successfully!`);
    }
    setCurrentScreen('servers');
    setSelectedServer(null);
  };

  const handleCancel = () => {
    setCurrentScreen('servers');
    setSelectedServer(null);
    alert("Operation cancelled");
  };

  const handleEdit = (serverName: string) => {
    const server = servers.find(s => s.name === serverName);
    if (server) {
      setSelectedServer(server);
      setCurrentScreen('edit-server');
    } else {
      alert(`Edit ${serverName} not implemented yet`);
    }
  };

  const handleToggle = (serverName: string) => {
    setServers(prev => prev.map(server =>
      server.name === serverName
        ? { ...server, enabled: !server.enabled }
        : server
    ));
    alert(`Server "${serverName}" ${servers.find(s => s.name === serverName)?.enabled ? 'disabled' : 'enabled'}`);
  };

  const handleDelete = (serverName: string) => {
    if (confirm(`Are you sure you want to delete server "${serverName}"?`)) {
      setServers(prev => prev.filter(server => server.name !== serverName));
      if (currentScreen === 'edit-server') {
        setCurrentScreen('servers');
        setSelectedServer(null);
      }
      alert(`Server "${serverName}" deleted successfully!`);
    }
  };

  const handleAddServer = () => {
    setCurrentScreen('add-server');
  };

  const handleSwitchToJSON = () => {
    setCurrentScreen('add-server-json');
  };

  const handleSwitchToForm = () => {
    setCurrentScreen('add-server');
  };

  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'servers': return 'MCP Servers';
      case 'add-server': return 'Add Server';
      case 'add-server-json': return 'Add Server (JSON)';
      case 'edit-server': return 'Edit Server';
      default: return 'MCP Manager';
    }
  };

  const getBreadcrumb = () => {
    switch (currentScreen) {
      case 'add-server': return ['Servers', 'Add Server'];
      case 'add-server-json': return ['Servers', 'Add Server', 'JSON Mode'];
      case 'edit-server': return ['Servers', 'Edit Server', selectedServer?.name || ''];
      default: return undefined;
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'servers':
        return (
          <ServerListScreen
            servers={servers}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onAddServer={handleAddServer}
          />
        );
      case 'add-server':
        return (
          <AddServerScreen
            onSave={handleSave}
            onCancel={handleCancel}
            onSwitchToJSON={handleSwitchToJSON}
          />
        );
      case 'add-server-json':
        return (
          <AddServerJSONScreen
            onSave={handleSave}
            onCancel={handleCancel}
            onSwitchToForm={handleSwitchToForm}
          />
        );
      case 'edit-server':
        return selectedServer ? (
          <EditServerScreen
            server={selectedServer}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
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
