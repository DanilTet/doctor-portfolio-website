/**
 * articles-admin.js — Block Editor for full articles in the Admin Panel
 * Handles: CRUD articles, block editor (sections), image upload, publish, translate
 * Auth: reads BLOG_SECRET from window.ADMIN_ENV (set in env.js)
 */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────── */
  const API    = '/api/articles';
  const SECRET = () => (window.ADMIN_ENV || window.ENV || {}).BLOG_SECRET || 'super-secret-key-123';

  const TAGS = ['Гастроскопія', 'Колоноскопія', 'УЗД', 'ЕРХПГ', 'Підготовка', 'Хірургія', 'Поліпи', 'Онкологія'];

  const getArticleUrl = (slug, isRu = false) => { const isCore = ['gastroscopy', 'colonoscopy', 'uzd', 'surgery'].includes(slug); const base = isCore ? `/${slug}/` : `/articles/${slug}`; return isRu ? `/ru${base}` : base; };
/* ── State ───────────────────────────────────────────────── */
  let articlesCache = [];
  let currentArticle = null;   // article being edited
  let sectionCounter = 0;
  let faqCounter = 0;          // FAQ item counter for unique IDs
  let articleSearchCallback = null; // callback for article search modal

  /* ── DOM helpers ─────────────────────────────────────────── */
  const getEl = id => document.getElementById(id);
  function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function toLocalDatetimeInputString(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function fromLocalDatetimeInputString(localStr) {
    if (!localStr) return new Date().toISOString();
    const d = new Date(localStr);
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    const navArticles = getEl('nav-articles');
    if (navArticles) {
      navArticles.addEventListener('click', () => loadArticles());
    }
  }

  /* ════════════════════════════════════════════════════════════
     ARTICLES LIST
     ════════════════════════════════════════════════════════════ */

  async function loadArticles() {
    const listEl = getEl('articles-list');
    if (!listEl) return;

    listEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:32px">Завантаження...</div>';
    showView('list');

    try {
      const res = await fetch(API, { headers: { 'X-Blog-Secret': SECRET() } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      articlesCache = await res.json();
      renderArticlesList(listEl);
    } catch (err) {
      listEl.innerHTML = `<div style="color:var(--danger);padding:16px">❌ Помилка завантаження: ${escHtml(err.message)}</div>`;
    }
  }

  function renderArticlesList(container) {
    if (!articlesCache.length) {
      container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:48px">
        <div style="font-size:48px;margin-bottom:12px">📝</div>
        <div style="font-weight:600;margin-bottom:6px">Статей ще немає</div>
        <div style="font-size:13px">Натисніть «Нова стаття» щоб створити першу</div>
      </div>`;
      return;
    }

    container.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'articles-list';

    articlesCache.forEach(article => {
      const row = document.createElement('div');
      row.className = 'article-row';

      const thumb = article.image_card
        ? `<img class="article-row__thumb" src="${escHtml(article.image_card)}" alt="">`
        : `<div class="article-row__thumb-placeholder">📄</div>`;

      const isScheduled = article.status === 'scheduled' || (article.date && new Date(article.date) > new Date() && article.status !== 'published');
      let status = `<span class="article-row__status article-row__status--draft">✎ Чернетка</span>`;
      if (article.status === 'published') {
        status = `<span class="article-row__status article-row__status--published">✓ Опубліковано</span>`;
      } else if (isScheduled) {
        status = `<span class="article-row__status article-row__status--scheduled">⏰ Заплановано</span>`;
      }

      const dateOpts = { day:'numeric', month:'long', year:'numeric', hour: isScheduled ? '2-digit' : undefined, minute: isScheduled ? '2-digit' : undefined };
      const date = new Date(article.date).toLocaleDateString('uk-UA', dateOpts);
      const tags = (article.tags || []).map(t => `<span style="background:var(--bg-surface);padding:1px 6px;border-radius:4px;border:1px solid var(--border);font-size:10px">${escHtml(t)}</span>`).join('');
      const hasRu = article.translations && article.translations.ru && article.translations.ru.title;
      const ruBadge = hasRu ? `<span style="font-size:10px;background:rgba(59,130,246,0.12);color:#60a5fa;border:1px solid rgba(59,130,246,0.2);padding:1px 6px;border-radius:4px;">🇷🇺 RU</span>` : '';
      const sections = (article.sections || []).length;

      row.innerHTML = `
        ${thumb}
        <div class="article-row__info">
          <div class="article-row__title">${escHtml(article.title)}</div>
          <div class="article-row__meta">
            ${status}
            <span>${date}</span>
            <span>${sections} ${getSectionsWord(sections)}</span>
            ${ruBadge}
            ${tags}
          </div>
        </div>
        <div class="article-row__actions">
          <a href="${['gastroscopy', 'colonoscopy', 'uzd', 'surgery'].includes(article.slug) ? `/${escHtml(article.slug)}/` : `/articles/${escHtml(article.slug)}`}" target="_blank" class="btn btn--ghost btn--sm" title="Переглянути статтю" style="color:var(--text-muted)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
          <button class="btn btn--ghost btn--sm" title="Редагувати" style="color:var(--primary)" data-action="edit" data-id="${article.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn--ghost btn--sm" title="Видалити" style="color:var(--danger)" data-action="delete" data-id="${article.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      `;

      row.querySelector('[data-action="edit"]').addEventListener('click', () => openEditor(article));
      row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteArticle(article.id, row));

      list.appendChild(row);
    });

    container.appendChild(list);
  }

  function getSectionsWord(n) {
    if (n === 1) return 'розділ';
    if (n >= 2 && n <= 4) return 'розділи';
    return 'розділів';
  }

  /* ════════════════════════════════════════════════════════════
     VIEW SWITCHER
     ════════════════════════════════════════════════════════════ */

  function showView(view) {
    const listView   = getEl('articles-list-view');
    const editorView = getEl('articles-editor-view');
    if (!listView || !editorView) return;

    if (view === 'list') {
      listView.style.display   = 'block';
      editorView.style.display = 'none';
    } else {
      listView.style.display   = 'none';
      editorView.style.display = 'block';
    }
  }

  /* ════════════════════════════════════════════════════════════
     EDITOR
     ════════════════════════════════════════════════════════════ */

  function openEditor(article = null) {
    if (!article) {
      const generatedId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('art-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9));
      currentArticle = {
        id: generatedId,
        title: '', subtitle: '', seo_description: '',
        slug: '', tags: [], image_card: null,
        sections: [], show_final_cta: true, show_in_blog: true,
        date: new Date().toISOString(),
        faq: [], related_articles: [], internal_links: [],
        isNew: true
      };
    } else {
      currentArticle = JSON.parse(JSON.stringify(article));
      // Ensure new fields exist on old articles
      currentArticle.faq = currentArticle.faq || [];
      currentArticle.related_articles = currentArticle.related_articles || [];
      currentArticle.internal_links = currentArticle.internal_links || [];
    }
    sectionCounter = 0;
    faqCounter = 0;
    showView('editor');
    buildEditorForm(currentArticle);
  }

  function buildEditorForm(article) {
    const editorEl = getEl('articles-editor-view');
    if (!editorEl) return;

    const isNew = !article || article.isNew;
    const a = article;

    const tagsHtml = TAGS.map(tag => `
      <label class="admin-tag-checkbox">
        <input type="checkbox" name="tags" value="${escHtml(tag)}"${(a.tags||[]).includes(tag) ? ' checked' : ''}>
        <span>${escHtml(tag)}</span>
      </label>`).join('');

    editorEl.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <!-- Header -->
        <div class="article-editor-header">
          <button id="art-back-btn" class="btn btn--ghost btn--sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Назад до списку
          </button>
          <span class="article-editor-title">${isNew ? '✚ Нова стаття' : '✎ Редагувати статтю'}</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-left:auto">
            <button id="art-ai-btn" class="btn btn--ai btn--sm" title="Автоматично згенерувати або доповнити статтю за допомогою Google Gemini">✨ ШІ Генератор</button>
            <button id="art-save-draft-btn" class="btn btn--outline btn--sm">${isNew ? '💾 Зберегти чернетку' : '💾 Зберегти як чернетку'}</button>
            <button id="art-publish-btn" class="btn btn--primary btn--sm">${isNew ? '🚀 Опублікувати статтю' : '💾 Зберегти зміни'}</button>
            ${!isNew ? `<button id="art-translate-btn" class="btn btn--secondary btn--sm" style="background:rgba(59,130,246,0.15);color:#60a5fa;border-color:rgba(59,130,246,0.3)">🇷🇺 Перевести на RU</button>` : ''}
          </div>
        </div>
        <div id="art-feedback" class="article-feedback"></div>
      </div>

      <!-- Main fields -->
      <div class="card" style="margin-bottom:16px">
        <h3 style="margin:0 0 20px;font-size:15px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">📋 Основна інформація</h3>

        <div class="form-group" style="margin-bottom:16px">
          <label class="form-label" for="art-title">Заголовок статті <span style="color:var(--danger)">*</span></label>
          <input id="art-title" type="text" class="form-input" placeholder="Підготовка до колоноскопії..." value="${escHtml(a.title)}">
        </div>

        <div class="form-group" style="margin-bottom:16px">
          <label class="form-label" for="art-subtitle">Підзаголовок / лід</label>
          <textarea id="art-subtitle" class="form-input" rows="2" placeholder="Коротко про що стаття..." style="resize:vertical">${escHtml(a.subtitle)}</textarea>
        </div>

        <div class="form-group" style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <label class="form-label" for="art-seo" style="margin-bottom:0">SEO-опис (meta description)</label>
            <span id="art-seo-counter" style="font-size:12px;color:var(--text-muted)">0 / 160 символів</span>
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin:4px 0 6px">
            💡 <strong>Для чого це:</strong> Короткий анонс для Google (показується під посиланням у пошуку). Оптимально 140–160 символів з ключовими словами.
          </div>
          <textarea id="art-seo" class="form-input" rows="2" placeholder="Чому печія може быть небезпечною і коли час робити гастроскопію? Симптоми та поради лікаря..." style="resize:vertical">${escHtml(a.seo_description)}</textarea>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
          <div class="form-group">
            <label class="form-label" for="art-slug">URL-slug</label>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="color:var(--text-muted);font-size:13px;white-space:nowrap">/articles/</span>
              <input id="art-slug" type="text" class="form-input" placeholder="pidgotovka-kolonoskopiya" value="${escHtml(a.slug)}" style="font-family:monospace;font-size:13px">
            </div>
            <div id="art-slug-error" style="color:var(--danger);font-size:12px;margin-top:4px;display:none;font-weight:600"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="art-date">Дата публікації</label>
            <input id="art-date" type="datetime-local" class="form-input" value="${toLocalDatetimeInputString(a.date)}">
          </div>
        </div>

        <!-- Tags -->
        <div class="form-group" style="margin-bottom:16px">
          <label class="form-label">Теги</label>
          <div class="admin-tags-container" id="art-tags-container">${tagsHtml}</div>
        </div>

        <!-- Cover image -->
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Обкладинка для блогу</label>
          <div class="cover-uploader">
            <div id="art-cover-preview-wrap">
              ${a.image_card
                ? `<img class="cover-preview" id="art-cover-preview" src="${escHtml(a.image_card)}" alt="Cover">`
                : `<div class="cover-preview-placeholder" id="art-cover-placeholder" title="Натисніть щоб вибрати">🖼️</div>`}
            </div>
            <div style="flex:1">
              <input id="art-cover-input" type="file" accept="image/*" class="form-input" style="padding:8px;margin-bottom:4px">
              <div id="art-cover-status" style="font-size:12px;color:var(--text-muted);word-break:break-all;margin-bottom:6px">
                ${a.image_card ? `<span style="color:var(--success, #22c55e);font-weight:500">✓ Поточна обкладинка:</span> ${escHtml(a.image_card)}` : 'Файл не обрано'}
              </div>
              ${a.image_card ? `<button id="art-remove-cover" class="btn btn--ghost btn--sm" style="color:var(--danger)">✕ Видалити обкладинку</button>` : ''}
            </div>
          </div>
          <input type="hidden" id="art-image-card" value="${escHtml(a.image_card || '')}">
        </div>
      </div>

      <!-- Options -->
      <div class="card" style="margin-bottom:16px">
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
            <input type="checkbox" id="art-show-blog"${a.show_in_blog !== false ? ' checked' : ''} style="width:16px;height:16px;cursor:pointer">
            <span>Показати в блозі на головній</span>
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
            <input type="checkbox" id="art-show-cta"${a.show_final_cta !== false ? ' checked' : ''} style="width:16px;height:16px;cursor:pointer">
            <span>Кнопка «Записатися» в кінці статті</span>
          </label>
        </div>
      </div>

      <!-- FAQ -->
      <div class="card" style="margin-bottom:16px">
        <div class="art-block-header">
          <span class="art-block-icon">❓</span>
          <h3 style="margin:0;font-size:15px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">FAQ (Швидкі відповіді)</h3>
          <span style="font-size:12px;color:var(--text-muted);margin-left:auto">Показується перед блоками статті</span>
        </div>
        <div id="art-faq-container" class="faq-admin-container"></div>
        <button id="art-add-faq-btn" class="add-section-btn" style="margin-top:8px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Додати питання
        </button>
      </div>

      <!-- Sections -->
      <div class="card" style="margin-bottom:16px">
        <h3 style="margin:0 0 20px;font-size:15px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">📦 Блоки статті</h3>
        <div id="art-sections-container" class="sections-container"></div>
        <button id="art-add-section-btn" class="add-section-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Додати розділ
        </button>
      </div>

      <!-- Related Articles -->
      <div class="card" style="margin-bottom:16px">
        <div class="art-block-header">
          <span class="art-block-icon">🔗</span>
          <h3 style="margin:0;font-size:15px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Пов'язані статті</h3>
          <span style="font-size:12px;color:var(--text-muted);margin-left:auto">Блок «Читайте також» після статті</span>
        </div>
        <div id="art-related-container" class="related-admin-container"></div>
        <button id="art-add-related-btn" class="add-section-btn" style="margin-top:8px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Пошук та додавання статті
        </button>
      </div>

      ${!isNew ? `
      <!-- Backlinks (auto) -->
      <div class="card" style="margin-bottom:16px">
        <div class="art-block-header">
          <span class="art-block-icon">↩️</span>
          <h3 style="margin:0;font-size:15px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Зворотні зв'язки</h3>
          <span style="font-size:12px;color:var(--text-muted);margin-left:auto">Автоматично</span>
        </div>
        <div id="art-backlinks-container"><span style="color:var(--text-muted);font-size:13px">Завантаження...</span></div>
      </div>` : ''}

      <!-- Bottom action bar -->
      <div class="card">
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:flex-end">
          <div id="art-feedback-bottom" class="article-feedback" style="flex:1"></div>
          <button id="art-ai-btn2" class="btn btn--ai" title="Автоматично згенерувати через ШІ">✨ ШІ Генератор</button>
          <button id="art-save-draft-btn2" class="btn btn--outline">${isNew ? '💾 Зберегти чернетку' : '💾 Зберегти як чернетку'}</button>
          <button id="art-publish-btn2" class="btn btn--primary">${isNew ? '🚀 Опублікувати статтю' : '💾 Зберегти зміни'}</button>
          ${!isNew ? `<button id="art-translate-btn2" class="btn btn--secondary" style="background:rgba(59,130,246,0.15);color:#60a5fa;border-color:rgba(59,130,246,0.3)">🇷🇺 Перевести на RU</button>` : ''}
        </div>
      </div>
    `;

    // Render existing sections
    const sectionsContainer = getEl('art-sections-container');
    (a.sections || []).forEach(s => appendSection(sectionsContainer, s));

    // Render existing FAQ items
    const faqContainer = getEl('art-faq-container');
    (a.faq || []).forEach(item => appendFaqItem(faqContainer, item));

    // Render existing related articles
    const relatedContainer = getEl('art-related-container');
    (a.related_articles || []).forEach(id => appendRelatedArticle(id, relatedContainer));

    // Load backlinks for existing articles
    if (!isNew && currentArticle.id) {
      loadBacklinks(currentArticle.id);
    }

    // SEO description character counter
    const seoEl = getEl('art-seo');
    const seoCounterEl = getEl('art-seo-counter');
    function updateSeoCounter() {
      if (!seoEl || !seoCounterEl) return;
      const len = seoEl.value.length;
      let status = '';
      let color = 'var(--text-muted)';
      if (len >= 130 && len <= 160) {
        status = ' (Ідеально)';
        color = 'var(--success, #22c55e)';
      } else if (len > 160) {
        status = ' (Задовгий, Google обріже)';
        color = 'var(--danger)';
      } else if (len > 0) {
        status = ' (Закороткий)';
        color = 'var(--warning, #f59e0b)';
      }
      seoCounterEl.textContent = `${len} / 160 символів${status}`;
      seoCounterEl.style.color = color;
    }
    if (seoEl) {
      seoEl.addEventListener('input', updateSeoCounter);
      updateSeoCounter();
    }

    // Slug validation helper
    function validateSlug() {
      const slugInput = getEl('art-slug');
      const slugErrorEl = getEl('art-slug-error');
      if (!slugInput || !slugErrorEl) return true;

      const val = slugInput.value.trim().toLowerCase();
      if (!val) {
        slugErrorEl.style.display = 'none';
        return true;
      }
      const duplicate = articlesCache.find(item => item.slug === val && item.id !== currentArticle.id);

      if (duplicate) {
        slugErrorEl.textContent = `⚠️ Стаття з таким URL-slug ("${val}") вже існує! Змініть slug.`;
        slugErrorEl.style.display = 'block';
        return false;
      } else {
        slugErrorEl.style.display = 'none';
        return true;
      }
    }

    // Auto-generate slug from title
    getEl('art-title').addEventListener('input', function () {
      const slugEl = getEl('art-slug');
      if (!slugEl.dataset.manuallyEdited) {
        slugEl.value = transliterate(this.value);
        validateSlug();
      }
    });
    getEl('art-slug').addEventListener('input', function () {
      this.dataset.manuallyEdited = '1';
      validateSlug();
    });

    // Back button
    getEl('art-back-btn').addEventListener('click', () => {
      showView('list');
    });

    // Add section
    getEl('art-add-section-btn').addEventListener('click', () => {
      appendSection(sectionsContainer, null);
    });

    // Add FAQ item
    const addFaqBtn = getEl('art-add-faq-btn');
    if (addFaqBtn) addFaqBtn.addEventListener('click', () => {
      appendFaqItem(getEl('art-faq-container'), null);
    });

    // Add related article (opens search modal)
    const addRelatedBtn = getEl('art-add-related-btn');
    if (addRelatedBtn) addRelatedBtn.addEventListener('click', () => {
      openArticleSearchModal(({ id, title }) => {
        const container = getEl('art-related-container');
        // Avoid duplicates
        const alreadyAdded = [...container.querySelectorAll('.related-admin-item')].some(el => el.dataset.articleId === id);
        if (alreadyAdded) { showFeedback('⚠️ Ця стаття вже додана', 'muted'); return; }
        appendRelatedArticle(id, container, title);
      });
    });

    // Cover image upload/remove
    getEl('art-cover-input').addEventListener('change', handleCoverUpload);
    const removeCoverBtn = getEl('art-remove-cover');
    if (removeCoverBtn) removeCoverBtn.addEventListener('click', removeCover);

    // Save / Publish / AI buttons (both top + bottom)
    const bindBtn = (id, fn) => { const el = getEl(id); if (el) el.addEventListener('click', fn); };
    bindBtn('art-ai-btn',          () => openAiGenerateModal());
    bindBtn('art-ai-btn2',         () => openAiGenerateModal());
    bindBtn('art-save-draft-btn',  () => saveArticle('draft'));
    bindBtn('art-save-draft-btn2', () => saveArticle('draft'));
    bindBtn('art-publish-btn',     () => saveAndPublish());
    bindBtn('art-publish-btn2',    () => saveAndPublish());
    bindBtn('art-translate-btn',   () => translateArticleAction());
    bindBtn('art-translate-btn2',  () => translateArticleAction());

    const updatePublishBtnLabel = () => {
      const dateVal = (getEl('art-date') || {}).value || '';
      const isFuture = dateVal && new Date(dateVal) > new Date(Date.now() + 60000);
      const btn1 = getEl('art-publish-btn');
      const btn2 = getEl('art-publish-btn2');
      const text = isFuture ? '⏰ Запланувати публікацію' : (isNew ? '🚀 Опублікувати статтю' : '💾 Зберегти зміни');
      if (btn1) btn1.innerHTML = text;
      if (btn2) btn2.innerHTML = text;
    };
    const dateInputEl = getEl('art-date');
    if (dateInputEl) dateInputEl.addEventListener('input', updatePublishBtnLabel);
    updatePublishBtnLabel();
  }


  /* ── Sections ────────────────────────────────────────────── */

  function appendSection(container, data) {
    const idx = ++sectionCounter;
    const s = data || { id: `section-${idx}`, heading: '', text: '', image: null, youtube_url: null, video_url: null, show_cta_button: false };

    const block = document.createElement('div');
    block.className = 'section-block';
    block.dataset.sid = idx;

    block.innerHTML = `
      <div class="section-block__header">
        <span class="section-block__drag" title="Перетягнути">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
        </span>
        <span class="section-block__num">№${idx}</span>
        <span class="section-block__heading-preview">${escHtml(s.heading) || 'Новий розділ...'}</span>
        <div class="section-block__controls">
          <button class="btn btn--ghost btn--sm" title="Вгору" data-move="up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button class="btn btn--ghost btn--sm" title="Вниз" data-move="down">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button class="btn btn--ghost btn--sm" title="Видалити розділ" style="color:var(--danger)" data-remove-section>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div class="section-block__body">
        <div class="form-group">
          <label class="form-label" style="font-size:12px">Заголовок розділу</label>
          <input type="text" class="form-input sec-heading" placeholder="Заголовок розділу..." value="${escHtml(s.heading)}">
        </div>

        <div class="form-group">
          <label class="form-label" style="font-size:12px">Текст розділу</label>
          <textarea class="form-input sec-text" rows="5" placeholder="Текст статті (кожен рядок — абзац; рядки з «- » або «• » стануть списком)..." style="resize:vertical">${escHtml(s.text)}</textarea>
        </div>

        <!-- Extras: image, youtube, cta, formatting -->
        <div class="section-extras" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">
          <button type="button" class="btn btn--ghost btn--sm sec-bold-btn" title="Зробити жирним (**текст**)" style="font-weight:bold;padding:2px 8px;"><b>B</b></button>
          <button type="button" class="btn btn--ghost btn--sm sec-italic-btn" title="Зробити курсивом (*текст*)" style="font-style:italic;padding:2px 8px;"><i>I</i></button>
          <button type="button" class="btn btn--ghost btn--sm sec-url-btn" title="Вставити зовнішнє посилання URL ([текст](url))" style="padding:2px 8px;color:var(--primary);">🔗 URL</button>
          <button type="button" class="btn btn--ghost btn--sm sec-add-img-btn" title="Додати фото до розділу">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            + Фото
          </button>
          <button type="button" class="btn btn--ghost btn--sm sec-add-video-btn" title="Додати відео файл (mp4, webm)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="15" height="11" rx="2"/><path d="M17 9l5-3v12l-5-3"/></svg>
            + Відео
          </button>
          <button type="button" class="btn btn--ghost btn--sm sec-add-yt-btn" title="Вставити YouTube">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            + YouTube
          </button>
          <button type="button" class="btn btn--ghost btn--sm sec-toggle-cta" title="Кнопка запису після розділу">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            + CTA
          </button>
          <button type="button" class="btn btn--ghost btn--sm sec-insert-link-btn" title="Вставити посилання на статтю" style="color:var(--primary)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            + Посилання (стаття)
          </button>
        </div>

        <!-- Image area (hidden by default) -->
        <div class="sec-img-area" style="${s.image ? '' : 'display:none'}">
          <div class="form-group">
            <label class="form-label" style="font-size:12px">Зображення розділу</label>
            <input type="file" accept="image/*" class="form-input sec-img-input" style="padding:8px;margin-bottom:8px">
            <input type="hidden" class="sec-img-url" value="${escHtml(s.image || '')}">
            ${s.image ? `<div class="section-img-preview"><img src="${escHtml(s.image)}" alt=""><button class="remove-btn sec-remove-img" type="button" title="Видалити фото">✕</button></div>` : ''}
          </div>
        </div>

        <!-- YouTube area (hidden by default) -->
        <div class="sec-yt-area" style="${s.youtube_url ? '' : 'display:none'}">
          <div class="form-group">
            <label class="form-label" style="font-size:12px">YouTube URL</label>
            <input type="url" class="form-input sec-yt-url" placeholder="https://youtube.com/watch?v=..." value="${escHtml(s.youtube_url || '')}">
          </div>
        </div>

        <!-- Video file area (hidden by default) -->
        <div class="sec-video-area" style="${s.video_url ? '' : 'display:none'}">
          <div class="form-group">
            <label class="form-label" style="font-size:12px">
              🎬 Відео файл
              <span style="font-size:11px;color:var(--text-muted);font-weight:400;">(підтримується mp4, webm, mov, avi &mdash; до 500 МБ)</span>
            </label>
            <input type="file" accept="video/*" class="form-input sec-video-input" style="padding:8px;margin-bottom:8px">
            <input type="hidden" class="sec-video-url" value="${escHtml(s.video_url || '')}">
            <div class="sec-video-status" style="font-size:12px;color:var(--text-muted);margin-bottom:8px">
              ${s.video_url ? `<span style="color:var(--success, #22c55e);font-weight:500">✓ Відео завантажено</span>` : 'Файл не обрано'}
            </div>
            ${s.video_url ? `
              <div class="sec-video-preview">
                <video controls preload="metadata" style="max-width:100%;border-radius:8px;display:block;background:#000;">
                  <source src="${escHtml(s.video_url)}">
                </video>
                <button class="btn btn--ghost btn--sm sec-remove-video" type="button" style="margin-top:6px;color:var(--danger)">✕ Видалити відео</button>
              </div>` : ''}
          </div>
        </div>

        <!-- CTA badge -->
        <div class="sec-cta-badge" style="${s.show_cta_button ? '' : 'display:none'}">
          <div class="section-extra-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            Кнопка «Записатися» після розділу
            <button class="sec-remove-cta" type="button" title="Прибрати CTA">✕</button>
          </div>
        </div>
      </div>
    `;

    // Wire up controls
    block.querySelector('[data-move="up"]').addEventListener('click', () => moveSection(block, -1));
    block.querySelector('[data-move="down"]').addEventListener('click', () => moveSection(block, 1));
    block.querySelector('[data-remove-section]').addEventListener('click', () => {
      block.style.transition = 'opacity 0.2s';
      block.style.opacity = '0';
      setTimeout(() => { block.remove(); renumberSections(); }, 200);
    });

    // Heading preview update
    block.querySelector('.sec-heading').addEventListener('input', function () {
      block.querySelector('.section-block__heading-preview').textContent = this.value || 'Новий розділ...';
    });

    // Add image
    block.querySelector('.sec-add-img-btn').addEventListener('click', () => {
      const area = block.querySelector('.sec-img-area');
      area.style.display = area.style.display === 'none' ? 'block' : 'none';
    });

    // Image upload
    block.querySelector('.sec-img-input').addEventListener('change', function () {
      handleSectionImageUpload(this, block);
    });

    // Remove section image
    block.querySelector('.sec-img-area').addEventListener('click', e => {
      if (e.target.closest('.sec-remove-img')) {
        block.querySelector('.sec-img-url').value = '';
        block.querySelector('.sec-img-area').style.display = 'none';
        const prev = block.querySelector('.section-img-preview');
        if (prev) prev.remove();
      }
    });

    // Add YouTube
    block.querySelector('.sec-add-yt-btn').addEventListener('click', () => {
      const area = block.querySelector('.sec-yt-area');
      area.style.display = area.style.display === 'none' ? 'block' : 'none';
    });

    // Toggle video area
    block.querySelector('.sec-add-video-btn').addEventListener('click', () => {
      const area = block.querySelector('.sec-video-area');
      area.style.display = area.style.display === 'none' ? 'block' : 'none';
    });

    // Video upload
    block.querySelector('.sec-video-input').addEventListener('change', function () {
      handleSectionVideoUpload(this, block);
    });

    // Remove video
    block.querySelector('.sec-video-area').addEventListener('click', e => {
      if (e.target.closest('.sec-remove-video')) {
        block.querySelector('.sec-video-url').value = '';
        block.querySelector('.sec-video-status').innerHTML = 'Файл не обрано';
        const prev = block.querySelector('.sec-video-preview');
        if (prev) prev.remove();
      }
    });

    // CTA toggle
    block.querySelector('.sec-toggle-cta').addEventListener('click', () => {
      const badge = block.querySelector('.sec-cta-badge');
      badge.style.display = badge.style.display === 'none' ? 'block' : 'none';
    });
    block.querySelector('.sec-remove-cta').addEventListener('click', () => {
      block.querySelector('.sec-cta-badge').style.display = 'none';
    });

    // Text formatting buttons
    const secTextarea = block.querySelector('.sec-text');
    block.querySelector('.sec-bold-btn').addEventListener('click', () => window.EditorFormatting.apply(secTextarea, 'bold'));
    block.querySelector('.sec-italic-btn').addEventListener('click', () => window.EditorFormatting.apply(secTextarea, 'italic'));
    block.querySelector('.sec-url-btn').addEventListener('click', () => window.EditorFormatting.apply(secTextarea, 'url'));

    // Internal link insert
    block.querySelector('.sec-insert-link-btn').addEventListener('click', () => {
      openArticleSearchModal(({ id, title }) => {
        const textarea = block.querySelector('.sec-text');
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const sel = textarea.value.slice(start, end).trim();
        const linkLabel = sel || title;
        const placeholder = `[[LINK:${id}:${linkLabel}]]`;
        const val = textarea.value;
        textarea.value = val.slice(0, start) + placeholder + val.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
        textarea.focus();
        // Show visual hint
        const hint = document.createElement('div');
        hint.className = 'internal-link-inserted-hint';
        hint.textContent = `✓ Посилання вставлено: ${linkLabel}`;
        block.querySelector('.sec-insert-link-btn').after(hint);
        setTimeout(() => hint.remove(), 2500);
      });
    });

    container.appendChild(block);
    renumberSections();
  }

  function moveSection(block, dir) {
    const container = block.parentElement;
    const blocks = [...container.querySelectorAll('.section-block')];
    const idx = blocks.indexOf(block);
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;

    if (dir === -1) {
      container.insertBefore(block, blocks[targetIdx]);
    } else {
      container.insertBefore(blocks[targetIdx], block);
    }
    renumberSections();
  }

  function renumberSections() {
    const container = getEl('art-sections-container');
    if (!container) return;
    const blocks = container.querySelectorAll('.section-block');
    blocks.forEach((b, i) => {
      const num = b.querySelector('.section-block__num');
      if (num) num.textContent = `№${i + 1}`;
    });
  }

  /* ── FAQ Block ───────────────────────────────────────────── */

  function appendFaqItem(container, data) {
    if (!container) return;
    const idx = ++faqCounter;
    const item = data || { id: `faq-${idx}`, question: '', answer: '' };

    const el = document.createElement('div');
    el.className = 'faq-admin-item';
    el.dataset.faqId = item.id || `faq-${idx}`;

    el.innerHTML = `
      <div class="faq-admin-item__header">
        <span class="faq-admin-item__num">❓${idx}</span>
        <span class="faq-admin-item__preview">${escHtml(item.question) || 'Нове питання...'}</span>
        <div class="faq-admin-item__controls">
          <button class="btn btn--ghost btn--sm" title="Вгору" data-faq-move="up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button class="btn btn--ghost btn--sm" title="Вниз" data-faq-move="down">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button class="btn btn--ghost btn--sm" title="Видалити питання" style="color:var(--danger)" data-faq-remove>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div class="faq-admin-item__body">
        <div class="form-group" style="margin-bottom:10px">
          <label class="form-label" style="font-size:12px">Питання</label>
          <input type="text" class="form-input faq-question" placeholder="Яке питання ставить пацієнт?" value="${escHtml(item.question)}">
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label" style="font-size:12px">Відповідь</label>
          <textarea class="form-input faq-answer" rows="2" placeholder="Коротка, зрозуміла відповідь..." style="resize:vertical">${escHtml(item.answer)}</textarea>
          <div class="faq-extras" style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;align-items:center;">
            <button type="button" class="btn btn--ghost btn--sm faq-bold-btn" title="Зробити жирним (**текст**)" style="font-weight:bold;padding:2px 8px;"><b>B</b></button>
            <button type="button" class="btn btn--ghost btn--sm faq-italic-btn" title="Зробити курсивом (*текст*)" style="font-style:italic;padding:2px 8px;"><i>I</i></button>
            <button type="button" class="btn btn--ghost btn--sm faq-url-btn" title="Вставити зовнішнє посилання URL ([текст](url))" style="padding:2px 8px;color:var(--primary);">🔗 URL</button>
            <button type="button" class="btn btn--ghost btn--sm faq-insert-link-btn" title="Вставити посилання на статтю" style="color:var(--primary);">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              + Посилання (стаття)
            </button>
          </div>
        </div>
      </div>
    `;

    // Text formatting for FAQ
    const answerTextarea = el.querySelector('.faq-answer');
    el.querySelector('.faq-bold-btn').addEventListener('click', () => window.EditorFormatting.apply(answerTextarea, 'bold'));
    el.querySelector('.faq-italic-btn').addEventListener('click', () => window.EditorFormatting.apply(answerTextarea, 'italic'));
    el.querySelector('.faq-url-btn').addEventListener('click', () => window.EditorFormatting.apply(answerTextarea, 'url'));
    el.querySelector('.faq-insert-link-btn').addEventListener('click', () => {
      openArticleSearchModal(({ id, title }) => {
        const start = answerTextarea.selectionStart || 0;
        const end = answerTextarea.selectionEnd || 0;
        const sel = answerTextarea.value.slice(start, end).trim();
        const linkLabel = sel || title;
        const placeholder = `[[LINK:${id}:${linkLabel}]]`;
        const val = answerTextarea.value;
        answerTextarea.value = val.slice(0, start) + placeholder + val.slice(end);
        answerTextarea.selectionStart = answerTextarea.selectionEnd = start + placeholder.length;
        answerTextarea.focus();
      });
    });

    // Update preview on question input
    el.querySelector('.faq-question').addEventListener('input', function() {
      el.querySelector('.faq-admin-item__preview').textContent = this.value || 'Нове питання...';
    });

    // Move up/down
    el.querySelector('[data-faq-move="up"]').addEventListener('click', () => moveFaqItem(el, -1));
    el.querySelector('[data-faq-move="down"]').addEventListener('click', () => moveFaqItem(el, 1));

    // Remove
    el.querySelector('[data-faq-remove]').addEventListener('click', () => {
      el.style.transition = 'opacity 0.2s';
      el.style.opacity = '0';
      setTimeout(() => { el.remove(); renumberFaqItems(); }, 200);
    });

    container.appendChild(el);
    renumberFaqItems();
  }

  function moveFaqItem(el, dir) {
    const container = el.parentElement;
    const items = [...container.querySelectorAll('.faq-admin-item')];
    const idx = items.indexOf(el);
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    if (dir === -1) container.insertBefore(el, items[targetIdx]);
    else container.insertBefore(items[targetIdx], el);
    renumberFaqItems();
  }

  function renumberFaqItems() {
    const container = getEl('art-faq-container');
    if (!container) return;
    container.querySelectorAll('.faq-admin-item').forEach((el, i) => {
      const num = el.querySelector('.faq-admin-item__num');
      if (num) num.textContent = `❓${i + 1}`;
    });
  }

  function collectFaqData() {
    const container = getEl('art-faq-container');
    if (!container) return [];
    return [...container.querySelectorAll('.faq-admin-item')].map((el, i) => ({
      id: el.dataset.faqId || `faq-${i + 1}`,
      question: el.querySelector('.faq-question').value.trim(),
      answer: el.querySelector('.faq-answer').value.trim(),
    })).filter(item => item.question || item.answer);
  }

  /* ── Related Articles Block ──────────────────────────────── */

  function appendRelatedArticle(articleId, container, knownTitle) {
    if (!container || !articleId) return;

    // Try to get title from cache
    const cached = articlesCache.find(a => a.id === articleId);
    const title = knownTitle || (cached && cached.title) || articleId;

    const el = document.createElement('div');
    el.className = 'related-admin-item';
    el.dataset.articleId = articleId;

    el.innerHTML = `
      <div class="related-admin-item__info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        <span class="related-admin-item__title">${escHtml(title)}</span>
      </div>
      <div class="related-admin-item__controls">
        <button class="btn btn--ghost btn--sm" title="Вгору" data-rel-move="up">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <button class="btn btn--ghost btn--sm" title="Вниз" data-rel-move="down">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button class="btn btn--ghost btn--sm" title="Видалити" style="color:var(--danger)" data-rel-remove>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;

    el.querySelector('[data-rel-move="up"]').addEventListener('click', () => moveRelatedItem(el, -1));
    el.querySelector('[data-rel-move="down"]').addEventListener('click', () => moveRelatedItem(el, 1));
    el.querySelector('[data-rel-remove]').addEventListener('click', () => {
      el.style.transition = 'opacity 0.2s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 200);
    });

    container.appendChild(el);
  }

  function moveRelatedItem(el, dir) {
    const container = el.parentElement;
    const items = [...container.querySelectorAll('.related-admin-item')];
    const idx = items.indexOf(el);
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    if (dir === -1) container.insertBefore(el, items[targetIdx]);
    else container.insertBefore(items[targetIdx], el);
  }

  function collectRelatedArticles() {
    const container = getEl('art-related-container');
    if (!container) return [];
    return [...container.querySelectorAll('.related-admin-item')].map(el => el.dataset.articleId).filter(Boolean);
  }

  /* ── Article Search Modal ────────────────────────────────── */

  /**
   * Opens a search modal to find and select an existing article.
   * @param {function} onSelect - Callback({id, title, slug}) when article is selected
   */
  function openArticleSearchModal(onSelect) {
    articleSearchCallback = onSelect;

    // Remove any existing modal
    const existing = document.getElementById('article-search-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'article-search-modal';
    modal.className = 'article-search-modal';
    modal.innerHTML = `
      <div class="article-search-modal__overlay"></div>
      <div class="article-search-modal__window">
        <div class="article-search-modal__header">
          <span style="font-weight:700;font-size:15px">🔍 Пошук статті</span>
          <button class="article-search-modal__close btn btn--ghost btn--sm" title="Закрити">✕</button>
        </div>
        <div style="padding:0 16px 8px">
          <input id="article-search-input" type="text" class="form-input" placeholder="Введіть назву статті..." autocomplete="off" style="margin-bottom:0">
        </div>
        <div id="article-search-results" class="article-search-results"></div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector('#article-search-input');
    const results = modal.querySelector('#article-search-results');

    function renderResults(query) {
      const q = query.toLowerCase().trim();
      const filtered = articlesCache.filter(a =>
        a.id !== (currentArticle && currentArticle.id) &&
        (!q || a.title.toLowerCase().includes(q))
      ).slice(0, 20);

      if (!filtered.length) {
        results.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px">${q ? 'Статей не знайдено' : 'Немає доступних статей'}</div>`;
        return;
      }
      results.innerHTML = filtered.map(a => `
        <div class="article-search-result-item" data-id="${escHtml(a.id)}" data-title="${escHtml(a.title)}" data-slug="${escHtml(a.slug || '')}">
          <span class="article-search-result-item__title">${escHtml(a.title)}</span>
          <span class="article-search-result-item__slug">${getArticleUrl(a.slug || '')}</span>
        </div>
      `).join('');

      results.querySelectorAll('.article-search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          if (articleSearchCallback) {
            articleSearchCallback({ id: item.dataset.id, title: item.dataset.title, slug: item.dataset.slug });
          }
          closeArticleSearchModal();
        });
      });
    }

    renderResults('');
    input.addEventListener('input', () => renderResults(input.value));
    input.focus();

    modal.querySelector('.article-search-modal__close').addEventListener('click', closeArticleSearchModal);
    modal.querySelector('.article-search-modal__overlay').addEventListener('click', closeArticleSearchModal);

    // ESC to close
    function onKeydown(e) {
      if (e.key === 'Escape') { closeArticleSearchModal(); document.removeEventListener('keydown', onKeydown); }
    }
    document.addEventListener('keydown', onKeydown);

    // Animate in
    requestAnimationFrame(() => modal.classList.add('article-search-modal--open'));
  }

  function closeArticleSearchModal() {
    const modal = document.getElementById('article-search-modal');
    if (modal) {
      modal.classList.remove('article-search-modal--open');
      setTimeout(() => modal.remove(), 200);
    }
    articleSearchCallback = null;
  }

  /* ── Backlinks Block ─────────────────────────────────────── */

  async function loadBacklinks(articleId) {
    const container = getEl('art-backlinks-container');
    if (!container) return;
    try {
      const res = await fetch(`${API}/${articleId}/backlinks`, { headers: { 'X-Blog-Secret': SECRET() } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const backlinks = await res.json();

      if (!backlinks.length) {
        container.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:4px 0">Жодна стаття ще не посилається на цю.</div>`;
        return;
      }

      container.innerHTML = backlinks.map(a => `
        <div class="backlink-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          <span class="backlink-item__title">${escHtml(a.title)}</span>
          <a href="${getArticleUrl(a.slug || '')}" target="_blank" class="backlink-item__link" title="Переглянути">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
          <span class="backlink-item__status ${a.status === 'published' ? 'backlink-item__status--pub' : 'backlink-item__status--draft'}">${a.status === 'published' ? 'опубл.' : 'чернетка'}</span>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger);font-size:13px">Помилка завантаження: ${escHtml(err.message)}</div>`;
    }
  }


  /* ── Cover Image Upload ──────────────────────────────────── */

  async function handleCoverUpload(e) {
    const file = e.target.files[0];
    if (!file || !currentArticle || !currentArticle.id) return;

    showFeedback('⏳ Завантаження обкладинки...', 'muted');
    const url = await uploadImageToServer(currentArticle.id, file);
    if (url) {
      getEl('art-image-card').value = url;
      currentArticle.image_card = url;
      updateCoverPreview(url);
      const statusEl = getEl('art-cover-status');
      if (statusEl) {
        statusEl.innerHTML = `<span style="color:var(--success, #22c55e);font-weight:600">✅ Завантажено:</span> ${escHtml(url)}`;
      }
      showFeedback('✅ Обкладинку успішно завантажено на сервер!', 'success');
    }
  }

  function updateCoverPreview(src) {
    const wrap = getEl('art-cover-preview-wrap');
    if (!wrap) return;
    wrap.innerHTML = `<img class="cover-preview" id="art-cover-preview" src="${escHtml(src)}" alt="Cover">`;
  }

  function removeCover() {
    getEl('art-image-card').value = '';
    if (currentArticle) currentArticle.image_card = null;
    const wrap = getEl('art-cover-preview-wrap');
    if (wrap) wrap.innerHTML = `<div class="cover-preview-placeholder" id="art-cover-placeholder">🖼️</div>`;
  }

  /* ── Section Image Upload ────────────────────────────────── */

  async function handleSectionImageUpload(input, block) {
    const file = input.files[0];
    if (!file || !currentArticle || !currentArticle.id) return;

    const urlInput = block.querySelector('.sec-img-url');
    showFeedback('⏳ Завантаження фото розділу...', 'muted');
    const url = await uploadImageToServer(currentArticle.id, file);
    if (url) {
      urlInput.value = url;
      showSectionImagePreview(block, url);
      showFeedback('✅ Фото розділу завантажено!', 'success');
    }
  }

  function showSectionImagePreview(block, url) {
    const area = block.querySelector('.sec-img-area .form-group');
    const existing = area.querySelector('.section-img-preview');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'section-img-preview';
    div.innerHTML = `<img src="${escHtml(url)}" alt=""><button class="remove-btn sec-remove-img" type="button" title="Видалити фото">✕</button>`;
    area.appendChild(div);
  }

  async function uploadImageToServer(articleId, file) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API}/${articleId}/upload-image`, {
        method: 'POST',
        headers: { 'X-Blog-Secret': SECRET() },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      return data.url;
    } catch (err) {
      showFeedback(`❌ Помилка завантаження: ${err.message}`, 'danger');
      return null;
    }
  }

  /* ── Section Video Upload ────────────────────────────────── */

  async function handleSectionVideoUpload(input, block) {
    const file = input.files[0];
    if (!file || !currentArticle || !currentArticle.id) return;

    const statusEl = block.querySelector('.sec-video-status');
    const urlInput = block.querySelector('.sec-video-url');

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    if (statusEl) statusEl.innerHTML = `⏳ Завантаження ${sizeMB} МБ...`;
    showFeedback('⏳ Завантаження відео... (це може зайняти декілька хвилин)', 'muted');

    const url = await uploadVideoToServer(currentArticle.id, file);
    if (url) {
      urlInput.value = url;
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--success, #22c55e);font-weight:500">✅ Відео завантажено (${sizeMB} МБ)</span>`;
      showSectionVideoPreview(block, url);
      showFeedback('✅ Відео завантажено!', 'success');
    } else {
      if (statusEl) statusEl.innerHTML = '❌ Помилка завантаження';
    }
  }

  function showSectionVideoPreview(block, url) {
    const area = block.querySelector('.sec-video-area .form-group');
    const existing = area.querySelector('.sec-video-preview');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'sec-video-preview';
    div.innerHTML = `
      <video controls preload="metadata" style="max-width:100%;border-radius:8px;display:block;background:#000;margin-bottom:6px;">
        <source src="${escHtml(url)}">
      </video>
      <button class="btn btn--ghost btn--sm sec-remove-video" type="button" style="color:var(--danger)">✕ Видалити відео</button>
    `;
    area.appendChild(div);
  }

  async function uploadVideoToServer(articleId, file) {
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await fetch(`${API}/${articleId}/upload-video`, {
        method: 'POST',
        headers: { 'X-Blog-Secret': SECRET() },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video upload failed');
      return data.url;
    } catch (err) {
      showFeedback(`❌ Помилка завантаження відео: ${err.message}`, 'danger');
      return null;
    }
  }



  /* ── Collect form data ───────────────────────────────────── */

  function collectFormData() {
    const title   = (getEl('art-title') || {}).value || '';
    const subtitle = (getEl('art-subtitle') || {}).value || '';
    const seo     = (getEl('art-seo') || {}).value || '';
    const slug    = (getEl('art-slug') || {}).value || '';
    const dateVal = (getEl('art-date') || {}).value || '';
    const imageCard = (getEl('art-image-card') || {}).value || null;
    const showBlog = getEl('art-show-blog') ? getEl('art-show-blog').checked : true;
    const showCta  = getEl('art-show-cta') ? getEl('art-show-cta').checked : true;

    const tags = [...document.querySelectorAll('#art-tags-container input[type=checkbox]:checked')].map(c => c.value);

    const sectionBlocks = [...document.querySelectorAll('#art-sections-container .section-block')];
    const sections = sectionBlocks.map((block, i) => {
      const ctaBadge = block.querySelector('.sec-cta-badge');
      return {
        id: block.dataset.sid ? `section-${block.dataset.sid}` : `section-${i+1}`,
        heading: block.querySelector('.sec-heading').value || '',
        text:    block.querySelector('.sec-text').value || '',
        image:   block.querySelector('.sec-img-url').value || null,
        youtube_url: block.querySelector('.sec-yt-url').value || null,
        video_url: block.querySelector('.sec-video-url').value || null,
        show_cta_button: ctaBadge ? ctaBadge.style.display !== 'none' : false,
      };
    });

    // Collect all internal link IDs from section texts [[LINK:uuid:text]]
    const internal_links = extractInternalLinks(sections);
    const faq = collectFaqData();
    const related_articles = collectRelatedArticles();

    return { title, subtitle, seo_description: seo, slug, date: dateVal ? fromLocalDatetimeInputString(dateVal) : undefined, image_card: imageCard || null, show_in_blog: showBlog, show_final_cta: showCta, tags, sections, faq, related_articles, internal_links };
  }

  /**
   * Extracts unique article IDs from [[LINK:uuid:text]] placeholders in section texts.
   */
  function extractInternalLinks(sections) {
    const ids = new Set();
    const rx = /\[\[LINK:([\w-]+):[^\]]+\]\]/g;
    for (const s of sections) {
      let m;
      rx.lastIndex = 0;
      while ((m = rx.exec(s.text || '')) !== null) {
        ids.add(m[1]);
      }
    }
    return [...ids];
  }


  /* ── Save (draft) ────────────────────────────────────────── */

  async function saveArticle(status = 'draft') {
    const data = collectFormData();
    if (!data.title || data.title.trim().length < 2) {
      showFeedback('❌ Введіть заголовок статті', 'danger');
      getEl('art-title').focus();
      return null;
    }

    setAllBtnsLoading(true);
    showFeedback('⏳ Збереження...', 'muted');

    try {
      const isNew = currentArticle.isNew;
      const url   = isNew ? API : `${API}/${currentArticle.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const payload = { ...data, id: currentArticle.id, status };

      const res  = await fetch(url, {
        method,
        headers: { 'X-Blog-Secret': SECRET(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const article = await res.json();
      if (!res.ok) throw new Error(article.error || 'Помилка сервера');

      delete article.isNew;
      currentArticle = article;
      showFeedback('✅ Збережено!', 'success');
      // Refresh list cache
      loadArticlesCache();
      return article;
    } catch (err) {
      showFeedback(`❌ ${err.message}`, 'danger');
      return null;
    } finally {
      setAllBtnsLoading(false);
    }
  }

  /* ── Publish / Schedule ──────────────────────────────────── */

  async function saveAndPublish() {
    const dateVal = (getEl('art-date') || {}).value || '';
    const isFuture = dateVal && new Date(dateVal) > new Date(Date.now() + 60000);
    const targetStatus = isFuture ? 'scheduled' : 'published';

    const saved = await saveArticle(targetStatus);
    if (!saved) return;

    if (isFuture || saved.status === 'scheduled') {
      const formattedDate = new Date(saved.date).toLocaleString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      showFeedback(`⏰ Заплановано на ${formattedDate}! Стаття автоматично опублікується у вказаний час.`, 'success');
      return;
    }

    showFeedback('⏳ Генерація HTML...', 'muted');
    setAllBtnsLoading(true);

    try {
      const res = await fetch(`${API}/${saved.id}/publish`, {
        method: 'POST',
        headers: { 'X-Blog-Secret': SECRET() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Помилка публікації');

      showFeedback(`✅ Опубліковано! <a href="${getArticleUrl(saved.slug)}" target="_blank" style="color:var(--primary)">Переглянути статтю ↗</a>`, 'success');
    } catch (err) {
      showFeedback(`❌ ${err.message}`, 'danger');
    } finally {
      setAllBtnsLoading(false);
    }
  }

  /* ── Translate ───────────────────────────────────────────── */

  async function translateArticleAction() {
    if (!currentArticle || !currentArticle.id) {
      const saved = await saveArticle('draft');
      if (!saved) return;
    }

    if (!confirm('Перекласти статтю на російську мову через Google Translate?\nЦе займе 20–40 секунд.')) return;

    showFeedback('<span class="ar-spinner"></span> Переклад...', 'muted');
    setAllBtnsLoading(true);

    try {
      const res = await fetch(`${API}/${currentArticle.id}/translate`, {
        method: 'POST',
        headers: { 'X-Blog-Secret': SECRET() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Помилка перекладу');

      currentArticle.translations = currentArticle.translations || {};
      currentArticle.translations.ru = data.ru;
      showFeedback(`✅ Переклад готовий! <a href="${getArticleUrl(currentArticle.slug, true)}" target="_blank" style="color:var(--primary);font-weight:600;margin-left:6px">Переглянути RU версію ↗</a>`, 'success');
    } catch (err) {
      showFeedback(`❌ ${err.message}`, 'danger');
    } finally {
      setAllBtnsLoading(false);
    }
  }

  /* ── Delete ──────────────────────────────────────────────── */

  async function deleteArticle(id, rowEl) {
    if (!confirm('Видалити статтю? Цю дію не можна скасувати.\nHTML-файли теж не видаляться автоматично.')) return;

    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: { 'X-Blog-Secret': SECRET() },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Помилка'); }
      rowEl.style.transition = 'opacity 0.25s';
      rowEl.style.opacity = '0';
      setTimeout(() => {
        rowEl.remove();
        articlesCache = articlesCache.filter(a => a.id !== id);
      }, 250);
    } catch (err) {
      alert(`Помилка: ${err.message}`);
    }
  }

  /* ── Helpers ─────────────────────────────────────────────── */

  async function loadArticlesCache() {
    try {
      const res = await fetch(API, { headers: { 'X-Blog-Secret': SECRET() } });
      if (res.ok) articlesCache = await res.json();
    } catch (e) {}
  }

  function showFeedback(html, type) {
    const colors = { success: 'var(--success, #22c55e)', danger: 'var(--danger)', muted: 'var(--text-muted)' };
    ['art-feedback', 'art-feedback-bottom'].forEach(id => {
      const el = getEl(id);
      if (el) { el.innerHTML = html; el.style.color = colors[type] || ''; }
    });
  }

  function setAllBtnsLoading(loading) {
    ['art-save-draft-btn', 'art-save-draft-btn2', 'art-publish-btn', 'art-publish-btn2', 'art-translate-btn', 'art-translate-btn2'].forEach(id => {
      const el = getEl(id);
      if (el) el.disabled = loading;
    });
  }

  function transliterate(str) {
    const map = {а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ye',ж:'zh',з:'z',и:'y',і:'i',ї:'yi',й:'j',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'yu',я:'ya',ё:'yo',а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ж:'zh',з:'z',и:'i',й:'j',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
    return str.toLowerCase().split('').map(c => map[c] !== undefined ? map[c] : (/[a-z0-9]/.test(c) ? c : (/\s/.test(c) ? '-' : ''))).join('').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  /* ── AI Generator Modal ──────────────────────────────────── */

  function openAiGenerateModal() {
    // Remove any existing AI modal
    const existing = document.getElementById('ai-article-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'ai-article-modal';
    modal.className = 'ai-modal';
    modal.innerHTML = `
      <div class="ai-modal__overlay"></div>
      <div class="ai-modal__window">
        <div class="ai-modal__header">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:18px">✨</span>
            <span style="font-weight:700;font-size:16px;color:var(--text-primary)">Генерація статті через ШІ</span>
            <span style="font-size:11px;background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);padding:2px 6px;border-radius:4px;font-weight:600">Google Gemini</span>
          </div>
          <button class="ai-modal__close btn btn--ghost btn--sm" title="Закрити" style="font-size:16px">✕</button>
        </div>

        <div class="ai-modal__body" id="ai-modal-body-content">
          <div style="font-size:13px;line-height:1.5;color:var(--text-muted);margin-bottom:16px;background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:12px 14px">
            💡 <strong>Як це працює:</strong> Вставте будь-який сирий текст (пост з Instagram, чернетку або тези). ШІ автоматично створить заголовок, структуру розділів, форматування (**жирний**, *курсив*, списки), SEO-опис, блок FAQ, вибере теги та <strong>розставить посилання на інші статті вашого сайту</strong>.
          </div>

          <div class="form-group" style="margin-bottom:14px">
            <label class="form-label" for="ai-raw-text">Вхідний текст або пост з Instagram <span style="color:var(--danger)">*</span></label>
            <textarea id="ai-raw-text" class="form-input" rows="8" placeholder="Вставте текст поста або чернетки сюди..." style="resize:vertical;font-size:13px;line-height:1.6"></textarea>
          </div>

          <div class="form-group" style="margin-bottom:14px">
            <label class="form-label" for="ai-topic-select">Пріоритетна тема (необов'язково)</label>
            <select id="ai-topic-select" class="form-input" style="cursor:pointer">
              <option value="">Автоматично (на розсуд ШІ)</option>
              <option value="Гастроскопія">Гастроскопія</option>
              <option value="Колоноскопія">Колоноскопія</option>
              <option value="Підготовка">Підготовка</option>
              <option value="Поліпи">Поліпи</option>
              <option value="УЗД">УЗД</option>
              <option value="ЕРХПГ">ЕРХПГ</option>
              <option value="Хірургія">Хірургія</option>
              <option value="Онкологія">Онкологія</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom:14px">
            <label class="form-label" for="ai-model-select">Модель Google Gemini</label>
            <select id="ai-model-select" class="form-input" style="cursor:pointer">
              <option value="gemini-3.6-flash">Gemini 3.6 Flash (Рекомендовано Google)</option>
              <option value="gemini-3.7-flash">Gemini 3.7 Flash (Новітня модель)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Швидка версія)</option>
            </select>
          </div>

          <div style="margin-bottom:0">
            <details id="ai-api-key-details" style="font-size:12px;color:var(--text-muted);background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:6px;padding:8px 12px">
              <summary style="cursor:pointer;color:var(--text-secondary);font-weight:600;user-select:none">
                🔑 Власний API-ключ Gemini (необов'язково)
              </summary>
              <div style="margin-top:8px">
                <input type="password" id="ai-custom-key" class="form-input" placeholder="AIzaSy... (якщо не вказано на сервері в .env)" style="font-size:12px;padding:6px 10px;font-family:monospace">
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px">
                  Якщо вказати тут, ключ збережеться у вашому браузері і буде передаватися у запиті.
                </div>
              </div>
            </details>
          </div>

          <div id="ai-modal-error" style="display:none;color:var(--danger);font-size:13px;font-weight:600;margin-top:14px;padding:10px 14px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:8px"></div>
        </div>

        <div class="ai-modal__footer" id="ai-modal-footer-content">
          <button id="ai-cancel-btn" class="btn btn--ghost">Скасувати</button>
          <button id="ai-submit-btn" class="btn btn--ai">
            <span>🚀</span>
            <span>Згенерувати статтю</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const rawInput = modal.querySelector('#ai-raw-text');
    const topicSelect = modal.querySelector('#ai-topic-select');
    const modelSelect = modal.querySelector('#ai-model-select');
    const customKeyInput = modal.querySelector('#ai-custom-key');
    const submitBtn = modal.querySelector('#ai-submit-btn');
    const cancelBtn = modal.querySelector('#ai-cancel-btn');
    const closeBtn = modal.querySelector('.ai-modal__close');
    const overlay = modal.querySelector('.ai-modal__overlay');
    const errorEl = modal.querySelector('#ai-modal-error');
    const bodyContent = modal.querySelector('#ai-modal-body-content');
    const footerContent = modal.querySelector('#ai-modal-footer-content');

    // Restore saved model & key from localStorage
    try {
      const savedModel = localStorage.getItem('ai_gemini_model');
      if (savedModel && modelSelect) modelSelect.value = savedModel;
      const savedKey = localStorage.getItem('ai_gemini_key');
      if (savedKey && customKeyInput) {
        customKeyInput.value = savedKey;
        const keyDetails = modal.querySelector('#ai-api-key-details');
        if (keyDetails) keyDetails.open = true;
      }
    } catch (_) {}

    const closeModal = () => {
      modal.classList.remove('ai-modal--open');
      setTimeout(() => modal.remove(), 250);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    submitBtn.addEventListener('click', async () => {
      const textVal = rawInput.value.trim();
      if (!textVal) {
        errorEl.textContent = '⚠️ Будь ласка, вставте текст статті або поста для обробки.';
        errorEl.style.display = 'block';
        rawInput.focus();
        return;
      }

      errorEl.style.display = 'none';

      // Save model and key preferences
      try {
        if (modelSelect) localStorage.setItem('ai_gemini_model', modelSelect.value);
        if (customKeyInput) {
          const val = customKeyInput.value.trim();
          if (val) localStorage.setItem('ai_gemini_key', val);
          else localStorage.removeItem('ai_gemini_key');
        }
      } catch (_) {}

      // Switch modal to loading view
      bodyContent.innerHTML = `
        <div class="ai-loading-overlay">
          <div class="ai-spinner"></div>
          <div class="ai-status-text" id="ai-status-text">🧠 ШІ аналізує текст та медичний контекст...</div>
          <div class="ai-status-subtext">Зазвичай це займає 3–5 секунд</div>
        </div>
      `;
      footerContent.style.display = 'none';

      // Progressive status updates
      const statusEl = modal.querySelector('#ai-status-text');
      const t1 = setTimeout(() => { if (statusEl) statusEl.textContent = '🔍 Підбирає релевантні статті для внутрішньої перелінковки...'; }, 1800);
      const t2 = setTimeout(() => { if (statusEl) statusEl.textContent = '✍️ Формує розділи, FAQ, виділення та SEO-опис...'; }, 3500);

      try {
        const res = await fetch('/api/articles/ai-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Blog-Secret': SECRET()
          },
          body: JSON.stringify({
            text: textVal,
            topicHint: topicSelect.value,
            model: modelSelect ? modelSelect.value : 'gemini-3.6-flash',
            apiKey: (customKeyInput ? customKeyInput.value.trim() : '') || undefined
          })
        });

        clearTimeout(t1);
        clearTimeout(t2);

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const generated = data.article;
        closeModal();

        // Apply to editor
        const isEditingExisting = currentArticle && !currentArticle.isNew;
        const currentCover = currentArticle ? currentArticle.image_card : null;
        const currentId = currentArticle ? currentArticle.id : null;
        const currentDate = currentArticle ? currentArticle.date : new Date().toISOString();

        const generatedId = currentId || ((window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('art-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)));

        currentArticle = {
          id: generatedId,
          title: generated.title || '',
          subtitle: generated.subtitle || '',
          seo_description: generated.seo_description || '',
          slug: generated.slug || '',
          tags: generated.tags || [],
          image_card: currentCover,
          sections: generated.sections || [],
          faq: generated.faq || [],
          related_articles: generated.related_articles || [],
          internal_links: [],
          show_final_cta: true,
          show_in_blog: true,
          date: currentDate,
          isNew: !isEditingExisting
        };

        sectionCounter = 0;
        faqCounter = 0;
        showView('editor');
        buildEditorForm(currentArticle);

        showFeedback('✨ Статтю успішно згенеровано за допомогою ШІ! Перевірте дані, завантажте обкладинку та збережіть.', 'success');
      } catch (err) {
        clearTimeout(t1);
        clearTimeout(t2);
        console.error('[AI Modal Error]:', err);
        // Restore form with error
        openAiGenerateModal();
        const newModal = document.getElementById('ai-article-modal');
        if (newModal) {
          const errBox = newModal.querySelector('#ai-modal-error');
          const inputArea = newModal.querySelector('#ai-raw-text');
          if (inputArea) inputArea.value = textVal;
          if (errBox) {
            errBox.textContent = `❌ Помилка: ${err.message}`;
            errBox.style.display = 'block';
          }
        }
      }
    });

    // ESC to close
    function onKeydown(e) {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKeydown); }
    }
    document.addEventListener('keydown', onKeydown);

    requestAnimationFrame(() => {
      modal.classList.add('ai-modal--open');
      rawInput.focus();
    });
  }

  /* ── Expose global helpers ──────────────────────────────── */
  window.openNewArticleEditor = function () { openEditor(null); };
  window.openAiGenerateModal = openAiGenerateModal;

  window.downloadFullBackup = function () {
    fetch('/api/backup/full', { headers: { 'X-Blog-Secret': SECRET() } })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        const dateStr = new Date().toISOString().split('T')[0];
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doctor_website_full_backup_${dateStr}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => alert('Помилка завантаження бекапу: ' + err.message));
  };

  window.republishAllArticles = async function () {
    if (!confirm('Переґенерувати HTML для ВСІХ опублікованих статей?\nЦе виправить відображення фотографій та інші оновлення шаблону.')) return;
    try {
      const btn = document.querySelector('[onclick="window.republishAllArticles()"]');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Генерація...'; }

      const res = await fetch('/api/articles/republish-all', {
        method: 'POST',
        headers: { 'X-Blog-Secret': SECRET() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Помилка');

      alert(`✅ Готово!\n\nПереґенеровано: ${data.regenerated} статей\nПропущено (чернетки): ${data.skipped}\nПомилок: ${data.errors}\n\nОновіть сторінку щоб переконатися.`);
    } catch (err) {
      alert('❌ Помилка: ' + err.message);
    } finally {
      const btn = document.querySelector('[onclick="window.republishAllArticles()"]');
      if (btn) { btn.disabled = false; btn.innerHTML = '🔄 Переґенерувати всі'; }
    }
  };

  /* ── Boot ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
