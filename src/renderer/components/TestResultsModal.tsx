// Created by Claude Code on 2025-09-28
// TestResultsModal component for displaying MCP server test results
// Purpose: Show comprehensive test results with capabilities in a modal dialog

import React from 'react';
import { TestResult, McpTool, McpResource, McpPrompt } from '../../shared/mcpTypes';
import Button from './common/Button';

interface TestResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverName: string;
  testResult: TestResult | null;
}

const TestResultsModal: React.FC<TestResultsModalProps> = ({
  isOpen,
  onClose,
  serverName,
  testResult,
}) => {
  if (!isOpen || !testResult) return null;

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (date: Date): string => {
    return new Date(date).toLocaleString();
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Test Results: {serverName}
            </h2>
            <Button variant="secondary" onClick={onClose} className="text-sm">
              Close
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Test Status */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                testResult.success
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResult.success ? '✓ Passed' : '✗ Failed'}
              </span>
              <span className="ml-4 text-sm text-gray-600">
                Duration: {formatDuration(testResult.duration)}
              </span>
              <span className="ml-4 text-sm text-gray-600">
                Tested: {formatTimestamp(testResult.timestamp)}
              </span>
            </div>
          </div>

          {testResult.success ? (
            <div className="space-y-6">
              {/* Server Info */}
              {testResult.serverInfo && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Server Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-900">{testResult.serverInfo.name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Version:</span>
                        <span className="ml-2 text-gray-900">{testResult.serverInfo.version}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Protocol Version:</span>
                        <span className="ml-2 text-gray-900">{testResult.protocolVersion}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Capabilities Summary */}
              {testResult.capabilities && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Capabilities Summary</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {testResult.capabilities.tools.length}
                      </div>
                      <div className="text-sm text-blue-800">Tools</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {testResult.capabilities.resources.length}
                      </div>
                      <div className="text-sm text-green-800">Resources</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {testResult.capabilities.prompts.length}
                      </div>
                      <div className="text-sm text-purple-800">Prompts</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tools */}
              {testResult.capabilities?.tools && testResult.capabilities.tools.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Available Tools</h3>
                  <div className="space-y-2">
                    {testResult.capabilities.tools.map((tool: McpTool, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{tool.name}</span>
                            {tool.description && (
                              <span className="text-sm text-gray-600 ml-2">- {tool.description}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {testResult.capabilities?.resources && testResult.capabilities.resources.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Available Resources</h3>
                  <div className="space-y-3">
                    {testResult.capabilities.resources.map((resource: McpResource, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">{resource.name || resource.uri}</h4>
                        <p className="text-sm text-gray-600 mt-1 font-mono">{resource.uri}</p>
                        {resource.description && (
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                        )}
                        {resource.mimeType && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {resource.mimeType}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompts */}
              {testResult.capabilities?.prompts && testResult.capabilities.prompts.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Available Prompts</h3>
                  <div className="space-y-3">
                    {testResult.capabilities.prompts.map((prompt: McpPrompt, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">{prompt.name}</h4>
                        {prompt.description && (
                          <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
                        )}
                        {prompt.arguments && prompt.arguments.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-700">Arguments:</span>
                            <div className="mt-1 space-y-1">
                              {prompt.arguments.map((arg, argIndex) => (
                                <div key={argIndex} className="text-sm text-gray-600">
                                  <span className="font-mono bg-gray-100 px-1 rounded">{arg.name}</span>
                                  {arg.required && <span className="text-red-500 ml-1">*</span>}
                                  {arg.description && <span className="ml-2">- {arg.description}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Error Display */
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-800 mb-2">Test Failed</h3>
              <p className="text-red-700">{testResult.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResultsModal;