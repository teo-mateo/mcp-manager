// Created by Claude Code on 2025-09-27
// Shared TypeScript types for MCP Manager application
// Purpose: Define interfaces for MCP server configuration and application state
// Updated 2025-09-28: Added project-based configuration structure

export interface McpServer {
  type?: string;  // Added for consistency with Claude Code format
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface McpServers {
  [serverName: string]: McpServer;
}

// Individual project configuration within Claude config
export interface ProjectConfig {
  mcpServers?: McpServers;
  mcpServers_disabled?: McpServers;
  allowedTools?: string[];
  history?: unknown[];
  mcpContextUris?: string[];
  enabledMcpjsonServers?: string[];
  disabledMcpjsonServers?: string[];
  hasTrustDialogAccepted?: boolean;
  projectOnboardingSeenCount?: number;
  hasClaudeMdExternalIncludesApproved?: boolean;
  hasClaudeMdExternalIncludesWarningShown?: boolean;
  hasCompletedProjectOnboarding?: boolean;
  lastTotalWebSearchRequests?: number;
  exampleFiles?: string[];
  exampleFilesGeneratedAt?: number;
  [key: string]: unknown; // Preserve other project-specific properties
}

// Root-level Claude configuration
export interface ClaudeConfig {
  projects?: {
    [projectPath: string]: ProjectConfig;
  };
  mcpServers?: McpServers;  // Global MCP servers
  mcpServers_disabled?: McpServers;  // Global disabled MCP servers
  numStartups?: number;
  installMethod?: string;
  autoUpdates?: boolean;
  userID?: string;
  [key: string]: unknown; // Preserve other root-level properties
}

export interface FileStats {
  size: number;
  mtime: Date;
  isFile: boolean;
  isDirectory: boolean;
}

// Global-level configuration (subset of root config for MCP servers)
export interface GlobalConfig {
  mcpServers?: McpServers;
  mcpServers_disabled?: McpServers;
}

// Scope for MCP server management
export type ConfigScope = 'project' | 'global';

export interface FileState {
  config: ProjectConfig | GlobalConfig;  // Can be either project or global config
  lastModified: Date;
  filePath: string;
  projectPath?: string;  // Optional - only for project scope
  scope: ConfigScope;  // Added to track current scope
}

export interface IpcChannels {
  READ_CLAUDE_CONFIG: 'read-claude-config';
  WRITE_CLAUDE_CONFIG: 'write-claude-config';
  GET_CLAUDE_CONFIG_PATH: 'get-claude-config-path';
  CHECK_CONFIG_MODIFIED: 'check-config-modified';
  RESOLVE_MODIFICATION_CONFLICT: 'resolve-modification-conflict';
  GET_PROJECT_PATH: 'get-project-path';  // Added to get current project path
  READ_GLOBAL_CONFIG: 'read-global-config';  // Read global MCP servers
  WRITE_GLOBAL_CONFIG: 'write-global-config';  // Write global MCP servers
  GET_CURRENT_SCOPE: 'get-current-scope';  // Get current scope (project/global)
  TEST_MCP_SERVER: 'test-mcp-server';  // Test MCP server capabilities
  ADD_MCP_SERVER: 'add-mcp-server';  // Add new MCP server
  UPDATE_MCP_SERVER: 'update-mcp-server';  // Update existing MCP server
  DELETE_MCP_SERVER: 'delete-mcp-server';  // Delete MCP server
  TOGGLE_MCP_SERVER: 'toggle-mcp-server';  // Toggle MCP server enabled/disabled
}

export const IPC_CHANNELS: IpcChannels = {
  READ_CLAUDE_CONFIG: 'read-claude-config',
  WRITE_CLAUDE_CONFIG: 'write-claude-config',
  GET_CLAUDE_CONFIG_PATH: 'get-claude-config-path',
  CHECK_CONFIG_MODIFIED: 'check-config-modified',
  RESOLVE_MODIFICATION_CONFLICT: 'resolve-modification-conflict',
  GET_PROJECT_PATH: 'get-project-path',
  READ_GLOBAL_CONFIG: 'read-global-config',
  WRITE_GLOBAL_CONFIG: 'write-global-config',
  GET_CURRENT_SCOPE: 'get-current-scope',
  TEST_MCP_SERVER: 'test-mcp-server',
  ADD_MCP_SERVER: 'add-mcp-server',
  UPDATE_MCP_SERVER: 'update-mcp-server',
  DELETE_MCP_SERVER: 'delete-mcp-server',
  TOGGLE_MCP_SERVER: 'toggle-mcp-server',
};
