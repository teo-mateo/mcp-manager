#!/usr/bin/env node

// Created by Claude Code on 2025-09-28
// Global executable script for MCP Manager
// Purpose: Launch the Electron app from any directory with proper project path detection

const { spawn } = require('child_process');
const path = require('path');

// Get the directory where this package is installed
const appDir = path.resolve(__dirname, '..');
const electronPath = path.join(appDir, 'node_modules', '.bin', 'electron');
const mainPath = path.join(appDir, 'dist', 'main', 'main', 'main.js');

// Pass the current working directory as the project path
const args = [mainPath, process.cwd()];

// Preserve environment variables but ensure NODE_ENV is set appropriately
const env = { ...process.env };
if (!env.NODE_ENV) {
  env.NODE_ENV = 'production';
}

console.log(`Starting MCP Manager for project: ${process.cwd()}`);

// Spawn the Electron process
const electronProcess = spawn(electronPath, args, {
  env,
  stdio: 'inherit',
  shell: false
});

electronProcess.on('close', (code) => {
  process.exit(code);
});

electronProcess.on('error', (err) => {
  console.error('Failed to start MCP Manager:', err);
  process.exit(1);
});