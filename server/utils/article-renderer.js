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
  const lines = text.split('\n');
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
 * Renders the <section> blocks (TOC + sections content)
 */
function renderSections(sections, lang) {
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
    html += textToHtml(s.text || '');

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
 * Generates a complete HTML page for an article.
 * @param {object} article - The article JSON object
 * @param {string} lang - 'uk' or 'ru'
 * @returns {string} - Full HTML string
 */
function renderArticleHtml(article, lang = 'uk') {
  const isRu = lang === 'ru';

  // Pick language-specific content
  let title = article.title || '';
  let subtitle = article.subtitle || '';
  let seoDesc = article.seo_description || subtitle || '';
  let sections = article.sections || [];

  if (isRu && article.translations && article.translations.ru) {
    const ru = article.translations.ru;
    if (ru.title) title = ru.title;
    if (ru.subtitle) subtitle = ru.subtitle;
    if (ru.seo_description) seoDesc = ru.seo_description;
    if (ru.sections) sections = ru.sections;
  }

  const slug = article.slug || 'article';
  const ukUrl = `/articles/${slug}`;
  const ruUrl = `/ru/articles/${slug}`;
  const canonicalUrl = isRu ? ruUrl : ukUrl;
  const htmlLang = isRu ? 'ru' : 'uk';
  const backLabel = isRu ? '← Назад на главную' : '← Назад на головну';
  const finalCtaLabel = isRu ? 'Записаться на приём' : 'Записатися на прийом';
  const recordLabel = isRu ? 'Записаться' : 'Записатися на прийом';

  const sectionsHtml = renderSections(sections, lang);

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
        ${sectionsHtml}
        ${finalCta}
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer__inner">
      <p class="footer__copy">© 2026 Тетернік О.О. Всі права захищені.</p>
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
 * @param {object} article
 * @param {string} lang - 'uk' or 'ru'
 */
function writeArticleHtml(article, lang = 'uk') {
  const slug = article.slug;
  if (!slug) throw new Error('Article has no slug');

  const html = renderArticleHtml(article, lang);

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

module.exports = { renderArticleHtml, writeArticleHtml };
