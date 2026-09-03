/**
 * ai-generator.js — Generates structured articles using Google Gemini API
 * Designed for Dr. Teternik's medical blog (Kharkiv).
 */

'use strict';

const fetch = require('node-fetch');

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const ALLOWED_TAGS = ['Гастроскопія', 'Колоноскопія', 'УЗД', 'ЕРХПГ', 'Підготовка', 'Хірургія', 'Поліпи', 'Онкологія'];

/**
 * Generate a complete, SEO-optimized article structure from raw text using Google Gemini API.
 *
 * @param {object} params
 * @param {string} params.rawText - Raw input text (e.g. from Instagram, rough notes, case study)
 * @param {string} [params.topicHint] - Optional topic hint (e.g. 'Гастроскопія')
 * @param {Array<object>} [params.existingArticles] - Array of existing articles for internal linking
 * @param {string} [params.apiKey] - Optional explicit Gemini API key (defaults to process.env.GEMINI_API_KEY)
 * @param {string} [params.model] - Optional Gemini model name (defaults to GEMINI_MODEL or gemini-3.6-flash)
 * @returns {Promise<object>} Generated article data formatted for articles-admin editor
 */
async function generateArticleWithAi({ rawText, topicHint, existingArticles = [], apiKey, model }) {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  if (!rawText || !rawText.trim()) {
    throw new Error('RAW_TEXT_EMPTY');
  }

  // Build existing articles summary for the prompt
  const articlesContext = existingArticles.map(a => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    tags: a.tags || []
  }));

  const systemInstruction = `Ти — провідний медичний редактор та експертний асистент лікаря-хірурга, ендоскопіста, лікаря УЗД вищої категорії Тетерніка Олега Олександровича (м. Харків, 17-а міська лікарня).

ТВОЄ ЗАВДАННЯ:
На основі наданого користувачем сирого тексту (пост з Instagram, чернетка, тези чи клінічний випадок) створити повноцінну, професійну, структуровану медичну статтю українською мовою для сайту лікаря.

ВАЖЛИВІ ПРАВИЛА:
1. МОВА ТА ТОН: Грамотна українська мова, теплий, турботливий, але строго експертний тон лікаря. Пояснювати складні терміни простими словами, заспокоювати страхи пацієнта перед процедурами (гастроскопія/колоноскопія/операції без болю, у медикаментозному сні).
2. ЗАГОЛОВОК (title): Привабливий, клікабельний, але без дешевого клікбейту (наприклад: «Чому печія може бути небезпечною: пояснення лікаря-ендоскопіста»).
3. ПІДЗАГОЛОВОК / ЛІД (subtitle): 1-2 речення короткого вступу, що розкриває головну думку статті.
4. URL-SLUG (slug): Чіткий латинський транслітерований slug через дефіси (наприклад: 'chomu-pechiya-nebezpechna', 'vydalennya-polipiv-shlunku'). Тільки маленькі латинські літери a-z, 0-9 та дефіс.
5. SEO-ОПИС (seo_description): РІВНО 130–160 символів! Містить ключові слова (назва хвороби/процедури, Харків, поради лікаря) та заклик до дії/користь. Якщо довжина вийде менше 130 або більше 160 — це помилка, тримайся діапазону 135-155 символів.
6. ТЕГИ (tags): 1-3 найбільш підходящі теги виключно з дозволеного списку: ${JSON.stringify(ALLOWED_TAGS)}.
7. РОЗДІЛИ СТАТТІ (sections):
   - Розбий статтю на 3–5 логічних розділів.
   - Кожен розділ має містити:
     * 'heading': чіткий інформативний підзаголовок розділу.
     * 'text': 2–4 абзаци тексту. Використовуй:
       - **жирний текст** для виділення важливих симптомів, діагнозів чи порад;
       - *курсив* для медичних акцентів;
       - марковані списки (кожен пункт починається з '- ');
       - абзаци розділяй звичайним перенесенням рядка.
8. АВТОМАТИЧНА ПЕРЕЛІНКОВКА (internal links):
   Ось список вже опублікованих статей на сайті:
   ${JSON.stringify(articlesContext, null, 2)}
   - Якщо в тексті статті доречно згадується тема/процедура іншої статті з цього списку, ВСТАВ ПОСИЛАННЯ в форматі: [[LINK:article_id:анкорний текст]].
   - Приклад: «Якщо призначена [[LINK:4034ca8a-50a8-458d-a56d-d3dc2af92427:підготовка до колоноскопії]], важливо дотримуватися дієти...»
   - Не перенасичуй: 1-3 якісних посилань на статтю цілком достатньо. Використовуй тільки реальні ID з наданого списку!
9. FAQ (Швидкі відповіді): 2–4 найчастіших практичних запитання пацієнтів по цій темі з чіткими, лаконічними відповідями (1-3 речення).
10. ПОВ'ЯЗАНІ СТАТТІ (related_articles): Масив з 2–3 ID статей з наданого списку, які найбільше підходять для блоку «Читайте також». Якщо статей у списку мало, обери найближчі.`;

  const promptContent = `ТЕКСТ ДЛЯ ОБРОБКИ:
${topicHint ? `[Пріоритетна тема: ${topicHint}]\n` : ''}
${rawText}

Сформуй JSON-об'єкт статті строго за схемою.`;

  const payload = {
    contents: [
      {
        parts: [
          { text: promptContent }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: systemInstruction }
      ]
    },
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
      responseSchema: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Заголовок статті українською мовою' },
          subtitle: { type: 'STRING', description: 'Підзаголовок / лід статті' },
          slug: { type: 'STRING', description: 'Латинський URL slug через дефіс' },
          seo_description: { type: 'STRING', description: 'SEO meta description рівно 130-160 символів' },
          tags: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: '1-3 теги з дозволеного списку'
          },
          sections: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                heading: { type: 'STRING', description: 'Підзаголовок розділу' },
                text: { type: 'STRING', description: 'Текст розділу з форматуванням (**жирний**, *курсив*, списки з - , [[LINK:id:анкор]])' }
              },
              required: ['heading', 'text']
            }
          },
          faq: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                question: { type: 'STRING', description: 'Запитання пацієнта' },
                answer: { type: 'STRING', description: 'Відповідь лікаря' }
              },
              required: ['question', 'answer']
            }
          },
          related_articles: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Масив з 2-3 ID релевантних статей'
          }
        },
        required: ['title', 'subtitle', 'slug', 'seo_description', 'tags', 'sections', 'faq', 'related_articles']
      }
    }
  };

  const requestedModel = model || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const candidateModels = [requestedModel];
  ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'].forEach(m => {
    if (!candidateModels.includes(m)) candidateModels.push(m);
  });

  let response = null;
  let lastErrorDetails = '';
  let usedModel = requestedModel;

  for (const currentModel of candidateModels) {
    usedModel = currentModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${encodeURIComponent(key)}`;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 45000
      });

      if (response.ok) {
        break;
      }

      let errorDetails = '';
      try {
        const errJson = await response.json();
        errorDetails = errJson.error ? errJson.error.message : JSON.stringify(errJson);
      } catch (_) {
        errorDetails = await response.text();
      }

      lastErrorDetails = errorDetails;

      if (response.status === 400 && errorDetails.includes('API_KEY_INVALID')) {
        throw new Error('GEMINI_API_KEY_INVALID');
      }
      if (response.status === 429 || errorDetails.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('GEMINI_QUOTA_EXCEEDED');
      }

      if (response.status === 404) {
        console.warn(`[AiGenerator] Model "${currentModel}" returned 404 (${errorDetails}). Trying fallback...`);
        continue;
      }

      throw new Error(`Gemini API Error (HTTP ${response.status}): ${errorDetails}`);
    } catch (networkErr) {
      if (networkErr.message === 'GEMINI_API_KEY_INVALID' || networkErr.message === 'GEMINI_QUOTA_EXCEEDED') {
        throw networkErr;
      }
      if (candidateModels.indexOf(currentModel) === candidateModels.length - 1) {
        throw networkErr;
      }
    }
  }

  if (!response || !response.ok) {
    throw new Error(`Gemini API Error: Не вдалося звернутися до жодної з моделей Gemini (${candidateModels.join(', ')}). Деталі: ${lastErrorDetails}`);
  }

  console.log(`[AiGenerator] Successfully generated content using model: ${usedModel}`);

  const resultData = await response.json();

  const rawCandidateText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawCandidateText) {
    throw new Error('Порожня або некоректна відповідь від моделі Gemini.');
  }

  let parsedArticle;
  try {
    // Strip markdown fences if present
    const cleanJsonText = rawCandidateText.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/g, '').trim();
    parsedArticle = JSON.parse(cleanJsonText);
  } catch (err) {
    console.error('[AiGenerator] JSON parse error:', err, 'Raw text was:', rawCandidateText);
    throw new Error('Не вдалося розібрати згенерований JSON статті.');
  }

  // Normalize and sanitize fields
  const normalized = {
    title: (parsedArticle.title || '').trim(),
    subtitle: (parsedArticle.subtitle || '').trim(),
    slug: (parsedArticle.slug || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''),
    seo_description: (parsedArticle.seo_description || '').trim(),
    tags: Array.isArray(parsedArticle.tags) ? parsedArticle.tags.filter(t => ALLOWED_TAGS.includes(t)) : [],
    sections: (Array.isArray(parsedArticle.sections) ? parsedArticle.sections : []).map((s, idx) => ({
      id: `section-${idx + 1}`,
      heading: (s.heading || `Розділ ${idx + 1}`).trim(),
      text: (s.text || '').trim(),
      image: null,
      youtube_url: null,
      video_url: null,
      show_cta_button: false
    })),
    faq: (Array.isArray(parsedArticle.faq) ? parsedArticle.faq : []).map((f, idx) => ({
      id: `faq-${idx + 1}`,
      question: (f.question || '').trim(),
      answer: (f.answer || '').trim()
    })).filter(f => f.question && f.answer),
    related_articles: Array.isArray(parsedArticle.related_articles)
      ? parsedArticle.related_articles.filter(id => existingArticles.some(a => a.id === id))
      : []
  };

  // Ensure fallback tags if empty
  if (!normalized.tags.length && topicHint && ALLOWED_TAGS.includes(topicHint)) {
    normalized.tags.push(topicHint);
  }

  return normalized;
}

module.exports = {
  generateArticleWithAi,
  ALLOWED_TAGS
};
