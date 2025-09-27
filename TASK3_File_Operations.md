# TASK 3: File Operations

## Overview
Implement secure and reliable file operations for reading and writing the ~/.claude.json configuration file with timestamp-based modification checking.

## Requirements
- Read ~/.claude.json safely
- Write with atomic operations and backup
- Check file modification timestamp before saving
- Handle missing mcpServers_disabled section
- Cross-platform path handling (Linux/Windows)
- Comprehensive error handling

## Core Functionality

### 1. File Path Resolution
```typescript
interface FileManager {
  getClaudeConfigPath(): string;
  fileExists(path: string): boolean;
  getFileStats(path: string): FileStats;
}
```

### 2. Configuration Structure
```typescript
interface ClaudeConfig {
  mcpServers: Record<string, MCPServer>;
  mcpServers_disabled?: Record<string, MCPServer>;
  [key: string]: any; // Preserve other config properties
}

interface MCPServer {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

interface FileState {
  config: ClaudeConfig;
  lastModified: Date;
  filePath: string;
}
```

### 3. File Reading Operations
```typescript
class ConfigFileManager {
  async readConfig(): Promise<FileState> {
    // Read ~/.claude.json
    // Parse JSON safely
    // Return config with timestamp
  }

  async validateConfig(config: any): Promise<ClaudeConfig> {
    // Validate JSON structure
    // Ensure mcpServers exists
    // Create mcpServers_disabled if missing
    // Validate individual server structures
  }
}
```

### 4. File Writing Operations
```typescript
class ConfigFileManager {
  async writeConfig(config: ClaudeConfig, lastKnownModified: Date): Promise<void> {
    // Check if file was modified since last read
    // Create backup of current file
    // Write new config atomically
    // Validate written file
  }

  async createBackup(originalPath: string): Promise<string> {
    // Create timestamped backup
    // Return backup file path
  }

  async atomicWrite(filePath: string, content: string): Promise<void> {
    // Write to temporary file first
    // Rename to target file (atomic operation)
  }
}
```

### 5. Timestamp Checking
```typescript
class ConfigFileManager {
  async checkForModifications(filePath: string, lastKnownModified: Date): Promise<boolean> {
    // Get current file modification time
    // Compare with last known modification time
    // Return true if file was modified externally
  }

  async resolveModificationConflict(
    currentConfig: ClaudeConfig,
    fileConfig: ClaudeConfig
  ): Promise<'overwrite' | 'reload' | 'cancel'> {
    // Present options to user via IPC
    // Return user's choice
  }
}
```

## Implementation Details

### Error Handling
```typescript
enum ConfigError {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_JSON = 'INVALID_JSON',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  FILE_MODIFIED = 'FILE_MODIFIED',
  BACKUP_FAILED = 'BACKUP_FAILED',
  WRITE_FAILED = 'WRITE_FAILED'
}

class ConfigFileError extends Error {
  constructor(
    public type: ConfigError,
    message: string,
    public originalError?: Error
  ) {
    super(message);
  }
}
```

### Path Handling
```typescript
import { homedir } from 'os';
import { join } from 'path';

class PathManager {
  static getClaudeConfigPath(): string {
    return join(homedir(), '.claude.json');
  }

  static getBackupPath(originalPath: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${originalPath}.backup.${timestamp}`;
  }
}
```

### File Operations with Node.js
```typescript
import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';

class FileOperations {
  async readFileWithStats(filePath: string): Promise<{ content: string; stats: Stats }> {
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    return { content, stats };
  }

  async atomicWrite(filePath: string, content: string): Promise<void> {
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, content, 'utf-8');
    await fs.rename(tempPath, filePath);
  }
}
```

## IPC Communication

### Main Process API
```typescript
// In main process
ipcMain.handle('config:read', async () => {
  return await configManager.readConfig();
});

ipcMain.handle('config:write', async (event, config: ClaudeConfig, lastModified: Date) => {
  return await configManager.writeConfig(config, lastModified);
});

ipcMain.handle('config:checkModified', async (event, lastModified: Date) => {
  return await configManager.checkForModifications(lastModified);
});
```

### Renderer Process API
```typescript
// In renderer process
class ConfigAPI {
  async readConfig(): Promise<FileState> {
    return await window.electronAPI.invoke('config:read');
  }

  async writeConfig(config: ClaudeConfig, lastModified: Date): Promise<void> {
    return await window.electronAPI.invoke('config:write', config, lastModified);
  }

  async checkForModifications(lastModified: Date): Promise<boolean> {
    return await window.electronAPI.invoke('config:checkModified', lastModified);
  }
}
```

## File Structure
```
src/
├── main/
│   ├── services/
│   │   ├── ConfigFileManager.ts
│   │   ├── PathManager.ts
│   │   └── FileOperations.ts
│   ├── ipc/
│   │   └── configHandlers.ts
│   └── main.ts
├── renderer/
│   ├── services/
│   │   └── ConfigAPI.ts
│   └── hooks/
│       └── useConfig.ts
└── shared/
    ├── types/
    │   ├── config.ts
    │   └── errors.ts
    └── constants.ts
```

## Acceptance Criteria
- [ ] Can read ~/.claude.json from both Linux and Windows
- [ ] Handles missing file gracefully
- [ ] Creates mcpServers_disabled section if missing
- [ ] Detects file modifications since last read
- [ ] Creates timestamped backups before writing
- [ ] Writes files atomically (no corruption risk)
- [ ] Preserves all existing config properties
- [ ] Handles all error scenarios gracefully
- [ ] IPC communication works between main/renderer
- [ ] TypeScript types are properly defined

## Test Cases
1. Read valid config file
2. Read corrupted JSON file
3. Read missing file
4. Write config successfully
5. Detect external file modification
6. Handle write permission errors
7. Test atomic write operations
8. Test backup creation
9. Cross-platform path resolution
10. Preserve unknown config properties

## Technical Notes
- Use Node.js fs.promises for async operations
- Implement proper error propagation via IPC
- Ensure JSON.stringify preserves property order when possible
- Use fs.stat() for modification time checking
- Consider file locking mechanisms for concurrent access
- Validate JSON schema before writing