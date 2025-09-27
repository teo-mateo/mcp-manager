// Created by Claude Code on 2025-09-27
// Low-level file operations for safe file handling
// Purpose: Provide atomic writes, file stats, and safe file I/O operations

import { promises as fs } from 'fs';
import { Stats } from 'fs';
import { FileStats } from '../../shared/types';
import { ConfigError, ConfigFileError } from '../../shared/errors';

export class FileOperations {
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async getFileStats(filePath: string): Promise<FileStats> {
    try {
      const stats: Stats = await fs.stat(filePath);
      return {
        size: stats.size,
        mtime: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      throw new ConfigFileError(
        ConfigError.FILE_NOT_FOUND,
        `Cannot get stats for file: ${filePath}`,
        error as Error
      );
    }
  }

  static async readFileWithStats(filePath: string): Promise<{ content: string; stats: FileStats }> {
    try {
      const [content, stats] = await Promise.all([
        fs.readFile(filePath, 'utf-8'),
        FileOperations.getFileStats(filePath)
      ]);
      return { content, stats };
    } catch (error) {
      if (error instanceof ConfigFileError) {
        throw error;
      }
      throw new ConfigFileError(
        ConfigError.FILE_NOT_FOUND,
        `Cannot read file: ${filePath}`,
        error as Error
      );
    }
  }

  static async atomicWrite(filePath: string, content: string): Promise<void> {
    const tempPath = `${filePath}.tmp.${Date.now()}`;

    try {
      await fs.writeFile(tempPath, content, 'utf-8');
      await fs.rename(tempPath, filePath);
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }

      throw new ConfigFileError(
        ConfigError.ATOMIC_WRITE_FAILED,
        `Atomic write failed for file: ${filePath}`,
        error as Error
      );
    }
  }

  static async createBackup(originalPath: string, backupPath: string): Promise<void> {
    try {
      await fs.copyFile(originalPath, backupPath);
    } catch (error) {
      throw new ConfigFileError(
        ConfigError.BACKUP_FAILED,
        `Failed to create backup: ${backupPath}`,
        error as Error
      );
    }
  }
}