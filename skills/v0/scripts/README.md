# v0 API Scripts

## v0.js - Main CLI

Command-line interface for v0 Platform API.

### Commands

```bash
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
2. **get_file_list** - List files in chat
3. **get_file_content** (all files) - Retrieve all file contents
4. **get_file_content** (specific) - Retrieve specific file
5. **get_files_by_path** - Path-based file retrieval

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

...

═══════════════════════════════════════
  Test Summary
═══════════════════════════════════════

Total:   5
Passed:  5
Failed:  0
Skipped: 0
```

## Setup

Both scripts require `V0_API_KEY` environment variable:

```bash
export V0_API_KEY=your-api-key
```

Get your API key from https://v0.dev/chat/settings/keys
