# TASK 2: UI Screens (No Functionality)

## Overview
Create all user interface screens and components without implementing functionality. Focus on layout, navigation, and visual design.

## Requirements
- Single theme (no dark/light toggle)
- Clean, functional design
- Navigation between screens
- Responsive layout for different window sizes
- All forms and components as visual mockups

## Screens to Create

### 1. Main Layout
- Application header with title
- Navigation sidebar or menu
- Main content area
- Status bar (optional)

### 2. Server List View
- Table/list showing MCP servers
- Columns: Name, Status (Active/Disabled), Command, Actions
- Separate sections for active and disabled servers
- Action buttons: Edit, Toggle (Enable/Disable), Delete
- "Add Server" button prominent at top

### 3. Add Server Form View
- Form with fields:
  - Server Name (text input, required indicator)
  - Command (text input, required indicator)
  - Arguments (dynamic list with add/remove buttons)
  - Environment Variables (key-value pairs with add/remove)
- Cancel and Save buttons
- Form validation indicators (red borders, error messages)

### 4. Add Server JSON View
- Large text area or code editor for JSON input
- JSON validation indicator
- Format/Prettify button
- Cancel and Save buttons
- Toggle between Form and JSON modes

### 5. Edit Server View
- Same layout as Add Server Form
- Pre-populated with existing server data
- Clear indication this is edit mode (title, breadcrumb)
- Cancel, Save, and Delete buttons

### 6. Confirmation Dialogs
- Delete server confirmation
- Unsaved changes warning
- File modification conflict dialog

## Component Library

### Basic Components
```typescript
// Button variants
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete</Button>

// Form inputs
<TextInput label="Server Name" required />
<TextArea label="Command" />
<Select options={[]} />

// Arrays
<ArrayInput
  label="Arguments"
  items={[]}
  onAdd={() => {}}
  onRemove={() => {}}
/>

// Key-Value pairs
<KeyValueInput
  label="Environment Variables"
  pairs={[]}
  onAdd={() => {}}
  onRemove={() => {}}
/>
```

### Layout Components
```typescript
// Main layout
<Layout>
  <Sidebar />
  <MainContent>
    <Header />
    <ContentArea />
  </MainContent>
</Layout>

// Cards for server display
<ServerCard
  name="searxng"
  status="active"
  command="npx"
  onEdit={() => {}}
  onToggle={() => {}}
/>
```

## Navigation Structure
```
Main App
├── Server List (default view)
├── Add Server
│   ├── Form Mode
│   └── JSON Mode
└── Edit Server
    └── Form Mode
```

## Styling Approach
- Use CSS Modules or styled-components
- Simple, clean design
- Consistent spacing and typography
- Form validation visual states
- Hover and focus states for interactive elements

## Mock Data for Testing
```typescript
const mockServers = [
  {
    name: "searxng",
    command: "npx",
    args: ["-y", "mcp-searxng"],
    env: { "SEARXNG_URL": "http://localhost:8888" },
    enabled: true
  },
  {
    name: "vastai",
    command: "node",
    args: ["/path/to/vastai/index.js"],
    env: { "NODE_ENV": "production" },
    enabled: true
  },
  {
    name: "disabled-server",
    command: "disabled-command",
    args: [],
    env: {},
    enabled: false
  }
];
```

## File Structure
```
src/renderer/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── TextInput.tsx
│   │   ├── ArrayInput.tsx
│   │   └── KeyValueInput.tsx
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── server/
│       ├── ServerCard.tsx
│       ├── ServerList.tsx
│       └── ServerForm.tsx
├── screens/
│   ├── ServerListScreen.tsx
│   ├── AddServerScreen.tsx
│   ├── EditServerScreen.tsx
│   └── AddServerJSONScreen.tsx
├── styles/
│   ├── globals.css
│   ├── components.css
│   └── layout.css
└── App.tsx
```

## Acceptance Criteria
- [ ] All screens render without errors
- [ ] Navigation works between all screens
- [ ] Forms display all required fields
- [ ] Array and key-value inputs show add/remove buttons
- [ ] Server list displays mock data correctly
- [ ] Responsive design works at different window sizes
- [ ] All buttons and interactive elements have hover states
- [ ] Form validation visual states are implemented
- [ ] Consistent styling across all screens

## Technical Notes
- Use React Router for navigation (or simple state-based routing)
- Implement form components with proper TypeScript types
- Use CSS Grid/Flexbox for layouts
- Ensure accessibility basics (labels, focus management)
- No actual functionality - all buttons should show placeholder alerts

## Mock Event Handlers
```typescript
// Placeholder functions for all interactions
const handleSave = () => alert("Save functionality not implemented yet");
const handleCancel = () => alert("Cancel functionality not implemented yet");
const handleEdit = (serverId: string) => alert(`Edit ${serverId} not implemented yet`);
const handleToggle = (serverId: string) => alert(`Toggle ${serverId} not implemented yet`);
```