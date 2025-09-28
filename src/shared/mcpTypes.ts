// Created by Claude Code on 2025-09-28
// MCP Protocol types for server testing and capabilities discovery
// Purpose: Define JSON-RPC and MCP-specific types for testing MCP servers

// JSON-RPC base types
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: unknown;
  id: number | string;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: JsonRpcError;
  id: number | string;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

// MCP-specific types
export interface McpServerInfo {
  name: string;
  version: string;
}

export interface McpCapabilities {
  tools?: Record<string, unknown>;
  resources?: Record<string, unknown>;
  prompts?: Record<string, unknown>;
}

export interface McpInitializeParams {
  protocolVersion: string;
  capabilities?: {
    roots?: {
      listChanged?: boolean;
    };
  };
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface McpInitializeResult {
  protocolVersion: string;
  serverInfo: McpServerInfo;
  capabilities: McpCapabilities;
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export interface McpResource {
  uri: string;
  name?: string;
  description?: string;
  mimeType?: string;
}

export interface McpPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

export interface McpToolsListResult {
  tools: McpTool[];
}

export interface McpResourcesListResult {
  resources: McpResource[];
}

export interface McpPromptsListResult {
  prompts: McpPrompt[];
}

// Test result types
export interface TestCapabilities {
  tools: McpTool[];
  resources: McpResource[];
  prompts: McpPrompt[];
}

export interface TestResult {
  success: boolean;
  serverInfo?: McpServerInfo;
  protocolVersion?: string;
  capabilities?: TestCapabilities;
  error?: string;
  timestamp: Date;
  duration: number; // milliseconds
}

export type TestStatus = 'untested' | 'testing' | 'passed' | 'failed';