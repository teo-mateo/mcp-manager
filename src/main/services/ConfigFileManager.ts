// Created by Claude Code on 2025-09-27
// Configuration file manager with timestamp checking and atomic operations
// Purpose: Provide safe reading/writing of ~/.claude.json with conflict detection
// Updated 2025-09-28: Made project-aware to read/write specific project configurations
// Updated 2025-09-28: Added support for global MCP servers

import { ClaudeConfig, ProjectConfig, GlobalConfig, FileState, ConfigScope } from '../../shared/types';
import { ConfigError, ConfigFileError } from '../../shared/errors';
import { PathManager } from './PathManager';
import { FileOperations } from './FileOperations';

export class ConfigFileManager {
  private filePath: string;
  private projectPath: string;
  private scope: ConfigScope;

  constructor(projectPath: string, scope: ConfigScope = 'project') {
    this.filePath = PathManager.getClaudeConfigPath();
    this.projectPath = projectPath;
    this.scope = scope;
    console.log('ConfigFileManager: Initialized for', scope, 'scope');
    if (scope === 'project') {
      console.log('ConfigFileManager: Project path:', this.projectPath);
    }
  }

  async readConfig(): Promise<FileState> {
    try {
      if (!(await FileOperations.fileExists(this.filePath))) {
        // Create empty config if file doesn't exist
        if (this.scope === 'global') {
          const defaultConfig: GlobalConfig = {
            mcpServers: {},
            mcpServers_disabled: {}
          };
          return {
            config: defaultConfig,
            lastModified: new Date(0),
            filePath: this.filePath,
            scope: this.scope
          };
        } else {
          const defaultConfig: ClaudeConfig = {
            projects: {
              [this.projectPath]: {
                mcpServers: {},
                mcpServers_disabled: {}
              }
            }
          };
          return {
            config: defaultConfig.projects![this.projectPath],
            lastModified: new Date(0),
            filePath: this.filePath,
            projectPath: this.projectPath,
            scope: this.scope
          };
        }
      }

      const { content, stats } = await FileOperations.readFileWithStats(this.filePath);
      const fullConfig = await this.parseAndValidateFullConfig(content);

      if (this.scope === 'global') {
        // Return global MCP servers
        const globalConfig: GlobalConfig = {
          mcpServers: fullConfig.mcpServers || {},
          mcpServers_disabled: fullConfig.mcpServers_disabled || {}
        };
        return {
          config: globalConfig,
          lastModified: stats.mtime,
          filePath: this.filePath,
          scope: this.scope
        };
      } else {
        // Return project-specific MCP servers
        if (!fullConfig.projects || !fullConfig.projects[this.projectPath]) {
          throw new ConfigFileError(
            ConfigError.PROJECT_NOT_FOUND,
            `Project "${this.projectPath}" not found in Claude configuration. Please initialize the project in Claude Code first.`
          );
        }

        const projectConfig = fullConfig.projects[this.projectPath];
        return {
          config: projectConfig,
          lastModified: stats.mtime,
          filePath: this.filePath,
          projectPath: this.projectPath,
          scope: this.scope
        };
      }
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

  async writeConfig(config: ProjectConfig | GlobalConfig, lastKnownModified: Date): Promise<void> {
    try {
      // Check for external modifications before writing
      if (await FileOperations.fileExists(this.filePath)) {
        await this.checkForModifications(lastKnownModified);
      }

      // Read the full config to preserve other data
      let fullConfig: ClaudeConfig;
      if (await FileOperations.fileExists(this.filePath)) {
        const { content } = await FileOperations.readFileWithStats(this.filePath);
        fullConfig = await this.parseAndValidateFullConfig(content);
      } else {
        fullConfig = {};
      }

      if (this.scope === 'global') {
        // Update global MCP servers
        const globalConfig = config as GlobalConfig;
        fullConfig.mcpServers = globalConfig.mcpServers;
        fullConfig.mcpServers_disabled = globalConfig.mcpServers_disabled;
      } else {
        // Update project-specific MCP servers
        if (!fullConfig.projects) {
          fullConfig.projects = {};
        }
        fullConfig.projects[this.projectPath] = await this.validateProjectConfig(config);
      }

      // Create backup if file exists
      if (await FileOperations.fileExists(this.filePath)) {
        const backupPath = PathManager.getBackupPath(this.filePath);
        await FileOperations.createBackup(this.filePath, backupPath);
      }

      // Write atomically
      const content = JSON.stringify(fullConfig, null, 2);
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

  private async parseAndValidateFullConfig(content: string): Promise<ClaudeConfig> {
    try {
      const parsed = JSON.parse(content);
      return await this.validateFullConfig(parsed);
    } catch (error) {
      throw new ConfigFileError(
        ConfigError.INVALID_JSON,
        `Invalid JSON in config file: ${this.filePath}`,
        error as Error
      );
    }
  }

  private async validateFullConfig(config: unknown): Promise<ClaudeConfig> {
    try {
      // Ensure basic structure
      if (typeof config !== 'object' || config === null) {
        throw new Error('Config must be an object');
      }

      const typedConfig = config as ClaudeConfig;

      // Initialize projects if missing
      if (!typedConfig.projects) {
        typedConfig.projects = {};
      }

      // Initialize global mcpServers if missing
      if (!typedConfig.mcpServers) {
        typedConfig.mcpServers = {};
      }
      if (!typedConfig.mcpServers_disabled) {
        typedConfig.mcpServers_disabled = {};
      }

      // Validate global servers
      this.validateServerSection(typedConfig.mcpServers, 'global mcpServers');
      this.validateServerSection(typedConfig.mcpServers_disabled, 'global mcpServers_disabled');

      // Validate each project's configuration
      for (const [projectPath, projectConfig] of Object.entries(typedConfig.projects)) {
        typedConfig.projects[projectPath] = await this.validateProjectConfig(projectConfig);
      }

      return typedConfig;
    } catch (error) {
      throw new ConfigFileError(
        ConfigError.VALIDATION_FAILED,
        `Config validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error as Error
      );
    }
  }

  private async validateProjectConfig(config: unknown): Promise<ProjectConfig> {
    try {
      // Ensure basic structure
      if (typeof config !== 'object' || config === null) {
        throw new Error('Project config must be an object');
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

      return typedConfig as ProjectConfig;
    } catch (error) {
      throw new ConfigFileError(
        ConfigError.VALIDATION_FAILED,
        `Project config validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

      // Type is optional but if present must be a string
      if (server.type !== undefined && typeof server.type !== 'string') {
        throw new Error(`Server "${serverName}" type must be a string if provided`);
      }
    }
  }

  getFilePath(): string {
    return this.filePath;
  }

  getProjectPath(): string {
    return this.projectPath;
  }

  getScope(): ConfigScope {
    return this.scope;
  }

  setScope(scope: ConfigScope): void {
    this.scope = scope;
    console.log('ConfigFileManager: Scope changed to', scope);
  }
}