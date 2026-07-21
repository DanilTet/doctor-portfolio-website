/**
 * server.js — Blog API Server for Dr. Teternik's website
 * Handles: blog post CRUD, local image storage, Instagram sync
 * No external cloud services (no Supabase).
 */

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 3000;
const BLOG_SECRET = process.env.BLOG_SECRET || 'super-secret-key-123';
const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME || '';

/* ── Paths ───────────────────────────────────────────────── */
const ROOT_DIR = path.join(__dirname, '..');            // Project root
const DATA_FILE = path.join(__dirname, 'data', 'posts.json');
const ANALYTICS_FILE = path.join(__dirname, 'data', 'analytics.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'blog');

// Ensure directories exist
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/* ── Middleware ──────────────────────────────────────────── */
app.use(cors());
app.use(express.json());

// Serve uploaded blog images
app.use('/uploads/blog', express.static(UPLOADS_DIR));

// Serve the entire website from project root (index.html, css/, js/, admin/, img/, etc.)
app.use(express.static(ROOT_DIR, { extensions: ['html'] }));

/* ── Multer (image upload) ───────────────────────────────── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
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

function readAnalytics() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.warn('[Analytics API] Failed to read analytics.json:', e.message);
  }
  return [];
}

function writeAnalytics(data) {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Analytics API] Failed to write analytics.json:', e.message);
  }
}

function authGuard(req, res, next) {
  const secret = req.headers['x-blog-secret'];
  console.log(`[Blog Auth] Received secret: "${secret}", Expected: "${BLOG_SECRET}"`);
  if (secret !== BLOG_SECRET) {
    console.warn(`[Blog Auth] Denied access. Secret mismatch.`);
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/* ── Routes ──────────────────────────────────────────────── */

/**
 * GET /api/blog/posts
 * Returns all posts (sorted newest first). Public — no auth required.
 * If ?all=true and valid X-Blog-Secret is provided, returns all posts including scheduled.
 */
app.get('/api/blog/posts', (req, res) => {
  let posts = readPosts().sort((a, b) => new Date(b.date) - new Date(a.date));

  const wantAll = req.query.all === 'true';
  const secret = req.headers['x-blog-secret'];
  const isAdmin = wantAll && secret === BLOG_SECRET;

  if (!isAdmin) {
    const now = new Date();
    posts = posts.filter(p => new Date(p.date) <= now);
  }

  res.json(posts);
});

/**
 * POST /api/blog/posts
 * Create a new manual blog post.
 * Requires header: X-Blog-Secret
 * Body: multipart/form-data with fields: title, content, image (optional file)
 */
app.post('/api/blog/posts', authGuard, upload.single('image'), (req, res) => {
  const { title, content, date } = req.body;

  if (!title || title.trim().length < 3)
    return res.status(400).json({ error: 'Заголовок должен быть не менее 3 символов' });
  if (!content || content.trim().length < 10)
    return res.status(400).json({ error: 'Текст поста должен быть не менее 10 символов' });

  const posts = readPosts();

  let parsedTags = [];
  try {
    if (req.body.tags) {
      parsedTags = JSON.parse(req.body.tags);
    }
  } catch (e) {
    console.warn('[Blog] Failed to parse tags:', req.body.tags);
  }

  const newPost = {
    id: uuidv4(),
    title: title.trim(),
    content: content.trim(),
    image_path: req.file ? `/uploads/blog/${req.file.filename}` : null,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    source: 'manual',
    tags: Array.isArray(parsedTags) ? parsedTags : [],
  };

  posts.push(newPost);
  writePosts(posts);

  res.status(201).json(newPost);
});

/**
 * PUT /api/blog/posts/:id
 * Edit an existing manual blog post.
 * Requires header: X-Blog-Secret
 * Body: multipart/form-data with fields: title, content, image (optional file), remove_image (optional boolean)
 */
app.put('/api/blog/posts/:id', authGuard, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title, content, remove_image, date } = req.body;

  if (title && title.trim().length < 3)
    return res.status(400).json({ error: 'Заголовок должен быть не менее 3 символов' });
  if (content && content.trim().length < 10)
    return res.status(400).json({ error: 'Текст поста должен быть не менее 10 символов' });

  const posts = readPosts();
  const idx = posts.findIndex(p => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Пост не найден' });
  }

  const post = posts[idx];

  // Only manual posts can be fully edited this way. We might allow editing instagram posts' text too, but mainly manual.
  if (title) post.title = title.trim();
  if (content) post.content = content.trim();
  if (date) post.date = new Date(date).toISOString();

  try {
    if (req.body.tags) {
      post.tags = JSON.parse(req.body.tags);
    }
  } catch (e) {
    console.warn('[Blog] Failed to parse tags on update:', req.body.tags);
  }

  // Handle new image upload or removing image
  if (req.file) {
    // Delete old local image if it exists
    if (post.image_path && post.image_path.startsWith('/uploads/blog/')) {
      const oldPath = path.join(__dirname, post.image_path);
      fs.rm(oldPath, { force: true }, () => { });
    }
    post.image_path = `/uploads/blog/${req.file.filename}`;
  } else if (remove_image === 'true') {
    if (post.image_path && post.image_path.startsWith('/uploads/blog/')) {
      const oldPath = path.join(__dirname, post.image_path);
      fs.rm(oldPath, { force: true }, () => { });
    }
    post.image_path = null;
  }

  writePosts(posts);
  res.json(post);
});

/**
 * DELETE /api/blog/posts/:id
 * Delete a post and its local image (if any).
 * Requires header: X-Blog-Secret
 */
app.delete('/api/blog/posts/:id', authGuard, (req, res) => {
  const { id } = req.params;
  console.log(`[Blog API] DELETE requested for post ID: "${id}"`);

  const posts = readPosts();
  const idx = posts.findIndex(p => p.id === id);

  if (idx === -1) {
    console.warn(`[Blog API] Post with ID "${id}" not found.`);
    return res.status(404).json({ error: 'Пост не найден' });
  }

  const [deleted] = posts.splice(idx, 1);

  // Delete local image if it's stored locally (not an external URL)
  if (deleted.image_path && deleted.image_path.startsWith('/uploads/blog/')) {
    const filePath = path.join(__dirname, deleted.image_path);
    fs.rm(filePath, { force: true }, () => { });
    console.log(`[Blog API] Deleted local image: "${filePath}"`);
  }

  writePosts(posts);
  console.log(`[Blog API] Post "${id}" deleted successfully.`);
  res.json({ ok: true, deleted });
});

/**
 * POST /api/blog/sync-instagram
 * Fetches posts from public Instagram profile and saves new ones locally.
 * Uses a stable, official-based Behold.so JSON Feed API (free plan, bypasses Cloudflare).
 * Requires header: X-Blog-Secret
 */
app.post('/api/blog/sync-instagram', authGuard, async (req, res) => {
  const BEHOLD_URL = process.env.INSTAGRAM_BEHOLD_URL;

  if (!BEHOLD_URL || BEHOLD_URL.includes('YOUR_FEED_ID')) {
    return res.status(400).json({
      error: 'Вы еще не заменили YOUR_FEED_ID на ваш собственный ID в файле server/.env. Пожалуйста, зарегистрируйтесь на https://behold.so (это бесплатно), создайте фид для Instagram аккаунта и укажите реальную ссылку.'
    });
  }

  try {
    const response = await fetch(BEHOLD_URL, { timeout: 15000 });
    if (!response.ok) throw new Error(`Behold API вернул статус: ${response.status}`);

    // Behold can return either a direct array of posts or an object containing an array.
    const result = await response.json();
    const rawPosts = Array.isArray(result) ? result : (result.posts || []);

    const posts = readPosts();
    const existingIg = new Set(posts.filter(p => p.instagram_id).map(p => p.instagram_id));
    const newPosts = [];

    for (const raw of rawPosts) {
      const igPostId = raw.id;
      if (existingIg.has(igPostId)) continue; // Уже синхронизирован

      const caption = raw.caption || '';
      const imgUrl = raw.mediaUrl;

      // Скачиваем изображение локально на сервер
      let localImagePath = null;
      if (imgUrl) {
        try {
          const imgRes = await fetch(imgUrl, { timeout: 10000 });
          if (imgRes.ok) {
            const buffer = await imgRes.buffer();
            const ext = '.jpg';
            const fname = `ig_${igPostId}${ext}`;
            const fpath = path.join(UPLOADS_DIR, fname);
            fs.writeFileSync(fpath, buffer);
            localImagePath = `/uploads/blog/${fname}`;
          }
        } catch (imgErr) {
          console.warn(`[Instagram] Не удалось скачать изображение: ${imgErr.message}`);
        }
      }

      const post = {
        id: uuidv4(),
        instagram_id: igPostId,
        title: caption.split('\n')[0].slice(0, 100) || 'Пост из Instagram',
        content: caption,
        image_path: localImagePath,
        instagram_url: raw.permalink || `https://www.instagram.com/p/${igPostId}/`,
        date: raw.timestamp ? new Date(raw.timestamp).toISOString() : new Date().toISOString(),
        source: 'instagram',
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

/**
 * GET /api/analytics
 * Returns local daily analytics JSON (requires admin secret).
 */
app.get('/api/analytics', authGuard, (_req, res) => {
  const data = readAnalytics();
  res.json(data);
});

/**
 * POST /api/analytics/track
 * Receives visitor analytics events and records them locally in analytics.json.
 * Public endpoint called by tracker.js.
 */
app.post('/api/analytics/track', (req, res) => {
  try {
    const event = req.body;
    const today = new Date().toISOString().split('T')[0];

    const data = readAnalytics();
    let dayEntry = data.find(d => d.date === today);

    if (!dayEntry) {
      dayEntry = {
        date: today,
        pageviews: 0,
        unique_visitors: 0,
        returning_visitors: 0,
        total_scroll_depth: 0,
        scroll_events: 0,
        total_time_on_site: 0,
        time_events: 0,
        utm_sources: {},
        cities: {},
        os: {},
        browsers: {},
        devices: {},
        clicks: {},
        referrers: {}
      };
      data.unshift(dayEntry); // Add to beginning (newest first)
    }

    // Increment pageviews
    if (event.p_event_type === 'pageview') {
      dayEntry.pageviews += 1;
    }

    // Increment visitors
    if (event.p_is_new_visitor) {
      dayEntry.unique_visitors += 1;
    }
    if (event.p_is_returning) {
      dayEntry.returning_visitors += 1;
    }

    // Handle scroll depth
    if (event.p_scroll_depth !== null && event.p_scroll_depth !== undefined) {
      dayEntry.total_scroll_depth += parseInt(event.p_scroll_depth, 10) || 0;
      dayEntry.scroll_events += 1;
    }

    // Handle time on site
    if (event.p_time_on_site !== null && event.p_time_on_site !== undefined) {
      dayEntry.total_time_on_site += parseInt(event.p_time_on_site, 10) || 0;
      dayEntry.time_events += 1;
    }

    // Incrementor helper
    const incrementObjKey = (obj, key) => {
      if (!key) return;
      const cleanKey = String(key).trim();
      if (!cleanKey) return;
      obj[cleanKey] = (obj[cleanKey] || 0) + 1;
    };

    if (event.p_event_type === 'pageview') {
      incrementObjKey(dayEntry.utm_sources, event.p_utm_source);
      incrementObjKey(dayEntry.cities, event.p_city);
      incrementObjKey(dayEntry.os, event.p_os);
      incrementObjKey(dayEntry.browsers, event.p_browser);
      incrementObjKey(dayEntry.devices, event.p_device);
      incrementObjKey(dayEntry.referrers, event.p_referrer);
    }

    if (event.p_event_type === 'click') {
      incrementObjKey(dayEntry.clicks, event.p_event_target);
    }

    writeAnalytics(data);
    res.json({ ok: true });
  } catch (err) {
    console.error('[Analytics API] Tracking error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/analytics/backup
 * Download analytics.json backup file directly (requires admin secret).
 */
app.get('/api/analytics/backup', authGuard, (_req, res) => {
  if (fs.existsSync(ANALYTICS_FILE)) {
    res.download(ANALYTICS_FILE, `analytics_backup_${new Date().toISOString().split('T')[0]}.json`);
  } else {
    res.status(404).json({ error: 'Файл аналитики не найден' });
  }
});

/**
 * GET /api/database/tables
 * Lists all available local JSON database tables in server/data/
 */
app.get('/api/database/tables', authGuard, (_req, res) => {
  const dataDir = path.join(__dirname, 'data');
  const result = [];
  try {
    const files = fs.readdirSync(dataDir);
    for (const file of files) {
      if (file.endsWith('.json') && !file.endsWith('.example.json')) {
        const tableName = file.replace('.json', '');
        const filePath = path.join(dataDir, file);
        let rowCount = 0;
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          rowCount = Array.isArray(content) ? content.length : 1;
        } catch (e) { }

        result.push({
          name: tableName,
          fileName: file,
          rowCount: rowCount
        });
      }
    }
  } catch (err) {
    console.error('[DB Explorer] Error listing tables:', err.message);
  }
  res.json(result);
});

/**
 * GET /api/database/tables/:tableName
 * Returns records of a specific local JSON table
 */
app.get('/api/database/tables/:tableName', authGuard, (req, res) => {
  const { tableName } = req.params;
  const safeName = tableName.replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(__dirname, 'data', `${safeName}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Таблица "${safeName}" не найдена` });
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json({
      name: safeName,
      data: Array.isArray(content) ? content : [content]
    });
  } catch (err) {
    res.status(500).json({ error: `Ошибка чтения таблицы: ${err.message}` });
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

/**
 * GET /api/blog/backup-images
 * Streams a ZIP archive of all blog images, posts.json and analytics.json
 */
app.get('/api/blog/backup-images', authGuard, (req, res) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="doctor_blog_media.zip"');

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    res.status(500).send({ error: err.message });
  });

  archive.pipe(res);

  // Append posts.json
  if (fs.existsSync(DATA_FILE)) {
    archive.file(DATA_FILE, { name: 'posts.json' });
  }

  // Append analytics.json
  if (fs.existsSync(ANALYTICS_FILE)) {
    archive.file(ANALYTICS_FILE, { name: 'analytics.json' });
  }

  // Append uploads folder
  if (fs.existsSync(UPLOADS_DIR)) {
    archive.directory(UPLOADS_DIR, 'uploads/blog');
  }

  archive.finalize();
});

/* ── Start ───────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚀 Сервер блога запущен: http://localhost:${PORT}`);
  console.log(`📝 Блог: http://localhost:${PORT}/`);
  console.log(`🔧 Админка: http://localhost:${PORT}/admin`);
  console.log(`📦 Посты хранятся в: server/data/posts.json`);
  console.log(`🖼️  Картинки хранятся в: server/uploads/blog/\n`);
});
