/**
 * article-renderer.js — Generates HTML files for articles from JSON data
 * Based on the structure of articles/pechiya/index.html
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');

/**
 * Renders a YouTube embed URL from various YouTube URL formats
 */
function parseYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Converts plain-text article text to HTML paragraphs.
 * Lines starting with "- " become list items; empty lines = paragraph break.
 */
function textToHtml(text) {
  if (!text) return '';
  // Normalize literal \n strings (from AI-generated content) to real newlines
  const normalized = text.replace(/\\n/g, '\n');
  const lines = normalized.split('\n');
  const result = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith('- ') || line.startsWith('• ')) {
      if (!inList) { result.push('<ul style="margin:0 0 16px 0;padding-left:20px;list-style-type:disc;">'); inList = true; }
      result.push(`<li style="margin-bottom:8px;">${escHtml(line.slice(2))}</li>`);
    } else {
      if (inList) { result.push('</ul>'); inList = false; }
      if (line === '') {
        // paragraph break
      } else {
        result.push(`<p style="margin-bottom:16px;">${escHtml(line)}</p>`);
      }
    }
  }
  if (inList) result.push('</ul>');
  return result.join('\n');
}

/**
 * Resolves internal link placeholders [[LINK:uuid:link text]] to real <a> tags.
 * Falls back to plain text if the referenced article is not found.
 * @param {string} text
 * @param {object[]} allArticles
 * @returns {string}
 */
function resolveInternalLinks(text, allArticles) {
  if (!text || !allArticles || !allArticles.length) return text;
  return text.replace(/\[\[LINK:([\w-]+):([^\]]+)\]\]/g, (_match, id, linkText) => {
    const target = allArticles.find(a => a.id === id);
    if (target) {
      return `<a href="/articles/${escHtml(target.slug)}" style="color:var(--color-primary);text-decoration:underline;">${escHtml(linkText)}</a>`;
    }
    return escHtml(linkText);
  });
}

/**
 * Renders the FAQ block (quick answers) before sections content.
 * Structured for easy Schema.org FAQPage migration later.
 * @param {object[]} faq - [{id, question, answer}]
 * @param {string} lang
 * @returns {string}
 */
function renderFaqBlock(faq, lang) {
  if (!faq || !faq.length) return '';
  const heading = lang === 'ru' ? 'Быстрые ответы' : 'Швидкі відповіді';
  const itemsHtml = faq.map((item, i) => `
    <details class="faq-item" style="border:1px solid rgba(43,217,185,0.2);border-radius:10px;margin-bottom:10px;overflow:hidden;" ${i === 0 ? 'open' : ''}>
      <summary style="padding:16px 20px;cursor:pointer;font-weight:600;font-size:1rem;color:var(--color-text-light);display:flex;align-items:center;justify-content:space-between;gap:12px;list-style:none;-webkit-appearance:none;">
        <span>${escHtml(item.question)}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5" class="faq-chevron" style="flex-shrink:0;transition:transform .3s;"><polyline points="6 9 12 15 18 9"/></svg>
      </summary>
      <div style="padding:12px 20px 16px;color:var(--color-text);line-height:1.7;border-top:1px solid rgba(43,217,185,0.1);">${textToHtml(item.answer || '')}</div>
    </details>`).join('');

  return `
    <div class="article-faq" style="margin-bottom:40px;" itemscope itemtype="https://schema.org/FAQPage">
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px;color:var(--color-primary);">${heading}</h2>
      ${itemsHtml}
    </div>
    <style>.faq-item[open] .faq-chevron{transform:rotate(180deg)}.faq-item summary::-webkit-details-marker{display:none}</style>`;
}

/**
 * Renders the "Читайте також" block at the end of the article.
 * Resolves article IDs to real slugs at render time — slug changes don't break links.
 * @param {string[]} relatedIds
 * @param {object[]} allArticles
 * @param {string} lang
 * @returns {string}
 */
function renderRelatedArticles(relatedIds, allArticles, lang) {
  if (!relatedIds || !relatedIds.length || !allArticles) return '';
  const resolved = relatedIds
    .map(id => allArticles.find(a => a.id === id))
    .filter(Boolean);
  if (!resolved.length) return '';

  const heading = lang === 'ru' ? 'Читайте также' : 'Читайте також';
  const itemsHtml = resolved.map(a => {
    const thumb = a.image_card
      ? `<img src="${escHtml(a.image_card)}" alt="${escHtml(a.title)}" style="width:80px;height:60px;object-fit:cover;border-radius:8px;flex-shrink:0;">`
      : `<div style="width:80px;height:60px;border-radius:8px;background:rgba(43,217,185,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:24px;">📄</div>`;
    return `
      <a href="/articles/${escHtml(a.slug)}" style="display:flex;gap:14px;align-items:center;padding:12px 16px;border:1px solid rgba(43,217,185,0.15);border-radius:12px;text-decoration:none;color:var(--color-text-light);background:transparent;transition:border-color .2s,background .2s;" onmouseover="this.style.borderColor='rgba(43,217,185,0.6)';this.style.background='rgba(43,217,185,0.05)'" onmouseout="this.style.borderColor='rgba(43,217,185,0.15)';this.style.background='transparent'">
        ${thumb}
        <span style="font-weight:600;font-size:.95rem;">${escHtml(a.title)}</span>
      </a>`;
  }).join('\n');

  return `
    <div class="article-related" style="margin-top:48px;padding-top:32px;border-top:1px solid rgba(255,255,255,0.08);">
      <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:16px;color:var(--color-text-light);">${heading}</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${itemsHtml}
      </div>
    </div>`;
}

/**
 * Renders the <section> blocks (TOC + sections content)
 * @param {object[]} sections
 * @param {string} lang
 * @param {object[]} [allArticles]
 */
function renderSections(sections, lang, allArticles = []) {
  if (!sections || !sections.length) return '';

  // Table of Contents
  const tocItems = sections
    .filter(s => s.heading)
    .map((s, i) => `<li><a href="#section-${i + 1}" class="toc-link">${escHtml(s.heading)}</a></li>`)
    .join('\n            ');

  const toc = sections.some(s => s.heading) ? `
    <div style="background:rgba(43,217,185,0.05);border-left:4px solid var(--color-primary);padding:24px;border-radius:0 8px 8px 0;margin-bottom:40px;">
      <h4 style="margin-top:0;margin-bottom:16px;color:var(--color-primary);font-size:1.2rem;">${lang === 'ru' ? 'Путеводитель по статье:' : 'Путівник по статті:'}</h4>
      <ol style="margin:0;padding-left:20px;line-height:1.8;list-style-type:decimal;">
        ${tocItems}
      </ol>
    </div>` : '';

  // Sections
  const sectionsHtml = sections.map((s, i) => {
    const mt = i === 0 ? 'margin-top:0;' : 'margin-top:32px;';
    let html = `<h3 id="section-${i + 1}" style="${mt}margin-bottom:16px;font-weight:700;font-size:1.5rem;color:var(--color-text-light);">${escHtml(s.heading || '')}</h3>`;
    // Resolve internal link placeholders in section text
    const resolvedText = resolveInternalLinks(s.text || '', allArticles);
    html += textToHtmlResolved(resolvedText);

    // Section image — shown fully without crop or distortion
    if (s.image) {
      html += `\n<div style="margin:24px 0;border-radius:12px;overflow:hidden;background:transparent;text-align:center;">
        <img src="${escHtml(s.image)}" alt="${escHtml(s.heading || '')}" style="max-width:100%;width:auto;height:auto;display:inline-block;border-radius:12px;object-fit:contain;">
      </div>`;
    }

    // YouTube embed
    const ytId = parseYoutubeId(s.youtube_url);
    if (ytId) {
      html += `\n<div style="margin:24px 0;position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;">
        <iframe src="https://www.youtube.com/embed/${ytId}" title="YouTube video" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;"></iframe>
      </div>`;
    }

    // Section CTA button
    if (s.show_cta_button) {
      html += `\n<div style="margin:24px 0;text-align:center;">
        <a href="/#appointment-section" class="btn btn--primary open-booking-modal">${lang === 'ru' ? 'Записаться на приём' : 'Записатися на прийом'}</a>
      </div>`;
    }

    return html;
  }).join('\n\n');

  return toc + sectionsHtml;
}

/**
 * Like textToHtml but accepts pre-rendered HTML (for resolved internal links).
 * Wraps lines that are not already HTML tags in <p>.
 */
function textToHtmlResolved(text) {
  if (!text) return '';
  // Normalize literal \n strings (from AI-generated content) to real newlines
  const normalized = text.replace(/\\n/g, '\n');
  // Split on newlines, wrap non-HTML, non-list lines in <p>
  const lines = normalized.split('\n');
  const result = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith('- ') || line.startsWith('\u2022 ')) {
      if (!inList) { result.push('<ul style="margin:0 0 16px 0;padding-left:20px;list-style-type:disc;">'); inList = true; }
      // resolve links inside list items too (already done by resolveInternalLinks on full text)
      result.push(`<li style="margin-bottom:8px;">${line.slice(2)}</li>`);
    } else {
      if (inList) { result.push('</ul>'); inList = false; }
      if (line === '') {
        // paragraph break
      } else {
        result.push(`<p style="margin-bottom:16px;">${line}</p>`);
      }
    }
  }
  if (inList) result.push('</ul>');
  return result.join('\n');
}

/**
 * Generates a complete HTML page for an article.
 * @param {object} article - The article JSON object
 * @param {string} lang - 'uk' or 'ru'
 * @param {object[]} [allArticles] - All articles for resolving links and related (optional)
 * @returns {string} - Full HTML string
 */
function renderArticleHtml(article, lang = 'uk', allArticles = []) {
  const isRu = lang === 'ru';

  // Pick language-specific content
  let title = article.title || '';
  let subtitle = article.subtitle || '';
  let seoDesc = article.seo_description || subtitle || '';
  let sections = article.sections || [];
  let faq = article.faq || [];

  if (isRu && article.translations && article.translations.ru) {
    const ru = article.translations.ru;
    if (ru.title) title = ru.title;
    if (ru.subtitle) subtitle = ru.subtitle;
    if (ru.seo_description) seoDesc = ru.seo_description;
    if (ru.sections) sections = ru.sections;
    if (ru.faq) faq = ru.faq;
  }

  const slug = article.slug || 'article';
  const ukUrl = `/articles/${slug}`;
  const ruUrl = `/ru/articles/${slug}`;
  const canonicalUrl = isRu ? ruUrl : ukUrl;
  const htmlLang = isRu ? 'ru' : 'uk';
  const backLabel = isRu ? '← Назад на главную' : '← Назад на головну';
  const finalCtaLabel = isRu ? 'Записаться на приём' : 'Записатися на прийом';
  const recordLabel = isRu ? 'Записаться' : 'Записатися на прийом';

  const sectionsHtml = renderSections(sections, lang, allArticles);
  const faqHtml = renderFaqBlock(faq, lang);
  const relatedHtml = renderRelatedArticles(article.related_articles || [], allArticles, lang);

  const ogImage = article.image_card ? `<meta property="og:image" content="${escHtml(article.image_card)}">` : '';
  // NOTE: image_card is only for blog card previews (og:image) — it is NOT inserted into the article body.

  const finalCta = article.show_final_cta ? `
        <div style="margin-top:40px;text-align:center;">
          <a href="/#appointment-section" class="btn btn--primary open-booking-modal">${finalCtaLabel}</a>
        </div>` : '';

  const hasRuTranslation = !!(article.translations && article.translations.ru && article.translations.ru.title);
  const langSwitchHtml = hasRuTranslation ? `
          <div class="lang-switch">
            <a href="${ukUrl}" class="lang-switch__btn${isRu ? '' : ' active'}">UA</a>
            <a href="${ruUrl}" class="lang-switch__btn${isRu ? ' active' : ''}">RU</a>
          </div>` : '';

  const html = `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escHtml(seoDesc)}">
  <meta name="author" content="Тетернік О.О.">

  <!-- Open Graph -->
  <meta property="og:title" content="${escHtml(title)} | Лікар Тетернік О.О.">
  <meta property="og:description" content="${escHtml(seoDesc)}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="${isRu ? 'ru_RU' : 'uk_UA'}">
  ${ogImage}

  <title>${escHtml(title)} | Лікар Тетернік О.О.</title>
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="/css/animations.css">
  <link rel="stylesheet" href="/css/blog.css">

  <style>
    html { scroll-behavior: smooth; }
    .article-content h2, .article-content h3 { scroll-margin-top: 100px; }
    .toc-link { color: var(--color-text); text-decoration: none; transition: color 0.3s; }
    .toc-link:hover { color: var(--color-primary); }
  </style>
</head>
<body>

  <header class="header" id="header">
    <div class="container header__inner">
      <a href="/" class="header__logo" aria-label="${isRu ? 'На главную' : 'На головну'}">
        <span class="header__logo-text"><span>Ендоскопія</span> <span>простими словами</span></span>
      </a>
      <nav class="nav" id="nav" aria-label="${isRu ? 'Главное меню' : 'Головне меню'}">
        <div class="header__actions" style="margin-left: auto;">
          ${langSwitchHtml}
          <a href="/#appointment-section" class="btn btn--primary header__cta open-booking-modal">${recordLabel}</a>
        </div>
      </nav>
    </div>
  </header>

  <section class="section" style="padding-top:140px;padding-bottom:60px;background:radial-gradient(120% 120% at 50% 10%,#151a26 0%,#0a0d14 100%);">
    <div class="container">
      <a href="/" class="btn btn--ghost" style="margin-bottom:24px;display:inline-flex;align-items:center;gap:8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        <span>${backLabel}</span>
      </a>
      <h1 class="section-title" style="text-align:left;margin-bottom:16px;font-size:clamp(2rem,5vw,3.5rem);">${escHtml(title)}</h1>
      ${subtitle ? `<p class="section-subtitle" style="text-align:left;max-width:800px;">${escHtml(subtitle)}</p>` : ''}
    </div>
  </section>

  <section class="section" style="padding:60px 0;">
    <div class="container">
      <div class="card article-content" style="max-width:800px;margin:0 auto;line-height:1.8;">
        ${faqHtml}
        ${sectionsHtml}
        ${finalCta}
        ${relatedHtml}
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer__inner" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <p class="footer__copy">© 2026 Тетернік О.О. Всі права захищені.</p>
      <p class="footer__copy" style="font-size:0.85rem;opacity:0.75;">Розробка: <a href="https://github.com/DanilTet" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">DanilTet</a></p>
    </div>
  </footer>

  <div class="modal" id="appointment-modal" aria-hidden="true" role="dialog">
    <div class="modal__overlay" data-modal-close></div>
    <div class="modal__window modal__window--form" style="max-width:480px;">
      <button class="modal__close" data-modal-close aria-label="Close modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="modal__header" style="text-align:center;margin-bottom:24px;">
        <h3 class="modal__title">${isRu ? 'Записаться на приём' : 'Записатися на прийом'}</h3>
      </div>
      <div class="modal__body" style="display:flex;flex-direction:column;gap:16px;">
        <a href="https://t.me/AppointmentEndoscopyBot" class="btn btn--primary" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          <span>${isRu ? 'Записаться через Telegram-бот' : 'Записатися через Telegram-бот'}</span>
        </a>
        <a href="/#appointment-section" class="btn btn--outline" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>${isRu ? 'Заполнить форму на сайте' : 'Заповнити форму на сайті'}</span>
        </a>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const header = document.getElementById('header');
      function checkScroll() {
        header.classList.toggle('header--scrolled', window.scrollY > 20);
      }
      window.addEventListener('scroll', checkScroll);
      checkScroll();

      const modal = document.getElementById('appointment-modal');
      document.querySelectorAll('.open-booking-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          modal.classList.add('modal--active');
          modal.setAttribute('aria-hidden', 'false');
        });
      });
      document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.classList.remove('modal--active');
          modal.setAttribute('aria-hidden', 'true');
        });
      });
    });
  </script>

  <!-- Analytics Tracking -->
  <script src="/js/env.js"></script>
  <script src="/js/config.js"></script>
  <script src="/js/tracker.js"></script>
</body>
</html>`;

  return html;
}

/**
 * Write the rendered HTML to disk.
 * Loads all articles to resolve internal links and related at render time.
 * @param {object} article
 * @param {string} lang - 'uk' or 'ru'
 */
function writeArticleHtml(article, lang = 'uk') {
  const slug = article.slug;
  if (!slug) throw new Error('Article has no slug');

  // Load all articles for link resolution — reads from disk each publish
  let allArticles = [];
  try {
    const ARTICLES_DIR = path.join(ROOT_DIR, 'server', 'data', 'articles');
    if (fs.existsSync(ARTICLES_DIR)) {
      const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'));
      allArticles = files.map(f => {
        try { return JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8')); }
        catch (e) { return null; }
      }).filter(Boolean);
    }
  } catch (e) {
    console.warn('[ArticleRenderer] Could not load articles for link resolution:', e.message);
  }

  const html = renderArticleHtml(article, lang, allArticles);

  let dir;
  if (lang === 'ru') {
    dir = path.join(ROOT_DIR, 'ru', 'articles', slug);
  } else {
    dir = path.join(ROOT_DIR, 'articles', slug);
  }

  fs.mkdirSync(dir, { recursive: true });
  const outFile = path.join(dir, 'index.html');
  fs.writeFileSync(outFile, html, 'utf-8');
  console.log(`[ArticleRenderer] Written: ${outFile}`);
  return outFile;
}

module.exports = { renderArticleHtml, writeArticleHtml, resolveInternalLinks };
