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

  /* ── State ───────────────────────────────────────────────── */
  let articlesCache = [];
  let currentArticle = null;   // article being edited
  let sectionCounter = 0;

  /* ── DOM helpers ─────────────────────────────────────────── */
  const getEl = id => document.getElementById(id);
  function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

      const status = article.status === 'published'
        ? `<span class="article-row__status article-row__status--published">✓ Опубліковано</span>`
        : `<span class="article-row__status article-row__status--draft">✎ Чернетка</span>`;

      const date = new Date(article.date).toLocaleDateString('uk-UA', { day:'numeric', month:'long', year:'numeric' });
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
          <a href="/articles/${escHtml(article.slug)}" target="_blank" class="btn btn--ghost btn--sm" title="Переглянути статтю" style="color:var(--text-muted)">
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
        isNew: true
      };
    } else {
      currentArticle = JSON.parse(JSON.stringify(article));
    }
    sectionCounter = 0;
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
            <input id="art-date" type="datetime-local" class="form-input" value="${a.date ? a.date.slice(0,16) : ''}">
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

      <!-- Sections -->
      <div class="card" style="margin-bottom:16px">
        <h3 style="margin:0 0 20px;font-size:15px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">📦 Блоки статті</h3>
        <div id="art-sections-container" class="sections-container"></div>
        <button id="art-add-section-btn" class="add-section-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Додати розділ
        </button>
      </div>

      <!-- Bottom action bar -->
      <div class="card">
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:flex-end">
          <div id="art-feedback-bottom" class="article-feedback" style="flex:1"></div>
          <button id="art-save-draft-btn2" class="btn btn--outline">${isNew ? '💾 Зберегти чернетку' : '💾 Зберегти як чернетку'}</button>
          <button id="art-publish-btn2" class="btn btn--primary">${isNew ? '🚀 Опублікувати статтю' : '💾 Зберегти зміни'}</button>
          ${!isNew ? `<button id="art-translate-btn2" class="btn btn--secondary" style="background:rgba(59,130,246,0.15);color:#60a5fa;border-color:rgba(59,130,246,0.3)">🇷🇺 Перевести на RU</button>` : ''}
        </div>
      </div>
    `;

    // Render existing sections
    const sectionsContainer = getEl('art-sections-container');
    (a.sections || []).forEach(s => appendSection(sectionsContainer, s));

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

    // Cover image upload/remove
    getEl('art-cover-input').addEventListener('change', handleCoverUpload);
    const removeCoverBtn = getEl('art-remove-cover');
    if (removeCoverBtn) removeCoverBtn.addEventListener('click', removeCover);

    // Save / Publish buttons (both top + bottom)
    const bindBtn = (id, fn) => { const el = getEl(id); if (el) el.addEventListener('click', fn); };
    bindBtn('art-save-draft-btn',  () => saveArticle('draft'));
    bindBtn('art-save-draft-btn2', () => saveArticle('draft'));
    bindBtn('art-publish-btn',     () => saveAndPublish());
    bindBtn('art-publish-btn2',    () => saveAndPublish());
    bindBtn('art-translate-btn',   () => translateArticleAction());
    bindBtn('art-translate-btn2',  () => translateArticleAction());
  }

  /* ── Sections ────────────────────────────────────────────── */

  function appendSection(container, data) {
    const idx = ++sectionCounter;
    const s = data || { id: `section-${idx}`, heading: '', text: '', image: null, youtube_url: null, show_cta_button: false };

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

        <!-- Extras: image, youtube, cta -->
        <div class="section-extras">
          <button type="button" class="btn btn--ghost btn--sm sec-add-img-btn" title="Додати фото до розділу">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            + Фото
          </button>
          <button type="button" class="btn btn--ghost btn--sm sec-add-yt-btn" title="Вставити YouTube">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            + YouTube
          </button>
          <button type="button" class="btn btn--ghost btn--sm sec-toggle-cta" title="Кнопка запису після розділу">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            + CTA
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

    // CTA toggle
    block.querySelector('.sec-toggle-cta').addEventListener('click', () => {
      const badge = block.querySelector('.sec-cta-badge');
      badge.style.display = badge.style.display === 'none' ? 'block' : 'none';
    });
    block.querySelector('.sec-remove-cta').addEventListener('click', () => {
      block.querySelector('.sec-cta-badge').style.display = 'none';
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
        show_cta_button: ctaBadge ? ctaBadge.style.display !== 'none' : false,
      };
    });

    return { title, subtitle, seo_description: seo, slug, date: dateVal ? new Date(dateVal).toISOString() : undefined, image_card: imageCard || null, show_in_blog: showBlog, show_final_cta: showCta, tags, sections };
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

  /* ── Publish ─────────────────────────────────────────────── */

  async function saveAndPublish() {
    const saved = await saveArticle('published');
    if (!saved) return;

    showFeedback('⏳ Генерація HTML...', 'muted');
    setAllBtnsLoading(true);

    try {
      const res = await fetch(`${API}/${saved.id}/publish`, {
        method: 'POST',
        headers: { 'X-Blog-Secret': SECRET() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Помилка публікації');

      showFeedback(`✅ Опубліковано! <a href="/articles/${escHtml(saved.slug)}" target="_blank" style="color:var(--primary)">Переглянути статтю ↗</a>`, 'success');
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
      showFeedback('✅ Переклад готовий! Якщо стаття опублікована — RU версія вже доступна.', 'success');
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

  /* ── Expose global helpers ──────────────────────────────── */
  window.openNewArticleEditor = function () { openEditor(null); };

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

  /* ── Boot ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
