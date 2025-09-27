# TASK 8: Toggle Server (Enable/Disable)

## Overview
Implement functionality to enable and disable MCP servers by moving them between the `mcpServers` and `mcpServers_disabled` sections of the configuration file.

## Requirements
- Move servers between mcpServers and mcpServers_disabled
- Maintain complete server configuration during state changes
- Visual feedback for toggle operations
- Error handling for file conflicts
- Batch operation support for multiple servers (future consideration)

## Core Functionality

### 1. Server Toggle Operations
```typescript
interface ServerToggleOperation {
  serverName: string;
  fromEnabled: boolean;
  toEnabled: boolean;
  serverConfig: MCPServer;
}

interface ToggleResult {
  success: boolean;
  operation: ServerToggleOperation;
  error?: string;
}

class ServerToggleManager {
  async toggleServer(serverName: string): Promise<ToggleResult> {
    try {
      const configState = await ConfigAPI.readConfig();
      const operation = await this.prepareToggleOperation(serverName, configState.config);

      if (!operation) {
        throw new Error(`Server "${serverName}" not found`);
      }

      const updatedConfig = this.applyToggleOperation(configState.config, operation);
      await ConfigAPI.writeConfig(updatedConfig, configState.lastModified);

      return {
        success: true,
        operation
      };

    } catch (error) {
      return {
        success: false,
        operation: null as any,
        error: error.message
      };
    }
  }

  private async prepareToggleOperation(
    serverName: string,
    config: ClaudeConfig
  ): Promise<ServerToggleOperation | null> {
    const activeServers = config.mcpServers || {};
    const disabledServers = config.mcpServers_disabled || {};

    // Check if server is currently enabled
    if (activeServers[serverName]) {
      return {
        serverName,
        fromEnabled: true,
        toEnabled: false,
        serverConfig: activeServers[serverName]
      };
    }

    // Check if server is currently disabled
    if (disabledServers[serverName]) {
      return {
        serverName,
        fromEnabled: false,
        toEnabled: true,
        serverConfig: disabledServers[serverName]
      };
    }

    return null;
  }

  private applyToggleOperation(
    config: ClaudeConfig,
    operation: ServerToggleOperation
  ): ClaudeConfig {
    const updatedConfig = { ...config };

    if (operation.fromEnabled) {
      // Moving from enabled to disabled
      // Remove from mcpServers
      const { [operation.serverName]: removed, ...remainingActive } =
        updatedConfig.mcpServers || {};

      updatedConfig.mcpServers = remainingActive;

      // Add to mcpServers_disabled
      updatedConfig.mcpServers_disabled = {
        ...updatedConfig.mcpServers_disabled,
        [operation.serverName]: operation.serverConfig
      };
    } else {
      // Moving from disabled to enabled
      // Remove from mcpServers_disabled
      const { [operation.serverName]: removed, ...remainingDisabled } =
        updatedConfig.mcpServers_disabled || {};

      updatedConfig.mcpServers_disabled = remainingDisabled;

      // Add to mcpServers
      updatedConfig.mcpServers = {
        ...updatedConfig.mcpServers,
        [operation.serverName]: operation.serverConfig
      };
    }

    return updatedConfig;
  }

  async getServerState(serverName: string): Promise<'enabled' | 'disabled' | 'not-found'> {
    try {
      const configState = await ConfigAPI.readConfig();
      const activeServers = configState.config.mcpServers || {};
      const disabledServers = configState.config.mcpServers_disabled || {};

      if (activeServers[serverName]) return 'enabled';
      if (disabledServers[serverName]) return 'disabled';
      return 'not-found';
    } catch (error) {
      throw new Error(`Failed to check server state: ${error.message}`);
    }
  }
}
```

### 2. UI Integration with Server List
```typescript
// Enhanced ServerItem component with toggle functionality
interface ServerItemProps {
  name: string;
  server: MCPServer;
  isEnabled: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  isToggling?: boolean; // New prop for loading state
}

function ServerItem({
  name,
  server,
  isEnabled,
  onEdit,
  onToggle,
  onDelete,
  isToggling = false
}: ServerItemProps) {
  return (
    <div className={`server-item ${isEnabled ? 'enabled' : 'disabled'}`}>
      <div className="server-info">
        <div className="server-name">
          <h4>{name}</h4>
          <span className={`status-badge ${isEnabled ? 'active' : 'disabled'}`}>
            {isEnabled ? 'Active' : 'Disabled'}
          </span>
        </div>

        <div className="server-details">
          <div className="detail-row">
            <span className="label">Command:</span>
            <code className="command">{server.command}</code>
          </div>

          {server.args && server.args.length > 0 && (
            <div className="detail-row">
              <span className="label">Arguments:</span>
              <span className="count">{server.args.length} args</span>
            </div>
          )}

          {server.env && Object.keys(server.env).length > 0 && (
            <div className="detail-row">
              <span className="label">Environment:</span>
              <span className="count">{Object.keys(server.env).length} variables</span>
            </div>
          )}
        </div>
      </div>

      <div className="server-actions">
        <Button variant="secondary" onClick={onEdit}>
          Edit
        </Button>
        <Button
          variant={isEnabled ? "warning" : "success"}
          onClick={onToggle}
          disabled={isToggling}
        >
          {isToggling ? (
            <>
              <Spinner size="small" />
              {isEnabled ? 'Disabling...' : 'Enabling...'}
            </>
          ) : (
            isEnabled ? 'Disable' : 'Enable'
          )}
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
```

### 3. Toggle Hook for State Management
```typescript
interface ToggleState {
  togglingServers: Set<string>;
  lastToggleResults: Map<string, ToggleResult>;
}

function useServerToggle() {
  const [toggleState, setToggleState] = useState<ToggleState>({
    togglingServers: new Set(),
    lastToggleResults: new Map()
  });

  const toggleManager = new ServerToggleManager();

  const toggleServer = useCallback(async (serverName: string): Promise<void> => {
    // Prevent concurrent toggles of the same server
    if (toggleState.togglingServers.has(serverName)) {
      return;
    }

    // Add to toggling set
    setToggleState(prev => ({
      ...prev,
      togglingServers: new Set([...prev.togglingServers, serverName])
    }));

    try {
      const result = await toggleManager.toggleServer(serverName);

      // Store result
      setToggleState(prev => ({
        togglingServers: new Set([...prev.togglingServers].filter(name => name !== serverName)),
        lastToggleResults: new Map([...prev.lastToggleResults, [serverName, result]])
      }));

      if (!result.success) {
        throw new Error(result.error);
      }

      // Clear result after successful toggle
      setTimeout(() => {
        setToggleState(prev => {
          const newResults = new Map(prev.lastToggleResults);
          newResults.delete(serverName);
          return { ...prev, lastToggleResults: newResults };
        });
      }, 3000);

    } catch (error) {
      // Remove from toggling set on error
      setToggleState(prev => ({
        ...prev,
        togglingServers: new Set([...prev.togglingServers].filter(name => name !== serverName))
      }));

      throw error;
    }
  }, [toggleState.togglingServers, toggleManager]);

  const isToggling = useCallback((serverName: string): boolean => {
    return toggleState.togglingServers.has(serverName);
  }, [toggleState.togglingServers]);

  const getLastToggleResult = useCallback((serverName: string): ToggleResult | undefined => {
    return toggleState.lastToggleResults.get(serverName);
  }, [toggleState.lastToggleResults]);

  return {
    toggleServer,
    isToggling,
    getLastToggleResult
  };
}
```

### 4. Enhanced Server List with Toggle Integration
```typescript
function ServerListScreen() {
  const { activeServers, disabledServers, loading, error, refreshServers } = useServerList();
  const { toggleServer, isToggling, getLastToggleResult } = useServerToggle();
  const navigate = useNavigate();

  const handleToggle = useCallback(async (serverName: string, isCurrentlyEnabled: boolean) => {
    try {
      await toggleServer(serverName);
      await refreshServers(); // Refresh the list after toggle
    } catch (error) {
      alert(`Failed to ${isCurrentlyEnabled ? 'disable' : 'enable'} server: ${error.message}`);
    }
  }, [toggleServer, refreshServers]);

  const handleEdit = useCallback((serverName: string) => {
    navigate(`/edit/${encodeURIComponent(serverName)}`);
  }, [navigate]);

  const handleDelete = useCallback(async (serverName: string) => {
    if (!confirm(`Are you sure you want to delete server "${serverName}"?`)) {
      return;
    }

    try {
      // Delete implementation (from previous task)
      await deleteServer(serverName);
      await refreshServers();
    } catch (error) {
      alert(`Failed to delete server: ${error.message}`);
    }
  }, [refreshServers]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refreshServers} />;

  return (
    <div className="server-list">
      <header className="server-list-header">
        <h2>MCP Servers</h2>
        <Button onClick={() => navigate('/add')}>Add Server</Button>
      </header>

      <section className="active-servers">
        <h3>Active Servers ({Object.keys(activeServers).length})</h3>
        {Object.keys(activeServers).length === 0 ? (
          <div className="empty-state">
            <p>No active servers configured.</p>
          </div>
        ) : (
          Object.entries(activeServers).map(([name, server]) => (
            <ServerItem
              key={name}
              name={name}
              server={server}
              isEnabled={true}
              isToggling={isToggling(name)}
              onEdit={() => handleEdit(name)}
              onToggle={() => handleToggle(name, true)}
              onDelete={() => handleDelete(name)}
            />
          ))
        )}
      </section>

      <section className="disabled-servers">
        <h3>Disabled Servers ({Object.keys(disabledServers).length})</h3>
        {Object.keys(disabledServers).length === 0 ? (
          <div className="empty-state">
            <p>No disabled servers.</p>
          </div>
        ) : (
          Object.entries(disabledServers).map(([name, server]) => (
            <ServerItem
              key={name}
              name={name}
              server={server}
              isEnabled={false}
              isToggling={isToggling(name)}
              onEdit={() => handleEdit(name)}
              onToggle={() => handleToggle(name, false)}
              onDelete={() => handleDelete(name)}
            />
          ))
        )}
      </section>

      {/* Toast notifications for toggle results */}
      <ToggleNotifications
        results={Array.from(new Set([
          ...Object.keys(activeServers),
          ...Object.keys(disabledServers)
        ])).map(name => ({ name, result: getLastToggleResult(name) })).filter(item => item.result)}
      />
    </div>
  );
}
```

### 5. Toast Notifications for Toggle Results
```typescript
interface ToggleNotificationProps {
  results: Array<{ name: string; result: ToggleResult }>;
}

function ToggleNotifications({ results }: ToggleNotificationProps) {
  if (results.length === 0) return null;

  return (
    <div className="toggle-notifications">
      {results.map(({ name, result }) => (
        <div
          key={name}
          className={`notification ${result.success ? 'success' : 'error'}`}
        >
          {result.success ? (
            <>
              <CheckIcon />
              Server "{name}" {result.operation.toEnabled ? 'enabled' : 'disabled'} successfully
            </>
          ) : (
            <>
              <ErrorIcon />
              Failed to toggle "{name}": {result.error}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Error Handling and Edge Cases

### 1. Conflict Resolution
```typescript
class ToggleConflictResolver {
  async handleFileModificationConflict(
    serverName: string,
    operation: ServerToggleOperation
  ): Promise<'retry' | 'cancel' | 'reload'> {
    const choice = await showConflictDialog({
      title: 'Configuration File Modified',
      message: `The configuration file was modified while toggling server "${serverName}". What would you like to do?`,
      options: [
        { label: 'Retry Toggle', value: 'retry' },
        { label: 'Reload Configuration', value: 'reload' },
        { label: 'Cancel', value: 'cancel' }
      ]
    });

    return choice;
  }

  async handleMissingServer(serverName: string): Promise<void> {
    await showErrorDialog({
      title: 'Server Not Found',
      message: `Server "${serverName}" was not found in the configuration. It may have been removed by another process.`,
      action: 'Reload the server list to see current servers.'
    });
  }
}
```

### 2. Atomic Toggle Operations
```typescript
class AtomicToggleManager extends ServerToggleManager {
  async atomicToggle(serverName: string): Promise<ToggleResult> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await this.toggleServer(serverName);
      } catch (error) {
        if (error.type === 'FILE_MODIFIED' && attempt < maxRetries - 1) {
          attempt++;
          // Wait briefly before retry
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
          continue;
        }
        throw error;
      }
    }

    throw new Error(`Failed to toggle server after ${maxRetries} attempts`);
  }
}
```

## File Structure
```
src/renderer/
├── screens/
│   └── ServerListScreen.tsx (enhanced)
├── components/
│   ├── server/
│   │   ├── ServerItem.tsx (enhanced)
│   │   └── ToggleNotifications.tsx
│   └── common/
│       ├── ConflictDialog.tsx
│       └── Spinner.tsx
├── services/
│   ├── ServerToggleManager.ts
│   ├── ToggleConflictResolver.ts
│   └── AtomicToggleManager.ts
├── hooks/
│   └── useServerToggle.ts
└── styles/
    └── ServerToggle.css
```

## Styling for Toggle States
```css
.server-item.toggling {
  opacity: 0.7;
  pointer-events: none;
}

.server-item .toggle-button {
  min-width: 100px;
  transition: all 0.2s ease;
}

.server-item .toggle-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## Acceptance Criteria
- [ ] Can enable disabled servers (move to mcpServers)
- [ ] Can disable active servers (move to mcpServers_disabled)
- [ ] Server configuration is preserved during toggle
- [ ] Visual feedback shows toggle operation in progress
- [ ] Success/error notifications are displayed
- [ ] File modification conflicts are handled gracefully
- [ ] Toggle operations are atomic (no partial state)
- [ ] UI updates automatically after successful toggle
- [ ] Concurrent toggles of same server are prevented
- [ ] Error states are handled and displayed clearly

## Technical Notes
- Implement optimistic UI updates for better perceived performance
- Use atomic file operations to prevent corruption
- Consider implementing undo functionality for accidental toggles
- Add keyboard shortcuts for quick toggle operations
- Ensure proper cleanup of notification timers