# MCP Manager Development Guide

## Project Overview

MCP Manager is an Electron-based desktop application for managing Model Context Protocol (MCP) servers in Claude Code projects. It provides a graphical interface for viewing, adding, configuring, enabling/disabling, and testing MCP servers with support for both project-specific and global server management.

## Current Architecture (2025-09-28)

### Application Structure

**Main Process** (`src/main/`)
- `main.ts` - Electron main process entry point with IPC handlers
- `preload.ts` - Secure bridge between main and renderer processes
- `services/` - Core business logic services:
  - `ConfigFileManager.ts` - Configuration file operations with atomic writes
  - `PathManager.ts` - Path resolution and validation
  - `FileOperations.ts` - Low-level file system operations
  - `ServerTester.ts` - MCP server testing and capability discovery
  - `McpClient.ts` - MCP protocol communication client

**Renderer Process** (`src/renderer/`)
- `App.tsx` - Main React application with navigation state
- `components/` - Reusable UI components:
  - `common/` - Generic UI components (Button, TextInput, ErrorMessage, etc.)
  - `layout/` - Layout components (Header, Sidebar, Layout)
  - `server/` - MCP server-specific components (ServerCard, ServerList, ServerForm)
- `screens/` - Full-page views:
  - `ServerListScreen.tsx` - Main server management interface
  - `AddServerJSONScreen.tsx` - JSON-based server addition
  - `AddServerScreen.tsx` - Form-based server addition
  - `EditServerScreen.tsx` - Server editing interface
- `hooks/` - React hooks for state management:
  - `useConfigScope.ts` - Scope switching (project/global)
  - `useProjectPath.ts` - Project path detection
  - `useServerList.ts` - Server list management
  - `useConfig.ts` - Configuration state management
- `services/` - Frontend service layer:
  - `configApi.ts` - API wrapper for configuration operations

**Shared Types** (`src/shared/`)
- `types.ts` - Core TypeScript interfaces and types
- `mcpTypes.ts` - MCP protocol-specific types
- `errors.ts` - Custom error classes and enums

### Configuration Management

**Dual Scope Support**
- **Project Scope**: Manages MCP servers for specific Claude Code projects
- **Global Scope**: Manages MCP servers that apply to all projects
- **Scope Toggle**: UI component allowing users to switch between scopes

**Configuration Structure** (`~/.claude.json`)
```json
{
  "projects": {
    "/absolute/path/to/project": {
      "mcpServers": { /* active servers */ },
      "mcpServers_disabled": { /* disabled servers */ },
      // ... other project settings
    }
  },
  "mcpServers": { /* global active servers */ },
  "mcpServers_disabled": { /* global disabled servers */ },
  // ... other root-level settings
}
```

**Key Features**
- Project path detection from `process.cwd()` or command-line arguments
- Atomic file operations with backup creation
- Timestamp-based conflict detection
- Preserves all existing configuration data when updating
- Graceful error handling for missing or invalid configurations

### Implemented Features

**Core Functionality**
- ✅ Project-based and global MCP server management
- ✅ Server listing with enabled/disabled states
- ✅ JSON-based server addition with validation
- ✅ MCP server testing and capability discovery
- ✅ Real-time scope switching (project ↔ global)
- ✅ Configuration conflict detection and error handling
- ✅ Global CLI installation (`mcp-manager` command)

**User Interface**
- ✅ Modern React-based UI with Tailwind CSS
- ✅ Responsive layout with sidebar navigation
- ✅ Server cards showing configuration details
- ✅ Test result modals with capability information
- ✅ Error messages with retry functionality
- ✅ Project path display and status indicators

**Technical Features**
- ✅ Secure IPC communication between main/renderer processes
- ✅ TypeScript throughout with comprehensive type safety
- ✅ Atomic file operations with backup creation
- ✅ Development/production configuration separation
- ✅ Hot-reload development environment

### IPC Communication Patterns

**Channel Architecture**
```typescript
// Main process handlers
IPC_CHANNELS.READ_CLAUDE_CONFIG → ConfigFileManager.readConfig()
IPC_CHANNELS.WRITE_CLAUDE_CONFIG → ConfigFileManager.writeConfig()
IPC_CHANNELS.READ_GLOBAL_CONFIG → GlobalConfigManager.readConfig()
IPC_CHANNELS.TEST_MCP_SERVER → ServerTester.testServer()
IPC_CHANNELS.ADD_MCP_SERVER → ConfigFileManager.addServer()
```

**Data Flow**
1. Renderer requests data via `window.electronAPI`
2. Main process handles request through IPC handlers
3. Services perform business logic and file operations
4. Results returned to renderer through secure preload bridge
5. React hooks manage state updates and UI re-rendering

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

## Development Guidelines

### Build System & Structure

**Build Output**
- Main process: `dist/main/main/` (TypeScript compilation)
- Renderer process: `dist/renderer/` (Vite build)
- Entry point: `./dist/main/main/main.js`
- Global CLI: `bin/mcp-manager.js`

**Development Scripts**
```bash
npm run dev         # Start both main (tsc -w) and renderer (vite) in watch mode
npm run build       # Build both processes for production
npm run start       # Run production build
npm run lint        # ESLint validation
npm run format      # Prettier formatting
```

**Project Structure Standards**
- Main process services: `src/main/services/`
- React components: `src/renderer/components/`
- Shared types: `src/shared/`
- UI screens: `src/renderer/screens/`
- React hooks: `src/renderer/hooks/`

### TypeScript Standards

**Type Safety**
- Use `unknown` instead of `any` for dynamic JSON data
- Cast to specific interfaces after validation
- Add `readonly` modifiers for immutable data
- Comprehensive error typing with custom error classes

**Code Organization**
- Shared types in `src/shared/types.ts`
- MCP-specific types in `src/shared/mcpTypes.ts`
- Custom errors in `src/shared/errors.ts`
- Forward-looking ESLint disables for unused exports

### Configuration Management Standards

**File Operations**
- Atomic writes (temp file + rename) for all config updates
- Automatic backup creation before modifications
- Timestamp-based conflict detection
- Graceful handling of missing or corrupted files
- Preserve all existing configuration when updating

**Error Handling**
- ConfigFileError class with typed error categories
- PROJECT_NOT_FOUND errors with helpful user guidance
- Validation at all service boundaries
- Error chaining for debugging

**Data Validation**
- JSON parsing with try-catch and meaningful errors
- Schema validation for MCP server configurations
- Initialize missing sections automatically
- Preserve unknown properties in configurations

## Installation & Usage

### Prerequisites
- Node.js 18 or higher
- npm package manager
- Claude Code (for project initialization)

### Installation Options

**Option 1: Global Installation (Recommended)**
```bash
# Clone and build
git clone https://github.com/teo-mateo/mcp-manager.git
cd mcp-manager
npm install
npm run build

# Install globally
npm install -g .

# Use from any directory
cd /your/claude/project
mcp-manager
```

**Option 2: Development Link**
```bash
# In mcp-manager directory
npm install && npm run build && npm link

# Use from any directory
mcp-manager
```

**Option 3: Shell Alias**
```bash
# Add to ~/.bashrc or ~/.zshrc
alias mcp-manager='node /path/to/mcp-manager/bin/mcp-manager.js'
```

### Development Workflow

**Development Mode** (with hot-reload)
```bash
# Terminal 1: Start build watchers
npm run dev

# Terminal 2: Run Electron app
NODE_ENV=development npx electron .
```

**Production Testing**
```bash
npm run build
npm start
```

**Code Quality**
```bash
npm run lint      # Check for linting errors
npm run format    # Auto-format code with Prettier
```

### Command Line Usage

```bash
# Use current directory as project path
mcp-manager

# Specify project path explicitly
mcp-manager /path/to/claude/project

# Development mode (uses test config)
NODE_ENV=development mcp-manager
```

## Configuration Environment

### File Locations
- **Production**: `~/.claude.json` (Claude Code's config file)
- **Development**: `test-claude-config.json` (local test file)

### Project Requirements
- Projects must exist in Claude Code's configuration before management
- MCP Manager preserves all existing Claude Code settings
- Only modifies MCP server sections (`mcpServers`, `mcpServers_disabled`)

### Scope Management
- **Project Scope**: Servers specific to current project directory
- **Global Scope**: Servers available to all Claude Code projects
- **Scope Toggle**: Real-time switching between project and global views

## Troubleshooting

**"Project not found" Error**
- Ensure the project is opened in Claude Code first
- Check that the directory path matches exactly
- Try switching to Global scope to manage global servers

**Permission Errors During Global Install**
- Use Node version manager (nvm) instead of system Node
- Configure npm prefix: `npm config set prefix ~/.npm-global`
- Avoid using sudo with npm install

**Application Won't Start**
- Verify build completed successfully: `npm run build`
- Check that global installation worked: `npm list -g mcp-manager`
- Try running with explicit path: `node /path/to/bin/mcp-manager.js`

## Technical Architecture Notes

- **Security**: Secure IPC with context isolation and no node integration in renderer
- **Performance**: Lazy loading of configurations, cached file operations
- **Reliability**: Atomic file writes, backup creation, conflict detection
- **Compatibility**: Works with Claude Code's existing configuration structure
- **Extensibility**: Modular service architecture for future enhancements