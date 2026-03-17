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
| `get_chat_details` | Chat details | `node scripts/v0.js get_chat_details <chatId>` |
| `get_version_list` | List versions | `node scripts/v0.js get_version_list <chatId>` |
| `get_file_list` | List files in chat | `node scripts/v0.js get_file_list <chatId> [--version <id>]` |
| `get_file_content` | Get source code | `node scripts/v0.js get_file_content <chatId> [file1...] [--version <id>]` |
| `search_chats` | Search chats by name/files | `node scripts/v0.js search_chats <query> [-f]` |
| `create_chat` | Generate from prompt | `node scripts/v0.js create_chat <prompt> [--privacy public\|private]` |
| `send_message` | Follow-up message | `node scripts/v0.js send_message <chatId> <message>` |
| `config profile set` | Create/update profile | `node scripts/v0.js config profile set <name> --key <value>` |
| `config profile <name>` | Switch active profile | `node scripts/v0.js config profile <name>` |
| `config profile list` | List profiles | `node scripts/v0.js config profile list` |
| `config profile delete` | Delete profile | `node scripts/v0.js config profile delete <name>` |
| `config show` | Show config | `node scripts/v0.js config show` |

## Setup

1. Get API key from https://v0.dev/chat/settings/keys
2. Configure with a profile (recommended) or environment variable:

   **Option A: Profile (supports multiple accounts)**
   ```bash
   # Direct key
   node scripts/v0.js config profile set personal --key v0_key_abc123

   # Environment variable reference (key stays in env, not in config file)
   node scripts/v0.js config profile set team --key 'env://V0_TEAM_API_KEY'
   ```

   **Option B: Environment variable (single account)**
   ```bash
   export V0_API_KEY=your-api-key
   ```

   **Key resolution priority:** `--api-key` flag > `--profile` flag > `V0_API_KEY` env var > active profile in config

## Commands

### get_chat_list
```bash
node scripts/v0.js get_chat_list [limit] [offset]
```
- `limit`: Results per page (default: 10)
- `offset`: Results to skip (default: 0)

**Output:** `{ "data": [{ "id", "name", "createdAt" }] }`

### get_chat_details
```bash
node scripts/v0.js get_chat_details <chatId>
```
Returns full details for a specific chat.

**Output:** Chat object with id, name, createdAt, etc.

### get_version_list
```bash
node scripts/v0.js get_version_list <chatId>
```
Lists all versions (iterations) of a chat, newest first.

**Output:** `{ "chatId", "versions": [{ "id", "status", "createdAt" }] }`

### get_file_list
```bash
node scripts/v0.js get_file_list <chatId> [--version <id>]
```
Lists source files in a chat's latest valid version. Use `--version` to target a specific version.

**Output:** `{ "versionId", "fallback", "filtered", "files": [{ "name", "lang" }] }`

### get_file_content
```bash
node scripts/v0.js get_file_content <chatId> [file1] [file2] ... [--version <id>]
```
Retrieves source code. Omit file names to get all files. Use `--version` to target a specific version.

**Output:** `{ "versionId", "fallback", "filtered", "files": [{ "name", "lang", "source" }] }`

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

## Known Limitations

- **Synthetic files** (v0 internal layout files) are not accessible via the API
- **GENERATING files** are automatically filtered out — files still being generated are excluded from results
- The `filtered` field in responses indicates how many files were excluded (GENERATING or empty content)
- When all files in a version are GENERATING, the version is skipped and an older version is used (indicated by `fallback: true`)

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

### Switch profile

```bash
# Switch to a different account/team
node scripts/v0.js config profile team

# One-off override without switching
node scripts/v0.js get_chat_list --profile personal

# One-off override with direct key
node scripts/v0.js get_chat_list --api-key v0_key_override
```

### Access a specific version

```bash
# 1. List all versions
node scripts/v0.js get_version_list <chatId>

# 2. Get files from a specific version
node scripts/v0.js get_file_content <chatId> --version <versionId>
node scripts/v0.js get_file_list <chatId> --version <versionId>
```

### Generate new UI and get code

```bash
# 1. Generate — returns chatId + full source code
node scripts/v0.js create_chat "Data table with sorting, filtering, pagination. Next.js 14, Tailwind, shadcn/ui"

# 2. Iterate if needed — returns updated source code
node scripts/v0.js send_message <chatId> "Add dark mode support and make columns resizable"
```

### Generate from project context

When the user asks to generate a UI component based on an existing project or plan, analyze the source code to build an effective v0 prompt before calling `create_chat`.

**Step 1: Analyze the source code**

Read the relevant source files in the project to understand:
- Tech stack and framework patterns (App Router vs Pages, styling approach)
- Component structure, naming conventions, import paths
- Shared layouts, design tokens, utility patterns
- UI library usage (which shadcn/Radix/MUI components are used and how)

Focus on files directly related to where the new component will live — sibling components, parent layouts, shared utilities.

**Step 2: Compose the v0 prompt**

Combine the user's requirement with patterns observed from the source code:

```
<requirement from user or plan>

Tech stack: <framework, styling, UI library, language — as observed in source>
Conventions: <naming, structure, import patterns from existing code>

Requirements:
- <component behavior and interactions>
- <state requirements: loading, error, empty>
- <responsive breakpoints if relevant>
- <accessibility needs>
```

**Step 3: Generate and iterate**

```bash
node scripts/v0.js create_chat "<composed prompt>"
# Refine if needed
node scripts/v0.js send_message <chatId> "<refinement>"
```

**Step 4: Integrate into project**

- Adapt import paths to match the project's alias structure
- Adjust naming to match project conventions
- Wire up data fetching, state management, and routing
- Install any missing dependencies

**Example**

```
User: "Add a settings page with profile editing and notification preferences"

1. Read existing pages/layout → App Router, sidebar layout, shadcn Tabs/Card/Input used
2. Compose prompt:
   "Settings page with two tabs: Profile (avatar, name, email, bio with validation)
    and Notifications (toggle switches for email/push/SMS).
    Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui (Tabs, Card, Input, Switch, Button).
    Responsive: stack tabs vertically on mobile. Include loading and save states."
3. node scripts/v0.js create_chat "<prompt>"
4. Adapt imports, integrate with existing layout
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
