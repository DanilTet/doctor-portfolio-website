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
      const slugs = fs.readdirSync(ARTICLES_DIR).filter(file => {
        return fs.statSync(path.join(ARTICLES_DIR, file)).isDirectory() && 
               fs.existsSync(path.join(ARTICLES_DIR, file, 'index.html'));
      });

      slugs.forEach(slug => {
        count++;
        // Get last modified date from index.html
        const stat = fs.statSync(path.join(ARTICLES_DIR, slug, 'index.html'));
        const lastmod = stat.mtime.toISOString().split('T')[0];
        
        const hasRu = fs.existsSync(path.join(RU_ARTICLES_DIR, slug, 'index.html'));

        dynamicUrls += `
  <url>
    <loc>https://endo.kh.ua/articles/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://endo.kh.ua/articles/${slug}"/>`;

        if (hasRu) {
          dynamicUrls += `\n    <xhtml:link rel="alternate" hreflang="ru" href="https://endo.kh.ua/ru/articles/${slug}"/>`;
        }

        dynamicUrls += `\n  </url>`;
        
        if (hasRu) {
          dynamicUrls += `
  <url>
    <loc>https://endo.kh.ua/ru/articles/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://endo.kh.ua/articles/${slug}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://endo.kh.ua/ru/articles/${slug}"/>
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
