# ✅ COMPLETED TASK 1: Project Setup & Infrastructure

## Overview
Initialize the Electron application with TypeScript support and basic development infrastructure for Linux and Windows platforms.

## Requirements
- Cross-platform Electron app (Linux/Windows)
- TypeScript support throughout
- Hot-reload for development
- Code quality tools (ESLint, Prettier)
- Main/renderer process architecture
- Basic file system access to ~/.claude.json

## Implementation Steps

### 1. Project Initialization
```bash
npm init -y
npm install electron --save-dev
npm install typescript @types/node --save-dev
```

### 2. TypeScript Configuration
- Create `tsconfig.json` for both main and renderer processes
- Configure separate builds for main/renderer
- Set up source maps for debugging

### 3. Electron Main Process
- Create `src/main/main.ts` - entry point
- Configure main window creation
- Set up IPC communication
- Implement basic menu structure

### 4. Renderer Process Setup
- Create `src/renderer/` directory structure
- Set up HTML entry point
- Configure bundler (Vite recommended)
- Basic React setup

### 5. Development Environment
- Hot-reload configuration
- Development scripts in package.json
- Build scripts for production

### 6. Code Quality Tools
- ESLint configuration
- Prettier setup
- Pre-commit hooks (optional)

### 7. File System Access
- Create utility for reading ~/.claude.json
- Handle different OS paths (Linux vs Windows)
- Basic error handling for file operations

## File Structure to Create
```
mcp-manager/
├── package.json
├── tsconfig.json
├── tsconfig.main.json
├── tsconfig.renderer.json
├── .eslintrc.js
├── .prettierrc
├── src/
│   ├── main/
│   │   ├── main.ts
│   │   └── preload.ts
│   ├── renderer/
│   │   ├── index.html
│   │   ├── index.ts
│   │   └── App.tsx
│   └── shared/
│       └── types.ts
├── build/
│   └── vite.config.ts
└── dist/ (created by build)
```

## Acceptance Criteria
- [ ] Electron app launches successfully
- [ ] Hot-reload works in development
- [ ] TypeScript compiles without errors
- [ ] Can read ~/.claude.json file
- [ ] Basic window with "Hello World" displays
- [ ] Build process works for both platforms
- [ ] Code passes ESLint/Prettier checks

## Technical Notes
- Use electron-builder for packaging (later tasks)
- Ensure Node.js APIs are available in main process only
- Use contextIsolation and disable nodeIntegration for security
- Set up IPC for secure communication between processes

## Dependencies to Install
```json
{
  "devDependencies": {
    "electron": "^latest",
    "typescript": "^latest",
    "@types/node": "^latest",
    "vite": "^latest",
    "@vitejs/plugin-react": "^latest",
    "eslint": "^latest",
    "@typescript-eslint/parser": "^latest",
    "@typescript-eslint/eslint-plugin": "^latest",
    "prettier": "^latest"
  },
  "dependencies": {
    "react": "^latest",
    "react-dom": "^latest",
    "@types/react": "^latest",
    "@types/react-dom": "^latest"
  }
}
```

## Scripts to Add
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:main\" \"npm run dev:renderer\"",
    "dev:main": "tsc -p tsconfig.main.json -w",
    "dev:renderer": "vite",
    "build": "npm run build:main && npm run build:renderer",
    "build:main": "tsc -p tsconfig.main.json",
    "build:renderer": "vite build",
    "start": "electron ./dist/main/main.js",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src"
  }
}
```