# Task: Add Comprehensive MCP Server Testing with Capabilities Discovery

## Overview
Implement a comprehensive testing feature that not only checks if a server works but also discovers and displays all its capabilities (tools, resources, prompts) using the MCP protocol's JSON-RPC methods.

## Implementation Steps

### 1. Create MCP Protocol Types (`src/shared/mcpTypes.ts`)
- Define JSON-RPC message types (request, response, error)
- Define MCP-specific types for:
  - Initialize request/response with capabilities
  - Tools/Resources/Prompts list responses
  - Server metadata and capabilities
- Create TestResult interface with detailed capability information

### 2. Create MCP Client Service (`src/main/services/McpClient.ts`)
- Implement JSON-RPC communication over stdio
- Handle request/response correlation with unique IDs
- Implement timeout handling (10 seconds for full test)
- Parse and validate JSON-RPC responses
- Methods:
  - `initialize()` - Handshake and capability negotiation
  - `listTools()` - Get available tools
  - `listResources()` - Get available resources
  - `listPrompts()` - Get available prompts
  - `ping()` - Basic connectivity test

### 3. Create Server Tester Service (`src/main/services/ServerTester.ts`)
- Spawn server process with configured command/args/env
- Create McpClient instance for communication
- Execute comprehensive test sequence:
  1. Start server process
  2. Initialize connection and get capabilities
  3. Query tools, resources, and prompts
  4. Compile results into detailed report
- Handle errors gracefully at each step
- Clean up processes on completion/failure

### 4. Add IPC Channels
- Add `TEST_MCP_SERVER` channel to types
- Implement IPC handler in main.ts
- Update preload script to expose testServer API

### 5. Create Test Results Modal (`src/renderer/components/TestResultsModal.tsx`)
- Display comprehensive test results:
  - Connection status (success/fail)
  - Protocol version
  - Server info (name, version)
  - Capabilities overview
  - Tools list with descriptions and schemas
  - Resources list with URIs and metadata
  - Prompts list with templates
- Collapsible sections for each capability type
- Copy-to-clipboard for JSON results
- Error details if test fails

### 6. Update ServerCard Component
- Add "Test" button with testing state
- Show inline status indicator (untested/passed/failed)
- Last test timestamp
- Click to open detailed results modal
- Loading spinner during test

### 7. Add Frontend State Management
- Store test results per server in component state
- Cache results for session duration
- Add refresh/retest functionality
- Handle concurrent tests appropriately

## UI/UX Flow

1. User clicks "Test" button on a server card
2. Button shows spinner, card shows "Testing..." status
3. Backend spawns server and performs comprehensive test
4. Quick status shown on card (✓ Works, ✗ Failed)
5. User can click status to see detailed modal with:
   - Full capabilities report
   - Available tools/resources/prompts
   - Any errors encountered
6. Results are cached until app restart or manual retest

## Error Handling

Different error types with specific messages:
- **Command not found** - The server command doesn't exist
- **Spawn error** - Process failed to start
- **Protocol error** - Invalid JSON-RPC responses
- **Timeout** - Server didn't respond in time
- **Initialization failed** - Server rejected initialization
- **Partial success** - Some capabilities work, others don't

## Technical Details

### Test Sequence
```javascript
1. spawn(command, args, {env, stdio: 'pipe'})
2. Send: {"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"1.0"},"id":1}
3. Send: {"jsonrpc":"2.0","method":"tools/list","id":2}
4. Send: {"jsonrpc":"2.0","method":"resources/list","id":3}
5. Send: {"jsonrpc":"2.0","method":"prompts/list","id":4}
6. Send: {"jsonrpc":"2.0","method":"ping","id":5}
7. Compile results and terminate process
```

### Expected Response Structure

#### Initialize Response
```json
{
  "jsonrpc": "2.0",
  "result": {
    "protocolVersion": "1.0",
    "serverInfo": {
      "name": "example-server",
      "version": "1.0.0"
    },
    "capabilities": {
      "tools": {},
      "resources": {},
      "prompts": {}
    }
  },
  "id": 1
}
```

#### Tools List Response
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {
        "name": "read_file",
        "description": "Read contents of a file",
        "inputSchema": {
          "type": "object",
          "properties": {
            "path": {"type": "string"}
          }
        }
      }
    ]
  },
  "id": 2
}
```

## Benefits

This comprehensive approach will provide:
- **Debugging** - Understanding what a server actually provides
- **Validation** - Ensuring the server has expected capabilities
- **Documentation** - Auto-generating docs about server features
- **UI Enhancement** - Showing users what each server can do
- **Compatibility Checking** - Verifying the server works with your MCP client version

## Completion Criteria

- [ ] Server testing works for all configured servers
- [ ] Detailed capabilities are discovered and displayed
- [ ] Error handling covers all failure scenarios
- [ ] UI provides clear feedback during testing
- [ ] Results modal shows comprehensive information
- [ ] Test results are cached appropriately
- [ ] Process cleanup happens reliably