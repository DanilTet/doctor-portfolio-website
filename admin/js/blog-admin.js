/**
 * blog-admin.js — Blog management module for the Admin Panel
 * Handles: create post, delete post, Instagram sync, image preview
 * Auth: reads BLOG_SECRET from window.ADMIN_ENV (set in env.js)
 */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────── */
  const API   = '/api/blog';
  const SECRET = () => (window.ADMIN_ENV || window.ENV || {}).BLOG_SECRET || 'super-secret-key-123';

  /* ── DOM refs ────────────────────────────────────────────── */
  const getEl = id => document.getElementById(id);

  /* ── Init: hook into admin nav system ───────────────────── */
  function init() {
    // Admin.js navigates pages by toggling `.active` on `.page-section` and `.nav-item`.
    // We hook into the nav-blog button click to load posts.
    const navBlog = getEl('nav-blog');
    if (navBlog) {
      navBlog.addEventListener('click', () => {
        loadBlogPosts();
      });
    }

    // Form submit
    const form = getEl('blog-post-form');
    if (form) form.addEventListener('submit', handleSubmit);

    // Image preview
    const imgInput = getEl('blog-image');
    if (imgInput) imgInput.addEventListener('change', handleImagePreview);

    // Instagram sync
    const syncBtn = getEl('blog-sync-instagram-btn');
    if (syncBtn) syncBtn.addEventListener('click', handleInstagramSync);

    // Custom tag addition
    const addTagBtn = getEl('blog-add-tag-btn');
    const tagInput  = getEl('blog-new-tag-input');
    if (addTagBtn && tagInput) {
      const addCustomTag = () => {
        let tag = tagInput.value.trim();
        if (!tag) return;
        
        // Normalize: Capitalize first letter
        tag = tag.charAt(0).toUpperCase() + tag.slice(1);
        
        const container = getEl('blog-tags-container');
        if (!container) return;

        // Check if exists
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        const exists = Array.from(checkboxes).some(cb => cb.value.toLowerCase() === tag.toLowerCase());
        
        if (!exists) {
          const label = document.createElement('label');
          label.className = 'admin-tag-checkbox';
          label.innerHTML = `
            <input type="checkbox" value="${tag}" checked>
            <span>${tag}</span>
          `;
          container.appendChild(label);
        } else {
          // If it exists, just make sure it's checked
          const match = Array.from(checkboxes).find(cb => cb.value.toLowerCase() === tag.toLowerCase());
          if (match) match.checked = true;
        }

        tagInput.value = '';
      };

      addTagBtn.addEventListener('click', addCustomTag);
      tagInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addCustomTag();
        }
      });
    }
  }

  /* ── Image Preview ───────────────────────────────────────── */
  function handleImagePreview(e) {
    const file    = e.target.files[0];
    const preview = getEl('blog-image-preview');
    const thumb   = getEl('blog-image-thumb');
    if (!file || !preview || !thumb) return;

    const reader = new FileReader();
    reader.onload = ev => {
      thumb.src = ev.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  /* ── Load & Render Posts ─────────────────────────────────── */
  async function loadBlogPosts() {
    const container = getEl('blog-posts-list');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:32px">Загрузка...</div>';

    try {
      const res   = await fetch(`${API}/posts`);
      const posts = await res.json();
      window.blogPostsCache = posts;

      if (!posts.length) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:32px">Постов пока нет. Создайте первый!</div>';
        return;
      }

      container.innerHTML = '';
      posts.forEach(post => container.appendChild(renderPostRow(post)));
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger);padding:16px">Ошибка загрузки постов: ${err.message}</div>`;
    }
  }

  function renderPostRow(post) {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)';

    // Thumbnail
    if (post.image_path) {
      const img = document.createElement('img');
      img.src   = post.image_path;
      img.alt   = '';
      img.style.cssText = 'width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0;border:1px solid var(--border)';
      div.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.style.cssText = 'width:56px;height:56px;border-radius:8px;background:var(--bg-secondary);flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1px solid var(--border)';
      placeholder.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
      div.appendChild(placeholder);
    }

    // Content
    const info = document.createElement('div');
    info.style.flex = '1';
    const date = new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const sourceIcon = post.source === 'instagram'
      ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/></svg> Instagram · '
      : '';

    const tagsHtml = (post.tags && post.tags.length > 0)
      ? `<div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">` + 
        post.tags.map(t => `<span style="background:var(--bg-secondary);color:var(--text);font-size:10px;padding:2px 6px;border-radius:4px;border:1px solid var(--border)">${escHtml(t)}</span>`).join('') +
        `</div>`
      : '';

    info.innerHTML = `
      <div style="font-weight:600;font-size:14px;margin-bottom:2px">${escHtml(post.title)}</div>
      <div style="font-size:12px;color:var(--text-muted)">${sourceIcon}${date}</div>
      ${tagsHtml}
    `;
    div.appendChild(info);

    // Instagram link
    if (post.instagram_url) {
      const link = document.createElement('a');
      link.href          = post.instagram_url;
      link.target        = '_blank';
      link.rel           = 'noopener noreferrer';
      link.style.cssText = 'font-size:12px;color:var(--primary);text-decoration:none;white-space:nowrap';
      link.textContent   = 'Instagram ↗';
      div.appendChild(link);
    }

    // Edit button (only for manual posts)
    if (post.source === 'manual') {
      const editBtn = document.createElement('button');
      editBtn.className   = 'btn btn--ghost btn--sm';
      editBtn.style.color = 'var(--primary)';
      editBtn.style.marginRight = '8px';
      editBtn.title       = 'Редактировать пост';
      editBtn.innerHTML   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
      editBtn.addEventListener('click', () => editBlogPost(post.id));
      div.appendChild(editBtn);
    }

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className   = 'btn btn--ghost btn--sm';
    delBtn.style.color = 'var(--danger)';
    delBtn.title       = 'Удалить пост';
    delBtn.innerHTML   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>';
    delBtn.addEventListener('click', () => deletePost(post.id, div));
    div.appendChild(delBtn);

    return div;
  }

  /* ── Create Post ─────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();

    const title   = getEl('blog-title').value.trim();
    const content = getEl('blog-content').value.trim();
    const imgFile = getEl('blog-image').files[0];
    const btn     = getEl('blog-submit-btn');
    const fb      = getEl('blog-form-feedback');

    // Validate
    let valid = true;
    if (title.length < 3) {
      showFieldError('blog-title-error', 'Заголовок должен быть не менее 3 символов');
      valid = false;
    } else { hideFieldError('blog-title-error'); }

    if (content.length < 10) {
      showFieldError('blog-content-error', 'Текст поста должен быть не менее 10 символов');
      valid = false;
    } else { hideFieldError('blog-content-error'); }

    if (!valid) return;

    btn.disabled    = true;
    btn.textContent = 'Публикация...';
    fb.textContent  = '';
    fb.style.color  = '';

    const formData = new FormData();
    formData.append('title',   title);
    formData.append('content', content);
    if (imgFile) formData.append('image', imgFile);

    // Collect tags
    const tagInputs = document.querySelectorAll('#blog-tags-container input[type="checkbox"]:checked');
    const tags = Array.from(tagInputs).map(input => input.value);
    formData.append('tags', JSON.stringify(tags));

    try {
      const editId = getEl('blog-edit-id').value;
      const url = editId ? `${API}/posts/${editId}` : `${API}/posts`;
      const method = editId ? 'PUT' : 'POST';

      const res  = await fetch(url, {
        method:  method,
        headers: { 'X-Blog-Secret': SECRET() },
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сервера');

      // Reset form
      getEl('blog-post-form').reset();
      getEl('blog-edit-id').value = '';
      getEl('blog-modal-title-el').textContent = 'Додати пост (Вручну)';
      getEl('blog-image-preview').style.display = 'none';
      hideFieldError('blog-title-error');
      hideFieldError('blog-content-error');
      document.querySelectorAll('#blog-tags-container input[type="checkbox"]').forEach(cb => cb.checked = false);

      fb.textContent = '✅ Пост опубликован!';
      fb.style.color = 'var(--success, #22c55e)';

      loadBlogPosts();
    } catch (err) {
      fb.textContent = `❌ ${err.message}`;
      fb.style.color = 'var(--danger)';
    } finally {
      btn.disabled    = false;
      btn.textContent = '';
      btn.innerHTML   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Опубликовать пост';
    }
  }

  /* ── Delete Post ─────────────────────────────────────────── */
  window.editBlogPost = function(id) {
    const post = window.blogPostsCache.find(p => p.id === id);
    if (!post) return;

    getEl('blog-edit-id').value = id;
    getEl('blog-title').value = post.title || '';
    getEl('blog-content').value = post.content || '';
    getEl('blog-modal-title-el').textContent = 'Редагувати пост';
    getEl('blog-submit-btn').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Зберегти зміни';

    // Set tags
    document.querySelectorAll('#blog-tags-container input[type="checkbox"]').forEach(cb => {
      cb.checked = post.tags && post.tags.includes(cb.value);
    });

    // Reset image input
    getEl('blog-image').value = '';
    getEl('blog-image-preview').style.display = 'none';

    // Scroll to form
    getEl('blog-post-form').scrollIntoView({ behavior: 'smooth' });
  };

  async function deletePost(id, rowEl) {
    if (!confirm('Удалить этот пост? Действие нельзя отменить.')) return;

    try {
      const res = await fetch(`${API}/posts/${id}`, {
        method:  'DELETE',
        headers: { 'X-Blog-Secret': SECRET() },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Ошибка при удалении');
      }
      rowEl.style.transition = 'opacity 0.3s';
      rowEl.style.opacity    = '0';
      setTimeout(() => rowEl.remove(), 300);
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    }
  }

  /* ── Instagram Sync ──────────────────────────────────────── */
  async function handleInstagramSync() {
    const btn = getEl('blog-sync-instagram-btn');
    const fb  = getEl('blog-sync-feedback');

    btn.disabled    = true;
    btn.textContent = 'Синхронизация...';
    fb.textContent  = '⏳ Получаем посты из Instagram...';
    fb.style.color  = 'var(--text-muted)';

    try {
      const res  = await fetch(`${API}/sync-instagram`, {
        method:  'POST',
        headers: { 'X-Blog-Secret': SECRET() },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Ошибка синхронизации');

      if (data.synced === 0) {
        fb.textContent = '✅ Всё актуально — новых постов в Instagram не найдено.';
      } else {
        fb.textContent = `✅ Импортировано новых постов: ${data.synced}`;
      }
      fb.style.color = 'var(--success, #22c55e)';
      loadBlogPosts();
    } catch (err) {
      fb.textContent = `❌ ${err.message}`;
      fb.style.color = 'var(--danger)';
    } finally {
      btn.disabled  = false;
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Синхронизировать';
    }
  }

  /* ── Utils ───────────────────────────────────────────────── */
  function showFieldError(id, msg) {
    const el = getEl(id);
    if (!el) return;
    el.textContent   = msg;
    el.style.display = 'block';
  }

  function hideFieldError(id) {
    const el = getEl(id);
    if (!el) return;
    el.style.display = 'none';
  }

  function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Boot ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
