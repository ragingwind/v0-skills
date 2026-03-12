---
name: v0
description: v0 Platform API — fetch code from v0 chats and generate new UI components with natural language prompts.
---

# v0 Platform API Skill

v0 Platform API generates production-ready React components with proper architecture, accessibility, and responsive design. All commands output JSON for direct agent consumption.

## Quick Reference

| Command | Purpose | Usage |
|---------|---------|-------|
| `get_chat_list` | List existing chats | `node scripts/v0.js get_chat_list [limit] [offset]` |
| `get_file_list` | List files in chat | `node scripts/v0.js get_file_list <chatId>` |
| `get_file_content` | Get source code | `node scripts/v0.js get_file_content <chatId> [file1] [file2]...` |
| `search_chats` | Search chats by name/files | `node scripts/v0.js search_chats <query> [-f]` |
| `create_chat` | Generate from prompt | `node scripts/v0.js create_chat <prompt> [--privacy public\|private]` |
| `send_message` | Follow-up message | `node scripts/v0.js send_message <chatId> <message>` |

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
- `limit`: Results per page (default: 10)
- `offset`: Results to skip (default: 0)

**Output:** `{ "data": [{ "id", "name", "createdAt" }] }`

### get_file_list
```bash
node scripts/v0.js get_file_list <chatId>
```
Lists source files in a chat's latest valid version.

**Output:** `{ "versionId", "files": [{ "name", "lang" }] }`

### get_file_content
```bash
node scripts/v0.js get_file_content <chatId> [file1] [file2] ...
```
Retrieves source code. Omit file names to get all files.

**Output:** `{ "versionId", "files": [{ "name", "lang", "source" }] }`

### search_chats
```bash
node scripts/v0.js search_chats <query> [-f]
```
Searches chats by name. With `-f` or `--files`, also searches file names within each chat.

**Output:** `{ "query", "results": [{ "chatId", "name", "matchType", "files?" }] }`

### create_chat
```bash
node scripts/v0.js create_chat <prompt> [--privacy public|private]
```
Creates a new v0 chat, waits for generation, and returns generated files with source code.

**Output:** `{ "chatId", "versionId", "demoUrl", "files": [{ "name", "lang", "source" }] }`

### send_message
```bash
node scripts/v0.js send_message <chatId> <message>
```
Sends a follow-up message and waits for the new version. Returns updated files with source code.

**Output:** `{ "chatId", "versionId", "demoUrl", "files": [{ "name", "lang", "source" }] }`

## Workflows

### Fetch code from v0

```bash
# 1. Find the chat
node scripts/v0.js get_chat_list
# or search
node scripts/v0.js search_chats "dashboard"

# 2. Get the code
node scripts/v0.js get_file_content <chatId>
# or specific files only
node scripts/v0.js get_file_content <chatId> Button.tsx DataTable.tsx
```

### Generate new UI and get code

```bash
# 1. Generate — returns chatId + full source code
node scripts/v0.js create_chat "Data table with sorting, filtering, pagination. Next.js 14, Tailwind, shadcn/ui"

# 2. Iterate if needed — returns updated source code
node scripts/v0.js send_message <chatId> "Add dark mode support and make columns resizable"
```

## Prompt Patterns

### Effective Prompts

**Specific with context**
```
"Dashboard with sidebar nav, top bar, 3 metric cards. Next.js 14, Tailwind, shadcn/ui"
```

**Functional requirements**
```
"Product card: image, title, price, add-to-cart button. Hover effects, responsive"
```

**Specify interactions and states**
```
"Modal for image gallery. Close button, overlay, keyboard navigation (Esc), accessible. Tailwind."
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

## Output Format

All commands output JSON. `create_chat` and `send_message` include full source code in the response — no separate `get_file_content` call needed after generation.

**File Patterns:**
- Single: `component.tsx`
- With types: `component.tsx`, `types.ts`
- With styles: `component.tsx`, `styles.module.css`

**Defaults:** Tailwind CSS, React hooks, TypeScript, semantic HTML, mobile-first. Override by specifying in prompts.
