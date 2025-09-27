# TASK 6: Add Server - JSON Mode

## Overview
Implement a JSON editor interface for adding MCP servers with syntax highlighting, real-time validation, and schema checking for advanced users who prefer direct JSON editing.

## Requirements
- JSON editor with syntax highlighting
- Real-time JSON validation
- Schema validation for MCP server structure
- Toggle between Form and JSON modes
- Save valid JSON to ~/.claude.json
- Error highlighting and messages

## Core Functionality

### 1. JSON Editor Integration
```typescript
interface JSONEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (errors: ValidationError[]) => void;
  readOnly?: boolean;
  height?: number;
}

interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

interface JSONEditorState {
  content: string;
  isValid: boolean;
  errors: ValidationError[];
  parsedData: any;
  hasChanges: boolean;
}
```

### 2. Server Schema Validation
```typescript
interface MCPServerSchema {
  type: 'object';
  properties: {
    command: { type: 'string'; minLength: 1; maxLength: 255 };
    args?: { type: 'array'; items: { type: 'string'; maxLength: 255 } };
    env?: {
      type: 'object';
      patternProperties: {
        '^[a-zA-Z_][a-zA-Z0-9_]*$': { type: 'string' }
      };
      additionalProperties: false;
    };
  };
  required: ['command'];
  additionalProperties: false;
}

class JSONServerValidator {
  private schema: MCPServerSchema;

  validateServerJSON(jsonString: string): ValidationResult {
    try {
      // Parse JSON
      const parsed = JSON.parse(jsonString);

      // Validate structure
      if (typeof parsed !== 'object' || parsed === null) {
        return {
          isValid: false,
          errors: [{ message: 'Root must be an object', line: 1, column: 1, severity: 'error' }]
        };
      }

      // Check for single server entry
      const serverNames = Object.keys(parsed);
      if (serverNames.length !== 1) {
        return {
          isValid: false,
          errors: [{
            message: 'JSON must contain exactly one server definition',
            line: 1,
            column: 1,
            severity: 'error'
          }]
        };
      }

      const serverName = serverNames[0];
      const serverConfig = parsed[serverName];

      // Validate server name
      const nameErrors = this.validateServerName(serverName);

      // Validate server config
      const configErrors = this.validateServerConfig(serverConfig);

      const allErrors = [...nameErrors, ...configErrors];

      return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        parsedData: { name: serverName, config: serverConfig }
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [{
          message: `Invalid JSON: ${error.message}`,
          line: this.getErrorLine(error, jsonString),
          column: 1,
          severity: 'error'
        }]
      };
    }
  }

  private validateServerName(name: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!name || name.length === 0) {
      errors.push({ message: 'Server name cannot be empty', line: 1, column: 1, severity: 'error' });
    } else if (name.length > 50) {
      errors.push({ message: 'Server name must be 50 characters or less', line: 1, column: 1, severity: 'error' });
    } else if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      errors.push({
        message: 'Server name can only contain letters, numbers, hyphens, and underscores',
        line: 1,
        column: 1,
        severity: 'error'
      });
    }

    return errors;
  }

  private validateServerConfig(config: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (typeof config !== 'object' || config === null) {
      errors.push({ message: 'Server configuration must be an object', line: 1, column: 1, severity: 'error' });
      return errors;
    }

    // Validate command
    if (!config.command) {
      errors.push({ message: 'Command is required', line: 1, column: 1, severity: 'error' });
    } else if (typeof config.command !== 'string') {
      errors.push({ message: 'Command must be a string', line: 1, column: 1, severity: 'error' });
    } else if (config.command.length > 255) {
      errors.push({ message: 'Command must be 255 characters or less', line: 1, column: 1, severity: 'error' });
    }

    // Validate args
    if (config.args !== undefined) {
      if (!Array.isArray(config.args)) {
        errors.push({ message: 'Arguments must be an array', line: 1, column: 1, severity: 'error' });
      } else {
        config.args.forEach((arg: any, index: number) => {
          if (typeof arg !== 'string') {
            errors.push({ message: `Argument ${index + 1} must be a string`, line: 1, column: 1, severity: 'error' });
          } else if (arg.length > 255) {
            errors.push({ message: `Argument ${index + 1} must be 255 characters or less`, line: 1, column: 1, severity: 'error' });
          }
        });
      }
    }

    // Validate env
    if (config.env !== undefined) {
      if (typeof config.env !== 'object' || config.env === null || Array.isArray(config.env)) {
        errors.push({ message: 'Environment variables must be an object', line: 1, column: 1, severity: 'error' });
      } else {
        Object.entries(config.env).forEach(([key, value]) => {
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
            errors.push({ message: `Invalid environment variable name: ${key}`, line: 1, column: 1, severity: 'error' });
          }
          if (typeof value !== 'string') {
            errors.push({ message: `Environment variable ${key} must have a string value`, line: 1, column: 1, severity: 'error' });
          }
        });
      }
    }

    return errors;
  }
}
```

## UI Components

### JSON Editor Component
```typescript
import MonacoEditor from '@monaco-editor/react';

function JSONServerEditor() {
  const [editorState, setEditorState] = useState<JSONEditorState>({
    content: JSON.stringify({
      'my-server': {
        command: 'npx',
        args: ['-y', 'my-mcp-server'],
        env: {
          'MY_ENV_VAR': 'value'
        }
      }
    }, null, 2),
    isValid: true,
    errors: [],
    parsedData: null,
    hasChanges: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validator = new JSONServerValidator();
  const navigate = useNavigate();

  const validateContent = useCallback((content: string) => {
    const result = validator.validateServerJSON(content);

    setEditorState(prev => ({
      ...prev,
      isValid: result.isValid,
      errors: result.errors,
      parsedData: result.parsedData,
      hasChanges: content !== prev.content
    }));

    return result;
  }, [validator]);

  const handleEditorChange = useCallback((value: string = '') => {
    setEditorState(prev => ({ ...prev, content: value }));

    // Debounced validation
    const timeoutId = setTimeout(() => {
      validateContent(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [validateContent]);

  const handleSubmit = async () => {
    if (!editorState.isValid || !editorState.parsedData) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await saveServerFromJSON(editorState.parsedData);
      navigate('/');
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(editorState.content);
      const formatted = JSON.stringify(parsed, null, 2);
      setEditorState(prev => ({ ...prev, content: formatted }));
      validateContent(formatted);
    } catch (error) {
      // Invalid JSON, can't format
    }
  };

  return (
    <div className="json-editor-screen">
      <header className="editor-header">
        <div className="header-left">
          <h2>Add Server - JSON Mode</h2>
          <div className="mode-toggle">
            <Button
              variant="secondary"
              onClick={() => navigate('/add')}
            >
              Switch to Form Mode
            </Button>
          </div>
        </div>

        <div className="header-actions">
          <Button
            variant="secondary"
            onClick={formatJSON}
            disabled={!editorState.content}
          >
            Format JSON
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!editorState.isValid || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Server'}
          </Button>
        </div>
      </header>

      {submitError && (
        <div className="error-banner">
          <strong>Save Error:</strong> {submitError}
        </div>
      )}

      <div className="editor-content">
        <div className="editor-main">
          <MonacoEditor
            height="400px"
            language="json"
            value={editorState.content}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true
            }}
            theme="vs"
          />
        </div>

        <div className="editor-sidebar">
          <ValidationPanel
            isValid={editorState.isValid}
            errors={editorState.errors}
            parsedData={editorState.parsedData}
          />

          <ExamplePanel />
        </div>
      </div>
    </div>
  );
}
```

### Validation Panel Component
```typescript
interface ValidationPanelProps {
  isValid: boolean;
  errors: ValidationError[];
  parsedData: any;
}

function ValidationPanel({ isValid, errors, parsedData }: ValidationPanelProps) {
  return (
    <div className="validation-panel">
      <div className="validation-status">
        <h3>Validation</h3>
        <div className={`status-indicator ${isValid ? 'valid' : 'invalid'}`}>
          {isValid ? (
            <>
              <CheckIcon /> Valid JSON
            </>
          ) : (
            <>
              <ErrorIcon /> {errors.length} Error{errors.length !== 1 ? 's' : ''}
            </>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="error-list">
          <h4>Errors:</h4>
          {errors.map((error, index) => (
            <div key={index} className={`error-item ${error.severity}`}>
              <div className="error-location">
                Line {error.line}, Column {error.column}
              </div>
              <div className="error-message">{error.message}</div>
            </div>
          ))}
        </div>
      )}

      {isValid && parsedData && (
        <div className="parsed-preview">
          <h4>Preview:</h4>
          <div className="preview-content">
            <div className="preview-item">
              <strong>Name:</strong> {parsedData.name}
            </div>
            <div className="preview-item">
              <strong>Command:</strong> {parsedData.config.command}
            </div>
            {parsedData.config.args && (
              <div className="preview-item">
                <strong>Arguments:</strong> {parsedData.config.args.length} item{parsedData.config.args.length !== 1 ? 's' : ''}
              </div>
            )}
            {parsedData.config.env && (
              <div className="preview-item">
                <strong>Environment:</strong> {Object.keys(parsedData.config.env).length} variable{Object.keys(parsedData.config.env).length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Example Panel Component
```typescript
function ExamplePanel() {
  const [selectedExample, setSelectedExample] = useState<string>('basic');

  const examples = {
    basic: {
      title: 'Basic Server',
      description: 'Simple server with just a command',
      json: {
        'my-server': {
          command: 'npx'
        }
      }
    },
    withArgs: {
      title: 'Server with Arguments',
      description: 'Server with command line arguments',
      json: {
        'searxng': {
          command: 'npx',
          args: ['-y', 'mcp-searxng']
        }
      }
    },
    withEnv: {
      title: 'Server with Environment',
      description: 'Server with environment variables',
      json: {
        'my-server': {
          command: 'node',
          args: ['/path/to/server.js'],
          env: {
            'NODE_ENV': 'production',
            'DEBUG': 'true'
          }
        }
      }
    }
  };

  const insertExample = (exampleKey: string) => {
    const example = examples[exampleKey];
    if (example) {
      const jsonString = JSON.stringify(example.json, null, 2);
      // This would typically be connected to the editor state
      console.log('Insert example:', jsonString);
    }
  };

  return (
    <div className="example-panel">
      <h3>Examples</h3>

      <div className="example-selector">
        {Object.entries(examples).map(([key, example]) => (
          <button
            key={key}
            className={`example-option ${selectedExample === key ? 'selected' : ''}`}
            onClick={() => setSelectedExample(key)}
          >
            {example.title}
          </button>
        ))}
      </div>

      {selectedExample && (
        <div className="example-content">
          <div className="example-description">
            {examples[selectedExample].description}
          </div>

          <pre className="example-code">
            {JSON.stringify(examples[selectedExample].json, null, 2)}
          </pre>

          <Button
            variant="secondary"
            size="small"
            onClick={() => insertExample(selectedExample)}
          >
            Use This Example
          </Button>
        </div>
      )}
    </div>
  );
}
```

## Save Logic

### Save Server from JSON
```typescript
async function saveServerFromJSON(parsedData: { name: string; config: MCPServer }): Promise<void> {
  try {
    // Check if server name already exists
    const configState = await ConfigAPI.readConfig();
    const allServers = {
      ...configState.config.mcpServers,
      ...configState.config.mcpServers_disabled
    };

    if (allServers[parsedData.name]) {
      throw new Error(`A server with the name "${parsedData.name}" already exists`);
    }

    // Add to mcpServers
    const updatedConfig = {
      ...configState.config,
      mcpServers: {
        ...configState.config.mcpServers,
        [parsedData.name]: parsedData.config
      }
    };

    // Save to file
    await ConfigAPI.writeConfig(updatedConfig, configState.lastModified);

  } catch (error) {
    if (error.type === 'FILE_MODIFIED') {
      throw new Error('Configuration file was modified by another process. Please refresh and try again.');
    }
    throw error;
  }
}
```

## File Structure
```
src/renderer/
├── screens/
│   └── AddServerJSONScreen.tsx
├── components/
│   ├── json-editor/
│   │   ├── JSONServerEditor.tsx
│   │   ├── ValidationPanel.tsx
│   │   └── ExamplePanel.tsx
│   └── common/
│       └── MonacoEditor.tsx
├── services/
│   └── JSONServerValidator.ts
└── styles/
    └── JSONEditor.css
```

## Styling
```css
.json-editor-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
  background: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.editor-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  min-height: 0;
}

.editor-main {
  border-right: 1px solid #e1e5e9;
}

.editor-sidebar {
  padding: 20px;
  background: #f8f9fa;
  overflow-y: auto;
}

.validation-panel,
.example-panel {
  margin-bottom: 30px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.status-indicator.valid {
  color: #28a745;
}

.status-indicator.invalid {
  color: #dc3545;
}

.error-list {
  margin-top: 15px;
}

.error-item {
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  border-left: 4px solid #dc3545;
  background: #f8d7da;
}

.error-location {
  font-size: 12px;
  color: #721c24;
  font-weight: 500;
}

.error-message {
  margin-top: 4px;
  color: #721c24;
}

.example-code {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  overflow-x: auto;
  margin: 10px 0;
}
```

## Acceptance Criteria
- [ ] Monaco editor loads with JSON syntax highlighting
- [ ] Real-time validation shows errors as user types
- [ ] Schema validation catches all invalid server configurations
- [ ] Examples panel provides working templates
- [ ] Format JSON button properly formats valid JSON
- [ ] Save operation validates server name uniqueness
- [ ] Error messages are clear and actionable
- [ ] Can switch between Form and JSON modes
- [ ] Handles large JSON files without performance issues
- [ ] Preserves user's formatting preferences

## Technical Notes
- Use Monaco Editor for professional code editing experience
- Implement proper JSON schema validation
- Consider using JSON Schema libraries for validation
- Add keyboard shortcuts for common operations
- Ensure proper error handling for malformed JSON