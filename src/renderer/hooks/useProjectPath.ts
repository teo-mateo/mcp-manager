// Created by Claude Code on 2025-09-28
// useProjectPath hook for getting the current project path
// Purpose: Retrieve and provide the project path to UI components

import { useState, useEffect } from 'react';
import { ConfigAPI } from '../services/configApi';

export function useProjectPath() {
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjectPath() {
      try {
        const path = await ConfigAPI.getProjectPath();
        setProjectPath(path);
        setError(null);
      } catch (err) {
        console.error('Failed to get project path:', err);
        setError(err instanceof Error ? err.message : 'Failed to get project path');
      } finally {
        setLoading(false);
      }
    }

    fetchProjectPath();
  }, []);

  return { projectPath, loading, error };
}