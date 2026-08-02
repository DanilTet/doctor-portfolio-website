const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'sitemap.template.xml');
const OUTPUT_PATH = path.join(ROOT_DIR, 'sitemap.xml');
const ARTICLES_DIR = path.join(ROOT_DIR, 'articles');
const RU_ARTICLES_DIR = path.join(ROOT_DIR, 'ru', 'articles');

// Директории, которые никогда не должны попадать в sitemap как публичные страницы
const EXCLUDED_DIRS = [
  'admin', 'server', 'scratch', 'node_modules', '.git', '.github',
  'telegram-bot', 'css', 'js', 'img', 'uploads', 'articles',
  'ru', 'en', '.agents', '.code-review-graph', 'graphify-out'
];

function generateSitemap() {
  try {
    const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
    let dynamicUrls = '';
    let count = 0;

    // Статьи
    if (fs.existsSync(ARTICLES_DIR)) {
      const articleSlugs = fs.readdirSync(ARTICLES_DIR).filter(file => {
        const articlePath = path.join(ARTICLES_DIR, file);

        return (
          fs.statSync(articlePath).isDirectory() &&
          fs.existsSync(path.join(articlePath, 'index.html'))
        );
      });

      articleSlugs.forEach(slug => {
        addPageToSitemap(slug, false);
      });
    }

    // Основные публичные страницы (динамический поиск)
    const publicPages = fs.readdirSync(ROOT_DIR).filter(file => {
      const fullPath = path.join(ROOT_DIR, file);
      
      // Исключаем файлы и проверяем blacklist
      if (!fs.statSync(fullPath).isDirectory()) return false;
      if (EXCLUDED_DIRS.includes(file)) return false;
      
      // Публичная страница должна содержать index.html
      if (!fs.existsSync(path.join(fullPath, 'index.html'))) return false;
      
      return true;
    });

    publicPages.forEach(slug => {
      addPageToSitemap(slug, true);
    });

    function addPageToSitemap(slug, isCore) {
      count++;

      const indexHtmlPath = isCore
        ? path.join(ROOT_DIR, slug, 'index.html')
        : path.join(ARTICLES_DIR, slug, 'index.html');

      const ruIndexHtmlPath = isCore
        ? path.join(ROOT_DIR, 'ru', slug, 'index.html')
        : path.join(RU_ARTICLES_DIR, slug, 'index.html');

      const stat = fs.statSync(indexHtmlPath);
      const lastmod = stat.mtime.toISOString().split('T')[0];

      const hasRu = fs.existsSync(ruIndexHtmlPath);

      const urlPath = isCore
        ? `${slug}/`
        : `articles/${slug}`;

      // Украинская версия
      dynamicUrls += `
  <url>
    <loc>https://endo.kh.ua/${urlPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${isCore ? '0.8' : '0.7'}</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://endo.kh.ua/${urlPath}"/>`;

      if (hasRu) {
        dynamicUrls += `
    <xhtml:link rel="alternate" hreflang="ru" href="https://endo.kh.ua/ru/${urlPath}"/>`;
      }

      dynamicUrls += `
  </url>`;

      // Русская версия
      if (hasRu) {
        dynamicUrls += `
  <url>
    <loc>https://endo.kh.ua/ru/${urlPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${isCore ? '0.7' : '0.6'}</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://endo.kh.ua/${urlPath}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://endo.kh.ua/ru/${urlPath}"/>
  </url>`;
      }
    }

    // Вставляем автоматически найденные URL перед </urlset>
    const finalSitemap = template.replace(
      '</urlset>',
      dynamicUrls + '\n</urlset>'
    );

    fs.writeFileSync(OUTPUT_PATH, finalSitemap);

    console.log(
      '[Sitemap] Automatically generated sitemap.xml with ' +
      count +
      ' public pages based on file system.'
    );
  } catch (err) {
    console.error(
      '[Sitemap Error] Failed to generate sitemap:',
      err.message
    );
  }
}

module.exports = { generateSitemap };
