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
 * @param {string} chatId - Chat identifier
 * @param {string} prompt - Component description
 * @param {object} options - { createComponent?: boolean }
 * @returns {Promise<{ text: string, demo: string, files: Array<{ lang, file, source }> }>}
 */
async function createComponent(chatId, prompt, options = {}) {
  const response = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      createComponent: options.createComponent
    })
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
 * Get file list - List source files from specific chat
 * @param {string} chatId - Chat identifier
 * @returns {Promise<{ files: Array<{ lang, name }> }>}
 */
async function getFileList(chatId) {
  const response = await fetch(`${BASE_URL}/chats/${chatId}/files`, {
    headers: { 'Authorization': `Bearer ${getApiKey()}` }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Get file content - Retrieve file content with optional range reading
 * @param {string} chatId - Chat identifier
 * @param {object} options - { files?: string[], offset?: [start, end] }
 * @returns {Promise<{ files: Array<{ lang, name, source }> }>}
 */
async function getFileContent(chatId, options = {}) {
  const params = new URLSearchParams()
  if (options.files) {
    options.files.forEach(f => params.append('files', f))
  }
  if (options.offset) {
    params.set('start', options.offset[0])
    params.set('end', options.offset[1])
  }

  const response = await fetch(`${BASE_URL}/chats/${chatId}/files/content?${params}`, {
    headers: { 'Authorization': `Bearer ${getApiKey()}` }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// CLI handler for LLM execution
const [,, command, ...args] = process.argv

async function main() {
  try {
    switch (command) {
      case 'create_component': {
        const [chatId, ...promptParts] = args
        const result = await createComponent(chatId, promptParts.join(' '))
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
      default:
        console.log('v0 API CLI')
        console.log('Usage: node scripts/v0.js <command> [args]')
        console.log('')
        console.log('Commands:')
        console.log('  create_component <chatId> <prompt>  - Generate component')
        console.log('  get_chat_list [limit] [offset]      - List chats')
        console.log('  get_file_list <chatId>              - List files in chat')
        console.log('  get_file_content <chatId> [files..] - Get file contents')
    }
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()

module.exports = { createComponent, getChatList, getFileList, getFileContent }
