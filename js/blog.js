/**
 * blog.js — Public blog posts loader for index.html
 * Fetches posts from local API, renders grid + modal.
 */

(function () {
  'use strict';

  const API_URL = '/api/blog/posts';

  /* ── DOM Refs ─────────────────────────────────────────────── */
  const grid      = document.getElementById('blog-posts-grid');
  const loading   = document.getElementById('blog-loading');
  const empty     = document.getElementById('blog-empty');
  const modal     = document.getElementById('blog-modal');
  const modalOver = document.getElementById('blog-modal-overlay');
  const modalClose= document.getElementById('blog-modal-close');

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

      if (grid) {
        grid.style.display = '';
        posts.forEach(post => grid.appendChild(createCard(post)));
      }
    } catch {
      // Server might be offline — show empty state silently
      if (loading) loading.style.display = 'none';
      if (empty)   empty.style.display = 'flex';
    }
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

    // Render content: preserve newlines
    if (body) {
      body.innerHTML = escHtml(post.content)
        .replace(/\n\n+/g, '</p><p>')
        .replace(/\n/g, '<br>');
      body.innerHTML = `<p>${body.innerHTML}</p>`;
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

    // Focus close button for accessibility
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

  /* ── Utils ───────────────────────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Boot ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPosts);
  } else {
    loadPosts();
  }
})();
