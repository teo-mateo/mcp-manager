// Created by Claude Code on 2025-09-27
// Path management utility for cross-platform file operations
// Purpose: Handle path resolution and backup path generation for config files
// Updated 2025-09-27: Added environment-based path configuration for development and production

import { homedir } from 'os';
import { join } from 'path';

export class PathManager {
  static getClaudeConfigPath(): string {
    // Use different paths for development and production
    if (process.env.NODE_ENV === 'development') {
      // For development: use a test file in the current workspace
      return join(process.cwd(), 'test-claude-config.json');
    } else {
      // For production: use ~/.claude.json
      return join(homedir(), '.claude.json');
    }
  }

  static getBackupPath(originalPath: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${originalPath}.backup.${timestamp}`;
  }

  static getTempPath(originalPath: string): string {
    const timestamp = Date.now();
    return `${originalPath}.tmp.${timestamp}`;
  }
}