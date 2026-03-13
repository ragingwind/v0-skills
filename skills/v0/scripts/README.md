# v0 API Scripts

## v0.js - Main CLI

Command-line interface for v0 Platform API.

### Commands

```bash
# List chats
node scripts/v0.js get_chat_list [limit] [offset]

# Chat details
node scripts/v0.js get_chat_details <chatId>

# List versions
node scripts/v0.js get_version_list <chatId>

# List files in chat
node scripts/v0.js get_file_list <chatId> [--version <id>]

# Get file contents
node scripts/v0.js get_file_content <chatId> [file1] [file2]... [--version <id>]

# Search chats
node scripts/v0.js search_chats <query> [-f]
```

### Examples

```bash
# List recent chats
node scripts/v0.js get_chat_list 10 0

# Get all files
node scripts/v0.js get_file_content my-dashboard

# Get files from a specific version
node scripts/v0.js get_file_content my-dashboard --version b_abc123

# List all versions
node scripts/v0.js get_version_list my-dashboard
```

## v0.test.js - Test Suite

Comprehensive test suite for v0 API commands.

### Usage

```bash
# Run read-only tests
node scripts/v0.test.js

# Include write tests (creates real chats)
node scripts/v0.test.js --write

# Show help
node scripts/v0.test.js --help
```

### Test Coverage

1. **get_chat_list** - Retrieve and validate chat list
2. **get_file_list** - List files in chat
3. **get_file_content** (all files) - Retrieve all file contents
4. **get_file_content** (specific) - Retrieve specific file
5. **get_chat_details** - Chat details retrieval
6. **get_version_list** - Version listing
7. **get_file_content** (specific version) - Version-targeted file retrieval
8. **search_chats** - Search by name/files

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

Total:   8
Passed:  8
Failed:  0
Skipped: 0
```

## Setup

Both scripts require `V0_API_KEY` environment variable:

```bash
export V0_API_KEY=your-api-key
```

Get your API key from https://v0.dev/chat/settings/keys
