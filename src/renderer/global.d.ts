// Created by Claude Code on 2025-09-27
// Global type declarations for renderer process
// Purpose: Declare window.electronAPI interface for TypeScript
// Updated 2025-09-28: Added global config support

import { ElectronAPI } from '../main/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}