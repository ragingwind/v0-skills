#!/usr/bin/env node

const BASE_URL = 'https://api.v0.dev/v1'

function getApiKey() {
  const apiKey = process.env.V0_API_KEY
  if (!apiKey) {
    throw new Error('V0_API_KEY environment variable is required')
  }
  return apiKey
}

/**
 * Create component - Generate new components on v0 platform
 * @param {string} chatId - Chat identifier (optional for new chats)
 * @param {string} message - Component description
 * @returns {Promise<{ id: string, text: string, demo: string, files: Array<{ lang, meta: { file }, source }> }>}
 */
async function createComponent(chatId, message) {
  const url = chatId
    ? `${BASE_URL}/chats/${chatId}/messages`
    : `${BASE_URL}/chats`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Get chat list - Retrieve v0 chats with pagination
 * @param {object} options - { limit?: string, offset?: string }
 * @returns {Promise<{ chats: Array<{ chatId, chatName }> }>}
 */
async function getChatList(options = {}) {
  const params = new URLSearchParams({
    limit: options.limit || '10',
    offset: options.offset || '0'
  })

  const response = await fetch(`${BASE_URL}/chats?${params}`, {
    headers: { 'Authorization': `Bearer ${getApiKey()}` }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Get chat details - Retrieve chat with files from latestVersion
 * @param {string} chatId - Chat identifier
 * @returns {Promise<object>}
 */
async function getChatDetails(chatId) {
  const response = await fetch(`${BASE_URL}/chats/${chatId}`, {
    headers: { 'Authorization': `Bearer ${getApiKey()}` }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Get file list - List source files from specific chat
 * @param {string} chatId - Chat identifier
 * @returns {Promise<{ files: Array<{ name, lang }> }>}
 */
async function getFileList(chatId) {
  const chat = await getChatDetails(chatId)
  const files = chat.latestVersion?.files || []

  return {
    files: files.map(f => ({
      name: f.name,
      lang: f.name.endsWith('.tsx') || f.name.endsWith('.ts') ? 'typescript' :
            f.name.endsWith('.css') ? 'css' :
            f.name.endsWith('.json') ? 'json' : 'text'
    }))
  }
}

/**
 * Get file content - Retrieve file content with optional filtering
 * @param {string} chatId - Chat identifier
 * @param {object} options - { files?: string[] }
 * @returns {Promise<{ files: Array<{ name, lang, source }> }>}
 */
async function getFileContent(chatId, options = {}) {
  const chat = await getChatDetails(chatId)
  let files = chat.latestVersion?.files || []

  if (options.files && options.files.length > 0) {
    files = files.filter(f => options.files.includes(f.name))
  }

  return {
    files: files.map(f => ({
      name: f.name,
      lang: f.name.endsWith('.tsx') || f.name.endsWith('.ts') ? 'typescript' :
            f.name.endsWith('.css') ? 'css' :
            f.name.endsWith('.json') ? 'json' : 'text',
      source: f.content
    }))
  }
}

/**
 * Get files by path - Retrieve all files and their content matching a path pattern
 * @param {string} chatId - Chat identifier
 * @param {string} pathPattern - Path pattern to match (e.g., "/components", "components/", "lib/utils")
 * @returns {Promise<{ path: string, count: number, files: Array<{ name, lang, source }> }>}
 */
async function getFilesByPath(chatId, pathPattern) {
  // Get all files in the chat
  const fileList = await getFileList(chatId)

  // Normalize path pattern (remove leading/trailing slashes for matching)
  const normalizedPattern = pathPattern.replace(/^\/+|\/+$/g, '')

  // Filter files that match the path pattern
  const matchingFiles = fileList.files.filter(file => {
    const normalizedName = file.name.replace(/^\/+/, '')
    return normalizedName.startsWith(normalizedPattern)
  })

  if (matchingFiles.length === 0) {
    return { path: pathPattern, count: 0, files: [] }
  }

  // Get content for matching files
  const fileNames = matchingFiles.map(f => f.name)
  const content = await getFileContent(chatId, { files: fileNames })

  // Return with metadata
  return {
    path: pathPattern,
    count: content.files.length,
    files: content.files
  }
}

// CLI handler for LLM execution
const [,, command, ...args] = process.argv

async function main() {
  try {
    switch (command) {
      case 'create_component': {
        const [chatIdOrMessage, ...messageParts] = args
        const hasMessage = messageParts.length > 0
        const chatId = hasMessage ? chatIdOrMessage : null
        const message = hasMessage ? messageParts.join(' ') : chatIdOrMessage
        const result = await createComponent(chatId, message)
        console.log(JSON.stringify(result, null, 2))
        break
      }
      case 'get_chat_list': {
        const [limit, offset] = args
        const result = await getChatList({ limit, offset })
        console.log(JSON.stringify(result, null, 2))
        break
      }
      case 'get_file_list': {
        const [chatId] = args
        const result = await getFileList(chatId)
        console.log(JSON.stringify(result, null, 2))
        break
      }
      case 'get_file_content': {
        const [chatId, ...files] = args
        const result = await getFileContent(chatId, { files })
        console.log(JSON.stringify(result, null, 2))
        break
      }
      case 'get_files_by_path': {
        const [chatId, pathPattern, format] = args
        if (!pathPattern) {
          throw new Error('Path pattern is required')
        }
        const result = await getFilesByPath(chatId, pathPattern)

        if (format === '--format' || format === '-f') {
          // Formatted output for easier reading
          console.log(`\n=== Path: ${result.path} ===`)
          console.log(`Found ${result.count} file(s)\n`)
          result.files.forEach((file, index) => {
            console.log(`${'='.repeat(80)}`)
            console.log(`File ${index + 1}/${result.count}: ${file.name}`)
            console.log(`Language: ${file.lang}`)
            console.log(`${'='.repeat(80)}`)
            console.log(file.source)
            console.log()
          })
        } else {
          // JSON output (default)
          console.log(JSON.stringify(result, null, 2))
        }
        break
      }
      default:
        console.log('v0 API CLI')
        console.log('Usage: node scripts/v0.js <command> [args]')
        console.log('')
        console.log('Commands:')
        console.log('  create_component <chatId> <prompt>        - Generate component')
        console.log('  get_chat_list [limit] [offset]            - List chats')
        console.log('  get_file_list <chatId>                    - List files in chat')
        console.log('  get_file_content <chatId> [files...]      - Get file contents')
        console.log('  get_files_by_path <chatId> <path> [-f]    - Get all files under path')
        console.log('')
        console.log('Options:')
        console.log('  -f, --format    Format output with file separators (get_files_by_path only)')
    }
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

// Only run main if executed directly (not required as module)
if (require.main === module) {
  main()
}

module.exports = { createComponent, getChatList, getChatDetails, getFileList, getFileContent, getFilesByPath }
