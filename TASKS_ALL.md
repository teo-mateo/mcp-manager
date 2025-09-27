# MCP Server Manager - All Development Tasks

## Project Overview
Build a cross-platform Electron application for Linux & Windows to manage MCP servers in Claude Code's ~/.claude.json configuration file.

## Complete Task List

### ✅ COMPLETED TASK 1: Project Setup & Infrastructure
**File: COMPLETED_TASK1_Project_Setup.md**
- Initialize Electron project with TypeScript
- Configure build system for Linux/Windows
- Set up development environment with hot-reload
- Configure ESLint, Prettier
- Set up main/renderer process architecture
- Implement basic file system access

### TASK 2: UI Screens (No Functionality)
**File: TASK2_UI_Screens.md**
- Create main window layout
- Design server list view
- Create add server form
- Create JSON editor view
- Create edit server form
- Add basic navigation between screens
- Implement basic styling (single theme)

### ✅ COMPLETED TASK 3: File Operations
**File: COMPLETED_TASK3_File_Operations.md**
- Implement ~/.claude.json reading
- Implement safe JSON writing with backup
- Add file modification timestamp checking
- Handle file corruption scenarios
- Create mcpServers_disabled section if needed

### TASK 4: List Servers Feature
**File: TASK4_List_Servers.md**
- Display all servers from mcpServers
- Display disabled servers from mcpServers_disabled
- Show server details (name, command, args, env)
- Visual distinction between active/disabled
- Navigation to edit screens

### TASK 5: Add Server - Form Mode
**File: TASK5_Add_Server_Form.md**
- Name input (required, max 50 chars)
- Command input (required, max 255 chars)
- Dynamic args array editor
- Environment variables key-value editor
- Form validation
- Save to ~/.claude.json

### TASK 6: Add Server - JSON Mode
**File: TASK6_Add_Server_JSON.md**
- JSON editor with syntax highlighting
- Real-time JSON validation
- Schema validation for MCP server structure
- Save valid JSON to ~/.claude.json

### TASK 7: Edit Server Functionality
**File: TASK7_Edit_Server.md**
- Load existing server configuration
- Edit all fields (name, command, args, env)
- Array manipulation for args (add/remove/reorder)
- Key-value editor for env variables
- Validate and save changes

### TASK 8: Toggle Server (Enable/Disable)
**File: TASK8_Toggle_Server.md**
- Move servers between mcpServers and mcpServers_disabled
- Maintain configuration during state change
- Visual feedback for operations
- Error handling

### TASK 9: Testing & Validation
**File: TASK9_Testing.md**
- Unit tests for JSON operations
- Integration tests for file operations
- UI functionality testing
- Error scenario validation
- Cross-platform testing (Linux/Windows)

## Technical Stack
- **Framework**: Electron with TypeScript
- **UI**: React with basic CSS
- **JSON Editor**: Monaco Editor
- **Build Tool**: Vite or Webpack
- **Testing**: Jest

## File Structure
```
mcp-manager/
├── src/
│   ├── main/           # Main process (Node.js)
│   ├── renderer/       # Renderer process (Browser/React)
│   ├── shared/         # Shared types & utilities
│   └── assets/         # Static assets
├── tests/              # Test files
├── build/              # Build configurations
└── dist/               # Built application
```

## Development Order
Tasks should be completed in numerical order (1-9) as each builds upon the previous ones.