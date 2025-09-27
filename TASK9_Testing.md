# TASK 9: Testing & Validation

## Overview
Implement comprehensive testing for the MCP Server Manager application, covering unit tests, integration tests, UI functionality tests, and cross-platform validation.

## Requirements
- Unit tests for JSON operations and file handling
- Integration tests for file operations
- UI component testing
- Error scenario validation
- Cross-platform testing (Linux/Windows)
- Performance testing for large configurations

## Test Structure

### 1. Test Categories
```typescript
// Test organization structure
interface TestSuite {
  unit: {
    fileOperations: Test[];
    jsonValidation: Test[];
    serverManagement: Test[];
    formValidation: Test[];
  };
  integration: {
    configFileOperations: Test[];
    serverCRUD: Test[];
    toggleOperations: Test[];
  };
  ui: {
    components: Test[];
    screens: Test[];
    userFlows: Test[];
  };
  error: {
    fileCorruption: Test[];
    permissionErrors: Test[];
    conflictResolution: Test[];
  };
  crossPlatform: {
    pathHandling: Test[];
    filePermissions: Test[];
  };
}
```

### 2. Mock Data and Fixtures
```typescript
// Test fixtures for consistent test data
export const mockClaudeConfig: ClaudeConfig = {
  mcpServers: {
    "searxng": {
      command: "npx",
      args: ["-y", "mcp-searxng"],
      env: {
        "SEARXNG_URL": "http://localhost:8888"
      }
    },
    "vastai": {
      command: "node",
      args: ["/path/to/vastai/index.js"],
      env: {
        "NODE_ENV": "production"
      }
    }
  },
  mcpServers_disabled: {
    "disabled-server": {
      command: "disabled-command",
      args: ["arg1", "arg2"],
      env: {
        "DISABLED_VAR": "value"
      }
    }
  },
  otherProperty: "preserved"
};

export const mockValidServer: MCPServer = {
  command: "test-command",
  args: ["--flag", "value"],
  env: {
    "TEST_VAR": "test_value"
  }
};

export const mockInvalidServers = {
  missingCommand: {
    args: ["arg1"]
  },
  invalidArgsType: {
    command: "test",
    args: "not an array"
  },
  invalidEnvType: {
    command: "test",
    env: ["not", "an", "object"]
  }
};
```

## Unit Tests

### 1. File Operations Tests
```typescript
// src/tests/unit/fileOperations.test.ts
import { ConfigFileManager, PathManager } from '../../main/services/ConfigFileManager';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('ConfigFileManager', () => {
  let tempDir: string;
  let configPath: string;
  let manager: ConfigFileManager;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-test-'));
    configPath = path.join(tempDir, '.claude.json');
    manager = new ConfigFileManager(configPath);
  });

  afterEach(async () => {
    await fs.rmdir(tempDir, { recursive: true });
  });

  describe('readConfig', () => {
    test('reads valid config file', async () => {
      await fs.writeFile(configPath, JSON.stringify(mockClaudeConfig, null, 2));

      const result = await manager.readConfig();

      expect(result.config).toEqual(mockClaudeConfig);
      expect(result.lastModified).toBeInstanceOf(Date);
      expect(result.filePath).toBe(configPath);
    });

    test('handles missing file', async () => {
      await expect(manager.readConfig()).rejects.toThrow('FILE_NOT_FOUND');
    });

    test('handles invalid JSON', async () => {
      await fs.writeFile(configPath, 'invalid json');

      await expect(manager.readConfig()).rejects.toThrow('INVALID_JSON');
    });

    test('creates mcpServers_disabled if missing', async () => {
      const configWithoutDisabled = { ...mockClaudeConfig };
      delete configWithoutDisabled.mcpServers_disabled;

      await fs.writeFile(configPath, JSON.stringify(configWithoutDisabled));

      const result = await manager.readConfig();

      expect(result.config.mcpServers_disabled).toEqual({});
    });
  });

  describe('writeConfig', () => {
    test('writes config successfully', async () => {
      const lastModified = new Date('2023-01-01');

      await manager.writeConfig(mockClaudeConfig, lastModified);

      const written = await fs.readFile(configPath, 'utf-8');
      const parsed = JSON.parse(written);

      expect(parsed).toEqual(mockClaudeConfig);
    });

    test('detects file modification', async () => {
      await fs.writeFile(configPath, JSON.stringify(mockClaudeConfig));
      const oldTime = new Date('2020-01-01');

      await expect(manager.writeConfig(mockClaudeConfig, oldTime))
        .rejects.toThrow('FILE_MODIFIED');
    });

    test('creates backup before writing', async () => {
      await fs.writeFile(configPath, JSON.stringify(mockClaudeConfig));
      const stats = await fs.stat(configPath);

      await manager.writeConfig(mockClaudeConfig, stats.mtime);

      const files = await fs.readdir(tempDir);
      const backupFiles = files.filter(f => f.includes('.backup.'));

      expect(backupFiles.length).toBe(1);
    });

    test('preserves file permissions', async () => {
      await fs.writeFile(configPath, JSON.stringify(mockClaudeConfig));
      await fs.chmod(configPath, 0o600);

      const originalStats = await fs.stat(configPath);
      await manager.writeConfig(mockClaudeConfig, originalStats.mtime);
      const newStats = await fs.stat(configPath);

      expect(newStats.mode).toBe(originalStats.mode);
    });
  });

  describe('atomicWrite', () => {
    test('writes atomically', async () => {
      const content = JSON.stringify(mockClaudeConfig);

      await manager.atomicWrite(configPath, content);

      const written = await fs.readFile(configPath, 'utf-8');
      expect(written).toBe(content);
    });

    test('cleans up temp file on error', async () => {
      const invalidPath = path.join('/nonexistent', 'config.json');

      await expect(manager.atomicWrite(invalidPath, 'content'))
        .rejects.toThrow();

      // Verify no temp files left behind
      const tempFiles = await fs.readdir(tempDir);
      expect(tempFiles.filter(f => f.includes('.tmp'))).toHaveLength(0);
    });
  });
});
```

### 2. JSON Validation Tests
```typescript
// src/tests/unit/jsonValidation.test.ts
import { JSONServerValidator } from '../../renderer/services/JSONServerValidator';

describe('JSONServerValidator', () => {
  let validator: JSONServerValidator;

  beforeEach(() => {
    validator = new JSONServerValidator();
  });

  describe('validateServerJSON', () => {
    test('validates correct server JSON', () => {
      const validJSON = JSON.stringify({
        "test-server": {
          command: "npx",
          args: ["-y", "test"],
          env: { "TEST_VAR": "value" }
        }
      });

      const result = validator.validateServerJSON(validJSON);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.parsedData).toEqual({
        name: "test-server",
        config: {
          command: "npx",
          args: ["-y", "test"],
          env: { "TEST_VAR": "value" }
        }
      });
    });

    test('rejects invalid JSON syntax', () => {
      const invalidJSON = '{ "test": invalid }';

      const result = validator.validateServerJSON(invalidJSON);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('Invalid JSON');
    });

    test('rejects multiple server definitions', () => {
      const multipleServers = JSON.stringify({
        "server1": { command: "test1" },
        "server2": { command: "test2" }
      });

      const result = validator.validateServerJSON(multipleServers);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('exactly one server');
    });

    test('validates server name format', () => {
      const invalidName = JSON.stringify({
        "invalid name!": { command: "test" }
      });

      const result = validator.validateServerJSON(invalidName);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('letters, numbers, hyphens, and underscores')
        })
      );
    });

    test('requires command field', () => {
      const missingCommand = JSON.stringify({
        "test-server": { args: ["arg1"] }
      });

      const result = validator.validateServerJSON(missingCommand);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'Command is required'
        })
      );
    });

    test('validates args array', () => {
      const invalidArgs = JSON.stringify({
        "test-server": {
          command: "test",
          args: "not an array"
        }
      });

      const result = validator.validateServerJSON(invalidArgs);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'Arguments must be an array'
        })
      );
    });

    test('validates environment variables', () => {
      const invalidEnv = JSON.stringify({
        "test-server": {
          command: "test",
          env: {
            "123invalid": "value",
            "valid_var": 123
          }
        }
      });

      const result = validator.validateServerJSON(invalidEnv);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
```

### 3. Server Management Tests
```typescript
// src/tests/unit/serverManagement.test.ts
import { ServerToggleManager } from '../../renderer/services/ServerToggleManager';
import { EditServerManager } from '../../renderer/services/EditServerManager';

describe('ServerToggleManager', () => {
  let manager: ServerToggleManager;
  let mockConfigAPI: jest.Mocked<typeof ConfigAPI>;

  beforeEach(() => {
    manager = new ServerToggleManager();
    mockConfigAPI = jest.mocked(ConfigAPI);
  });

  describe('toggleServer', () => {
    test('moves enabled server to disabled', async () => {
      mockConfigAPI.readConfig.mockResolvedValue({
        config: mockClaudeConfig,
        lastModified: new Date(),
        filePath: '/test/path'
      });

      const result = await manager.toggleServer('searxng');

      expect(result.success).toBe(true);
      expect(result.operation.fromEnabled).toBe(true);
      expect(result.operation.toEnabled).toBe(false);

      expect(mockConfigAPI.writeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          mcpServers: expect.not.objectContaining({
            searxng: expect.anything()
          }),
          mcpServers_disabled: expect.objectContaining({
            searxng: expect.anything()
          })
        }),
        expect.any(Date)
      );
    });

    test('moves disabled server to enabled', async () => {
      mockConfigAPI.readConfig.mockResolvedValue({
        config: mockClaudeConfig,
        lastModified: new Date(),
        filePath: '/test/path'
      });

      const result = await manager.toggleServer('disabled-server');

      expect(result.success).toBe(true);
      expect(result.operation.fromEnabled).toBe(false);
      expect(result.operation.toEnabled).toBe(true);
    });

    test('handles non-existent server', async () => {
      mockConfigAPI.readConfig.mockResolvedValue({
        config: mockClaudeConfig,
        lastModified: new Date(),
        filePath: '/test/path'
      });

      const result = await manager.toggleServer('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
```

## Integration Tests

### 1. End-to-End Config Operations
```typescript
// src/tests/integration/configOperations.test.ts
import { app, BrowserWindow } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';

describe('Config Operations Integration', () => {
  let mainWindow: BrowserWindow;
  let tempConfigPath: string;

  beforeAll(async () => {
    await app.whenReady();
  });

  beforeEach(async () => {
    tempConfigPath = path.join(__dirname, 'temp-config.json');
    await fs.writeFile(tempConfigPath, JSON.stringify(mockClaudeConfig));

    mainWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
  });

  afterEach(async () => {
    if (mainWindow) {
      mainWindow.close();
    }
    try {
      await fs.unlink(tempConfigPath);
    } catch (error) {
      // File might not exist
    }
  });

  test('complete server lifecycle', async () => {
    // Test adding a server
    const newServer = {
      name: 'test-server',
      command: 'test-command',
      args: ['arg1', 'arg2'],
      env: { 'TEST_VAR': 'value' }
    };

    // Add server via IPC
    const addResult = await mainWindow.webContents.executeJavaScript(`
      window.electronAPI.invoke('config:addServer', ${JSON.stringify(newServer)})
    `);

    expect(addResult.success).toBe(true);

    // Verify server was added
    const configAfterAdd = await fs.readFile(tempConfigPath, 'utf-8');
    const parsedConfig = JSON.parse(configAfterAdd);
    expect(parsedConfig.mcpServers['test-server']).toBeDefined();

    // Test toggling server
    const toggleResult = await mainWindow.webContents.executeJavaScript(`
      window.electronAPI.invoke('config:toggleServer', 'test-server')
    `);

    expect(toggleResult.success).toBe(true);

    // Verify server was moved to disabled
    const configAfterToggle = await fs.readFile(tempConfigPath, 'utf-8');
    const parsedConfigToggle = JSON.parse(configAfterToggle);
    expect(parsedConfigToggle.mcpServers['test-server']).toBeUndefined();
    expect(parsedConfigToggle.mcpServers_disabled['test-server']).toBeDefined();

    // Test deleting server
    const deleteResult = await mainWindow.webContents.executeJavaScript(`
      window.electronAPI.invoke('config:deleteServer', 'test-server')
    `);

    expect(deleteResult.success).toBe(true);

    // Verify server was deleted
    const configAfterDelete = await fs.readFile(tempConfigPath, 'utf-8');
    const parsedConfigDelete = JSON.parse(configAfterDelete);
    expect(parsedConfigDelete.mcpServers_disabled['test-server']).toBeUndefined();
  });
});
```

## UI Component Tests

### 1. Component Unit Tests
```typescript
// src/tests/ui/components/ServerForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddServerForm } from '../../../renderer/components/forms/AddServerForm';

describe('AddServerForm', () => {
  test('renders all form fields', () => {
    render(<AddServerForm />);

    expect(screen.getByLabelText(/server name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/command/i)).toBeInTheDocument();
    expect(screen.getByText(/add argument/i)).toBeInTheDocument();
    expect(screen.getByText(/add variable/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    render(<AddServerForm />);

    const submitButton = screen.getByRole('button', { name: /save server/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/server name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/command is required/i)).toBeInTheDocument();
    });
  });

  test('adds and removes arguments', async () => {
    const user = userEvent.setup();
    render(<AddServerForm />);

    const addArgButton = screen.getByRole('button', { name: /add argument/i });

    // Add argument
    await user.click(addArgButton);

    const argInput = screen.getByPlaceholderText(/argument 1/i);
    expect(argInput).toBeInTheDocument();

    await user.type(argInput, 'test-arg');

    // Remove argument
    const removeButton = screen.getByRole('button', { name: /remove argument 1/i });
    await user.click(removeButton);

    expect(screen.queryByPlaceholderText(/argument 1/i)).not.toBeInTheDocument();
  });

  test('validates server name format', async () => {
    const user = userEvent.setup();
    render(<AddServerForm />);

    const nameInput = screen.getByLabelText(/server name/i);

    await user.type(nameInput, 'invalid name!');
    await user.tab(); // Trigger blur event

    await waitFor(() => {
      expect(screen.getByText(/can only contain letters, numbers, hyphens, and underscores/i))
        .toBeInTheDocument();
    });
  });

  test('submits valid form data', async () => {
    const mockSubmit = jest.fn();
    const user = userEvent.setup();

    render(<AddServerForm onSubmit={mockSubmit} />);

    // Fill form
    await user.type(screen.getByLabelText(/server name/i), 'test-server');
    await user.type(screen.getByLabelText(/command/i), 'test-command');

    // Add argument
    await user.click(screen.getByRole('button', { name: /add argument/i }));
    await user.type(screen.getByPlaceholderText(/argument 1/i), 'arg1');

    // Add environment variable
    await user.click(screen.getByRole('button', { name: /add variable/i }));
    const envInputs = screen.getAllByPlaceholderText(/variable name|variable value/i);
    await user.type(envInputs[0], 'TEST_VAR');
    await user.type(envInputs[1], 'test_value');

    // Submit
    await user.click(screen.getByRole('button', { name: /save server/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'test-server',
        command: 'test-command',
        args: ['arg1'],
        env: { 'TEST_VAR': 'test_value' }
      });
    });
  });
});
```

### 2. Screen Integration Tests
```typescript
// src/tests/ui/screens/ServerList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServerListScreen } from '../../../renderer/screens/ServerListScreen';
import { MemoryRouter } from 'react-router-dom';

// Mock the config API
jest.mock('../../../renderer/services/ConfigAPI');

describe('ServerListScreen', () => {
  beforeEach(() => {
    jest.mocked(ConfigAPI.readConfig).mockResolvedValue({
      config: mockClaudeConfig,
      lastModified: new Date(),
      filePath: '/test/path'
    });
  });

  test('displays servers from config', async () => {
    render(
      <MemoryRouter>
        <ServerListScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('searxng')).toBeInTheDocument();
      expect(screen.getByText('vastai')).toBeInTheDocument();
      expect(screen.getByText('disabled-server')).toBeInTheDocument();
    });

    expect(screen.getByText(/Active Servers \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Disabled Servers \(1\)/)).toBeInTheDocument();
  });

  test('toggles server state', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ServerListScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('searxng')).toBeInTheDocument();
    });

    const disableButton = screen.getAllByText('Disable')[0];
    await user.click(disableButton);

    await waitFor(() => {
      expect(ConfigAPI.writeConfig).toHaveBeenCalled();
    });
  });

  test('navigates to edit screen', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ServerListScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('searxng')).toBeInTheDocument();
    });

    const editButton = screen.getAllByText('Edit')[0];
    await user.click(editButton);

    // Verify navigation (would need router mock)
    expect(window.location.pathname).toContain('/edit/searxng');
  });
});
```

## Error Scenario Tests

### 1. File Corruption Tests
```typescript
// src/tests/error/fileCorruption.test.ts
describe('File Corruption Handling', () => {
  test('handles corrupted JSON file', async () => {
    const corruptedContent = '{ "mcpServers": { "test": corrupted }';
    await fs.writeFile(tempConfigPath, corruptedContent);

    const manager = new ConfigFileManager(tempConfigPath);

    await expect(manager.readConfig()).rejects.toThrow('INVALID_JSON');
  });

  test('recovers from backup when main file is corrupted', async () => {
    // Create backup
    const backupPath = `${tempConfigPath}.backup.2023-01-01T00-00-00-000Z`;
    await fs.writeFile(backupPath, JSON.stringify(mockClaudeConfig));

    // Corrupt main file
    await fs.writeFile(tempConfigPath, 'corrupted');

    const manager = new ConfigFileManager(tempConfigPath);
    const result = await manager.recoverFromBackup();

    expect(result.config).toEqual(mockClaudeConfig);
  });
});
```

### 2. Permission Error Tests
```typescript
// src/tests/error/permissions.test.ts
describe('Permission Error Handling', () => {
  test('handles read permission denied', async () => {
    await fs.writeFile(tempConfigPath, JSON.stringify(mockClaudeConfig));
    await fs.chmod(tempConfigPath, 0o000);

    const manager = new ConfigFileManager(tempConfigPath);

    await expect(manager.readConfig()).rejects.toThrow('PERMISSION_DENIED');

    // Cleanup
    await fs.chmod(tempConfigPath, 0o644);
  });

  test('handles write permission denied', async () => {
    await fs.writeFile(tempConfigPath, JSON.stringify(mockClaudeConfig));
    const stats = await fs.stat(tempConfigPath);
    await fs.chmod(path.dirname(tempConfigPath), 0o444);

    const manager = new ConfigFileManager(tempConfigPath);

    await expect(manager.writeConfig(mockClaudeConfig, stats.mtime))
      .rejects.toThrow('PERMISSION_DENIED');

    // Cleanup
    await fs.chmod(path.dirname(tempConfigPath), 0o755);
  });
});
```

## Cross-Platform Tests

### 1. Path Handling Tests
```typescript
// src/tests/crossPlatform/pathHandling.test.ts
describe('Cross-Platform Path Handling', () => {
  test('resolves config path on Linux', () => {
    jest.spyOn(os, 'homedir').mockReturnValue('/home/user');
    jest.spyOn(os, 'platform').mockReturnValue('linux');

    const configPath = PathManager.getClaudeConfigPath();

    expect(configPath).toBe('/home/user/.claude.json');
  });

  test('resolves config path on Windows', () => {
    jest.spyOn(os, 'homedir').mockReturnValue('C:\\Users\\User');
    jest.spyOn(os, 'platform').mockReturnValue('win32');

    const configPath = PathManager.getClaudeConfigPath();

    expect(configPath).toBe('C:\\Users\\User\\.claude.json');
  });

  test('handles path separators correctly', () => {
    const manager = new PathManager();

    const linuxPath = manager.normalizePath('/home/user/.claude.json');
    const windowsPath = manager.normalizePath('C:\\Users\\User\\.claude.json');

    expect(path.isAbsolute(linuxPath)).toBe(true);
    expect(path.isAbsolute(windowsPath)).toBe(true);
  });
});
```

## Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**/*'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Test Setup
```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom';

// Mock Electron APIs
global.window = Object.create(window);
global.window.electronAPI = {
  invoke: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn()
};

// Mock file system operations
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    stat: jest.fn(),
    mkdir: jest.fn(),
    rmdir: jest.fn(),
    unlink: jest.fn(),
    chmod: jest.fn(),
    readdir: jest.fn()
  }
}));

// Global test timeout
jest.setTimeout(10000);
```

## Performance Tests

### 1. Large Configuration Tests
```typescript
// src/tests/performance/largeConfig.test.ts
describe('Performance with Large Configurations', () => {
  test('handles 100+ servers efficiently', async () => {
    const largeConfig = generateLargeConfig(100);

    const startTime = Date.now();
    const manager = new ConfigFileManager(tempConfigPath);

    await fs.writeFile(tempConfigPath, JSON.stringify(largeConfig));
    const result = await manager.readConfig();

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(1000); // Should complete within 1 second
    expect(Object.keys(result.config.mcpServers)).toHaveLength(100);
  });

  test('validates large JSON efficiently', () => {
    const largeServerConfig = generateLargeServerConfig();
    const jsonString = JSON.stringify({ 'large-server': largeServerConfig });

    const startTime = Date.now();
    const validator = new JSONServerValidator();
    const result = validator.validateServerJSON(jsonString);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(100); // Should validate within 100ms
    expect(result.isValid).toBe(true);
  });
});

function generateLargeConfig(serverCount: number): ClaudeConfig {
  const mcpServers: Record<string, MCPServer> = {};

  for (let i = 0; i < serverCount; i++) {
    mcpServers[`server-${i}`] = {
      command: `command-${i}`,
      args: Array.from({ length: 10 }, (_, j) => `arg-${j}`),
      env: Object.fromEntries(
        Array.from({ length: 10 }, (_, j) => [`VAR_${j}`, `value-${j}`])
      )
    };
  }

  return {
    mcpServers,
    mcpServers_disabled: {}
  };
}
```

## Test Execution Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest src/tests/unit",
    "test:integration": "jest src/tests/integration",
    "test:ui": "jest src/tests/ui",
    "test:e2e": "jest src/tests/e2e",
    "test:cross-platform": "jest src/tests/crossPlatform",
    "test:performance": "jest src/tests/performance",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

## Acceptance Criteria
- [ ] All unit tests pass with >90% code coverage
- [ ] Integration tests cover complete user workflows
- [ ] UI tests validate all user interactions
- [ ] Error scenarios are tested and handled gracefully
- [ ] Cross-platform functionality works on Linux and Windows
- [ ] Performance tests validate efficiency with large configs
- [ ] CI/CD pipeline runs all tests automatically
- [ ] Tests provide clear error messages for failures
- [ ] Mock data accurately represents real-world usage
- [ ] Test setup is easily reproducible across environments

## Technical Notes
- Use Jest for test framework with TypeScript support
- Implement proper mocking for Electron APIs
- Create realistic test data that matches actual Claude configurations
- Use temporary directories for file operation tests
- Implement proper cleanup in all tests
- Consider using Docker for consistent cross-platform testing