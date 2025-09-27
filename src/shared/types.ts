// Created by Claude Code on 2025-09-27
// Shared TypeScript types for MCP Manager application
// Purpose: Define interfaces for MCP server configuration and application state

export interface McpServer {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface McpServers {
  [serverName: string]: McpServer;
}

export interface ClaudeConfig {
  mcpServers?: McpServers;
  mcpServers_disabled?: McpServers;
}

export interface IpcChannels {
  READ_CLAUDE_CONFIG: 'read-claude-config';
  WRITE_CLAUDE_CONFIG: 'write-claude-config';
  GET_CLAUDE_CONFIG_PATH: 'get-claude-config-path';
}

export const IPC_CHANNELS: IpcChannels = {
  READ_CLAUDE_CONFIG: 'read-claude-config',
  WRITE_CLAUDE_CONFIG: 'write-claude-config',
  GET_CLAUDE_CONFIG_PATH: 'get-claude-config-path',
};
