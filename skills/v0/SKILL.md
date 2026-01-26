# v0 Development Skill

## Description
Specialized skill for v0 Platform API development. Execute v0 API calls via node commands.

## Setup

1. Get API key from https://v0.dev/chat/settings/keys
2. Set environment variable: `export V0_API_KEY=your-api-key`

## Commands

Execute v0 API via node:

### Create Component
Generate new UI component from prompt.

```bash
node scripts/v0.js create_component <chatId> <prompt>
```

Output: `{ text, demo, files: [{ lang, file, source }] }`

### Get Chat List
Retrieve v0 chats with pagination.

```bash
node scripts/v0.js get_chat_list [limit] [offset]
```

Output: `{ chats: [{ chatId, chatName }] }`

### Get File List
List source files from specific chat.

```bash
node scripts/v0.js get_file_list <chatId>
```

Output: `{ files: [{ lang, name }] }`

### Get File Content
Retrieve file content from chat.

```bash
node scripts/v0.js get_file_content <chatId> [file1] [file2] ...
```

Output: `{ files: [{ lang, name, source }] }`

## API Reference

### Base URL
`https://api.v0.dev/v1`

### Functions
- `createComponent(chatId, prompt, options)` - Generate component
- `getChatList(options)` - List chats with pagination
- `getFileList(chatId)` - List files in chat
- `getFileContent(chatId, options)` - Get file contents

## Best Practices
- Use `enhancePrompt: true` for better component generation
- Handle rate limits (429 status)
- Paginate chat list with limit/offset
