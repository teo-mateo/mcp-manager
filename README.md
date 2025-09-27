# MCP Manager

A cross-platform Electron application for managing MCP (Model Context Protocol) servers in Claude Code's configuration.

## Overview

MCP Manager provides a user-friendly interface to manage MCP servers in your `~/.claude.json` configuration file. It allows you to:

- View all configured MCP servers
- Add new servers via form or JSON editor
- Edit existing server configurations
- Enable/disable servers
- Validate server configurations

## Development Status

✅ **TASK 1: Project Setup & Infrastructure** - COMPLETED
- Electron + TypeScript setup
- React + Vite renderer process
- ESLint + Prettier configuration
- File system utilities for ~/.claude.json access
- Cross-platform build configuration

🔄 **Next: TASK 2: UI Screens** - Planned

## Tech Stack

- **Framework**: Electron with TypeScript
- **UI**: React with Vite
- **Code Quality**: ESLint + Prettier
- **Build**: TypeScript Compiler + Vite

## Development

### Prerequisites

- Node.js (latest LTS version)
- npm

### Setup

```bash
# Install dependencies
npm install

# Development mode (with hot-reload)
npm run dev

# Build for production
npm run build

# Start built application
npm start

# Code quality
npm run lint
npm run format
```

### Project Structure

```
mcp-manager/
├── src/
│   ├── main/           # Main process (Node.js)
│   │   ├── main.ts     # Electron main process
│   │   └── preload.ts  # Preload script for IPC
│   ├── renderer/       # Renderer process (Browser/React)
│   │   ├── index.html  # HTML entry point
│   │   ├── index.tsx   # React entry point
│   │   └── App.tsx     # Main React component
│   └── shared/         # Shared types & utilities
│       └── types.ts    # TypeScript interfaces
├── dist/               # Built application
└── build configs...
```

## Features (Planned)

- Server list view with active/disabled status
- Add server form with validation
- JSON editor for advanced configuration
- Server enable/disable toggle
- Safe file operations with backup
- Cross-platform support (Linux/Windows)

## License

ISC