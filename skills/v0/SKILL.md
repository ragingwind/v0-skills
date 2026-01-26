# v0 Platform API Skill

v0 Platform API generates production-ready React components with proper architecture, accessibility, and responsive design.

## Quick Reference

| Command | Purpose | Usage |
|---------|---------|-------|
| `get_chat_list` | List existing chats | `node scripts/v0.js get_chat_list [limit] [offset]` |
| `get_file_list` | List files in chat | `node scripts/v0.js get_file_list <chatId>` |
| `get_file_content` | Get source code | `node scripts/v0.js get_file_content <chatId> [file1] [file2]...` |
| `get_files_by_path` | Get files under path | `node scripts/v0.js get_files_by_path <chatId> <path>` |

## Setup

1. Get API key from https://v0.dev/chat/settings/keys
2. Set environment variable:
   ```bash
   export V0_API_KEY=your-api-key
   ```

## Commands

### get_chat_list
```bash
node scripts/v0.js get_chat_list [limit] [offset]
```
- `limit`: Results per page (default: 20)
- `offset`: Results to skip (default: 0)

### get_file_list
```bash
node scripts/v0.js get_file_list <chatId>
```
Lists all source files in a chat.

### get_file_content
```bash
node scripts/v0.js get_file_content <chatId> [file1] [file2] ...
```
Retrieves source code. Omit file names to get all files.

### get_files_by_path
```bash
node scripts/v0.js get_files_by_path <chatId> <path> [-f]
```
Retrieves all files and their content under a specific path.
- `path`: Path pattern (e.g., "components", "/lib/utils", "src/hooks")
- `-f, --format`: Format output with file separators (optional)

**Output**: JSON with `path`, `count`, and `files` array (each file has `name`, `lang`, `source`)

## Prompt Patterns

### Effective Prompts

✅ **Specific with context**
```
"Dashboard with sidebar nav, top bar, 3 metric cards. Next.js 14, Tailwind, shadcn/ui"
```

❌ **Too vague**
```
"Make a dashboard"
```

✅ **Functional requirements**
```
"Product card: image, title, price, add-to-cart button. Hover effects, responsive"
```

❌ **Over-specified implementation**
```
"Create a div with className flex and children including an img tag..."
```

✅ **Include framework and styling**
```
"User profile form with email, name, avatar upload. Next.js 14, Tailwind, shadcn/ui. Validation and loading states."
```

❌ **Missing technical context**
```
"Make a form"
```

✅ **Specify interactions and states**
```
"Modal for image gallery. Close button, overlay, keyboard navigation (Esc), accessible. Tailwind."
```

❌ **Static description only**
```
"A modal with images"
```

✅ **Table with interactions**
```
"Data table: name, email, status columns. Sortable headers, search bar, pagination. Loading skeleton, empty state. Next.js 14, Tailwind, shadcn/ui"
```

❌ **Missing interactions**
```
"Create a table"
```

### Prompt Checklist

Include for best results:
- Framework (React, Next.js version)
- Styling (Tailwind, CSS modules, styled-components)
- UI library (shadcn/ui, Material-UI, Radix)
- Component behavior and interactions
- State requirements (loading, error, empty)
- Responsive breakpoints
- Accessibility needs

## Workflows

### Explore Project Structure

```bash
# Find your project
node scripts/v0.js get_chat_list

# See all files in the project
node scripts/v0.js get_file_list <chatId>

# Get everything
node scripts/v0.js get_file_content <chatId>
```

### Get Content from Specific Files

```bash
# Get a specific component file
node scripts/v0.js get_file_content <chatId> components/Button.tsx

# Get multiple specific files
node scripts/v0.js get_file_content <chatId> components/Card.tsx lib/utils.ts
```

### Get All Files Under a Path

```bash
# Get all components (JSON output)
node scripts/v0.js get_files_by_path <chatId> components

# Get all utilities (formatted output with file separators)
node scripts/v0.js get_files_by_path <chatId> lib -f

# Get hooks
node scripts/v0.js get_files_by_path <chatId> hooks

# Output example (formatted):
# === Path: components ===
# Found 3 file(s)
#
# ================================================================================
# File 1/3: components/Button.tsx
# Language: tsx
# ================================================================================
# [source code here]
```

## Best Practices

### Iteration Strategy
1. Core functionality and structure
2. Styling and visual refinement
3. Edge cases (loading, error, empty states)
4. Accessibility and optimization

### New Chat When
- Changing component scope
- Exploring different directions
- >5-6 iterations in current chat
- Switching between unrelated components

### Prompt Structure
- Component type and purpose
- Key elements and content
- Interactions (hover, click, keyboard)
- States (loading, error, disabled, active)
- Framework and styling approach
- Responsive requirements

## Output Format

Response includes `text` (description), `demo` (preview URL), and `files` array with `lang`, `file`, `source`.

**File Patterns:**
- Single: `component.tsx`
- With types: `component.tsx`, `types.ts`
- With styles: `component.tsx`, `styles.module.css`

**Defaults:** Tailwind CSS, React hooks, TypeScript, semantic HTML, mobile-first. Override by specifying in prompts.

## API Reference

**Base URL**: `https://api.v0.dev/v1`

**Functions**:
- `getChatList(options)` - List chats with pagination
- `getFileList(chatId)` - List files in chat
- `getFileContent(chatId, options)` - Get file contents
- `getFilesByPath(chatId, pathPattern)` - Get files under path
