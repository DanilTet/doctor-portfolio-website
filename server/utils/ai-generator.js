/**
 * ai-generator.js — Generates structured articles using Google Gemini API
 * Designed for Dr. Teternik's medical blog (Kharkiv).
 */

'use strict';

const fetch = require('node-fetch');

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const ALLOWED_TAGS = ['Гастроскопія', 'Колоноскопія', 'УЗД', 'ЕРХПГ', 'Підготовка', 'Хірургія', 'Поліпи', 'Онкологія'];

/**
 * Default editable base prompt defining the role, tone, and editorial structure.
 * Modeled after benchmark article "pishchevod-barretta-pechiya" (https://endo.kh.ua/articles/pishchevod-barretta-pechiya/).
 */
const DEFAULT_BASE_PROMPT = `Ти — провідний медичний редактор та експертний асистент лікаря-хірурга, ендоскопіста, лікаря УЗД вищої категорії Тетерніка Олега Олександровича (м. Харків, 17-а міська клінічна лікарня).

ТВОЄ ЗАВДАННЯ:
На основі наданого користувачем сирого тексту (пост з Instagram, чернетка, тези чи клінічний випадок) створити повноцінну, професійну, структуровану медичну статтю українською мовою для сайту лікаря.
Еталон стилю та структури: стаття «Пищевод Баретта: чому тривала печія потребує уваги» — розгорнута блокова подача з багатьма інформативними підзаголовками, компактними абзацами, маркованими списками та теплим лікарським тоном.

ВАЖЛИВІ ПРАВИЛА:
1. МОВА ТА ТОН: Грамотна українська мова, теплий, турботливий, але строго експертний тон лікаря. Пояснювати складні терміни простими словами, заспокоювати страхи пацієнта перед процедурами (гастроскопія/колоноскопія/операції без болю, у медикаментозному сні).
2. ЗАГОЛОВОК (title): Привабливий, клікабельний, але без дешевого клікбейту (наприклад: «Пищевод Баретта: чому тривала печія потребує уваги» або «Чому печія може бути небезпечною: пояснення лікаря-ендоскопіста»).
3. ПІДЗАГОЛОВОК / ЛІД (subtitle): 1-2 речення короткого вступу, що розкриває головну думку статті та підкреслює важливість своєчасного звернення.
4. URL-SLUG (slug): Чіткий латинський транслітерований slug через дефіси (наприклад: 'pishchevod-barretta-pechiya', 'vydalennya-polipiv-shlunku'). Тільки маленькі латинські літери a-z, 0-9 та дефіс.
5. SEO-ОПИС (seo_description): РІВНО 130–160 символів! Містить ключові слова (назва хвороби/процедури, Харків, поради лікаря) та заклик до дії/користь. Тримайся діапазону 135-155 символів.
6. РОЗДІЛИ СТАТТІ (sections) — БЛОКОВА СТРУКТУРА:
   - Стаття складається з масиву об'єктів sections: { "heading": "...", "text": "..." }.
   - ОБОВ'ЯЗКОВО сформуй від 6 до 10 окремих логічних блоків sections (мінімум 6 блоків!). Велика кількість чітких підзаголовків робить статтю зручною для читання пацієнтами та формує детальний зміст статті.
   - СУВОРО ЗАБОРОНЕНО використовувати символи Markdown-заголовків (#, ##, ###) всередині поля 'text'! Кожен заголовок має бути виключно в окремому полі 'heading'.
   - ВМІСТ 'text' у кожному блоці:
     * Компактний і легко читабельний: 1–2 невеликих абзаци (без важких монолітних простирадл тексту).
     * Використовуй марковані списки (кожен пункт починається з '- ') для симптомів, причин, етапів діагностики чи порад.
     * Виділяй **жирним шрифтом** ключові думки, тривожні симптоми, назви діагнозів та процедур.
     * Використовуй *курсив* для медичних термінів чи акцентів.
     * Абзаци всередині 'text' розділяй звичайним перенесенням рядка.
   - ТИПОВА ЛОГІКА РОЗДІЛІВ:
     1) Вступ: суть проблеми простими словами (наприклад: «Що це таке?»).
     2) Причини або механізм розвитку («Чому виникає...?»).
     3) Симптоми та відчуття (з маркованим списком ознак).
     4) Ризики та небезпека зволікання («Чому не варто ігнорувати?»).
     5) Як проводиться точна діагностика (гастроскопія / колоноскопія / УЗД у Харкові).
     6) Роль біопсії чи додаткових обстежень (навіщо потрібна гістологія).
     7) Що роблять при виявленні / тактика лікування та спостереження.
     8) Коли терміново звернутися до лікаря (тривожні симптоми).
     9) Підсумковий блок турботи («Подбайте про здоров'я вчасно»).
     10) Заключний блок із закликом («Залишилися питання? Запишіться на прийом» — вказівка: консультація та ендоскопічні обстеження, Тетернік Олег Олександрович, 17-а міська лікарня Харкова).
7. FAQ (Швидкі відповіді):
   - 3–5 найчастіших, практичних запитань пацієнтів по даній темі (наприклад: «Чи це рак?», «Чи боляче робити процедуру?», «Чи можна вилікувати таблетками?»).
   - Чіткі, заспокійливі та лаконічні відповіді лікаря (1–3 речення).`;

/**
 * Generate a complete, SEO-optimized article structure from raw text using Google Gemini API.
 *
 * @param {object} params
 * @param {string} params.rawText - Raw input text (e.g. from Instagram, rough notes, case study)
 * @param {string} [params.topicHint] - Optional topic hint (e.g. 'Гастроскопія')
 * @param {Array<object>} [params.existingArticles] - Array of existing articles for internal linking
 * @param {string} [params.apiKey] - Optional explicit Gemini API key (defaults to process.env.GEMINI_API_KEY)
 * @param {string} [params.model] - Optional Gemini model name (defaults to GEMINI_MODEL or gemini-3.6-flash)
 * @param {string} [params.customPrompt] - Optional custom base system prompt from admin
 * @param {string} [params.extraInstructions] - Optional one-off extra instructions for this article
 * @returns {Promise<object>} Generated article data formatted for articles-admin editor
 */
async function generateArticleWithAi({
  rawText,
  topicHint,
  existingArticles = [],
  apiKey,
  model,
  customPrompt,
  extraInstructions
}) {
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

  const baseInstruction = (customPrompt && customPrompt.trim())
    ? customPrompt.trim()
    : DEFAULT_BASE_PROMPT;

  let technicalInstruction = `\n\nТЕХНІЧНІ ВИМОГИ ДО ТЕГІВ ТА ПЕРЕЛІНКОВКИ:
1. ТЕГИ (tags): 1-3 найбільш підходящі теги виключно з дозволеного списку: ${JSON.stringify(ALLOWED_TAGS)}.
2. АВТОМАТИЧНА ПЕРЕЛІНКОВКА (internal links):
   Ось список вже опублікованих статей на сайті:
${JSON.stringify(articlesContext, null, 2)}
   - Якщо в тексті статті доречно згадується тема/процедура іншої статті з цього списку, ВСТАВ ПОСИЛАННЯ в форматі: [[LINK:article_id:анкорний текст]].
   - Приклад: «Якщо призначена [[LINK:4034ca8a-50a8-458d-a56d-d3dc2af92427:підготовка до колоноскопії]], важливо дотримуватися дієти...»
   - Не перенасичуй: 1-3 якісних посилань на статтю цілком достатньо. Використовуй тільки реальні ID з наданого списку!
3. ПОВ'ЯЗАНІ СТАТТІ (related_articles): Масив з 2–3 ID статей з наданого списку, які найбільше підходять для блоку «Читайте також». Якщо статей у списку мало, обери найближчі.`;

  if (extraInstructions && extraInstructions.trim()) {
    technicalInstruction += `\n\nДОДАТКОВІ ВИМОГИ ДО ЦІЄЇ СТАТТІ (ПРІОРИТЕТНІ):\n${extraInstructions.trim()}`;
  }

  const systemInstruction = baseInstruction + technicalInstruction;

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
            description: 'Масив з 6-10 логічних блоків sections',
            items: {
              type: 'OBJECT',
              properties: {
                heading: { type: 'STRING', description: 'Підзаголовок розділу' },
                text: { type: 'STRING', description: 'Текст розділу з форматуванням (**жирний**, *курсив*, списки з - , [[LINK:id:анкор]]). Без Markdown заголовків #.' }
              },
              required: ['heading', 'text']
            }
          },
          faq: {
            type: 'ARRAY',
            description: 'Масив з 3-5 питань та відповідей FAQ',
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
  ALLOWED_TAGS,
  DEFAULT_BASE_PROMPT
};
