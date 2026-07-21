/**
 * article-translator.js — Translates article fields from Ukrainian to Russian
 * Uses the free (no-key) Google Translate API endpoint.
 * Limit: ~100 requests/minute on the free tier.
 */

'use strict';

const fetch = require('node-fetch');

const GT_URL = 'https://translate.googleapis.com/translate_a/single';

/**
 * Translate a single text string from 'uk' to 'ru' using the free Google API.
 * @param {string} text
 * @returns {Promise<string>}
 */
async function translateText(text) {
  if (!text || !text.trim()) return text;

  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'uk',
    tl: 'ru',
    dt: 't',
    q: text,
  });

  const res = await fetch(`${GT_URL}?${params}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 15000,
  });

  if (!res.ok) {
    throw new Error(`Google Translate HTTP ${res.status}`);
  }

  const data = await res.json();

  // Response format: [ [ [translated, original, ...], ... ], ... ]
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('Unexpected Google Translate response format');
  }

  const translated = data[0]
    .filter(chunk => Array.isArray(chunk) && chunk[0])
    .map(chunk => chunk[0])
    .join('');

  return translated;
}

/**
 * Translate an array of texts in a batch (sequential, with small delay to avoid rate limit).
 * @param {string[]} texts
 * @returns {Promise<string[]>}
 */
async function translateBatch(texts) {
  const results = [];
  for (const text of texts) {
    const t = await translateText(text);
    results.push(t);
    // small delay to avoid hitting rate limits
    await new Promise(r => setTimeout(r, 120));
  }
  return results;
}

/**
 * Translate all text fields of an article object (uk → ru).
 * Returns a `translations.ru` object to be merged into the article.
 *
 * @param {object} article
 * @returns {Promise<object>} - translations.ru payload
 */
async function translateArticle(article) {
  const toTranslate = [];
  const keys = [];

  // Top-level fields
  const topFields = ['title', 'subtitle', 'seo_description'];
  for (const f of topFields) {
    if (article[f]) {
      keys.push({ type: 'top', field: f });
      toTranslate.push(article[f]);
    }
  }

  // Sections
  const sections = article.sections || [];
  sections.forEach((s, i) => {
    if (s.heading) {
      keys.push({ type: 'section', index: i, field: 'heading' });
      toTranslate.push(s.heading);
    }
    if (s.text) {
      keys.push({ type: 'section', index: i, field: 'text' });
      toTranslate.push(s.text);
    }
  });

  console.log(`[Translator] Translating ${toTranslate.length} text chunks...`);
  const translated = await translateBatch(toTranslate);

  // Assemble result
  const ruData = {
    title: article.title,
    subtitle: article.subtitle,
    seo_description: article.seo_description,
    sections: sections.map(s => ({
      id: s.id,
      heading: s.heading,
      text: s.text,
      image: s.image,
      youtube_url: s.youtube_url,
      show_cta_button: s.show_cta_button,
    })),
  };

  keys.forEach((key, idx) => {
    if (key.type === 'top') {
      ruData[key.field] = translated[idx];
    } else {
      ruData.sections[key.index][key.field] = translated[idx];
    }
  });

  return ruData;
}

module.exports = { translateText, translateArticle };
