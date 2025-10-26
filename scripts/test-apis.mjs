#!/usr/bin/env node

/**
 * Test script to verify Firecrawl and Groq connectivity
 * Run with: npm run test:apis
 */

import { FirecrawlClient } from '../src/lib/research/firecrawl-client.js'
import { GroqClient } from '../src/lib/research/groq-client.js'
import { FiresearchAdapter } from '../src/lib/research/firesearch-adapter.js'

async function testFirecrawlConnectivity() {
  console.log('🔍 Testing Firecrawl connectivity...')
  
  try {
    const firecrawl = new FirecrawlClient()
    
    // Test 1: Simple search
    console.log('  Testing search...')
    const searchResult = await firecrawl.search('artificial intelligence startups', { limit: 3 })
    console.log('  ✅ Search successful:', searchResult.data?.length || 0, 'results')
    
    // Test 2: Single URL scrape
    console.log('  Testing scrape...')
    const scrapeResult = await firecrawl.scrapeUrl('https://example.com', {
      formats: ['markdown'],
      onlyMainContent: true
    })
    console.log('  ✅ Scrape successful:', scrapeResult.data?.content ? 'Content extracted' : 'No content')
    
    return true
  } catch (error) {
    console.error('  ❌ Firecrawl test failed:', error.message)
    return false
  }
}

async function testGroqConnectivity() {
  console.log('🤖 Testing Groq connectivity...')
  
  try {
    const groq = new GroqClient()
    
    // Test simple chat
    console.log('  Testing chat completion...')
    const response = await groq.chat([
      { role: 'user', content: 'Say "Hello from Groq!" in exactly those words.' }
    ])
    console.log('  ✅ Chat successful:', response.substring(0, 50) + '...')
    
    return true
  } catch (error) {
    console.error('  ❌ Groq test failed:', error.message)
    return false
  }
}

async function testFiresearchWorkflow() {
  console.log('🔄 Testing Firesearch workflow...')
  
  try {
    const workflow = new FiresearchAdapter((state) => {
      console.log(`    Progress: ${state.currentStep} (${state.progress}%)`)
    })
    
    // Test with a simple query
    const result = await workflow.run({
      query: 'AI productivity tools',
      depth: 1,
      competitorUrls: ['https://example.com']
    })
    
    console.log('  ✅ Firesearch workflow successful:', result.pain_points ? 'Insights generated' : 'No insights')
    return true
  } catch (error) {
    console.error('  ❌ Firesearch workflow test failed:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Starting API connectivity tests...\n')
  
  const results = {
    firecrawl: await testFirecrawlConnectivity(),
    groq: await testGroqConnectivity(),
    workflow: await testFiresearchWorkflow()
  }
  
  console.log('\n📊 Test Results:')
  console.log(`  Firecrawl: ${results.firecrawl ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`  Groq: ${results.groq ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`  Workflow: ${results.workflow ? '✅ PASS' : '❌ FAIL'}`)
  
  const allPassed = Object.values(results).every(Boolean)
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed. Check your API keys and network connection.'}`)
  
  if (!allPassed) {
    console.log('\n💡 Troubleshooting:')
    console.log('  1. Check your .env.local file has FIRECRAWL_API_KEY and GROQ_API_KEY')
    console.log('  2. Verify your API keys are valid and have credits')
    console.log('  3. Check your internet connection')
    console.log('  4. Review the error messages above for specific issues')
  }
  
  process.exit(allPassed ? 0 : 1)
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error)
}

export { testFirecrawlConnectivity, testGroqConnectivity, testFiresearchWorkflow }
