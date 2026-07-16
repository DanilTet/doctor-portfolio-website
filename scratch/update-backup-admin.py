import re

with open('admin/js/admin.js', 'r', encoding='utf-8') as f:
    code = f.read()

backup_logic = """
  // ── BACKUP HANDLERS ───────────────────────────────────────
  const btnBackupData = getEl('btn-export-backup-data');
  if (btnBackupData) {
    btnBackupData.addEventListener('click', async () => {
      btnBackupData.disabled = true;
      const originalText = btnBackupData.innerHTML;
      btnBackupData.innerHTML = 'Завантаження...';
      try {
        // Fetch all appointments
        const { data: appointments } = await Supabase.get('appointments', '?select=*');
        // Fetch all reviews
        const { data: reviews } = await Supabase.get('reviews', '?select=*');
        // Fetch all blog posts
        let blogPosts = [];
        try {
          const res = await fetch(`${CFG.apiUrl}/posts`);
          if (res.ok) blogPosts = await res.json();
        } catch(e) {
          console.warn('Could not fetch blog posts', e);
        }

        const backupData = {
          timestamp: new Date().toISOString(),
          appointments: appointments || [],
          reviews: reviews || [],
          blog_posts: blogPosts
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `doctor_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        alert('Помилка під час завантаження даних: ' + err.message);
      } finally {
        btnBackupData.disabled = false;
        btnBackupData.innerHTML = originalText;
      }
    });
  }

  const btnBackupImages = getEl('btn-export-backup-images');
  if (btnBackupImages) {
    btnBackupImages.addEventListener('click', () => {
      // Create a form or window.location to trigger download with Auth Header
      // Since it's a file download and we use JWT/Token, we need to fetch it as blob then download,
      // or append token to query string.
      // Better approach: fetch blob with header
      btnBackupImages.disabled = true;
      const originalText = btnBackupImages.innerHTML;
      btnBackupImages.innerHTML = 'Формування архіву...';

      fetch(`${CFG.apiUrl}/posts/backup-images`, {
        headers: { 'X-Blog-Secret': sessionStorage.getItem('admin_token') || '' }
      })
      .then(res => {
        if (!res.ok) throw new Error('Помилка скачування архіву');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'doctor_blog_media.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(err => {
        alert(err.message);
      })
      .finally(() => {
        btnBackupImages.disabled = false;
        btnBackupImages.innerHTML = originalText;
      });
    });
  }
"""

# Find where EVENT LISTENERS are registered (e.g. init() function or just DOMContentLoaded block)
# In admin.js, the main logic starts around DOMContentLoaded
init_marker = """  // ── INIT ────────────────────────────────────────────────
  init();"""
init_new = backup_logic + "\n" + init_marker

code = code.replace(init_marker, init_new)

# Note: the endpoint I created was `/api/blog/backup-images`.
# In admin.js, CFG.apiUrl is typically `/api/blog` or similar. Wait, let's check `CFG.apiUrl`.
# It's better to explicitly use `/api/blog/backup-images` just in case.
code = code.replace('`${CFG.apiUrl}/posts/backup-images`', '`/api/blog/backup-images`')

with open('admin/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(code)
