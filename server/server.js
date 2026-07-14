/**
 * server.js — Blog API Server for Dr. Teternik's website
 * Handles: blog post CRUD, local image storage, Instagram sync
 * No external cloud services (no Supabase).
 */

require('dotenv').config();
const express  = require('express');
const multer   = require('multer');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const fetch    = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 3000;
const BLOG_SECRET = process.env.BLOG_SECRET || 'super-secret-key-123';
const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME || '';

/* ── Paths ───────────────────────────────────────────────── */
const ROOT_DIR    = path.join(__dirname, '..');            // Project root
const DATA_FILE   = path.join(__dirname, 'data', 'posts.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'blog');

// Ensure directories exist
fs.mkdirSync(path.join(__dirname, 'data'),    { recursive: true });
fs.mkdirSync(UPLOADS_DIR,                      { recursive: true });

/* ── Middleware ──────────────────────────────────────────── */
app.use(cors());
app.use(express.json());

// Serve uploaded blog images
app.use('/uploads/blog', express.static(UPLOADS_DIR));

// Serve the entire website from project root (index.html, css/, js/, admin/, img/, etc.)
app.use(express.static(ROOT_DIR));

/* ── Multer (image upload) ───────────────────────────────── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Только изображения!'));
  },
});

/* ── Helpers ─────────────────────────────────────────────── */
function readPosts() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writePosts(posts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

function authGuard(req, res, next) {
  const secret = req.headers['x-blog-secret'];
  if (secret !== BLOG_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/* ── Routes ──────────────────────────────────────────────── */

/**
 * GET /api/blog/posts
 * Returns all posts (sorted newest first). Public — no auth required.
 */
app.get('/api/blog/posts', (_req, res) => {
  const posts = readPosts().sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(posts);
});

/**
 * POST /api/blog/posts
 * Create a new manual blog post.
 * Requires header: X-Blog-Secret
 * Body: multipart/form-data with fields: title, content, image (optional file)
 */
app.post('/api/blog/posts', authGuard, upload.single('image'), (req, res) => {
  const { title, content } = req.body;

  if (!title || title.trim().length < 3)
    return res.status(400).json({ error: 'Заголовок должен быть не менее 3 символов' });
  if (!content || content.trim().length < 10)
    return res.status(400).json({ error: 'Текст поста должен быть не менее 10 символов' });

  const posts = readPosts();

  const newPost = {
    id:         uuidv4(),
    title:      title.trim(),
    content:    content.trim(),
    image_path: req.file ? `/uploads/blog/${req.file.filename}` : null,
    date:       new Date().toISOString(),
    source:     'manual',
  };

  posts.push(newPost);
  writePosts(posts);

  res.status(201).json(newPost);
});

/**
 * DELETE /api/blog/posts/:id
 * Delete a post and its local image (if any).
 * Requires header: X-Blog-Secret
 */
app.delete('/api/blog/posts/:id', authGuard, (req, res) => {
  const posts = readPosts();
  const idx   = posts.findIndex(p => p.id === req.params.id);

  if (idx === -1)
    return res.status(404).json({ error: 'Пост не найден' });

  const [deleted] = posts.splice(idx, 1);

  // Delete local image if it's stored locally (not an external URL)
  if (deleted.image_path && deleted.image_path.startsWith('/uploads/blog/')) {
    const filePath = path.join(__dirname, deleted.image_path);
    fs.rm(filePath, { force: true }, () => {});
  }

  writePosts(posts);
  res.json({ ok: true, deleted });
});

/**
 * POST /api/blog/sync-instagram
 * Fetches posts from public Instagram profile and saves new ones locally.
 * Uses a scraper-friendly approach via picuki.com JSON API (no official API key required).
 * Requires header: X-Blog-Secret
 */
app.post('/api/blog/sync-instagram', authGuard, async (req, res) => {
  if (!INSTAGRAM_USERNAME) {
    return res.status(400).json({ error: 'INSTAGRAM_USERNAME не задан в .env' });
  }

  try {
    // We use Picuki's public media endpoint as a free scraper-friendly source.
    // It returns the latest public posts from a profile without needing API keys.
    const profileUrl = `https://www.picuki.com/profile/${INSTAGRAM_USERNAME}`;
    const response   = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DoctorBlogBot/1.0)',
      },
      timeout: 15000,
    });

    if (!response.ok) throw new Error(`Ошибка при получении профиля: ${response.status}`);

    const html = await response.text();

    // Extract post data from Picuki's HTML using regex
    const posts      = readPosts();
    const existingIg = new Set(posts.filter(p => p.instagram_id).map(p => p.instagram_id));
    const newPosts   = [];

    // Parse media boxes from picuki HTML
    const boxRegex = /<div class="photo-description">([\s\S]*?)<\/div>[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?href="https:\/\/www\.instagram\.com\/p\/([^/]+)\//g;
    let match;
    while ((match = boxRegex.exec(html)) !== null) {
      const caption   = match[1].replace(/<[^>]+>/g, '').trim();
      const imgUrl    = match[2];
      const igPostId  = match[3];

      if (existingIg.has(igPostId)) continue; // Already saved

      // Download image locally
      let localImagePath = null;
      try {
        const imgRes  = await fetch(imgUrl, { timeout: 10000 });
        const buffer  = await imgRes.buffer();
        const ext     = '.jpg';
        const fname   = `ig_${igPostId}${ext}`;
        const fpath   = path.join(UPLOADS_DIR, fname);
        fs.writeFileSync(fpath, buffer);
        localImagePath = `/uploads/blog/${fname}`;
      } catch (imgErr) {
        console.warn(`[Instagram] Не удалось скачать изображение: ${imgErr.message}`);
      }

      const post = {
        id:           uuidv4(),
        instagram_id: igPostId,
        title:        caption.split('\n')[0].slice(0, 100) || 'Пост из Instagram',
        content:      caption || '',
        image_path:   localImagePath,
        instagram_url:`https://www.instagram.com/p/${igPostId}/`,
        date:          new Date().toISOString(),
        source:        'instagram',
      };

      posts.push(post);
      newPosts.push(post);
    }

    writePosts(posts);
    res.json({ ok: true, synced: newPosts.length, posts: newPosts });

  } catch (err) {
    console.error('[Instagram Sync Error]', err.message);
    res.status(500).json({ error: `Ошибка синхронизации: ${err.message}` });
  }
});

/* ── SPA fallback: serve index.html for all non-API routes ─ */
app.get('*', (req, res) => {
  // If requesting admin, serve admin/index.html
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(ROOT_DIR, 'admin', 'index.html'));
  }
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

/* ── Start ───────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚀 Сервер блога запущен: http://localhost:${PORT}`);
  console.log(`📝 Блог: http://localhost:${PORT}/`);
  console.log(`🔧 Админка: http://localhost:${PORT}/admin`);
  console.log(`📦 Посты хранятся в: server/data/posts.json`);
  console.log(`🖼️  Картинки хранятся в: server/uploads/blog/\n`);
});
