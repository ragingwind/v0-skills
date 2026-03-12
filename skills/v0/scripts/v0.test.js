#!/usr/bin/env node

/**
 * v0 API Test Suite
 *
 * Usage:
 *   node scripts/v0.test.js              - Run read-only tests
 *   node scripts/v0.test.js --write      - Include write tests (create/send_message)
 */

const {
  getChatList, getFileList, getFileContent, searchChats,
  createChat, pollUntilComplete, sendMessage, waitForNewVersion,
  getVersionList
} = require('./v0.js')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logTest(name) {
  console.log(`\n${colors.cyan}▶ ${name}${colors.reset}`)
}

function logSuccess(message) {
  log(`  ✓ ${message}`, colors.green)
}

function logError(message) {
  log(`  ✗ ${message}`, colors.red)
}

function logInfo(message) {
  log(`  ${message}`, colors.dim)
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Read Tests ───────────────────────────────────────────────────────────────

const readTests = {
  async testGetChatList() {
    logTest('get_chat_list')

    try {
      const result = await getChatList({ limit: '5', offset: '0' })

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid response: expected { data: [...] }')
      }

      logSuccess(`Retrieved ${result.data.length} chat(s)`)
      if (result.data.length > 0) {
        logInfo(`First: ${result.data[0].id} — ${result.data[0].name || '(unnamed)'}`)
      }

      return { success: true, data: result }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  },

  async testGetFileList(chatId) {
    logTest('get_file_list')

    if (!chatId) {
      logError('No chatId (skipped)')
      return { success: false, skipped: true }
    }

    try {
      const result = await getFileList(chatId)

      if (!result.files || !Array.isArray(result.files)) {
        throw new Error('Invalid response: expected { files: [...] }')
      }

      logSuccess(`Found ${result.files.length} file(s) in version ${result.versionId}`)
      result.files.forEach(f => logInfo(`  - ${f.name} (${f.lang})`))

      return { success: true, data: result }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  },

  async testGetFileContent(chatId) {
    logTest('get_file_content (all files)')

    if (!chatId) {
      logError('No chatId (skipped)')
      return { success: false, skipped: true }
    }

    try {
      const result = await getFileContent(chatId)

      if (!result.files || !Array.isArray(result.files)) {
        throw new Error('Invalid response: expected { files: [...] }')
      }

      result.files.forEach(f => {
        if (!f.source) throw new Error(`File ${f.name} has no source content`)
      })

      logSuccess(`Retrieved ${result.files.length} file(s) with content`)
      result.files.forEach(f => {
        logInfo(`  - ${f.name}: ${f.source.split('\n').length} lines`)
      })

      return { success: true, data: result }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  },

  async testGetFileContentSpecific(chatId, fileName) {
    logTest('get_file_content (specific file)')

    if (!chatId || !fileName) {
      logError('No chatId or fileName (skipped)')
      return { success: false, skipped: true }
    }

    try {
      const result = await getFileContent(chatId, { files: [fileName] })

      if (!result.files || result.files.length === 0) {
        throw new Error('No files returned')
      }

      const file = result.files[0]
      logSuccess(`Retrieved ${file.name}: ${file.source.split('\n').length} lines`)

      return { success: true, data: result }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  },

  async testSearchChats() {
    logTest('search_chats')

    try {
      const chatList = await getChatList({ limit: '1' })
      const chats = chatList.data || []

      if (chats.length === 0) {
        logInfo('No chats available')
        return { success: false, skipped: true }
      }

      const query = (chats[0].name || chats[0].id).substring(0, 3)
      logInfo(`Searching for: "${query}"`)

      const result = await searchChats(query, { searchFiles: false })

      if (!result.query || !Array.isArray(result.results)) {
        throw new Error('Invalid response: expected { query, results: [...] }')
      }

      logSuccess(`Found ${result.results.length} result(s)`)
      result.results.slice(0, 3).forEach(r => {
        logInfo(`  - ${r.name} (${r.matchType})`)
      })

      return { success: true, data: result }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  }
}

// ─── Write Tests ──────────────────────────────────────────────────────────────

const writeTests = {
  async testCreateChat() {
    logTest('create_chat')

    try {
      console.log('  Creating chat...')
      const chat = await createChat('Create a simple React button component with primary and secondary variants. Use Tailwind CSS.')
      const chatId = chat.id || chat.chatId

      if (!chatId) throw new Error('No chatId in response')
      logSuccess(`Chat created: ${chatId}`)

      console.log('  Waiting for generation...')
      const version = await pollUntilComplete(chatId, 180000)
      const files = version.files || []

      if (files.length === 0) throw new Error('No files generated')

      files.forEach(f => {
        if (!f.content) throw new Error(`File ${f.name} has no content`)
      })

      logSuccess(`Version ${version.id}: ${files.length} file(s)`)
      files.forEach(f => logInfo(`  - ${f.name} (${f.content.length} bytes)`))

      return { success: true, data: { chatId, versionId: version.id } }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  },

  async testSendMessage(chatId) {
    logTest('send_message')

    if (!chatId) {
      logError('No chatId (skipped)')
      return { success: false, skipped: true }
    }

    try {
      const versionsBefore = await getVersionList(chatId)
      const prevVersionId = (versionsBefore.data || [])[0]?.id

      console.log('  Sending follow-up message...')
      await sendMessage(chatId, 'Add a loading state with a spinner to the button')

      console.log('  Waiting for new version...')
      const version = await waitForNewVersion(chatId, prevVersionId, 180000)
      const files = version.files || []

      if (files.length === 0) throw new Error('No files in new version')
      if (version.id === prevVersionId) throw new Error('Version did not change')

      logSuccess(`New version ${version.id}: ${files.length} file(s)`)

      return { success: true, data: { chatId, versionId: version.id } }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  }
}

// ─── Test Runner ──────────────────────────────────────────────────────────────

async function runTests(options = {}) {
  log('\n═══════════════════════════════════════', colors.blue)
  log('  v0 API Test Suite', colors.blue)
  log('═══════════════════════════════════════\n', colors.blue)

  const results = { total: 0, passed: 0, failed: 0, skipped: 0 }

  function record(result) {
    results.total++
    if (result.success) results.passed++
    else if (result.skipped) results.skipped++
    else results.failed++
  }

  let testChatId = null
  let testFileName = null

  try {
    if (!process.env.V0_API_KEY) {
      logError('V0_API_KEY environment variable not set')
      process.exit(1)
    }

    // ─── Read Tests ─────────────────────────────────────────────────────

    log('\n── Read Tests ──\n', colors.blue)

    const chatListResult = await readTests.testGetChatList()
    record(chatListResult)
    if (chatListResult.data?.data?.length > 0) {
      testChatId = chatListResult.data.data[0].id
    }
    await sleep(500)

    const fileListResult = await readTests.testGetFileList(testChatId)
    record(fileListResult)
    if (fileListResult.data?.files?.length > 0) {
      testFileName = fileListResult.data.files[0].name
    }
    await sleep(500)

    record(await readTests.testGetFileContent(testChatId))
    await sleep(500)

    record(await readTests.testGetFileContentSpecific(testChatId, testFileName))
    await sleep(500)

    record(await readTests.testSearchChats())

    // ─── Write Tests ────────────────────────────────────────────────────

    if (options.write) {
      log('\n── Write Tests ──\n', colors.blue)
      log('  ⚠  Write tests create real v0 chats and consume API credits\n', colors.yellow)

      const createResult = await writeTests.testCreateChat()
      record(createResult)

      const writeChatId = createResult.data?.chatId
      await sleep(1000)

      record(await writeTests.testSendMessage(writeChatId))
    } else {
      log('\n── Write Tests (skipped, use --write to enable) ──\n', colors.yellow)
    }

  } catch (error) {
    logError(`\nUnexpected error: ${error.message}`)
    console.error(error)
  }

  // Summary
  log('\n═══════════════════════════════════════', colors.blue)
  log('  Test Summary', colors.blue)
  log('═══════════════════════════════════════\n', colors.blue)

  log(`Total:   ${results.total}`)
  log(`Passed:  ${results.passed}`, colors.green)
  log(`Failed:  ${results.failed}`, results.failed > 0 ? colors.red : colors.reset)
  log(`Skipped: ${results.skipped}`, colors.yellow)

  if (testChatId) {
    log(`\n${colors.dim}Tested with chat: ${testChatId}${colors.reset}`)
  }

  process.exit(results.failed > 0 ? 1 : 0)
}

// CLI
const cliArgs = process.argv.slice(2)

if (cliArgs.includes('--help') || cliArgs.includes('-h')) {
  console.log('v0 API Test Suite')
  console.log('')
  console.log('Usage:')
  console.log('  node scripts/v0.test.js              Run read-only tests')
  console.log('  node scripts/v0.test.js --write      Include write tests')
  console.log('')
  console.log('Environment:')
  console.log('  V0_API_KEY    Required. Get from https://v0.dev/chat/settings/keys')
  process.exit(0)
}

runTests({ write: cliArgs.includes('--write') })
