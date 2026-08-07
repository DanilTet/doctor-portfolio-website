import os
import re

base = 'c:/oleg-site/doctor-portfolio-website'

# 1. Update index.html
index_path = f"{base}/index.html"
with open(index_path, 'r', encoding='utf-8') as f:
    index_html = f.read()

index_html = index_html.replace(
    '<a href="/ercp/" class="btn btn--ghost">Детальніше про ЕРХПГ</a>',
    '<a href="/ercp/" class="btn btn--ghost" data-i18n="topics.usg.btn_ercp">Детальніше про ЕРХПГ</a>'
)
with open(index_path, 'w', encoding='utf-8') as f:
    f.write(index_html)

# 2. Update build.js
build_path = f"{base}/build.js"
with open(build_path, 'r', encoding='utf-8') as f:
    build_js = f.read()

# Add translation for RU
build_js = build_js.replace(
    "'topics.usg.posts_btn2': 'Статьи о Хирургии',",
    "'topics.usg.posts_btn2': 'Статьи о Хирургии',\n    'topics.usg.btn_ercp': 'Подробнее об ЭРХПГ',"
)

# Add translation for EN
build_js = build_js.replace(
    "'topics.usg.posts_btn2': 'Articles about Surgery',",
    "'topics.usg.posts_btn2': 'Articles about Surgery',\n    'topics.usg.btn_ercp': 'Details about ERCP',"
)

# Replace localizeLinks
old_fn = """function localizeLinks($, langCode) {
    const pages = ['gastroscopy', 'colonoscopy', 'uzd', 'surgery'];
    pages.forEach(p => {
        $(`a[href^="/${p}/"]`).not('.lang-switch a').each(function() {
            $(this).attr('href', `/${langCode}/${p}/`);
        });
    });
}"""

new_fn = """function localizeLinks($, langCode) {
    const pages = ['gastroscopy', 'colonoscopy', 'uzd', 'surgery'];
    pages.forEach(p => {
        $(`a[href^="/${p}/"]`).not('.lang-switch a').each(function() {
            $(this).attr('href', `/${langCode}/${p}/`);
        });
    });
    
    if (langCode === 'ru') {
        $(`a[href^="/ercp/"]`).not('.lang-switch a').each(function() {
            $(this).attr('href', `/ru/ercp/`);
        });
    } else if (langCode === 'en') {
        $(`a[href^="/ercp/"]`).not('.lang-switch a').remove();
    }
}"""

build_js = build_js.replace(old_fn, new_fn)

with open(build_path, 'w', encoding='utf-8') as f:
    f.write(build_js)

print("Patch applied successfully.")
