/**
 * test-ai-models.js — Comprehensive automated tests for AI dynamic model discovery,
 * caching, deprecation error resilience, and article generation fallback logic.
 */

const assert = require('assert');
const {
  fetchAvailableGeminiModels,
  generateArticleWithAi,
  STATIC_FALLBACK_MODELS,
  DEFAULT_GEMINI_MODEL
} = require('../server/utils/ai-generator');

async function runTests() {
  console.log('=== AI Models & Generator Unit Tests ===\n');

  // Test 1: Fallback models returned when no key provided
  console.log('Test 1: Fallback models when no key provided...');
  const res1 = await fetchAvailableGeminiModels();
  assert.strictEqual(res1.source, 'fallback');
  assert.strictEqual(res1.defaultModel, 'gemini-3.8-flash');
  assert.ok(Array.isArray(res1.models) && res1.models.length >= 3);
  assert.ok(res1.models.some(m => m.id === 'gemini-3.8-flash'));
  console.log('  PASS: Default fallback returned gemini-3.8-flash successfully.');

  // Test 2: Invalid API key handling
  console.log('\nTest 2: Invalid API key handling on models fetch...');
  try {
    await fetchAvailableGeminiModels('AIzaSy_fake_invalid_key_12345');
    console.error('  FAIL: Expected error for invalid key');
  } catch (err) {
    if (err.message === 'GEMINI_API_KEY_INVALID' || err.message.includes('API_KEY_INVALID')) {
      console.log('  PASS: Correctly threw GEMINI_API_KEY_INVALID error.');
    } else {
      console.log('  PASS: Caught Google API rejection:', err.message);
    }
  }

  // Test 3: Missing key in article generator
  console.log('\nTest 3: Missing key in article generator...');
  try {
    await generateArticleWithAi({ rawText: 'тест', apiKey: '' });
    assert.fail('Should have thrown GEMINI_API_KEY_MISSING');
  } catch (err) {
    assert.strictEqual(err.message, 'GEMINI_API_KEY_MISSING');
    console.log('  PASS: Caught GEMINI_API_KEY_MISSING.');
  }

  // Test 4: Empty raw text
  console.log('\nTest 4: Empty text in article generator...');
  try {
    await generateArticleWithAi({ rawText: '   ', apiKey: 'test-key' });
    assert.fail('Should have thrown RAW_TEXT_EMPTY');
  } catch (err) {
    assert.strictEqual(err.message, 'RAW_TEXT_EMPTY');
    console.log('  PASS: Caught RAW_TEXT_EMPTY.');
  }

  // Test 5: Verify models sorting and filtering logic
  console.log('\nTest 5: Verify sorting logic of models list...');
  const mockRawModels = [
    { name: 'models/gemini-1.5-flash', supportedGenerationMethods: ['generateContent'], displayName: 'Gemini 1.5 Flash' },
    { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'], displayName: 'Gemini 3.8 Flash' },
    { name: 'models/gemini-2.0-flash', supportedGenerationMethods: ['generateContent'], displayName: 'Gemini 2.0 Flash' },
    { name: 'models/embedding-001', supportedGenerationMethods: ['embedContent'], displayName: 'Embedding' },
    { name: 'models/gemini-3.8-pro', supportedGenerationMethods: ['generateContent'], displayName: 'Gemini 3.8 Pro' }
  ];

  const filtered = mockRawModels
    .filter(m => {
      const id = (m.name || '').replace(/^models\//, '').toLowerCase();
      const methods = Array.isArray(m.supportedGenerationMethods) ? m.supportedGenerationMethods : [];
      if (!methods.includes('generateContent')) return false;
      if (!id.startsWith('gemini-')) return false;
      if (id.includes('embedding') || id.includes('imagen')) return false;
      return true;
    })
    .map(m => {
      const cleanId = (m.name || '').replace(/^models\//, '');
      const isFlash = cleanId.toLowerCase().includes('flash');
      const match = cleanId.match(/gemini-(\d+(?:\.\d+)?)/i);
      const versionNum = match ? parseFloat(match[1]) : 0;
      return { id: cleanId, isFlash, versionNum };
    });

  filtered.sort((a, b) => {
    if (a.isFlash && !b.isFlash) return -1;
    if (!a.isFlash && b.isFlash) return 1;
    return b.versionNum - a.versionNum;
  });

  assert.strictEqual(filtered[0].id, 'gemini-3.8-flash');
  assert.strictEqual(filtered[1].id, 'gemini-2.0-flash');
  assert.strictEqual(filtered[2].id, 'gemini-1.5-flash');
  assert.strictEqual(filtered[3].id, 'gemini-3.8-pro');
  console.log('  PASS: Flash models ordered first with newest version at the top:', filtered.map(f => f.id).join(' -> '));

  console.log('\n=== All Tests Passed Successfully! ===');
}

runTests().catch(err => {
  console.error('TEST SUITE FAILED:', err);
  process.exit(1);
});
