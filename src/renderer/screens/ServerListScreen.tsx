// Created by Claude Code on 2025-09-27
// ServerListScreen component for MCP Manager UI
// Purpose: Main screen displaying list of MCP servers

import React from 'react';
import ServerList from '../components/server/ServerList';
import { ServerData } from '../components/server/ServerCard';

interface ServerListScreenProps {
  servers: ServerData[];
  onEdit: (serverName: string) => void;
  onToggle: (serverName: string) => void;
  onDelete: (serverName: string) => void;
  onAddServer: () => void;
  className?: string;
}

const ServerListScreen: React.FC<ServerListScreenProps> = ({
  servers,
  onEdit,
  onToggle,
  onDelete,
  onAddServer,
  className = '',
}) => {
  return (
    <div className={className}>
      <ServerList
        servers={servers}
        onEdit={onEdit}
        onToggle={onToggle}
        onDelete={onDelete}
        onAddServer={onAddServer}
      />
    </div>
  );
};

export default ServerListScreen;