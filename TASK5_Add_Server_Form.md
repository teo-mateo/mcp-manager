# TASK 5: Add Server - Form Mode

## Overview
Implement a form-based interface for adding new MCP servers with validation, dynamic array editing for arguments, and key-value editing for environment variables.

## Requirements
- Server name input (required, max 50 chars)
- Command input (required, max 255 chars)
- Dynamic arguments array editor
- Environment variables key-value editor
- Comprehensive form validation
- Save to ~/.claude.json with conflict detection

## Core Functionality

### 1. Form Data Structure
```typescript
interface AddServerFormData {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}

interface FormValidation {
  name: string[];
  command: string[];
  args: string[][];
  env: { key: string[]; value: string[] }[];
  general: string[];
}

interface FormState {
  data: AddServerFormData;
  validation: FormValidation;
  isSubmitting: boolean;
  hasChanges: boolean;
}
```

### 2. Form Validation Rules
```typescript
class ServerFormValidator {
  validateName(name: string): string[] {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Server name is required');
    } else if (name.length > 50) {
      errors.push('Server name must be 50 characters or less');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      errors.push('Server name can only contain letters, numbers, hyphens, and underscores');
    }

    return errors;
  }

  validateCommand(command: string): string[] {
    const errors: string[] = [];

    if (!command.trim()) {
      errors.push('Command is required');
    } else if (command.length > 255) {
      errors.push('Command must be 255 characters or less');
    }

    return errors;
  }

  validateArgs(args: string[]): string[][] {
    return args.map(arg => {
      const errors: string[] = [];
      if (arg.length > 255) {
        errors.push('Argument must be 255 characters or less');
      }
      return errors;
    });
  }

  validateEnvPair(key: string, value: string): { key: string[]; value: string[] } {
    const keyErrors: string[] = [];
    const valueErrors: string[] = [];

    if (!key.trim()) {
      keyErrors.push('Environment variable name is required');
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      keyErrors.push('Invalid environment variable name format');
    }

    return { key: keyErrors, value: valueErrors };
  }

  async validateServerExists(name: string): Promise<string[]> {
    try {
      const config = await ConfigAPI.readConfig();
      const allServers = {
        ...config.config.mcpServers,
        ...config.config.mcpServers_disabled
      };

      if (allServers[name]) {
        return ['A server with this name already exists'];
      }
      return [];
    } catch (error) {
      return ['Unable to check for existing servers'];
    }
  }
}
```

## UI Components

### Main Form Component
```typescript
function AddServerForm() {
  const [formState, setFormState] = useState<FormState>({
    data: {
      name: '',
      command: '',
      args: [],
      env: {}
    },
    validation: {
      name: [],
      command: [],
      args: [],
      env: [],
      general: []
    },
    isSubmitting: false,
    hasChanges: false
  });

  const validator = new ServerFormValidator();
  const navigate = useNavigate();

  const validateField = useCallback(async (field: keyof AddServerFormData, value: any) => {
    let errors: string[] = [];

    switch (field) {
      case 'name':
        errors = validator.validateName(value);
        if (errors.length === 0) {
          const existsErrors = await validator.validateServerExists(value);
          errors.push(...existsErrors);
        }
        break;
      case 'command':
        errors = validator.validateCommand(value);
        break;
      case 'args':
        // Handled separately for array items
        break;
      case 'env':
        // Handled separately for key-value pairs
        break;
    }

    setFormState(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        [field]: errors
      }
    }));
  }, [validator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formState.isSubmitting) return;

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Validate all fields
      await validateAllFields();

      if (hasValidationErrors()) {
        return;
      }

      // Save to config
      await saveServer(formState.data);

      // Navigate back to list
      navigate('/');
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        validation: {
          ...prev.validation,
          general: [error.message]
        }
      }));
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <form className="add-server-form" onSubmit={handleSubmit}>
      <header className="form-header">
        <h2>Add New MCP Server</h2>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Saving...' : 'Save Server'}
          </Button>
        </div>
      </header>

      {formState.validation.general.length > 0 && (
        <ErrorMessage errors={formState.validation.general} />
      )}

      <div className="form-content">
        <ServerBasicInfoSection
          data={formState.data}
          validation={formState.validation}
          onChange={updateFormData}
          onValidate={validateField}
        />

        <ServerArgsSection
          args={formState.data.args}
          validation={formState.validation.args}
          onChange={updateArgs}
          onValidate={validateArgs}
        />

        <ServerEnvSection
          env={formState.data.env}
          validation={formState.validation.env}
          onChange={updateEnv}
          onValidate={validateEnv}
        />
      </div>
    </form>
  );
}
```

### Basic Information Section
```typescript
interface ServerBasicInfoSectionProps {
  data: Pick<AddServerFormData, 'name' | 'command'>;
  validation: Pick<FormValidation, 'name' | 'command'>;
  onChange: (field: string, value: string) => void;
  onValidate: (field: string, value: string) => void;
}

function ServerBasicInfoSection({ data, validation, onChange, onValidate }: ServerBasicInfoSectionProps) {
  return (
    <section className="form-section">
      <h3>Basic Information</h3>

      <div className="form-group">
        <label htmlFor="server-name" className="required">
          Server Name
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
        <small className="help-text">
          Unique identifier for this server. Only letters, numbers, hyphens, and underscores allowed.
        </small>
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
        <small className="help-text">
          The executable command to run this MCP server.
        </small>
      </div>
    </section>
  );
}
```

### Arguments Array Section
```typescript
interface ServerArgsSectionProps {
  args: string[];
  validation: string[][];
  onChange: (args: string[]) => void;
  onValidate: (index: number, value: string) => void;
}

function ServerArgsSection({ args, validation, onChange, onValidate }: ServerArgsSectionProps) {
  const addArg = () => {
    onChange([...args, '']);
  };

  const removeArg = (index: number) => {
    const newArgs = args.filter((_, i) => i !== index);
    onChange(newArgs);
  };

  const updateArg = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index] = value;
    onChange(newArgs);
  };

  return (
    <section className="form-section">
      <div className="section-header">
        <h3>Arguments</h3>
        <Button type="button" variant="secondary" onClick={addArg}>
          Add Argument
        </Button>
      </div>

      {args.length === 0 ? (
        <div className="empty-state">
          <p>No arguments defined. Click "Add Argument" to add command line arguments.</p>
        </div>
      ) : (
        <div className="args-list">
          {args.map((arg, index) => (
            <div key={index} className="arg-item">
              <div className="arg-input">
                <TextInput
                  value={arg}
                  maxLength={255}
                  placeholder={`Argument ${index + 1}`}
                  errors={validation[index] || []}
                  onChange={(value) => updateArg(index, value)}
                  onBlur={(value) => onValidate(index, value)}
                />
              </div>
              <Button
                type="button"
                variant="danger-outline"
                onClick={() => removeArg(index)}
                aria-label={`Remove argument ${index + 1}`}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
```

### Environment Variables Section
```typescript
interface ServerEnvSectionProps {
  env: Record<string, string>;
  validation: { key: string[]; value: string[] }[];
  onChange: (env: Record<string, string>) => void;
  onValidate: (index: number, key: string, value: string) => void;
}

function ServerEnvSection({ env, validation, onChange, onValidate }: ServerEnvSectionProps) {
  const envPairs = Object.entries(env);

  const addEnvVar = () => {
    // Add a temporary key to track new entries
    const tempKey = `__temp_${Date.now()}`;
    onChange({ ...env, [tempKey]: '' });
  };

  const removeEnvVar = (keyToRemove: string) => {
    const newEnv = { ...env };
    delete newEnv[keyToRemove];
    onChange(newEnv);
  };

  const updateEnvVar = (oldKey: string, newKey: string, value: string) => {
    const newEnv = { ...env };

    if (oldKey !== newKey) {
      delete newEnv[oldKey];
    }

    if (newKey.trim()) {
      newEnv[newKey] = value;
    }

    onChange(newEnv);
  };

  return (
    <section className="form-section">
      <div className="section-header">
        <h3>Environment Variables</h3>
        <Button type="button" variant="secondary" onClick={addEnvVar}>
          Add Variable
        </Button>
      </div>

      {envPairs.length === 0 ? (
        <div className="empty-state">
          <p>No environment variables defined. Click "Add Variable" to add environment variables.</p>
        </div>
      ) : (
        <div className="env-list">
          {envPairs.map(([key, value], index) => (
            <div key={key} className="env-item">
              <div className="env-inputs">
                <TextInput
                  value={key.startsWith('__temp_') ? '' : key}
                  placeholder="Variable name"
                  errors={validation[index]?.key || []}
                  onChange={(newKey) => updateEnvVar(key, newKey, value)}
                  onBlur={(newKey) => onValidate(index, newKey, value)}
                />
                <TextInput
                  value={value}
                  placeholder="Variable value"
                  errors={validation[index]?.value || []}
                  onChange={(newValue) => updateEnvVar(key, key, newValue)}
                  onBlur={(newValue) => onValidate(index, key, newValue)}
                />
              </div>
              <Button
                type="button"
                variant="danger-outline"
                onClick={() => removeEnvVar(key)}
                aria-label={`Remove environment variable ${key}`}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
```

## Form Persistence and Save Logic

### Save Server Function
```typescript
async function saveServer(serverData: AddServerFormData): Promise<void> {
  try {
    // Read current config
    const configState = await ConfigAPI.readConfig();

    // Create new server object
    const newServer: MCPServer = {
      command: serverData.command,
      ...(serverData.args.length > 0 && { args: serverData.args.filter(arg => arg.trim()) }),
      ...(Object.keys(serverData.env).length > 0 && { env: serverData.env })
    };

    // Add to mcpServers
    const updatedConfig = {
      ...configState.config,
      mcpServers: {
        ...configState.config.mcpServers,
        [serverData.name]: newServer
      }
    };

    // Save to file
    await ConfigAPI.writeConfig(updatedConfig, configState.lastModified);

  } catch (error) {
    if (error.type === 'FILE_MODIFIED') {
      throw new Error('Configuration file was modified by another process. Please refresh and try again.');
    }
    throw new Error(`Failed to save server: ${error.message}`);
  }
}
```

## File Structure
```
src/renderer/
├── screens/
│   └── AddServerScreen.tsx
├── components/
│   ├── forms/
│   │   ├── AddServerForm.tsx
│   │   ├── ServerBasicInfoSection.tsx
│   │   ├── ServerArgsSection.tsx
│   │   └── ServerEnvSection.tsx
│   └── common/
│       ├── TextInput.tsx
│       └── ErrorMessage.tsx
├── services/
│   └── ServerFormValidator.ts
├── hooks/
│   └── useAddServerForm.ts
└── styles/
    └── AddServerForm.css
```

## Acceptance Criteria
- [ ] Form validates all required fields
- [ ] Server name uniqueness is checked
- [ ] Character limits are enforced
- [ ] Arguments can be added, edited, and removed
- [ ] Environment variables can be added, edited, and removed
- [ ] Form shows validation errors clearly
- [ ] Save operation handles file conflicts
- [ ] Cancel button discards changes with confirmation if needed
- [ ] Form is accessible with proper labels and ARIA attributes
- [ ] Loading states are shown during save operations

## Technical Notes
- Use debounced validation for better UX
- Implement proper form dirty state tracking
- Consider using React Hook Form for complex validation
- Ensure all form data is properly sanitized before saving
- Handle edge cases like empty arrays and objects