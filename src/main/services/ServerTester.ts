// Created by Claude Code on 2025-09-28
// Server Tester service for testing MCP servers and discovering capabilities
// Purpose: Spawn MCP server processes and test their capabilities using MCP protocol

import { spawn, ChildProcess } from 'child_process';
import { McpServer } from '../../shared/types';
import { TestResult, TestCapabilities } from '../../shared/mcpTypes';
import { McpClient } from './McpClient';

export class ServerTester {
  async testServer(serverName: string, serverConfig: McpServer): Promise<TestResult> {
    const startTime = Date.now();
    let childProcess: ChildProcess | null = null;
    let client: McpClient | null = null;

    try {
      // Spawn the server process
      childProcess = spawn(serverConfig.command, serverConfig.args || [], {
        env: { ...process.env, ...serverConfig.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      if (!childProcess.pid) {
        throw new Error('Failed to start server process');
      }

      // Handle process errors
      childProcess.on('error', (error) => {
        throw new Error(`Process error: ${error.message}`);
      });

      // Create MCP client
      client = new McpClient(childProcess);

      // Initialize connection
      const initResult = await client.initialize();

      // Test capabilities
      const capabilities: TestCapabilities = {
        tools: [],
        resources: [],
        prompts: [],
      };

      // Try to list tools
      try {
        const toolsResult = await client.listTools();
        capabilities.tools = toolsResult.tools || [];
      } catch (error) {
        // Tools listing failed, but that's okay - not all servers support tools
        console.warn('Tools listing failed:', error);
      }

      // Try to list resources
      try {
        const resourcesResult = await client.listResources();
        capabilities.resources = resourcesResult.resources || [];
      } catch (error) {
        // Resources listing failed, but that's okay
        console.warn('Resources listing failed:', error);
      }

      // Try to list prompts
      try {
        const promptsResult = await client.listPrompts();
        capabilities.prompts = promptsResult.prompts || [];
      } catch (error) {
        // Prompts listing failed, but that's okay
        console.warn('Prompts listing failed:', error);
      }

      // Try ping if available
      try {
        await client.ping();
      } catch (error) {
        // Ping failed, but that's okay - not all servers support ping
        console.warn('Ping failed:', error);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        serverInfo: initResult.serverInfo,
        protocolVersion: initResult.protocolVersion,
        capabilities,
        timestamp: new Date(),
        duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        duration,
      };

    } finally {
      // Cleanup
      if (client) {
        client.cleanup();
      }

      if (childProcess && !childProcess.killed) {
        // Try graceful shutdown first
        childProcess.kill('SIGTERM');

        // Force kill after 2 seconds if still running
        setTimeout(() => {
          if (childProcess && !childProcess.killed) {
            childProcess.kill('SIGKILL');
          }
        }, 2000);
      }
    }
  }
}