import re

with open('admin/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add sidebar item for Backup
sidebar_marker = """      <button class="nav-item" data-page="blog" id="nav-blog">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <span>Управление блогом</span>
      </button>"""

sidebar_new = sidebar_marker + """

      <div class="nav-section-label" style="margin-top:8px">Система</div>

      <button class="nav-item" data-page="backup" id="nav-backup">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Резервне копіювання</span>
      </button>"""

html = html.replace(sidebar_marker, sidebar_new)

# 2. Add Backup Page
page_marker = """    </section>

    <!-- ── 7. MARKETING ──────────────────────────────────────── -->"""

backup_page = """    <!-- ── 8. BACKUP ─────────────────────────────────────────── -->
    <section class="page-section" id="page-backup" style="display:none">
      <div class="page-header">
        <div>
          <h2 class="page-title">Резервне копіювання</h2>
          <p class="page-desc">Завантаження даних та медіа-файлів.</p>
        </div>
      </div>
      <div class="card" style="max-width: 600px;">
        <h3>Резервне копіювання даних</h3>
        <p style="margin-bottom: 20px; color: var(--text-muted)">Ця дія збере всі ваші публікації з блогу (тексти), відгуки пацієнтів та записи на прийом у єдиний JSON файл.</p>
        <button id="btn-export-backup-data" class="btn btn--primary" style="margin-bottom: 30px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Завантажити дані (JSON)
        </button>
        <hr style="border:0; border-top:1px solid #eaeaea; margin-bottom:20px;">
        <h3>Резервне копіювання медіа (Зображень)</h3>
        <p style="margin-bottom: 20px; color: var(--text-muted)">Завантажити архів (.zip) з усіма картинками, які були завантажені до блогу.</p>
        <button id="btn-export-backup-images" class="btn btn--outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Завантажити картинки (ZIP)
        </button>
      </div>
    </section>

"""

html = html.replace(page_marker, backup_page + page_marker)

# 3. Add Edit Button to Blog table
# Find where the delete button is rendered in the blog card
blog_table_marker = """                <button class="btn btn--icon btn--danger" onclick="deleteBlogPost('${post.id}')" title="Видалити">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>"""

blog_table_new = """                ${post.source === 'manual' ? `
                <button class="btn btn--icon btn--outline" onclick="editBlogPost('${post.id}')" title="Редагувати" style="margin-right:8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>` : ''}
""" + blog_table_marker

html = html.replace(blog_table_marker, blog_table_new)

# 4. Modify Blog Post Modal for Editing
modal_marker = """      <h2 class="modal__title">Додати пост (Вручну)</h2>"""
modal_new = """      <h2 class="modal__title" id="blog-modal-title-el">Додати пост (Вручну)</h2>"""
html = html.replace(modal_marker, modal_new)

# 5. Add hidden ID input for editing
form_marker = """      <form id="blog-form">"""
form_new = """      <form id="blog-form">
        <input type="hidden" id="blog-edit-id" value="">"""
html = html.replace(form_marker, form_new)


with open('admin/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
