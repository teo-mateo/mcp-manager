# MCP Manager Development Rules

## Task Completion Protocol

When a task is completed:
1. Rename the task file to prefix with "COMPLETED_" (e.g., `TASK1_Project_Setup.md` → `COMPLETED_TASK1_Project_Setup.md`)
2. Add a ✅ checkmark to the task title in both the task file and TASKS_ALL.md
3. Update any references to the task file in documentation

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

### Error Handling Philosophy
- Create specific error types with context information
- Use ConfigFileError class with type enum for categorized error handling
- Always include original error in error chain for debugging
- Validate data at service boundaries (file operations, IPC handlers)

### Incremental Development Approach
- It's acceptable to create error types and interfaces before all are used
- Focus on functionality first, then clean up linting issues
- Build layer by layer: types → services → IPC → UI integration

### Testing Strategy
- File operations should be tested with the actual file system (not mocked for now)
- Electron app timeout during testing indicates successful startup
- Build success + lint warnings (not errors) is acceptable for incremental development

### File Operations Standards
- Always use atomic writes (temp file + rename) for configuration files
- Create backups before modifying existing files
- Check file modification timestamps to detect external changes
- Initialize missing configuration sections automatically