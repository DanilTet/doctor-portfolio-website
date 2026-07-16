with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Gastroscopy accordion section
gastro_old = """              <a href="/gastroscopy/" class="btn btn--ghost" style="margin-top:16px" data-i18n="topics.gastro.btn">Детальніше про Гастроскопію</a>"""

gastro_new = """              <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">
                <a href="/gastroscopy/" class="btn btn--ghost" data-i18n="topics.gastro.btn">Детальніше про Гастроскопію</a>
                <button class="btn btn--ghost" data-filter-tag="Гастроскопія" data-i18n="topics.gastro.posts_btn">Статті про Гастроскопію</button>
              </div>"""

html = html.replace(gastro_old, gastro_new)

# 2. Update Colonoscopy accordion section
colono_old = """              <a href="/colonoscopy/" class="btn btn--ghost" style="margin-top:16px" data-i18n="topics.colono.btn">Детальніше про Колоноскопію</a>"""

colono_new = """              <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">
                <a href="/colonoscopy/" class="btn btn--ghost" data-i18n="topics.colono.btn">Детальніше про Колоноскопію</a>
                <button class="btn btn--ghost" data-filter-tag="Колоноскопія" data-i18n="topics.colono.posts_btn">Статті про Колоноскопію</button>
              </div>"""

html = html.replace(colono_old, colono_new)

# 3. Update UZD / Surgery section
uzd_old = """              <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">
                <a href="/uzd/" class="btn btn--ghost" data-i18n="topics.usg.btn1">Детальніше про УЗД</a>
                <a href="/surgery/" class="btn btn--ghost" data-i18n="topics.usg.btn2">Детальніше про Хірургію</a>
              </div>"""

uzd_new = """              <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">
                <a href="/uzd/" class="btn btn--ghost" data-i18n="topics.usg.btn1">Детальніше про УЗД</a>
                <button class="btn btn--ghost" data-filter-tag="УЗД" data-i18n="topics.usg.posts_btn1">Статті про УЗД</button>
                <a href="/surgery/" class="btn btn--ghost" data-i18n="topics.usg.btn2">Детальніше про Хірургію</a>
                <button class="btn btn--ghost" data-filter-tag="Хірургія" data-i18n="topics.usg.posts_btn2">Статті про Хірургію</button>
              </div>"""

html = html.replace(uzd_old, uzd_new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
