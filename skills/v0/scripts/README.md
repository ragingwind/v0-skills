# v0 API Scripts

## v0.js - Main CLI

Command-line interface for v0 Platform API.

### Commands

```bash
# Generate component
node scripts/v0.js create_component <chatId> <prompt>

# List chats
node scripts/v0.js get_chat_list [limit] [offset]

# List files in chat
node scripts/v0.js get_file_list <chatId>

# Get file contents
node scripts/v0.js get_file_content <chatId> [file1] [file2]...

# Get files by path
node scripts/v0.js get_files_by_path <chatId> <path> [-f]
```

### Examples

```bash
# Create dashboard component
node scripts/v0.js create_component my-dashboard "Dashboard with sidebar and cards. Next.js 14, Tailwind"

# List recent chats
node scripts/v0.js get_chat_list 10 0

# Get all files
node scripts/v0.js get_file_content my-dashboard

# Get components directory (formatted)
node scripts/v0.js get_files_by_path my-dashboard components -f
```

## v0.test.js - Test Suite

Comprehensive test suite for v0 API commands.

### Usage

```bash
# Run all tests
node scripts/v0.test.js

# Quick test (skip component creation)
node scripts/v0.test.js --quick

# Cleanup test chats
node scripts/v0.test.js --cleanup

# Show help
node scripts/v0.test.js --help
```

### Test Coverage

1. **get_chat_list** - Retrieve and validate chat list
2. **create_component** - Generate new component
3. **get_file_list** - List files in chat
4. **get_file_content** (all files) - Retrieve all file contents
5. **get_file_content** (specific) - Retrieve specific file
6. **get_files_by_path** - Path-based file retrieval
7. **Iterative refinement** - Update existing component

### Output

Tests provide colored output:
- ✓ Green = Passed
- ✗ Red = Failed
- Yellow = Skipped

### Example Output

```
═══════════════════════════════════════
  v0 API Test Suite
═══════════════════════════════════════

▶ Test: get_chat_list
  ✓ Retrieved 5 chat(s)
  First chat: abc123

▶ Test: create_component
  Creating chat: test-v0-api-1234567890-xyz
  ✓ Component created with 2 file(s)
  Description: I've created a simple button component with...
  Demo URL: https://v0.dev/chat/test-v0-api-1234567890-xyz/preview
    - button.tsx (tsx)
    - types.ts (ts)

...

═══════════════════════════════════════
  Test Summary
═══════════════════════════════════════

Total:   7
Passed:  7
Failed:  0
Skipped: 0

Test chat created: test-v0-api-1234567890-xyz
View at: https://v0.dev/chat/test-v0-api-1234567890-xyz
```

## Setup

Both scripts require `V0_API_KEY` environment variable:

```bash
export V0_API_KEY=your-api-key
```

Get your API key from https://v0.dev/chat/settings/keys
