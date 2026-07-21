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
const { writeArticleHtml } = require('./utils/article-renderer');
const { translateArticle } = require('./utils/article-translator');

const app = express();
const PORT = process.env.PORT || 3000;
const BLOG_SECRET = process.env.BLOG_SECRET || 'super-secret-key-123';
const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME || '';

/* ── Paths ───────────────────────────────────────────────── */
const ROOT_DIR = path.join(__dirname, '..');            // Project root
const DATA_FILE = path.join(__dirname, 'data', 'posts.json');
const ANALYTICS_FILE = path.join(__dirname, 'data', 'analytics.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'blog');
const ARTICLES_DIR = path.join(__dirname, 'data', 'articles');
const ARTICLES_UPLOADS_DIR = path.join(__dirname, 'uploads', 'articles');

// Ensure directories exist
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(ARTICLES_DIR, { recursive: true });
fs.mkdirSync(ARTICLES_UPLOADS_DIR, { recursive: true });

/* ── Middleware ──────────────────────────────────────────── */
app.use(cors());
app.use(express.json());

// Serve uploaded blog images
app.use('/uploads/blog', express.static(UPLOADS_DIR));

// Serve uploaded article images
app.use('/uploads/articles', express.static(ARTICLES_UPLOADS_DIR));

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

/* ── Multer for article images ───────────────────────────── */
const articleStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const slug = req.params.slug || req.body.slug || 'tmp';
    const dir = path.join(ARTICLES_UPLOADS_DIR, slug.replace(/[^a-z0-9-]/gi, '-'));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});
const uploadArticle = multer({
  storage: articleStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Только изображения!'));
  },
});

/* ── Helpers ─────────────────────────────────────────────── */
function readPosts() {
  let posts = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    posts = [];
  }

  // Auto-merge seed posts (tracked in git) if missing in local data/posts.json
  const seedFile = path.join(__dirname, 'data', 'posts.seed.json');
  if (fs.existsSync(seedFile)) {
    try {
      const seedPosts = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
      let updated = false;
      seedPosts.forEach(sp => {
        const idx = posts.findIndex(cp => cp.id === sp.id);
        if (idx !== -1) {
          // Merge seed into existing post, but DO NOT overwrite fields that
          // the admin may have changed (image_path, tags, source, title, content).
          const existing = posts[idx];
          const merged = { ...sp, ...existing };
          // Always keep external_url from seed if not set in existing
          if (!existing.external_url && sp.external_url) merged.external_url = sp.external_url;
          posts[idx] = merged;
          updated = true;
        } else {
          posts.unshift(sp);
          updated = true;
        }
      });
      if (updated) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
      }
    } catch (e) {
      console.warn('[Blog] Seed posts merge error:', e);
    }
  }

  return posts;
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

/* ═══════════════════════════════════════════════════════════
   ARTICLES API
   ═══════════════════════════════════════════════════════════ */

/* ── Helpers ─────────────────────────────────────────────── */
function readArticles() {
  const files = fs.existsSync(ARTICLES_DIR) ? fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json')) : [];
  return files.map(f => {
    try { return JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8')); }
    catch(e) { return null; }
  }).filter(Boolean);
}

function readArticle(id) {
  const articles = readArticles();
  return articles.find(a => a.id === id) || null;
}

function writeArticle(article) {
  const file = path.join(ARTICLES_DIR, `${article.slug}.json`);
  fs.writeFileSync(file, JSON.stringify(article, null, 2), 'utf-8');
}

function deleteArticleFile(article) {
  const file = path.join(ARTICLES_DIR, `${article.slug}.json`);
  if (fs.existsSync(file)) fs.rmSync(file, { force: true });
}

/**
 * GET /api/articles
 * Returns list of all articles (sorted newest first).
 */
app.get('/api/articles', authGuard, (_req, res) => {
  const articles = readArticles().sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(articles);
});

/**
 * POST /api/articles
 * Create a new article (draft).
 * Body: JSON
 */
app.post('/api/articles', authGuard, (req, res) => {
  const body = req.body;
  if (!body.title || body.title.trim().length < 2)
    return res.status(400).json({ error: 'Заголовок обязателен' });

  const slug = (body.slug || body.title)
    .toLowerCase()
    .replace(/[^a-zа-яёіїєґ0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[а-яёіїєґ]/g, c => {
      const map = {а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ye',ж:'zh',з:'z',и:'y',і:'i',ї:'yi',й:'j',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'yu',я:'ya',ё:'yo'};
      return map[c.toLowerCase()] || c;
    });

  const finalSlug = slug || uuidv4().slice(0, 8);
  const articleId = body.id || uuidv4();

  // Slug duplication check
  const existingArticles = readArticles();
  if (existingArticles.some(a => a.slug === finalSlug && a.id !== articleId)) {
    return res.status(400).json({ error: `Стаття з таким URL-slug ("${finalSlug}") вже існує! Будь ласка, вкажіть інший slug.` });
  }

  const article = {
    id: articleId,
    slug: finalSlug,
    title: body.title.trim(),
    subtitle: body.subtitle || '',
    seo_description: body.seo_description || '',
    image_card: body.image_card || null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
    status: body.status || 'draft',
    show_in_blog: body.show_in_blog !== false,
    sections: Array.isArray(body.sections) ? body.sections : [],
    show_final_cta: body.show_final_cta !== false,
    translations: body.translations || {},
  };

  writeArticle(article);
  res.status(201).json(article);
});

/**
 * PUT /api/articles/:id
 * Update an existing article.
 */
app.put('/api/articles/:id', authGuard, (req, res) => {
  const article = readArticle(req.params.id);
  if (!article) return res.status(404).json({ error: 'Статья не найдена' });

  const body = req.body;
  const oldFile = path.join(ARTICLES_DIR, `${article.slug}.json`);

  // Merge fields
  if (body.title !== undefined) article.title = body.title;
  if (body.subtitle !== undefined) article.subtitle = body.subtitle;
  if (body.seo_description !== undefined) article.seo_description = body.seo_description;
  if (body.image_card !== undefined) article.image_card = body.image_card;
  if (Array.isArray(body.tags)) article.tags = body.tags;
  if (body.date !== undefined) article.date = new Date(body.date).toISOString();
  if (body.status !== undefined) article.status = body.status;
  if (body.show_in_blog !== undefined) article.show_in_blog = body.show_in_blog;
  if (Array.isArray(body.sections)) article.sections = body.sections;
  if (body.show_final_cta !== undefined) article.show_final_cta = body.show_final_cta;
  if (body.slug !== undefined && body.slug !== article.slug) {
    const existingArticles = readArticles();
    if (existingArticles.some(a => a.slug === body.slug && a.id !== article.id)) {
      return res.status(400).json({ error: `Стаття з таким URL-slug ("${body.slug}") вже існує! Будь ласка, вкажіть інший slug.` });
    }
    // slug changed — rename file
    if (fs.existsSync(oldFile)) fs.rmSync(oldFile, { force: true });
    article.slug = body.slug;
  }

  writeArticle(article);

  // Sync updated info to posts.json if published in blog
  const posts = readPosts();
  const pIdx = posts.findIndex(p => p.article_id === article.id);
  if (pIdx >= 0) {
    posts[pIdx].title = article.title;
    posts[pIdx].content = article.subtitle || '';
    posts[pIdx].image_path = article.image_card || null;
    posts[pIdx].external_url = `/articles/${article.slug}`;
    posts[pIdx].tags = article.tags || [];
    writePosts(posts);
  }

  res.json(article);
});

/**
 * DELETE /api/articles/:id
 * Delete an article and its generated HTML files.
 */
app.delete('/api/articles/:id', authGuard, (req, res) => {
  const article = readArticle(req.params.id);
  if (!article) return res.status(404).json({ error: 'Статья не найдена' });

  deleteArticleFile(article);

  // Remove from posts.json if it was published there
  const posts = readPosts();
  const filtered = posts.filter(p => p.article_id !== article.id);
  if (filtered.length !== posts.length) writePosts(filtered);

  console.log(`[Articles API] Deleted article "${article.slug}"`);
  res.json({ ok: true });
});

/**
 * POST /api/articles/:id/upload-image
 * Upload an image for an article (cover or section).
 * URL param :slug is read from article.slug
 */
app.post('/api/articles/:id/upload-image', authGuard, (req, res, next) => {
  const article = readArticle(req.params.id);
  req.params.slug = (article && article.slug) ? article.slug : (req.body.slug || req.params.id);
  next();
}, uploadArticle.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  const url = `/uploads/articles/${req.params.slug}/${req.file.filename}`;
  res.json({ ok: true, url });
});

/**
 * POST /api/articles/:id/publish
 * Generate HTML files and add/update entry in posts.json for blog display.
 */
app.post('/api/articles/:id/publish', authGuard, async (req, res) => {
  const article = readArticle(req.params.id);
  if (!article) return res.status(404).json({ error: 'Статья не найдена' });

  try {
    // Generate Ukrainian HTML
    const ukFile = writeArticleHtml(article, 'uk');

    // If Russian translation exists — generate RU HTML too
    let ruFile = null;
    if (article.translations && article.translations.ru && article.translations.ru.title) {
      ruFile = writeArticleHtml(article, 'ru');
    }

    // Update article status
    article.status = 'published';
    writeArticle(article);

    // Upsert into posts.json (blog card)
    if (article.show_in_blog) {
      const posts = readPosts();
      const existing = posts.findIndex(p => p.article_id === article.id);
      const blogPost = {
        id: existing >= 0 ? posts[existing].id : uuidv4(),
        article_id: article.id,
        title: article.title,
        content: article.subtitle || '',
        image_path: article.image_card || null,
        external_url: `/articles/${article.slug}`,
        date: article.date,
        source: 'article',
        tags: article.tags || [],
      };
      if (existing >= 0) { posts[existing] = blogPost; } else { posts.unshift(blogPost); }
      writePosts(posts);
    }

    console.log(`[Articles API] Published "${article.slug}": ${ukFile}`);
    res.json({ ok: true, uk: ukFile, ru: ruFile });
  } catch (err) {
    console.error('[Articles API] Publish error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/articles/:id/translate
 * Translate article from Ukrainian to Russian and generate RU HTML.
 */
app.post('/api/articles/:id/translate', authGuard, async (req, res) => {
  const article = readArticle(req.params.id);
  if (!article) return res.status(404).json({ error: 'Статья не найдена' });

  try {
    console.log(`[Articles API] Starting translation for "${article.slug}"...`);
    const ruTranslation = await translateArticle(article);
    article.translations = article.translations || {};
    article.translations.ru = ruTranslation;
    writeArticle(article);

    // Generate RU HTML if article is published
    let ruFile = null;
    if (article.status === 'published') {
      ruFile = writeArticleHtml(article, 'ru');
    }

    console.log(`[Articles API] Translation done for "${article.slug}"`);
    res.json({ ok: true, ru: ruTranslation, ruFile });
  } catch (err) {
    console.error('[Articles API] Translation error:', err.message);
    res.status(500).json({ error: `Ошибка перевода: ${err.message}` });
  }
});

/**
 * GET /api/backup/full & GET /api/blog/backup-images
 * Streams a full ZIP archive containing all articles, database files, uploaded media and generated HTML pages.
 */
const handleFullBackup = (req, res) => {
  const dateStr = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="doctor_website_full_backup_${dateStr}.zip"`);

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    console.error('[Backup API] ZIP Archive Error:', err);
    if (!res.headersSent) res.status(500).send({ error: err.message });
  });

  archive.pipe(res);

  // 1. Data folder (posts.json, analytics.json, articles/*.json)
  const dataDir = path.join(__dirname, 'data');
  if (fs.existsSync(dataDir)) {
    archive.directory(dataDir, 'server/data');
  }

  // 2. Server uploads (server/uploads/articles/)
  if (fs.existsSync(ARTICLES_UPLOADS_DIR)) {
    archive.directory(ARTICLES_UPLOADS_DIR, 'server/uploads/articles');
  }

  // 3. Blog uploads (uploads/blog/)
  if (fs.existsSync(UPLOADS_DIR)) {
    archive.directory(UPLOADS_DIR, 'uploads/blog');
  }

  // 4. Generated article HTML pages (articles/)
  const articlesHtmlDir = path.join(ROOT_DIR, 'articles');
  if (fs.existsSync(articlesHtmlDir)) {
    archive.directory(articlesHtmlDir, 'articles');
  }

  // 5. Russian article HTML pages (ru/articles/)
  const ruArticlesHtmlDir = path.join(ROOT_DIR, 'ru', 'articles');
  if (fs.existsSync(ruArticlesHtmlDir)) {
    archive.directory(ruArticlesHtmlDir, 'ru/articles');
  }

  archive.finalize();
};

app.get('/api/backup/full', authGuard, handleFullBackup);
app.get('/api/blog/backup-images', authGuard, handleFullBackup);

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
