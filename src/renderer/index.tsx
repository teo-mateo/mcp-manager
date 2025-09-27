// Created by Claude Code on 2025-09-27
// Renderer process entry point for MCP Manager
// Purpose: Initialize React application and render main App component

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<App />);
