const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'sitemap.template.xml');
const OUTPUT_PATH = path.join(ROOT_DIR, 'sitemap.xml');
const ARTICLES_DIR = path.join(ROOT_DIR, 'articles');
const RU_ARTICLES_DIR = path.join(ROOT_DIR, 'ru', 'articles');

function generateSitemap() {
  try {
    let template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
    let dynamicUrls = '';
    let count = 0;

    if (fs.existsSync(ARTICLES_DIR)) {
      let slugs = fs.readdirSync(ARTICLES_DIR).filter(file => {
        return fs.statSync(path.join(ARTICLES_DIR, file)).isDirectory() && 
               fs.existsSync(path.join(ARTICLES_DIR, file, 'index.html'));
      });

      const CORE_PAGES = ['gastroscopy', 'colonoscopy', 'uzd', 'surgery'];
      CORE_PAGES.forEach(page => {
        if (fs.existsSync(path.join(ROOT_DIR, page, 'index.html'))) {
          slugs.push(page); // Add them to the list of slugs to process
        }
      });

      slugs.forEach(slug => {
        count++;
        const isCore = CORE_PAGES.includes(slug);
        const indexHtmlPath = isCore 
          ? path.join(ROOT_DIR, slug, 'index.html') 
          : path.join(ARTICLES_DIR, slug, 'index.html');
          
        const ruIndexHtmlPath = isCore
          ? path.join(ROOT_DIR, 'ru', slug, 'index.html')
          : path.join(RU_ARTICLES_DIR, slug, 'index.html');

        // Get last modified date from index.html
        const stat = fs.statSync(indexHtmlPath);
        const lastmod = stat.mtime.toISOString().split('T')[0];
        
        const hasRu = fs.existsSync(ruIndexHtmlPath);
        
        const urlPath = isCore ? `${slug}/` : `articles/${slug}`;

        dynamicUrls += `
  <url>
    <loc>https://endo.kh.ua/${urlPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${isCore ? '0.8' : '0.7'}</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://endo.kh.ua/${urlPath}"/>`;

        if (hasRu) {
          dynamicUrls += `\n    <xhtml:link rel="alternate" hreflang="ru" href="https://endo.kh.ua/ru/${urlPath}"/>`;
        }

        dynamicUrls += `\n  </url>`;
        
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
      });
    }

    // Replace the closing tag with our dynamic URLs and the closing tag
    const finalSitemap = template.replace('</urlset>', dynamicUrls + '\n</urlset>');
    fs.writeFileSync(OUTPUT_PATH, finalSitemap);
    console.log('[Sitemap] Automatically generated sitemap.xml with ' + count + ' articles based on file system.');

  } catch (err) {
    console.error('[Sitemap Error] Failed to generate sitemap:', err.message);
  }
}

module.exports = { generateSitemap };
