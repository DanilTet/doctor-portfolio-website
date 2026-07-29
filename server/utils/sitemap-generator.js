const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'sitemap.template.xml');
const OUTPUT_PATH = path.join(ROOT_DIR, 'sitemap.xml');
const ARTICLES_DATA_PATH = path.join(ROOT_DIR, 'server', 'data', 'articles.seed.json');

function generateSitemap() {
  try {
    let template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
    let articles = [];
    if (fs.existsSync(ARTICLES_DATA_PATH)) {
      articles = JSON.parse(fs.readFileSync(ARTICLES_DATA_PATH, 'utf-8'));
    }

    let dynamicUrls = '';
    
    articles.forEach(article => {
      if (article.status === 'published') {
        const slug = article.slug;
        const lastmod = (article.updated_at || article.created_at || new Date().toISOString()).split('T')[0];
        
        dynamicUrls += `
  <url>
    <loc>https://endo.kh.ua/articles/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://endo.kh.ua/articles/${slug}"/>`;

        // Check if RU translation exists
        if (article.translations && article.translations.ru && article.translations.ru.title) {
          dynamicUrls += `\n    <xhtml:link rel="alternate" hreflang="ru" href="https://endo.kh.ua/ru/articles/${slug}"/>`;
        }

        dynamicUrls += `\n  </url>`;
        
        if (article.translations && article.translations.ru && article.translations.ru.title) {
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
      }
    });

    // Replace the closing tag with our dynamic URLs and the closing tag
    const finalSitemap = template.replace('</urlset>', dynamicUrls + '\n</urlset>');
    fs.writeFileSync(OUTPUT_PATH, finalSitemap);
    console.log('[Sitemap] Automatically generated sitemap.xml with ' + articles.filter(a => a.status === 'published').length + ' articles.');

  } catch (err) {
    console.error('[Sitemap Error] Failed to generate sitemap:', err.message);
  }
}

module.exports = { generateSitemap };
