# MCP Manager

A desktop application for managing MCP (Model Context Protocol) servers in Claude Code projects.

## Features

- View and manage MCP servers for the current project
- Enable/disable servers
- Add new servers via form or JSON
- Edit existing server configurations
- Project-based configuration (reads from `~/.claude.json`)

## Installation

### Prerequisites

- Node.js 18 or higher
- npm

### Global Installation

There are several ways to install MCP Manager globally:

#### Option 1: Install from source (Recommended)

```bash
# Clone the repository
git clone https://github.com/teo-mateo/mcp-manager.git
cd mcp-manager

# Install dependencies
npm install

# Build the application
npm run build

# Install globally
npm install -g .

# Now you can run from any directory
cd /your/claude/project
mcp-manager
```

#### Option 2: npm link (for development)

```bash
# In the mcp-manager directory
npm install
npm run build
npm link

# Now you can run from any directory
cd /your/claude/project
mcp-manager
```

#### Option 3: Shell alias

Add this to your `~/.bashrc` or `~/.zshrc`:

```bash
alias mcp-manager='node /github/teo-mateo/mcp-manager/bin/mcp-manager.js'
```

Then reload your shell configuration:
```bash
source ~/.bashrc  # or ~/.zshrc
```

## Usage

After global installation, navigate to any Claude Code project directory and run:

```bash
mcp-manager
```

The application will:
1. Detect the current directory as the project path
2. Look for this project in `~/.claude.json`
3. Display and allow management of MCP servers for that specific project

If the project doesn't exist in `~/.claude.json`, you'll see an error message instructing you to open the project in Claude Code first to initialize it.

### Command Line Arguments

You can optionally specify a different project path:

```bash
mcp-manager /path/to/project
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# In another terminal, start Electron with the dev server
NODE_ENV=development npx electron .
```

### Build

```bash
# Build for production
npm run build

# Run production build
npm start
```

### Project Structure

- `src/main/` - Electron main process code
- `src/renderer/` - React renderer process code
- `src/shared/` - Shared types and utilities
- `dist/` - Compiled output
- `bin/` - Global executable script

## How It Works

MCP Manager is project-aware and integrates with Claude Code's configuration:

1. **Project Detection**: Uses the current working directory as the project path
2. **Configuration Reading**: Reads from `~/.claude.json` under `projects[projectPath].mcpServers`
3. **Scoped Management**: Only manages MCP servers for the current project
4. **Safe Updates**: Preserves all other projects and root-level configuration when saving

## Troubleshooting

### "Project not found" error

This means your current directory isn't registered as a project in Claude Code. To fix:
1. Open the project in Claude Code
2. This will initialize the project in `~/.claude.json`
3. Run `mcp-manager` again

### Application won't start globally

Ensure you've built the application and installed it correctly:
```bash
npm run build
npm install -g .
```

### Permission errors during global install

If you get permission errors, you can either:
- Use a Node version manager like nvm (recommended)
- Configure npm to use a different prefix: `npm config set prefix ~/.npm-global`
- Use sudo (not recommended): `sudo npm install -g .`

## Uninstalling

To uninstall the globally installed package:

```bash
npm uninstall -g mcp-manager
```

## License

ISC