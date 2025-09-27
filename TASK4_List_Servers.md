# TASK 4: List Servers Feature

## Overview
Implement the server list functionality to display all MCP servers from the configuration file, showing both active and disabled servers with proper visual distinction.

## Requirements
- Display servers from mcpServers (active)
- Display servers from mcpServers_disabled (disabled)
- Show essential server information
- Visual distinction between active/disabled
- Navigation to edit/add screens
- Real-time updates when config changes

## Core Functionality

### 1. Server Display Component
```typescript
interface ServerListProps {
  servers: MCPServer[];
  onEdit: (serverName: string) => void;
  onToggle: (serverName: string, currentState: boolean) => void;
  onDelete: (serverName: string) => void;
}

interface ServerItemProps {
  name: string;
  server: MCPServer;
  isEnabled: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}
```

### 2. Data Management
```typescript
interface ServerListState {
  activeServers: Record<string, MCPServer>;
  disabledServers: Record<string, MCPServer>;
  loading: boolean;
  error: string | null;
  lastModified: Date;
}

class ServerListManager {
  async loadServers(): Promise<ServerListState> {
    // Load from config file
    // Separate active/disabled servers
    // Return organized data
  }

  async refreshServers(): Promise<void> {
    // Check for file modifications
    // Reload if changed
    // Update UI state
  }
}
```

### 3. Server Information Display
```typescript
interface ServerDisplayData {
  name: string;
  command: string;
  argsCount: number;
  envCount: number;
  isEnabled: boolean;
  hasErrors: boolean; // For validation
}
```

## UI Components

### Server List Layout
```typescript
function ServerList({ servers, onEdit, onToggle, onDelete }: ServerListProps) {
  return (
    <div className="server-list">
      <header className="server-list-header">
        <h2>MCP Servers</h2>
        <Button onClick={() => navigate('/add')}>Add Server</Button>
      </header>

      <section className="active-servers">
        <h3>Active Servers ({activeCount})</h3>
        {activeServers.map(server => (
          <ServerItem
            key={server.name}
            {...server}
            isEnabled={true}
            onEdit={() => onEdit(server.name)}
            onToggle={() => onToggle(server.name, true)}
            onDelete={() => onDelete(server.name)}
          />
        ))}
      </section>

      <section className="disabled-servers">
        <h3>Disabled Servers ({disabledCount})</h3>
        {disabledServers.map(server => (
          <ServerItem
            key={server.name}
            {...server}
            isEnabled={false}
            onEdit={() => onEdit(server.name)}
            onToggle={() => onToggle(server.name, false)}
            onDelete={() => onDelete(server.name)}
          />
        ))}
      </section>
    </div>
  );
}
```

### Server Item Component
```typescript
function ServerItem({ name, server, isEnabled, onEdit, onToggle, onDelete }: ServerItemProps) {
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
              <code className="preview">{server.args.slice(0, 2).join(' ')}...</code>
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
        >
          {isEnabled ? 'Disable' : 'Enable'}
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
```

## State Management

### React Hook for Server Data
```typescript
function useServerList() {
  const [state, setState] = useState<ServerListState>({
    activeServers: {},
    disabledServers: {},
    loading: true,
    error: null,
    lastModified: new Date()
  });

  const loadServers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const configState = await ConfigAPI.readConfig();

      setState({
        activeServers: configState.config.mcpServers || {},
        disabledServers: configState.config.mcpServers_disabled || {},
        loading: false,
        error: null,
        lastModified: configState.lastModified
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, []);

  const refreshIfChanged = useCallback(async () => {
    try {
      const hasChanges = await ConfigAPI.checkForModifications(state.lastModified);
      if (hasChanges) {
        await loadServers();
      }
    } catch (error) {
      console.error('Failed to check for modifications:', error);
    }
  }, [state.lastModified, loadServers]);

  useEffect(() => {
    loadServers();
  }, [loadServers]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(refreshIfChanged, 5000);
    return () => clearInterval(interval);
  }, [refreshIfChanged]);

  return {
    ...state,
    loadServers,
    refreshServers: loadServers
  };
}
```

## Event Handlers

### Server Actions
```typescript
function ServerListScreen() {
  const { activeServers, disabledServers, loading, error, refreshServers } = useServerList();
  const navigate = useNavigate();

  const handleEdit = useCallback((serverName: string) => {
    navigate(`/edit/${encodeURIComponent(serverName)}`);
  }, [navigate]);

  const handleToggle = useCallback(async (serverName: string, isCurrentlyEnabled: boolean) => {
    try {
      // Implementation in next task
      console.log(`Toggle ${serverName} from ${isCurrentlyEnabled ? 'enabled' : 'disabled'}`);
      await refreshServers();
    } catch (error) {
      alert(`Failed to toggle server: ${error.message}`);
    }
  }, [refreshServers]);

  const handleDelete = useCallback(async (serverName: string) => {
    if (!confirm(`Are you sure you want to delete server "${serverName}"?`)) {
      return;
    }

    try {
      // Implementation in next task
      console.log(`Delete ${serverName}`);
      await refreshServers();
    } catch (error) {
      alert(`Failed to delete server: ${error.message}`);
    }
  }, [refreshServers]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refreshServers} />;

  return (
    <ServerList
      servers={[...Object.entries(activeServers), ...Object.entries(disabledServers)]}
      onEdit={handleEdit}
      onToggle={handleToggle}
      onDelete={handleDelete}
    />
  );
}
```

## Styling

### CSS Classes
```css
.server-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.server-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e1e5e9;
}

.server-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  margin-bottom: 15px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
}

.server-item.disabled {
  opacity: 0.6;
  background: #f8f9fa;
}

.server-info {
  flex: 1;
}

.server-name {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.server-name h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.disabled {
  background: #f8d7da;
  color: #721c24;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.label {
  font-weight: 500;
  min-width: 80px;
}

.command, .preview {
  font-family: monospace;
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 14px;
}

.count {
  color: #6c757d;
  font-size: 14px;
}

.server-actions {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

@media (max-width: 768px) {
  .server-item {
    flex-direction: column;
    gap: 15px;
  }

  .server-actions {
    flex-direction: row;
    align-self: stretch;
  }
}
```

## File Structure
```
src/renderer/
├── screens/
│   └── ServerListScreen.tsx
├── components/
│   ├── server/
│   │   ├── ServerList.tsx
│   │   ├── ServerItem.tsx
│   │   └── index.ts
│   └── common/
│       ├── LoadingSpinner.tsx
│       └── ErrorMessage.tsx
├── hooks/
│   └── useServerList.ts
└── styles/
    └── ServerList.css
```

## Acceptance Criteria
- [ ] Displays all active servers from mcpServers
- [ ] Displays all disabled servers from mcpServers_disabled
- [ ] Shows server name, command, args count, env count
- [ ] Visual distinction between active/disabled servers
- [ ] Edit button navigates to edit screen
- [ ] Toggle button shows correct label (Enable/Disable)
- [ ] Delete button shows confirmation dialog
- [ ] Auto-refreshes when config file changes
- [ ] Handles loading and error states
- [ ] Responsive design works on different screen sizes
- [ ] Empty states handled gracefully

## Technical Notes
- Use React.memo for ServerItem to prevent unnecessary re-renders
- Implement proper error boundaries
- Consider virtualization for large server lists (future enhancement)
- Ensure accessibility with proper ARIA labels
- Cache server data to prevent excessive file reads