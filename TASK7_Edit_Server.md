# TASK 7: Edit Server Functionality

## Overview
Implement the ability to edit existing MCP server configurations, including modifying all fields (name, command, args, env) with validation and safe persistence.

## Requirements
- Load existing server configuration for editing
- Edit all server properties (name, command, args, env)
- Array manipulation for arguments (add/remove/reorder)
- Key-value editor for environment variables
- Validation with conflict detection on save
- Handle renaming servers safely

## Core Functionality

### 1. Edit Server Data Management
```typescript
interface EditServerState {
  originalName: string;
  originalConfig: MCPServer;
  currentData: AddServerFormData;
  validation: FormValidation;
  isLoading: boolean;
  isSubmitting: boolean;
  hasChanges: boolean;
  isFromDisabled: boolean; // Track if editing a disabled server
}

interface ServerChange {
  type: 'name' | 'command' | 'args' | 'env';
  oldValue: any;
  newValue: any;
}
```

### 2. Load Server for Editing
```typescript
class EditServerManager {
  async loadServerForEdit(serverName: string): Promise<EditServerState> {
    try {
      const configState = await ConfigAPI.readConfig();

      // Check active servers first
      let serverConfig = configState.config.mcpServers?.[serverName];
      let isFromDisabled = false;

      // Check disabled servers if not found in active
      if (!serverConfig) {
        serverConfig = configState.config.mcpServers_disabled?.[serverName];
        isFromDisabled = true;
      }

      if (!serverConfig) {
        throw new Error(`Server "${serverName}" not found`);
      }

      // Convert to form data format
      const formData: AddServerFormData = {
        name: serverName,
        command: serverConfig.command,
        args: serverConfig.args || [],
        env: serverConfig.env || {}
      };

      return {
        originalName: serverName,
        originalConfig: serverConfig,
        currentData: formData,
        validation: this.getEmptyValidation(),
        isLoading: false,
        isSubmitting: false,
        hasChanges: false,
        isFromDisabled
      };

    } catch (error) {
      throw new Error(`Failed to load server: ${error.message}`);
    }
  }

  detectChanges(original: AddServerFormData, current: AddServerFormData): ServerChange[] {
    const changes: ServerChange[] = [];

    if (original.name !== current.name) {
      changes.push({ type: 'name', oldValue: original.name, newValue: current.name });
    }

    if (original.command !== current.command) {
      changes.push({ type: 'command', oldValue: original.command, newValue: current.command });
    }

    if (!this.arraysEqual(original.args, current.args)) {
      changes.push({ type: 'args', oldValue: original.args, newValue: current.args });
    }

    if (!this.objectsEqual(original.env, current.env)) {
      changes.push({ type: 'env', oldValue: original.env, newValue: current.env });
    }

    return changes;
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }

  private objectsEqual(a: Record<string, string>, b: Record<string, string>): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    return keysA.length === keysB.length &&
           keysA.every(key => a[key] === b[key]);
  }
}
```

### 3. Server Name Change Validation
```typescript
class EditServerValidator extends ServerFormValidator {
  async validateServerRename(
    originalName: string,
    newName: string,
    isFromDisabled: boolean
  ): Promise<string[]> {
    const errors: string[] = [];

    // If name hasn't changed, no validation needed
    if (originalName === newName) {
      return errors;
    }

    // Validate new name format
    const nameFormatErrors = this.validateName(newName);
    errors.push(...nameFormatErrors);

    if (nameFormatErrors.length > 0) {
      return errors;
    }

    try {
      const configState = await ConfigAPI.readConfig();
      const activeServers = configState.config.mcpServers || {};
      const disabledServers = configState.config.mcpServers_disabled || {};

      // Check if new name conflicts with existing servers
      if (activeServers[newName]) {
        errors.push(`An active server with the name "${newName}" already exists`);
      }

      if (disabledServers[newName]) {
        errors.push(`A disabled server with the name "${newName}" already exists`);
      }

    } catch (error) {
      errors.push('Unable to check for naming conflicts');
    }

    return errors;
  }
}
```

## UI Components

### Edit Server Form
```typescript
function EditServerForm({ serverName }: { serverName: string }) {
  const [editState, setEditState] = useState<EditServerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const manager = new EditServerManager();
  const validator = new EditServerValidator();
  const navigate = useNavigate();

  useEffect(() => {
    loadServer();
  }, [serverName]);

  const loadServer = async () => {
    try {
      setLoading(true);
      setError(null);
      const state = await manager.loadServerForEdit(serverName);
      setEditState(state);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = useCallback((field: keyof AddServerFormData, value: any) => {
    if (!editState) return;

    const newData = { ...editState.currentData, [field]: value };
    const hasChanges = JSON.stringify(newData) !== JSON.stringify({
      name: editState.originalName,
      command: editState.originalConfig.command,
      args: editState.originalConfig.args || [],
      env: editState.originalConfig.env || {}
    });

    setEditState(prev => ({
      ...prev!,
      currentData: newData,
      hasChanges
    }));
  }, [editState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editState || editState.isSubmitting) return;

    setEditState(prev => ({ ...prev!, isSubmitting: true }));

    try {
      await saveServerChanges(editState);
      navigate('/');
    } catch (error) {
      setEditState(prev => ({
        ...prev!,
        isSubmitting: false,
        validation: {
          ...prev!.validation,
          general: [error.message]
        }
      }));
    }
  };

  const handleDelete = async () => {
    if (!editState) return;

    const confirmMessage = `Are you sure you want to delete the server "${editState.originalName}"? This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteServer(editState.originalName, editState.isFromDisabled);
      navigate('/');
    } catch (error) {
      alert(`Failed to delete server: ${error.message}`);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={loadServer} />;
  if (!editState) return null;

  return (
    <form className="edit-server-form" onSubmit={handleSubmit}>
      <header className="form-header">
        <div className="header-left">
          <h2>Edit Server: {editState.originalName}</h2>
          {editState.isFromDisabled && (
            <span className="disabled-badge">From Disabled Servers</span>
          )}
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="danger-outline"
            onClick={handleDelete}
          >
            Delete Server
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={editState.isSubmitting || !editState.hasChanges}
          >
            {editState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      {editState.validation.general.length > 0 && (
        <ErrorMessage errors={editState.validation.general} />
      )}

      {editState.hasChanges && (
        <div className="changes-indicator">
          <InfoIcon />
          You have unsaved changes
        </div>
      )}

      <div className="form-content">
        <ServerBasicInfoSection
          data={editState.currentData}
          validation={editState.validation}
          onChange={updateFormData}
          onValidate={(field, value) => validateField(field, value, editState)}
          isEditing={true}
          originalName={editState.originalName}
        />

        <ServerArgsSection
          args={editState.currentData.args}
          validation={editState.validation.args}
          onChange={(args) => updateFormData('args', args)}
          onValidate={() => {}}
        />

        <ServerEnvSection
          env={editState.currentData.env}
          validation={editState.validation.env}
          onChange={(env) => updateFormData('env', env)}
          onValidate={() => {}}
        />
      </div>
    </form>
  );
}
```

### Enhanced Basic Info Section for Editing
```typescript
interface EditableServerBasicInfoSectionProps extends ServerBasicInfoSectionProps {
  isEditing?: boolean;
  originalName?: string;
}

function ServerBasicInfoSection({
  data,
  validation,
  onChange,
  onValidate,
  isEditing = false,
  originalName
}: EditableServerBasicInfoSectionProps) {
  return (
    <section className="form-section">
      <h3>Basic Information</h3>

      <div className="form-group">
        <label htmlFor="server-name" className="required">
          Server Name
          {isEditing && originalName && (
            <span className="original-value">
              (originally: {originalName})
            </span>
          )}
        </label>
        <TextInput
          id="server-name"
          value={data.name}
          maxLength={50}
          placeholder="e.g., searxng, vastai"
          errors={validation.name}
          onChange={(value) => onChange('name', value)}
          onBlur={(value) => onValidate('name', value)}
          required
        />
        {isEditing && (
          <small className="help-text warning">
            ⚠️ Changing the server name will create a new entry and remove the old one.
          </small>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="server-command" className="required">
          Command
        </label>
        <TextInput
          id="server-command"
          value={data.command}
          maxLength={255}
          placeholder="e.g., npx, node, python"
          errors={validation.command}
          onChange={(value) => onChange('command', value)}
          onBlur={(value) => onValidate('command', value)}
          required
        />
      </div>
    </section>
  );
}
```

## Save and Delete Operations

### Save Server Changes
```typescript
async function saveServerChanges(editState: EditServerState): Promise<void> {
  try {
    const configState = await ConfigAPI.readConfig();
    const isRename = editState.originalName !== editState.currentData.name;

    // Create updated server config
    const updatedServer: MCPServer = {
      command: editState.currentData.command,
      ...(editState.currentData.args.length > 0 && {
        args: editState.currentData.args.filter(arg => arg.trim())
      }),
      ...(Object.keys(editState.currentData.env).length > 0 && {
        env: editState.currentData.env
      })
    };

    let updatedConfig = { ...configState.config };

    if (editState.isFromDisabled) {
      // Editing a disabled server
      if (isRename) {
        // Remove old entry and add new one
        const { [editState.originalName]: removed, ...remainingDisabled } =
          updatedConfig.mcpServers_disabled || {};

        updatedConfig.mcpServers_disabled = {
          ...remainingDisabled,
          [editState.currentData.name]: updatedServer
        };
      } else {
        // Update in place
        updatedConfig.mcpServers_disabled = {
          ...updatedConfig.mcpServers_disabled,
          [editState.originalName]: updatedServer
        };
      }
    } else {
      // Editing an active server
      if (isRename) {
        // Remove old entry and add new one
        const { [editState.originalName]: removed, ...remainingActive } =
          updatedConfig.mcpServers || {};

        updatedConfig.mcpServers = {
          ...remainingActive,
          [editState.currentData.name]: updatedServer
        };
      } else {
        // Update in place
        updatedConfig.mcpServers = {
          ...updatedConfig.mcpServers,
          [editState.originalName]: updatedServer
        };
      }
    }

    await ConfigAPI.writeConfig(updatedConfig, configState.lastModified);

  } catch (error) {
    if (error.type === 'FILE_MODIFIED') {
      throw new Error('Configuration file was modified by another process. Please refresh and try again.');
    }
    throw new Error(`Failed to save changes: ${error.message}`);
  }
}
```

### Delete Server Function
```typescript
async function deleteServer(serverName: string, isFromDisabled: boolean): Promise<void> {
  try {
    const configState = await ConfigAPI.readConfig();
    let updatedConfig = { ...configState.config };

    if (isFromDisabled) {
      const { [serverName]: removed, ...remaining } =
        updatedConfig.mcpServers_disabled || {};
      updatedConfig.mcpServers_disabled = remaining;
    } else {
      const { [serverName]: removed, ...remaining } =
        updatedConfig.mcpServers || {};
      updatedConfig.mcpServers = remaining;
    }

    await ConfigAPI.writeConfig(updatedConfig, configState.lastModified);

  } catch (error) {
    if (error.type === 'FILE_MODIFIED') {
      throw new Error('Configuration file was modified by another process. Please refresh and try again.');
    }
    throw new Error(`Failed to delete server: ${error.message}`);
  }
}
```

## File Structure
```
src/renderer/
├── screens/
│   └── EditServerScreen.tsx
├── components/
│   ├── forms/
│   │   ├── EditServerForm.tsx
│   │   └── ServerBasicInfoSection.tsx (enhanced)
│   └── common/
│       ├── ConfirmDialog.tsx
│       └── ChangesIndicator.tsx
├── services/
│   ├── EditServerManager.ts
│   └── EditServerValidator.ts
├── hooks/
│   └── useEditServer.ts
└── styles/
    └── EditServerForm.css
```

## Acceptance Criteria
- [ ] Can load any existing server for editing (active or disabled)
- [ ] All fields are pre-populated with current values
- [ ] Form validation works the same as add server form
- [ ] Server renaming is handled safely
- [ ] Changes are detected and indicated to user
- [ ] Save operation handles all field updates correctly
- [ ] Delete operation removes server completely
- [ ] File modification conflicts are detected
- [ ] Unsaved changes warning when navigating away
- [ ] Visual indication when editing disabled servers

## Technical Notes
- Implement proper change detection to enable/disable save button
- Use optimistic updates where appropriate
- Handle edge cases like empty arrays and objects
- Ensure atomic operations for rename (delete old, add new)
- Consider implementing change preview/diff view