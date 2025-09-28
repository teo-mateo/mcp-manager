// Created by Claude Code on 2025-09-28
// ScopeToggle component for switching between project and global MCP servers
// Purpose: Provide UI control for switching configuration scope

import React from 'react';
import { ConfigScope } from '../../../shared/types';

interface ScopeToggleProps {
  currentScope: ConfigScope;
  onScopeChange: (scope: ConfigScope) => void;
  projectPath?: string;
  className?: string;
}

const ScopeToggle: React.FC<ScopeToggleProps> = ({
  currentScope,
  onScopeChange,
  projectPath,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => onScopeChange('project')}
          className={`px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
            currentScope === 'project'
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
          title={projectPath ? `Project: ${projectPath}` : 'Project Scope'}
        >
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Project
          </span>
        </button>
        <button
          onClick={() => onScopeChange('global')}
          className={`px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
            currentScope === 'global'
              ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
          title="Global: Applies to all projects"
        >
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Global
          </span>
        </button>
      </div>
      <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
        {currentScope === 'project' ? (
          <span className="font-mono text-xs">
            {projectPath ? projectPath.split('/').slice(-2).join('/') : 'Current Project'}
          </span>
        ) : (
          <span className="text-xs">All Projects</span>
        )}
      </div>
    </div>
  );
};

export default ScopeToggle;