// Created by Claude Code on 2025-09-28
// MCP Client service for JSON-RPC communication with MCP servers
// Purpose: Handle JSON-RPC protocol communication over stdio with MCP servers

import { ChildProcess } from 'child_process';
import {
  JsonRpcRequest,
  JsonRpcResponse,
  McpInitializeParams,
  McpInitializeResult,
  McpToolsListResult,
  McpResourcesListResult,
  McpPromptsListResult,
} from '../../shared/mcpTypes';

export class McpClient {
  private process: ChildProcess;
  private requestId = 1;
  private pendingRequests = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();
  private responseBuffer = '';

  constructor(process: ChildProcess) {
    this.process = process;
    this.setupResponseHandler();
  }

  private setupResponseHandler(): void {
    if (!this.process.stdout) {
      throw new Error('Process stdout is not available');
    }

    this.process.stdout.setEncoding('utf8');
    this.process.stdout.on('data', (data: string) => {
      this.responseBuffer += data;
      this.processResponses();
    });
  }

  private processResponses(): void {
    const lines = this.responseBuffer.split('\n');
    this.responseBuffer = lines.pop() || ''; // Keep incomplete line

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Only try to parse lines that look like JSON (start with { or [)
        if (trimmedLine.startsWith('{') || trimmedLine.startsWith('[')) {
          try {
            const response: JsonRpcResponse = JSON.parse(trimmedLine);
            // Validate it's a proper JSON-RPC response
            if (response.jsonrpc === '2.0' && response.id !== undefined) {
              this.handleResponse(response);
            }
          } catch (error) {
            console.error('Failed to parse JSON-RPC response:', trimmedLine, error);
          }
        } else {
          // This is likely a log message from the server, just log it for debugging
          console.log('MCP Server log:', trimmedLine);
        }
      }
    }
  }

  private handleResponse(response: JsonRpcResponse): void {
    const id = typeof response.id === 'string' ? parseInt(response.id) : response.id;
    const request = this.pendingRequests.get(id as number);

    if (!request) {
      console.warn('Received response for unknown request ID:', id);
      return;
    }

    clearTimeout(request.timeout);
    this.pendingRequests.delete(id as number);

    if (response.error) {
      request.reject(new Error(`JSON-RPC Error ${response.error.code}: ${response.error.message}`));
    } else {
      request.resolve(response.result);
    }
  }

  private sendRequest<T>(method: string, params?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this.requestId++;
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method,
        params,
        id,
      };

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout for method: ${method}`));
      }, 10000); // 10 second timeout

      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout,
      });

      if (!this.process.stdin) {
        reject(new Error('Process stdin is not available'));
        return;
      }

      const message = JSON.stringify(request) + '\n';
      this.process.stdin.write(message);
    });
  }

  async initialize(): Promise<McpInitializeResult> {
    const params: McpInitializeParams = {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'mcp-manager',
        version: '1.0.0',
      },
    };

    return this.sendRequest<McpInitializeResult>('initialize', params);
  }

  async listTools(): Promise<McpToolsListResult> {
    return this.sendRequest<McpToolsListResult>('tools/list');
  }

  async listResources(): Promise<McpResourcesListResult> {
    return this.sendRequest<McpResourcesListResult>('resources/list');
  }

  async listPrompts(): Promise<McpPromptsListResult> {
    return this.sendRequest<McpPromptsListResult>('prompts/list');
  }

  async ping(): Promise<unknown> {
    return this.sendRequest('ping');
  }

  cleanup(): void {
    // Clear all pending requests
    for (const [id, request] of this.pendingRequests) {
      clearTimeout(request.timeout);
      request.reject(new Error('Client cleanup - request cancelled'));
    }
    this.pendingRequests.clear();
  }
}