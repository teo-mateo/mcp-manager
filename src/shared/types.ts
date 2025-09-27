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
  [key: string]: unknown; // Preserve other config properties
}

export interface FileStats {
  size: number;
  mtime: Date;
  isFile: boolean;
  isDirectory: boolean;
}

export interface FileState {
  config: ClaudeConfig;
  lastModified: Date;
  filePath: string;
}

export interface IpcChannels {
  READ_CLAUDE_CONFIG: 'read-claude-config';
  WRITE_CLAUDE_CONFIG: 'write-claude-config';
  GET_CLAUDE_CONFIG_PATH: 'get-claude-config-path';
  CHECK_CONFIG_MODIFIED: 'check-config-modified';
  RESOLVE_MODIFICATION_CONFLICT: 'resolve-modification-conflict';
}

export const IPC_CHANNELS: IpcChannels = {
  READ_CLAUDE_CONFIG: 'read-claude-config',
  WRITE_CLAUDE_CONFIG: 'write-claude-config',
  GET_CLAUDE_CONFIG_PATH: 'get-claude-config-path',
  CHECK_CONFIG_MODIFIED: 'check-config-modified',
  RESOLVE_MODIFICATION_CONFLICT: 'resolve-modification-conflict',
};
