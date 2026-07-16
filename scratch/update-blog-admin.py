import re

with open('admin/js/blog-admin.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Save posts to window object
load_marker = """      const posts = await res.json();

      if (!posts.length) {"""
load_new = """      const posts = await res.json();
      window.blogPostsCache = posts;

      if (!posts.length) {"""
code = code.replace(load_marker, load_new)

# 2. Add editBlogPost function and reset edit id on success
edit_marker = """  async function deletePost(id, rowEl) {"""
edit_new = """  window.editBlogPost = function(id) {
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

  async function deletePost(id, rowEl) {"""
code = code.replace(edit_marker, edit_new)


# 3. Update handleSubmit to support PUT
submit_fetch_marker = """      const res  = await fetch(`${API}/posts`, {
        method:  'POST',
        headers: { 'X-Blog-Secret': SECRET() },
        body:    formData,
      });"""

submit_fetch_new = """      const editId = getEl('blog-edit-id').value;
      const url = editId ? `${API}/posts/${editId}` : `${API}/posts`;
      const method = editId ? 'PUT' : 'POST';

      const res  = await fetch(url, {
        method:  method,
        headers: { 'X-Blog-Secret': SECRET() },
        body:    formData,
      });"""

code = code.replace(submit_fetch_marker, submit_fetch_new)

# Reset form should clear edit ID and title
reset_marker = """      getEl('blog-post-form').reset();
      getEl('blog-image-preview').style.display = 'none';"""

reset_new = """      getEl('blog-post-form').reset();
      getEl('blog-edit-id').value = '';
      getEl('blog-modal-title-el').textContent = 'Додати пост (Вручну)';
      getEl('blog-image-preview').style.display = 'none';"""

code = code.replace(reset_marker, reset_new)

with open('admin/js/blog-admin.js', 'w', encoding='utf-8') as f:
    f.write(code)

