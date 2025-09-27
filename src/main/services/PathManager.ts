// Created by Claude Code on 2025-09-27
// Path management utility for cross-platform file operations
// Purpose: Handle path resolution and backup path generation for config files

import { homedir } from 'os';
import { join } from 'path';

export class PathManager {
  static getClaudeConfigPath(): string {
    return join(homedir(), '.claude.json');
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