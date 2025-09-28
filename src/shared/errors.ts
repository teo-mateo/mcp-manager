// Created by Claude Code on 2025-09-27
// Error types and classes for file operations in MCP Manager
// Purpose: Define specific error types for configuration file operations

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export enum ConfigError {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_JSON = 'INVALID_JSON',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  FILE_MODIFIED = 'FILE_MODIFIED',
  BACKUP_FAILED = 'BACKUP_FAILED',
  WRITE_FAILED = 'WRITE_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  ATOMIC_WRITE_FAILED = 'ATOMIC_WRITE_FAILED',
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND'
}

export class ConfigFileError extends Error {
  constructor(
    public readonly type: ConfigError,
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ConfigFileError';
  }
}