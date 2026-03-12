#!/usr/bin/env node

const BASE_URL = 'https://api.v0.dev/v1'

function getApiKey() {
  const apiKey = process.env.V0_API_KEY
  if (!apiKey) {
    throw new Error('V0_API_KEY environment variable is required')
  }
  return apiKey
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * List v0 chats with pagination
 * @param {object} options - { limit?: string, offset?: string }
 * @returns {Promise<{ data: Array<{ id, name, createdAt }> }>}
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
 * List source files from a chat's latest valid version
 * @param {string} chatId
 * @returns {Promise<{ versionId: string, fallback: boolean, files: Array<{ name, lang }> }>}
 */
async function getFileList(chatId) {
  const { version, fallback } = await findValidVersion(chatId, { includeDefaultFiles: true })
  const files = version.files || []

  return {
    versionId: version.id,
    fallback,
    files: files.map(f => ({
      name: f.name,
      lang: detectLang(f.name)
    }))
  }
}

/**
 * Get file contents from a chat, optionally filtered by file names
 * @param {string} chatId
 * @param {object} options - { files?: string[] }
 * @returns {Promise<{ versionId: string, fallback: boolean, files: Array<{ name, lang, source }> }>}
 */
async function getFileContent(chatId, options = {}) {
  const { version, fallback } = await findValidVersion(chatId, { includeDefaultFiles: true })
  let files = version.files || []

  if (options.files && options.files.length > 0) {
    files = files.filter(f => options.files.includes(f.name))
  }

  return {
    versionId: version.id,
    fallback,
    files: files.map(f => ({
      name: f.name,
      lang: detectLang(f.name),
      source: f.content
    }))
  }
}

/**
 * Search chats by name, optionally also by file names
 * @param {string} query
 * @param {object} options - { searchFiles?: boolean }
 * @returns {Promise<{ query, results: Array<{ chatId, name, matchType, files? }> }>}
 */
async function searchChats(query, options = {}) {
  const allChats = []
  let offset = 0
  const pageSize = 50

  while (true) {
    const result = await getChatList({ limit: String(pageSize), offset: String(offset) })
    const chats = result.data || []
    if (chats.length === 0) break
    allChats.push(...chats)
    if (chats.length < pageSize) break
    offset += pageSize
  }

  const queryLower = query.toLowerCase()
  const results = []

  for (const chat of allChats) {
    const nameMatch = (chat.name || chat.id || '').toLowerCase().includes(queryLower)

    if (nameMatch) {
      const entry = { chatId: chat.id, name: chat.name || chat.id, matchType: 'name' }
      if (options.searchFiles) {
        try {
          const fileList = await getFileList(chat.id)
          entry.files = fileList.files.map(f => f.name)
        } catch (_) {
          entry.files = []
        }
      }
      results.push(entry)
      continue
    }

    if (options.searchFiles) {
      try {
        const fileList = await getFileList(chat.id)
        const matchingFiles = fileList.files.filter(f =>
          f.name.toLowerCase().includes(queryLower)
        )
        if (matchingFiles.length > 0) {
          results.push({
            chatId: chat.id,
            name: chat.name || chat.id,
            matchType: 'file',
            files: matchingFiles.map(f => f.name)
          })
        }
      } catch (_) {
        // Skip chats with no valid versions
      }
    }
  }

  return { query, results }
}

/**
 * Create a new v0 chat, wait for generation, return files
 * @param {string} prompt
 * @param {object} options - { privacy?: 'public'|'private' }
 * @returns {Promise<object>} - POST response (chatId etc)
 */
async function createChat(prompt, options = {}) {
  const body = { prompt }
  if (options.privacy) body.privacy = options.privacy

  const response = await fetch(`${BASE_URL}/chats`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API error: ${response.status} - ${text}`)
  }

  return response.json()
}

/**
 * Send a follow-up message to an existing chat
 * @param {string} chatId
 * @param {string} message
 * @returns {Promise<object>}
 */
async function sendMessage(chatId, message) {
  const response = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API error: ${response.status} - ${text}`)
  }

  return response.json()
}

// ─── Internal API Helpers ─────────────────────────────────────────────────────

async function getChatDetails(chatId) {
  const response = await fetch(`${BASE_URL}/chats/${chatId}`, {
    headers: { 'Authorization': `Bearer ${getApiKey()}` }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

async function getVersionList(chatId) {
  const response = await fetch(`${BASE_URL}/chats/${chatId}/versions`, {
    headers: { 'Authorization': `Bearer ${getApiKey()}` }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

async function getVersionDetails(chatId, versionId, { includeDefaultFiles = false } = {}) {
  const params = includeDefaultFiles ? '?includeDefaultFiles=true' : ''
  const response = await fetch(`${BASE_URL}/chats/${chatId}/versions/${versionId}${params}`, {
    headers: { 'Authorization': `Bearer ${getApiKey()}` }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

async function pollUntilComplete(chatId, timeoutMs = 120000, intervalMs = 3000) {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const result = await getVersionList(chatId)
    const versions = result.data || []

    if (versions.length > 0) {
      const latest = versions[0]
      if (latest.status === 'completed') {
        return getVersionDetails(chatId, latest.id, { includeDefaultFiles: true })
      }
      if (latest.status === 'error' || latest.status === 'failed') {
        throw new Error(`Generation failed with status: ${latest.status}`)
      }
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error(`Polling timed out after ${timeoutMs}ms`)
}

async function waitForNewVersion(chatId, prevVersionId, timeoutMs = 120000) {
  const start = Date.now()
  const intervalMs = 3000

  while (Date.now() - start < timeoutMs) {
    const result = await getVersionList(chatId)
    const versions = result.data || []

    if (versions.length > 0 && versions[0].id !== prevVersionId) {
      const latest = versions[0]
      if (latest.status === 'completed') {
        return getVersionDetails(chatId, latest.id, { includeDefaultFiles: true })
      }
      if (latest.status === 'error' || latest.status === 'failed') {
        throw new Error(`Generation failed with status: ${latest.status}`)
      }
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error(`Waiting for new version timed out after ${timeoutMs}ms`)
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function detectLang(name) {
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'typescript'
  if (name.endsWith('.jsx') || name.endsWith('.js')) return 'javascript'
  if (name.endsWith('.css')) return 'css'
  if (name.endsWith('.json')) return 'json'
  return 'text'
}

function isValidContent(content) {
  if (!content) return false
  const trimmed = content.trim()
  return trimmed !== '' && trimmed !== 'GENERATING'
}

function hasValidFiles(files) {
  if (!files || files.length === 0) return false
  return files.every(f => isValidContent(f.content))
}

async function findValidVersion(chatId, { includeDefaultFiles = false } = {}) {
  const result = await getVersionList(chatId)
  const versions = result.data || []

  for (const v of versions) {
    if (v.status !== 'completed') continue
    const details = await getVersionDetails(chatId, v.id, { includeDefaultFiles })
    if (hasValidFiles(details.files)) {
      return { version: details, fallback: v.id !== versions[0]?.id }
    }
  }

  throw new Error('No version with valid file content found')
}

/**
 * Format a version response into agent-friendly JSON
 */
function formatVersionResult(chatId, version) {
  const files = version.files || []
  return {
    chatId,
    versionId: version.id,
    demoUrl: version.demoUrl || null,
    files: files.map(f => ({
      name: f.name,
      lang: detectLang(f.name),
      source: f.content
    }))
  }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const [,, command, ...args] = process.argv

async function main() {
  try {
    switch (command) {
      case 'get_chat_list': {
        const [limit, offset] = args
        const result = await getChatList({ limit, offset })
        console.log(JSON.stringify(result, null, 2))
        break
      }
      case 'get_file_list': {
        const [chatId] = args
        if (!chatId) throw new Error('chatId is required')
        const result = await getFileList(chatId)
        console.log(JSON.stringify(result, null, 2))
        break
      }
      case 'get_file_content': {
        const [chatId, ...files] = args
        if (!chatId) throw new Error('chatId is required')
        const result = await getFileContent(chatId, { files })
        console.log(JSON.stringify(result, null, 2))
        break
      }
      case 'search_chats': {
        const allArgs = [...args]
        const searchFiles = allArgs.includes('--files') || allArgs.includes('-f')
        const filteredArgs = allArgs.filter(a => a !== '--files' && a !== '-f')
        const query = filteredArgs.join(' ')
        if (!query) throw new Error('Search query is required')
        const result = await searchChats(query, { searchFiles })
        console.log(JSON.stringify(result, null, 2))
        break
      }
      case 'create_chat': {
        const allArgs = [...args]
        const privacyIdx = allArgs.indexOf('--privacy')
        let privacy
        if (privacyIdx !== -1) {
          privacy = allArgs[privacyIdx + 1]
          allArgs.splice(privacyIdx, 2)
        }
        const prompt = allArgs.join(' ')
        if (!prompt) throw new Error('Prompt is required')
        const chat = await createChat(prompt, { privacy })
        const chatId = chat.id || chat.chatId
        const version = await pollUntilComplete(chatId)
        console.log(JSON.stringify(formatVersionResult(chatId, version), null, 2))
        break
      }
      case 'send_message': {
        const [chatId, ...messageParts] = args
        if (!chatId) throw new Error('chatId is required')
        const message = messageParts.join(' ')
        if (!message) throw new Error('Message is required')
        const versionsBefore = await getVersionList(chatId)
        const prevVersionId = (versionsBefore.data || [])[0]?.id
        await sendMessage(chatId, message)
        const version = await waitForNewVersion(chatId, prevVersionId)
        console.log(JSON.stringify(formatVersionResult(chatId, version), null, 2))
        break
      }
      default:
        console.log('v0 API CLI — all commands output JSON')
        console.log('')
        console.log('Usage: node scripts/v0.js <command> [args]')
        console.log('')
        console.log('Read:')
        console.log('  get_chat_list [limit] [offset]         List chats')
        console.log('  get_file_list <chatId>                 List files in chat')
        console.log('  get_file_content <chatId> [files...]   Get file contents')
        console.log('  search_chats <query> [-f]              Search chats by name/files')
        console.log('')
        console.log('Write:')
        console.log('  create_chat <prompt> [--privacy p]     Generate from prompt')
        console.log('  send_message <chatId> <message>        Send follow-up message')
    }
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  getChatList, getChatDetails, getFileList, getFileContent, searchChats,
  createChat, sendMessage,
  getVersionList, getVersionDetails, findValidVersion,
  pollUntilComplete, waitForNewVersion,
  isValidContent
}
