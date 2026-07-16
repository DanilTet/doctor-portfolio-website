/**
 * blog.js — Public blog posts loader for index.html
 * Fetches posts from local API, renders grid + modal, handles tag filtering.
 */

(function () {
  'use strict';

  const API_URL = '/api/blog/posts';

  let allPosts = [];
  let activeFilter = 'Всі';

  /* ── DOM Refs ─────────────────────────────────────────────── */
  const grid         = document.getElementById('blog-posts-grid');
  const loading      = document.getElementById('blog-loading');
  const empty        = document.getElementById('blog-empty');
  const filtersWrap  = document.getElementById('blog-filters');
  const modal        = document.getElementById('blog-modal');
  const modalOver    = document.getElementById('blog-modal-overlay');
  const modalClose   = document.getElementById('blog-modal-close');

  /* ── Fetch & Render ──────────────────────────────────────── */
  async function loadPosts() {
    try {
      const res   = await fetch(API_URL);
      const posts = await res.json();

      if (loading) loading.style.display = 'none';

      if (!posts.length) {
        if (empty) empty.style.display = 'flex';
        return;
      }

      allPosts = posts;
      renderFilters();
      renderGrid();

    } catch (e) {
      console.warn('[Blog] Error loading posts:', e);
      if (loading) loading.style.display = 'none';
      if (empty)   empty.style.display = 'flex';
    }
  }

  /* ── Filters ─────────────────────────────────────────────── */
  function renderFilters() {
    if (!filtersWrap) return;

    // Get all unique tags
    const tagSet = new Set();
    allPosts.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => tagSet.add(t));
      }
    });

    if (tagSet.size === 0) {
      filtersWrap.style.display = 'none';
      return;
    }

    const tags = ['Всі', ...Array.from(tagSet).sort()];
    
    filtersWrap.innerHTML = '';
    tags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'blog-filter-btn';
      if (tag === activeFilter) btn.classList.add('active');
      btn.textContent = tag === 'Всі' ? 'Всі статті' : `#${tag}`;
      btn.addEventListener('click', () => {
        activeFilter = tag;
        updateFilterUI();
        renderGrid();
      });
      filtersWrap.appendChild(btn);
    });

    filtersWrap.style.display = 'flex';
  }

  function updateFilterUI() {
    if (!filtersWrap) return;
    const btns = filtersWrap.querySelectorAll('.blog-filter-btn');
    btns.forEach(btn => {
      const tagText = btn.textContent.replace(/^#/, '');
      if (tagText === activeFilter || (activeFilter === 'Всі' && tagText === 'Всі статті')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /* ── Grid Renderer ───────────────────────────────────────── */
  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = activeFilter === 'Всі' 
      ? allPosts 
      : allPosts.filter(p => Array.isArray(p.tags) && p.tags.includes(activeFilter));

    if (!filtered.length) {
      grid.style.display = 'none';
      if (empty) empty.style.display = 'flex';
      return;
    }

    if (empty) empty.style.display = 'none';
    grid.style.display = '';

    filtered.forEach(post => grid.appendChild(createCard(post)));
  }

  /* ── Card Builder ────────────────────────────────────────── */
  function createCard(post) {
    const article = document.createElement('article');
    article.className = 'blog-card';
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', post.title);

    const dateStr = new Date(post.date).toLocaleDateString('uk-UA', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    const igBadge = post.source === 'instagram'
      ? `<span class="blog-card__ig-badge" title="Пост з Instagram">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
             <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
             <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
           </svg>
           Instagram
         </span>`
      : '';

    const tagsHtml = (Array.isArray(post.tags) && post.tags.length > 0)
      ? `<div class="blog-card__tags">` + post.tags.map(t => `<span class="blog-tag">${escHtml(t)}</span>`).join('') + `</div>`
      : '';

    const excerpt = post.content.length > 140
      ? post.content.slice(0, 140).trimEnd() + '…'
      : post.content;

    article.innerHTML = `
      ${post.image_path
        ? `<div class="blog-card__img-wrap"><img src="${escHtml(post.image_path)}" alt="${escHtml(post.title)}" loading="lazy"></div>`
        : `<div class="blog-card__img-wrap blog-card__img-wrap--no-img"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>`
      }
      <div class="blog-card__body">
        <div class="blog-card__meta">${igBadge}<span class="blog-card__date">${dateStr}</span></div>
        ${tagsHtml}
        <h3 class="blog-card__title">${escHtml(post.title)}</h3>
        <p class="blog-card__excerpt">${escHtml(excerpt)}</p>
        <span class="blog-card__read-more">Читати далі →</span>
      </div>
    `;

    article.addEventListener('click', () => openModal(post));
    article.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(post); });
    return article;
  }

  /* ── Modal ───────────────────────────────────────────────── */
  function openModal(post) {
    if (!modal) return;

    const imgWrap = document.getElementById('blog-modal-img-wrap');
    const img     = document.getElementById('blog-modal-img');
    const title   = document.getElementById('blog-modal-title');
    const body    = document.getElementById('blog-modal-body');
    const date    = document.getElementById('blog-modal-date');
    const source  = document.getElementById('blog-modal-source');
    const igLink  = document.getElementById('blog-modal-ig-link');

    const dateStr = new Date(post.date).toLocaleDateString('uk-UA', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    if (img && imgWrap) {
      if (post.image_path) {
        img.src           = post.image_path;
        img.alt           = post.title;
        imgWrap.style.display = '';
      } else {
        imgWrap.style.display = 'none';
      }
    }

    if (title)  title.textContent  = post.title;
    if (date)   date.textContent   = dateStr;
    if (source) {
      source.textContent = post.source === 'instagram' ? '📸 Instagram' : '✍️ Блог';
    }

    if (body) {
      if (window.marked && window.DOMPurify) {
        body.innerHTML = DOMPurify.sanitize(marked.parse(post.content));
      } else {
        body.innerHTML = escHtml(post.content)
          .replace(/\n\n+/g, '</p><p>')
          .replace(/\n/g, '<br>');
        body.innerHTML = `<p>${body.innerHTML}</p>`;
      }
    }

    if (igLink) {
      if (post.instagram_url) {
        igLink.href           = post.instagram_url;
        igLink.style.display  = 'inline-flex';
      } else {
        igLink.style.display  = 'none';
      }
    }

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('blog-modal--open');
    document.body.style.overflow = 'hidden';

    setTimeout(() => { if (modalClose) modalClose.focus(); }, 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('blog-modal--open');
    document.body.style.overflow = '';
  }

  /* ── Events ──────────────────────────────────────────────── */
  if (modalClose)  modalClose.addEventListener('click', closeModal);
  if (modalOver)   modalOver.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── External Hooks (Accordion to Blog Filter) ─────────────── */
  function initExternalFilters() {
    const filterBtns = document.querySelectorAll('[data-filter-tag]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tag = e.target.getAttribute('data-filter-tag');
        if (!tag) return;
        
        // 1. Smooth scroll to blog section
        const blogSection = document.getElementById('blog');
        if (blogSection) {
          blogSection.scrollIntoView({ behavior: 'smooth' });
        }

        // 2. Set filter
        activeFilter = tag;
        updateFilterUI();
        renderGrid();
      });
    });
  }

  /* ── Utils ───────────────────────────────────────────────── */
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Boot ────────────────────────────────────────────────── */
  function boot() {
    loadPosts();
    initExternalFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
