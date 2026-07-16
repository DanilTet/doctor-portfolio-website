/**
 * blog-admin.js — Blog management module for the Admin Panel
 * Handles: create post, delete post, Instagram sync, image preview, scheduling
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

    // Scheduling Modal
    const scheduleBtn = getEl('blog-schedule-btn');
    const modal = getEl('blog-schedule-modal');
    const modalCancel = getEl('blog-schedule-cancel');
    const modalConfirm = getEl('blog-schedule-confirm');
    if (scheduleBtn && modal) {
      scheduleBtn.addEventListener('click', () => {
        // validate first
        const title   = getEl('blog-title').value.trim();
        const content = getEl('blog-content').value.trim();
        let valid = true;
        if (title.length < 3) { showFieldError('blog-title-error', 'Заголовок должен быть не менее 3 символов'); valid = false; } else { hideFieldError('blog-title-error'); }
        if (content.length < 10) { showFieldError('blog-content-error', 'Текст поста должен быть не менее 10 символов'); valid = false; } else { hideFieldError('blog-content-error'); }
        if (!valid) return;
        
        // set default time (now + 1 hour)
        const d = new Date();
        d.setHours(d.getHours() + 1);
        // format local time to YYYY-MM-DDThh:mm
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d - tzOffset)).toISOString().slice(0, 16);
        getEl('blog-schedule-datetime').value = localISOTime;
        
        modal.style.display = 'flex';
      });
      modalCancel.addEventListener('click', () => modal.style.display = 'none');
      modalConfirm.addEventListener('click', () => {
        const dt = getEl('blog-schedule-datetime').value;
        if(!dt) return alert("Выберите дату и время");
        modal.style.display = 'none';
        submitPost(dt); 
      });
    }
  }

  /* ── Tab Switching ───────────────────────────────────────── */
  window.switchBlogTab = function(tab) {
    const pubBtn = getEl('blog-tab-published');
    const schBtn = getEl('blog-tab-scheduled');
    const pubList = getEl('blog-posts-list');
    const schList = getEl('blog-scheduled-list');
    
    if (!pubBtn || !schBtn || !pubList || !schList) return;

    if (tab === 'published') {
      pubBtn.className = 'btn btn--primary btn--sm';
      schBtn.className = 'btn btn--outline btn--sm';
      pubList.style.display = 'block';
      schList.style.display = 'none';
    } else {
      schBtn.className = 'btn btn--primary btn--sm';
      pubBtn.className = 'btn btn--outline btn--sm';
      schList.style.display = 'block';
      pubList.style.display = 'none';
    }
  };

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
    const scheduledContainer = getEl('blog-scheduled-list');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:32px">Загрузка...</div>';
    if(scheduledContainer) scheduledContainer.innerHTML = '';

    try {
      const res   = await fetch(`${API}/posts?all=true`, {
        headers: { 'X-Blog-Secret': SECRET() }
      });
      const posts = await res.json();
      window.blogPostsCache = posts;

      const now = new Date();
      const published = posts.filter(p => new Date(p.date) <= now);
      const scheduled = posts.filter(p => new Date(p.date) > now);

      if (!published.length) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:32px">Опубликованных постов пока нет. Создайте первый!</div>';
      } else {
        container.innerHTML = '';
        published.forEach(post => container.appendChild(renderPostRow(post, false)));
      }

      if (scheduledContainer) {
        if (!scheduled.length) {
          scheduledContainer.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:32px">Нет отложенных постов.</div>';
        } else {
          scheduledContainer.innerHTML = '';
          scheduled.forEach(post => scheduledContainer.appendChild(renderPostRow(post, true)));
        }
      }
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger);padding:16px">Ошибка загрузки постов: ${err.message}</div>`;
    }
  }

  function renderPostRow(post, isScheduled = false) {
    const div = document.createElement('div');
    div.className = 'blog-post-row';
    div.style.cssText = 'display:flex;align-items:flex-start;gap:12px;padding:16px 0;border-bottom:1px solid var(--border);flex-wrap:wrap;';

    // Image/Thumbnail Container
    const thumbWrap = document.createElement('div');
    thumbWrap.style.cssText = 'display:flex;align-items:center;gap:12px;flex:1;min-width:260px;';

    if (post.image_path) {
      const img = document.createElement('img');
      img.src   = post.image_path;
      img.alt   = '';
      img.style.cssText = 'width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0;border:1px solid var(--border)';
      thumbWrap.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.style.cssText = 'width:56px;height:56px;border-radius:8px;background:var(--bg-secondary);flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1px solid var(--border)';
      placeholder.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
      thumbWrap.appendChild(placeholder);
    }

    // Content
    const info = document.createElement('div');
    info.style.flex = '1';
    
    // Formatting date safely. For scheduled, we might want to show time as well.
    const dateOpts = { day: 'numeric', month: 'long', year: 'numeric', hour: isScheduled ? '2-digit' : undefined, minute: isScheduled ? '2-digit' : undefined };
    const date = new Date(post.date).toLocaleDateString('ru-RU', dateOpts);
    
    const sourceIcon = post.source === 'instagram'
      ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/></svg> Instagram · '
      : '';

    const tagsHtml = (post.tags && post.tags.length > 0)
      ? `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">` + 
        post.tags.map(t => `<span style="background:var(--bg-secondary);color:var(--text);font-size:10px;padding:2px 6px;border-radius:4px;border:1px solid var(--border)">${escHtml(t)}</span>`).join('') +
        `</div>`
      : '';

    const badgeHtml = isScheduled ? '<div style="margin-bottom:6px"><span class="badge badge--pending">Ожидает публикации</span></div>' : '';

    info.innerHTML = `
      ${badgeHtml}
      <div style="font-weight:600;font-size:14px;margin-bottom:4px;line-height:1.4">${escHtml(post.title)}</div>
      <div style="font-size:12px;color:var(--text-muted)">${sourceIcon}${date}</div>
      ${tagsHtml}
    `;
    thumbWrap.appendChild(info);
    div.appendChild(thumbWrap);

    // Actions
    const actionWrap = document.createElement('div');
    actionWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:flex-end;flex:1;min-width:200px;';

    // Instagram link
    if (post.instagram_url) {
      const link = document.createElement('a');
      link.href          = post.instagram_url;
      link.target        = '_blank';
      link.rel           = 'noopener noreferrer';
      link.className     = 'btn btn--ghost btn--sm';
      link.style.color   = 'var(--primary)';
      link.innerHTML     = 'Instagram ↗';
      actionWrap.appendChild(link);
    }

    if (isScheduled) {
       const pubNowBtn = document.createElement('button');
       pubNowBtn.className = 'btn btn--success btn--sm';
       pubNowBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Опубликовать сейчас';
       pubNowBtn.onclick = () => window.publishBlogPostNow(post.id);
       actionWrap.appendChild(pubNowBtn);
    }

    // Edit button (only for manual posts)
    if (post.source === 'manual') {
      const editBtn = document.createElement('button');
      editBtn.className   = 'btn btn--ghost btn--sm';
      editBtn.style.color = 'var(--primary)';
      editBtn.title       = isScheduled ? 'Изменить время и текст' : 'Редактировать пост';
      editBtn.innerHTML   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
      editBtn.addEventListener('click', () => editBlogPost(post.id));
      actionWrap.appendChild(editBtn);
    }

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className   = 'btn btn--ghost btn--sm';
    delBtn.style.color = 'var(--danger)';
    delBtn.title       = 'Удалить пост';
    delBtn.innerHTML   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>';
    delBtn.addEventListener('click', () => deletePost(post.id, div));
    actionWrap.appendChild(delBtn);

    div.appendChild(actionWrap);

    return div;
  }

  /* ── Publish Now ─────────────────────────────────────────── */
  window.publishBlogPostNow = async function(id) {
     if(!confirm('Опубликовать этот пост прямо сейчас?')) return;
     try {
       const formData = new FormData();
       formData.append('date', new Date().toISOString());
       const res = await fetch(`${API}/posts/${id}`, {
         method: 'PUT',
         headers: { 'X-Blog-Secret': SECRET() },
         body: formData
       });
       if(!res.ok) throw new Error('Ошибка публикации');
       // Move to published tab automatically
       window.switchBlogTab('published');
       loadBlogPosts();
     } catch(e) {
       alert(e.message);
     }
  };

  /* ── Create Post ─────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    submitPost(null);
  }

  async function submitPost(scheduleDate) {
    const title   = getEl('blog-title').value.trim();
    const content = getEl('blog-content').value.trim();
    const imgFile = getEl('blog-image').files[0];
    const btn     = getEl('blog-submit-btn');
    const fb      = getEl('blog-form-feedback');

    // Validate (already validated before schedule modal, but double check)
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
    btn.textContent = scheduleDate ? 'Планирование...' : 'Публикация...';
    fb.textContent  = '';
    fb.style.color  = '';

    const formData = new FormData();
    formData.append('title',   title);
    formData.append('content', content);
    if (imgFile) formData.append('image', imgFile);
    if (scheduleDate) {
      // Must pass ISO format for backend
      formData.append('date', new Date(scheduleDate).toISOString());
    }

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
      getEl('blog-modal-title-el').textContent = 'Новый пост';
      getEl('blog-image-preview').style.display = 'none';
      hideFieldError('blog-title-error');
      hideFieldError('blog-content-error');
      document.querySelectorAll('#blog-tags-container input[type="checkbox"]').forEach(cb => cb.checked = false);

      fb.textContent = scheduleDate ? '✅ Пост запланирован!' : '✅ Пост опубликован!';
      fb.style.color = 'var(--success, #22c55e)';

      if (scheduleDate) {
        window.switchBlogTab('scheduled');
      } else {
        window.switchBlogTab('published');
      }
      
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
    getEl('blog-submit-btn').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Зберегти изменения';

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
      
      window.switchBlogTab('published');
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
    if(!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Boot ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
