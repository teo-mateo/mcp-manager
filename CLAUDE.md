# MCP Manager Development Rules

## Project Architecture Update (2025-09-28)

### Project-Based Configuration Management
The application now correctly handles Claude Code's project-based configuration structure:

- **Configuration Structure**: `~/.claude.json` contains a `projects` object where each project is keyed by its absolute path
- **Project Detection**: The app uses the current working directory as the project path (or accepts it as a command-line argument)
- **Scoped Operations**: All MCP server operations are scoped to the specific project, preserving other projects' configurations
- **Error Handling**: Shows appropriate error when a project doesn't exist in the configuration

### Key Implementation Details
- `ConfigFileManager` is initialized with a project path and only manages that project's MCP servers
- The main process detects the project path from `process.cwd()` or command-line arguments
- IPC channels pass project context between main and renderer processes
- UI displays the current project path and provides helpful error messages for uninitialized projects

## Task Completion Protocol

When a task is completed:
1. **Test the implementation thoroughly** - If working on a task defined in a file, test it yourself before saying it's ready
   - **CRITICAL**: Just not crashing at startup does NOT mean it runs correctly
   - Verify actual functionality works as specified in the task requirements
   - Test user interactions, data loading, error handling, etc.
   - Only mark as complete when you've verified the feature actually works
2. Rename the task file to prefix with "COMPLETED_" (e.g., `TASK1_Project_Setup.md` → `COMPLETED_TASK1_Project_Setup.md`)
3. Add a ✅ checkmark to the task title in both the task file and TASKS_ALL.md
4. Update any references to the task file in documentation

This helps track progress and maintain a clear overview of what has been accomplished in the project.

## Development Guidelines (Updated after Task 3)

### TypeScript Best Practices
- Use `unknown` instead of `any` for dynamic JSON data, then cast to specific types
- Add `readonly` modifiers to error class properties to prevent accidental mutation
- Use ESLint disable comments for forward-looking code that will be used in future tasks:
  ```typescript
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export enum ConfigError { ... }
  ```

### Build and File Structure
- TypeScript compilation outputs to `dist/main/main/` (double main directory)
- Correct Electron startup path: `./dist/main/main/main.js`
- Services should be organized in `src/main/services/` for main process utilities
- Global executable script in `bin/mcp-manager.js` for running from any directory

### Error Handling Philosophy
- Create specific error types with context information
- Use ConfigFileError class with type enum for categorized error handling
- Always include original error in error chain for debugging
- Validate data at service boundaries (file operations, IPC handlers)
- Handle PROJECT_NOT_FOUND errors with helpful user guidance

### Incremental Development Approach
- It's acceptable to create error types and interfaces before all are used
- Focus on functionality first, then clean up linting issues
- Build layer by layer: types → services → IPC → UI integration

### Testing Strategy
- File operations should be tested with the actual file system (not mocked for now)
- Electron app timeout during testing indicates successful startup
- Build success + lint warnings (not errors) is acceptable for incremental development
- Test with different project paths to verify project-based configuration works

### File Operations Standards
- Always use atomic writes (temp file + rename) for configuration files
- Create backups before modifying existing files
- Check file modification timestamps to detect external changes
- Initialize missing configuration sections automatically
- Preserve all other projects and root-level properties when updating

## Running the Application

### Global Installation
The application can be installed globally using npm:
```bash
# Build the application
npm run build

# Install globally
npm install -g .

# Run from any project directory
cd /your/claude/project
mcp-manager
```

### Development Mode
To run the app with hot-reload for both main and renderer processes:
1. Run `npm run dev` - This starts both TypeScript compiler in watch mode and Vite dev server
2. In a separate terminal, run the Electron app:
   ```bash
   NODE_ENV=development npx electron .
   ```

### Production Mode
- Build first: `npm run build`
- Then run: `npm start` (loads the built renderer from dist/)
- Note: Ensure the dev server is NOT running when testing production builds

### Testing Different Projects
To test the app with different project paths:
```bash
# Test with current directory
mcp-manager

# Test with specific project path
mcp-manager /path/to/project

# Test with development config
NODE_ENV=development mcp-manager
```

## Configuration File Handling

### Development vs Production
- **Development**: Uses `test-claude-config.json` in the project root
- **Production**: Uses `~/.claude.json` in the user's home directory

### Project Structure in ~/.claude.json
```json
{
  "projects": {
    "/absolute/path/to/project": {
      "mcpServers": {
        "server-name": {
          "command": "node",
          "args": ["server.js"],
          "env": {}
        }
      },
      "mcpServers_disabled": {},
      // ... other project-specific settings
    }
  },
  // ... other root-level settings
}
```

## Important Notes

- The application is designed to work per-project, matching Claude Code's configuration structure
- Projects must be initialized in Claude Code first before they can be managed by this tool
- All changes preserve the full configuration structure, only modifying the specific project's MCP servers
- The global installation allows running the app from any directory without navigating to the installation path