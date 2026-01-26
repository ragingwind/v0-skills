#!/usr/bin/env node

/**
 * v0 API Test Suite
 * Tests all v0 API commands with real API calls
 *
 * Usage:
 *   node scripts/v0.test.js              - Run all tests
 *   node scripts/v0.test.js --quick      - Quick test (skip creation)
 *   node scripts/v0.test.js --cleanup    - Cleanup test chats
 */

const { getChatList, getFileList, getFileContent, getFilesByPath } = require('./v0.js')

// Test configuration
const TEST_CHAT_PREFIX = 'test-v0-api-'

// ANSI colors for output
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

// Test helpers
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Test Suite
const tests = {
  async testGetChatList() {
    logTest('Test: get_chat_list')

    try {
      const result = await getChatList({ limit: '5', offset: '0' })

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid response structure')
      }

      logSuccess(`Retrieved ${result.data.length} chat(s)`)

      if (result.data.length > 0) {
        logInfo(`First chat: ${result.data[0].id}`)
      }

      return { success: true, data: result }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  },

  async testGetFileList(chatId) {
    logTest('Test: get_file_list')

    if (!chatId) {
      logError('No chatId provided (skipped)')
      return { success: false, skipped: true }
    }

    try {
      const result = await getFileList(chatId)

      if (!result.files || !Array.isArray(result.files)) {
        throw new Error('Invalid response structure')
      }

      logSuccess(`Found ${result.files.length} file(s)`)

      result.files.forEach(file => {
        logInfo(`  - ${file.name} (${file.lang})`)
      })

      return { success: true, data: result }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  },

  async testGetFileContent(chatId) {
    logTest('Test: get_file_content (all files)')

    if (!chatId) {
      logError('No chatId provided (skipped)')
      return { success: false, skipped: true }
    }

    try {
      const result = await getFileContent(chatId)

      if (!result.files || !Array.isArray(result.files)) {
        throw new Error('Invalid response structure')
      }

      logSuccess(`Retrieved ${result.files.length} file(s) with content`)

      result.files.forEach(file => {
        const lines = file.source.split('\n').length
        logInfo(`  - ${file.name}: ${lines} lines`)
      })

      return { success: true, data: result }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  },

  async testGetFileContentSpecific(chatId, fileName) {
    logTest('Test: get_file_content (specific file)')

    if (!chatId || !fileName) {
      logError('No chatId or fileName provided (skipped)')
      return { success: false, skipped: true }
    }

    try {
      const result = await getFileContent(chatId, { files: [fileName] })

      if (!result.files || result.files.length === 0) {
        throw new Error('No files returned')
      }

      const file = result.files[0]
      const lines = file.source.split('\n').length

      logSuccess(`Retrieved ${file.name}: ${lines} lines`)

      return { success: true, data: result }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  },

  async testGetFilesByPath(chatId) {
    logTest('Test: get_files_by_path')

    if (!chatId) {
      logError('No chatId provided (skipped)')
      return { success: false, skipped: true }
    }

    try {
      // First get file list to find a valid path
      const fileList = await getFileList(chatId)

      if (fileList.files.length === 0) {
        logError('No files to test with (skipped)')
        return { success: false, skipped: true }
      }

      // Extract path from first file (e.g., "components/Button.tsx" -> "components")
      const firstFile = fileList.files[0].name
      let testPath = firstFile.includes('/')
        ? firstFile.split('/')[0]
        : firstFile.split('.')[0]

      logInfo(`Testing path: ${testPath}`)

      const result = await getFilesByPath(chatId, testPath)

      if (!result.files || !Array.isArray(result.files)) {
        throw new Error('Invalid response structure')
      }

      if (result.path !== testPath) {
        throw new Error(`Path mismatch: expected ${testPath}, got ${result.path}`)
      }

      logSuccess(`Found ${result.count} file(s) under path "${result.path}"`)

      result.files.forEach(file => {
        const lines = file.source.split('\n').length
        logInfo(`  - ${file.name}: ${lines} lines`)
      })

      return { success: true, data: result }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  },

  async cleanupTestChats() {
    logTest('Cleanup: Remove test chats')

    try {
      const result = await getChatList({ limit: '100', offset: '0' })
      const testChats = result.data.filter(chat =>
        chat.id.startsWith(TEST_CHAT_PREFIX)
      )

      if (testChats.length === 0) {
        logInfo('No test chats to cleanup')
        return { success: true, cleaned: 0 }
      }

      logInfo(`Found ${testChats.length} test chat(s) to cleanup`)
      logInfo('Note: v0 API does not support chat deletion via API')
      logInfo('Please delete these chats manually from https://v0.dev/chat')

      testChats.forEach(chat => {
        logInfo(`  - ${chat.id}`)
      })

      return { success: true, cleaned: testChats.length }
    } catch (error) {
      logError(`Failed: ${error.message}`)
      return { success: false, error }
    }
  }
}

// Main test runner
async function runTests(options = {}) {
  log('\n═══════════════════════════════════════', colors.blue)
  log('  v0 API Test Suite', colors.blue)
  log('═══════════════════════════════════════\n', colors.blue)

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }

  let testChatId = null
  let testFileName = null

  try {
    // Check API key
    if (!process.env.V0_API_KEY) {
      logError('V0_API_KEY environment variable not set')
      process.exit(1)
    }

    // Test 1: Get chat list
    results.total++
    const chatListResult = await tests.testGetChatList()
    if (chatListResult.success) {
      results.passed++
      // Use first chat from list for subsequent tests
      if (chatListResult.data?.data?.length > 0) {
        testChatId = chatListResult.data.data[0].id
      }
    } else {
      results.failed++
    }

    await sleep(500)

    // Test 2: Get file list
    results.total++
    const fileListResult = await tests.testGetFileList(testChatId)
    if (fileListResult.success) {
      results.passed++
      if (fileListResult.data?.files?.length > 0) {
        testFileName = fileListResult.data.files[0].name
      }
    } else if (fileListResult.skipped) {
      results.skipped++
    } else {
      results.failed++
    }

    await sleep(500)

    // Test 3: Get file content (all)
    results.total++
    const fileContentResult = await tests.testGetFileContent(testChatId)
    if (fileContentResult.success) results.passed++
    else if (fileContentResult.skipped) results.skipped++
    else results.failed++

    await sleep(500)

    // Test 4: Get file content (specific)
    results.total++
    const fileContentSpecificResult = await tests.testGetFileContentSpecific(testChatId, testFileName)
    if (fileContentSpecificResult.success) results.passed++
    else if (fileContentSpecificResult.skipped) results.skipped++
    else results.failed++

    await sleep(500)

    // Test 5: Get files by path
    results.total++
    const filesByPathResult = await tests.testGetFilesByPath(testChatId)
    if (filesByPathResult.success) results.passed++
    else if (filesByPathResult.skipped) results.skipped++
    else results.failed++

    // Cleanup if requested
    if (options.cleanup) {
      await sleep(500)
      await tests.cleanupTestChats()
    }

  } catch (error) {
    logError(`\nUnexpected error: ${error.message}`)
    console.error(error)
  }

  // Print summary
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

  const exitCode = results.failed > 0 ? 1 : 0
  process.exit(exitCode)
}

// CLI handler
const args = process.argv.slice(2)
const options = {
  cleanup: args.includes('--cleanup')
}

if (args.includes('--help') || args.includes('-h')) {
  console.log('v0 API Test Suite')
  console.log('')
  console.log('Usage:')
  console.log('  node scripts/v0.test.js              Run all tests')
  console.log('  node scripts/v0.test.js --cleanup    Cleanup test chats')
  console.log('  node scripts/v0.test.js --help       Show this help')
  console.log('')
  console.log('Environment:')
  console.log('  V0_API_KEY    Required. Get from https://v0.dev/chat/settings/keys')
  process.exit(0)
}

runTests(options)
