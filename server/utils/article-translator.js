/**
 * article-translator.js — Translates article fields from Ukrainian to Russian
 * Uses single-batch HTTP request for instant translation without rate limits.
 */

'use strict';

const fetch = require('node-fetch');

const GT_URL = 'https://translate.googleapis.com/translate_a/single';
const SPLITTER = '\n\n===SPLIT===\n\n';
const SPLITTER_REGEX = /\s*===\s*SPLIT\s*===\s*/i;

/**
 * Translate a text chunk from 'uk' to 'ru' using the free Google API.
 * @param {string} text
 * @returns {Promise<string>}
 */
async function translateTextChunk(text) {
  if (!text || !text.trim()) return text;

  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'uk',
    tl: 'ru',
    dt: 't',
    q: text,
  });

  const res = await fetch(`${GT_URL}?${params}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ru,uk,en;q=0.9',
    },
    timeout: 30000,
  });

  if (!res.ok) {
    throw new Error(`Google Translate API error: HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('Unexpected translation response format');
  }

  const translated = data[0]
    .filter(chunk => Array.isArray(chunk) && chunk[0])
    .map(chunk => chunk[0])
    .join('');

  return translated;
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

  if (!toTranslate.length) {
    return { title: article.title, subtitle: article.subtitle, seo_description: article.seo_description, sections: article.sections };
  }

  console.log(`[Translator] Translating ${toTranslate.length} chunks for "${article.slug || 'article'}"...`);

  // Join with delimiter for single-batch request
  const combined = toTranslate.join(SPLITTER);
  let translatedCombined = '';

  try {
    translatedCombined = await translateTextChunk(combined);
  } catch (err) {
    console.warn('[Translator] Batch translation failed, falling back to individual chunks:', err.message);
    const fallbackResults = [];
    for (const chunk of toTranslate) {
      const res = await translateTextChunk(chunk);
      fallbackResults.push(res);
      await new Promise(r => setTimeout(r, 100));
    }
    translatedCombined = fallbackResults.join(SPLITTER);
  }

  const translatedArray = translatedCombined.split(SPLITTER_REGEX);

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
    const val = (translatedArray[idx] !== undefined) ? translatedArray[idx].trim() : toTranslate[idx];
    if (key.type === 'top') {
      ruData[key.field] = val;
    } else {
      ruData.sections[key.index][key.field] = val;
    }
  });

  return ruData;
}

module.exports = { translateTextChunk, translateArticle };
