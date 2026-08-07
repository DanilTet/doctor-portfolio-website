import os

base = 'c:/oleg-site/doctor-portfolio-website'

def patch_index():
    path = f"{base}/index.html"
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Remove the old button
    old_btn = '                <a href="/ercp/" class="btn btn--ghost" data-i18n="topics.usg.btn_ercp">Детальніше про ЕРХПГ</a>\n'
    html = html.replace(old_btn, '')

    # 2. Add the new topic 4
    topic_4 = """
        <!-- Topic 4 -->
        <div class="stats__item stats__accordion" id="topic-ercp-card" data-animate data-animate-delay="4" tabindex="0" role="button" aria-expanded="false" aria-controls="topic-ercp-content">
          <div class="stats__label" data-i18n="topics.ercp.title">ЕРХПГ</div>
          <div class="stats__sublabel" data-i18n="topics.ercp.description">Ендоскопічна ретроградна холангіопанкреатографія</div>
          <div class="stats__arrow-wrap">
            <span class="stats__more-btn" data-i18n="topics.more">Дізнатися більше</span>
            <svg class="stats__arrow-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <!-- Hidden detail block -->
          <div class="stats__accordion-content" id="topic-ercp-content" aria-hidden="true">
            <div class="stats__accordion-inner">
              <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">
                <a href="/ercp/" class="btn btn--ghost" data-i18n="topics.ercp.btn">Детальніше про ЕРХПГ</a>
              </div>
            </div>
          </div>
        </div>
"""
    # Insert right before the end of stats__inner
    # Find `        </div>\n\n      </div>\n    </div>\n  </section>`
    marker = "      </div>\n    </div>\n  </section>"
    if marker in html:
        # We want to insert inside `<div class="stats__inner">`
        # which is closed by the first `</div>` in the marker above.
        parts = html.split("      </div>\n    </div>\n  </section>")
        html = parts[0] + topic_4 + "\n      </div>\n    </div>\n  </section>" + parts[1]

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)


def patch_build():
    path = f"{base}/build.js"
    with open(path, 'r', encoding='utf-8') as f:
        build_js = f.read()

    # Add translations
    ru_trans = """    'topics.usg.btn_ercp': 'Подробнее об ЭРХПГ',
    'topics.ercp.title': 'ЭРХПГ',
    'topics.ercp.description': 'Эндоскопическая ретроградная холангиопанкреатография',
    'topics.ercp.btn': 'Подробнее об ЭРХПГ',"""
    
    build_js = build_js.replace("'topics.usg.btn_ercp': 'Подробнее об ЭРХПГ',", ru_trans)

    en_trans = """    'topics.usg.btn_ercp': 'Details about ERCP',
    'topics.ercp.title': 'ERCP',
    'topics.ercp.description': 'Endoscopic retrograde cholangiopancreatography',
    'topics.ercp.btn': 'Details about ERCP',"""
    
    build_js = build_js.replace("'topics.usg.btn_ercp': 'Details about ERCP',", en_trans)

    # Patch localizeLinks
    old_logic = """    if (langCode === 'ru') {
        $(`a[href^="/ercp/"]`).not('.lang-switch a').each(function() {
            $(this).attr('href', `/ru/ercp/`);
        });
    } else if (langCode === 'en') {
        $(`a[href^="/ercp/"]`).not('.lang-switch a').remove();
    }"""
    
    new_logic = """    if (langCode === 'ru') {
        $(`a[href^="/ercp/"]`).not('.lang-switch a').each(function() {
            $(this).attr('href', `/ru/ercp/`);
        });
    } else if (langCode === 'en') {
        $('#topic-ercp-card').remove();
        $(`a[href^="/ercp/"]`).not('.lang-switch a').remove();
    }"""
    
    build_js = build_js.replace(old_logic, new_logic)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(build_js)

patch_index()
patch_build()
print("Done")
