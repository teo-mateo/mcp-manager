// Created by Claude Code on 2025-09-27
// Configuration file manager with timestamp checking and atomic operations
// Purpose: Provide safe reading/writing of ~/.claude.json with conflict detection

import { ClaudeConfig, FileState } from '../../shared/types';
import { ConfigError, ConfigFileError } from '../../shared/errors';
import { PathManager } from './PathManager';
import { FileOperations } from './FileOperations';

export class ConfigFileManager {
  private filePath: string;

  constructor() {
    this.filePath = PathManager.getClaudeConfigPath();
  }

  async readConfig(): Promise<FileState> {
    try {
      if (!(await FileOperations.fileExists(this.filePath))) {
        // Create empty config if file doesn't exist
        const defaultConfig: ClaudeConfig = {
          mcpServers: {},
          mcpServers_disabled: {}
        };
        return {
          config: defaultConfig,
          lastModified: new Date(0), // Unix epoch to indicate new file
          filePath: this.filePath
        };
      }

      const { content, stats } = await FileOperations.readFileWithStats(this.filePath);
      const config = await this.parseAndValidateConfig(content);

      return {
        config,
        lastModified: stats.mtime,
        filePath: this.filePath
      };
    } catch (error) {
      if (error instanceof ConfigFileError) {
        throw error;
      }
      throw new ConfigFileError(
        ConfigError.FILE_NOT_FOUND,
        `Failed to read config file: ${this.filePath}`,
        error as Error
      );
    }
  }

  async writeConfig(config: ClaudeConfig, lastKnownModified: Date): Promise<void> {
    try {
      // Check for external modifications before writing
      if (await FileOperations.fileExists(this.filePath)) {
        await this.checkForModifications(lastKnownModified);
      }

      // Validate config before writing
      const validatedConfig = await this.validateConfig(config);

      // Create backup if file exists
      if (await FileOperations.fileExists(this.filePath)) {
        const backupPath = PathManager.getBackupPath(this.filePath);
        await FileOperations.createBackup(this.filePath, backupPath);
      }

      // Write atomically
      const content = JSON.stringify(validatedConfig, null, 2);
      await FileOperations.atomicWrite(this.filePath, content);

    } catch (error) {
      if (error instanceof ConfigFileError) {
        throw error;
      }
      throw new ConfigFileError(
        ConfigError.WRITE_FAILED,
        `Failed to write config file: ${this.filePath}`,
        error as Error
      );
    }
  }

  async checkForModifications(lastKnownModified: Date): Promise<boolean> {
    try {
      if (!(await FileOperations.fileExists(this.filePath))) {
        return false; // File was deleted, not modified
      }

      const stats = await FileOperations.getFileStats(this.filePath);
      const currentModified = stats.mtime;

      // Compare timestamps (allow 1 second tolerance for filesystem precision)
      const timeDiff = Math.abs(currentModified.getTime() - lastKnownModified.getTime());
      const wasModified = timeDiff > 1000;

      if (wasModified) {
        throw new ConfigFileError(
          ConfigError.FILE_MODIFIED,
          `Config file was modified externally. Last known: ${lastKnownModified.toISOString()}, Current: ${currentModified.toISOString()}`
        );
      }

      return false;
    } catch (error) {
      if (error instanceof ConfigFileError) {
        throw error;
      }
      throw new ConfigFileError(
        ConfigError.FILE_NOT_FOUND,
        `Cannot check file modifications: ${this.filePath}`,
        error as Error
      );
    }
  }

  private async parseAndValidateConfig(content: string): Promise<ClaudeConfig> {
    try {
      const parsed = JSON.parse(content);
      return await this.validateConfig(parsed);
    } catch (error) {
      throw new ConfigFileError(
        ConfigError.INVALID_JSON,
        `Invalid JSON in config file: ${this.filePath}`,
        error as Error
      );
    }
  }

  private async validateConfig(config: unknown): Promise<ClaudeConfig> {
    try {
      // Ensure basic structure
      if (typeof config !== 'object' || config === null) {
        throw new Error('Config must be an object');
      }

      const typedConfig = config as Record<string, unknown>;

      // Initialize mcpServers if missing
      if (!typedConfig.mcpServers) {
        typedConfig.mcpServers = {};
      }

      // Initialize mcpServers_disabled if missing
      if (!typedConfig.mcpServers_disabled) {
        typedConfig.mcpServers_disabled = {};
      }

      // Validate mcpServers structure
      this.validateServerSection(typedConfig.mcpServers, 'mcpServers');
      this.validateServerSection(typedConfig.mcpServers_disabled, 'mcpServers_disabled');

      return typedConfig as ClaudeConfig;
    } catch (error) {
      throw new ConfigFileError(
        ConfigError.VALIDATION_FAILED,
        `Config validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error as Error
      );
    }
  }

  private validateServerSection(section: unknown, sectionName: string): void {
    if (typeof section !== 'object' || section === null) {
      throw new Error(`${sectionName} must be an object`);
    }

    for (const [serverName, serverConfig] of Object.entries(section)) {
      if (typeof serverConfig !== 'object' || serverConfig === null) {
        throw new Error(`Server "${serverName}" in ${sectionName} must be an object`);
      }

      const server = serverConfig as Record<string, unknown>;

      if (typeof server.command !== 'string' || server.command.trim() === '') {
        throw new Error(`Server "${serverName}" must have a non-empty command string`);
      }

      if (server.args !== undefined && !Array.isArray(server.args)) {
        throw new Error(`Server "${serverName}" args must be an array if provided`);
      }

      if (server.env !== undefined && (typeof server.env !== 'object' || server.env === null)) {
        throw new Error(`Server "${serverName}" env must be an object if provided`);
      }
    }
  }

  getFilePath(): string {
    return this.filePath;
  }
}