import re
import os

base = 'c:/oleg-site/doctor-portfolio-website'

def update_html_remove_en(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Remove EN hreflang
    html = re.sub(r'<link rel="alternate" hreflang="en" href="[^"]+" />\s*', '', html)
    
    # Remove EN lang-switch button
    html = re.sub(r'<a href="[^"]+" class="lang-switch__btn">EN</a>\s*', '', html)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

update_html_remove_en(f'{base}/ercp/index.html')
update_html_remove_en(f'{base}/ru/ercp/index.html')

# Update build.js
with open(f'{base}/build.js', 'r', encoding='utf-8') as f:
    build_js = f.read()

ru_ercp_keys = """
    'service.ercp.meta.desc': 'ЭРХПГ (эндоскопическая ретроградная холангиопанкреатография) в Харькове. Эндоскопическое удаление камней из желчных протоков, лечение холедохолитиаза.',
    'service.ercp.meta.keywords': 'ЭРХПГ Харьков, ERCP Харьков, удаление камней из желчных протоков эндоскопически, холедохолитиаз, диагностика желчных протоков',
    'service.ercp.meta.title': 'ЭРХПГ в Харькове | Врач Тетерник О.А.',
    'service.ercp.title': 'ЭРХПГ (эндоскопическая ретроградная холангиопанкреатография)',
    'service.ercp.subtitle': 'Высокоточная диагностика и малоинвазивное лечение заболеваний желчных протоков без разрезов.',
    'service.ercp.btn': 'Получить консультацию по ЭРХПГ',
    'service.ercp.toc.title': 'Путеводитель по вопросам подготовки и проведения:',
    'service.ercp.toc.item1': '1. Что такое ЭРХПГ?',
    'service.ercp.toc.item2': '2. Диагностическая ЭРХПГ (диагностика желчных протоков)',
    'service.ercp.toc.item3': '3. Лечебная ЭРХПГ (эндоскопическое удаление камней)',
    'service.ercp.toc.item4': '4. Как проходит процедура и подготовка',
    'service.ercp.toc.item5': '5. Восстановление после ЭРХПГ',
    'service.ercp.about.title': '1. Что такое ЭРХПГ?',
    'service.ercp.about.p1': '<strong>ЭРХПГ (эндоскопическая ретроградная холангиопанкреатография)</strong> — это специализированная процедура, объединяющая эндоскопию и рентгеноскопию для диагностики и лечения заболеваний желчных и панкреатических протоков.',
    'service.ercp.about.p2': 'С помощью специального эндоскопа врач достигает двенадцатиперстной кишки, находит место выхода желчных протоков (фатеров сосочек) и вводит контрастное вещество.',
    'service.ercp.diag.title': '2. Диагностическая ЭРХПГ (диагностика желчных протоков)',
    'service.ercp.diag.p1': 'Диагностический этап процедуры позволяет врачу визуализировать структуру желчевыводящих путей.',
    'service.ercp.diag.li1': 'Выявление камней в желчных протоках (холедохолитиаз).',
    'service.ercp.diag.li2': 'Определение причин механической желтухи.',
    'service.ercp.diag.li3': 'Диагностика стриктур (сужений) желчных путей.',
    'service.ercp.treatment.title': '3. Лечебная ЭРХПГ (эндоскопическое удаление камней)',
    'service.ercp.treatment.p1': 'Если во время диагностики обнаруживается проблема, врач может немедленно перейти к лечебному вмешательству.',
    'service.ercp.treatment.li1': '<strong>Эндоскопическое удаление камней:</strong> извлечение конкрементов из желчных протоков.',
    'service.ercp.treatment.li2': '<strong>Папиллосфинктеротомия:</strong> небольшое рассечение сосочка для облегчения выхода камней.',
    'service.ercp.treatment.li3': '<strong>Стентирование:</strong> установка пластиковых или металлических стентов.',
    'service.ercp.prep.title': '4. Как проходит процедура и подготовка',
    'service.ercp.prep.p1': 'ЭРХПГ — это серьезное медицинское вмешательство, которое проводится в условиях стационара.',
    'service.ercp.prep.li1': '<strong>Строго натощак:</strong> нельзя есть минимум 8 часов и пить за 4 часа до процедуры.',
    'service.ercp.prep.li2': '<strong>Анализы:</strong> перед ЭРХПГ обязательно сдается анализ крови, коагулограмма, ЭКГ.',
    'service.ercp.prep.li3': '<strong>Лекарства:</strong> сообщите врачу обо всех принимаемых препаратах.',
    'service.ercp.rec.title': '5. Восстановление после ЭРХПГ',
    'service.ercp.rec.p1': 'После процедуры пациент остается под медицинским наблюдением в клинике.',
    'service.ercp.rec.p2': 'В большинстве случаев выписка возможна на следующий день.',
"""

en_ercp_keys = """
    'service.ercp.meta.desc': 'ERCP in Kharkiv. Endoscopic removal of stones from bile ducts, treatment of choledocholithiasis.',
    'service.ercp.meta.keywords': 'ERCP Kharkiv, gallstones removal, bile ducts diagnostics',
    'service.ercp.meta.title': 'ERCP in Kharkiv | Dr. Teternik',
    'service.ercp.title': 'ERCP (Endoscopic retrograde cholangiopancreatography)',
    'service.ercp.subtitle': 'High-precision diagnostics and minimally invasive treatment of bile duct diseases.',
    'service.ercp.btn': 'Get consultation for ERCP',
    'service.ercp.toc.title': 'Preparation & Procedure Guide:',
    'service.ercp.toc.item1': '1. What is ERCP?',
    'service.ercp.toc.item2': '2. Diagnostic ERCP',
    'service.ercp.toc.item3': '3. Therapeutic ERCP (stone removal)',
    'service.ercp.toc.item4': '4. Procedure and preparation',
    'service.ercp.toc.item5': '5. Recovery',
    'service.ercp.about.title': '1. What is ERCP?',
    'service.ercp.about.p1': 'ERCP is a specialized procedure that combines endoscopy and fluoroscopy to diagnose and treat diseases of the biliary or pancreatic ductal systems.',
    'service.ercp.about.p2': 'Using a special endoscope, the doctor reaches the duodenum and injects a contrast medium.',
    'service.ercp.diag.title': '2. Diagnostic ERCP',
    'service.ercp.diag.p1': 'The diagnostic stage allows the doctor to visualize the structure of the biliary tract.',
    'service.ercp.diag.li1': 'Detection of stones in bile ducts (choledocholithiasis).',
    'service.ercp.diag.li2': 'Determining the causes of obstructive jaundice.',
    'service.ercp.diag.li3': 'Diagnosis of strictures (narrowing) of the biliary tract.',
    'service.ercp.treatment.title': '3. Therapeutic ERCP (stone removal)',
    'service.ercp.treatment.p1': 'If a problem is found during diagnosis, the doctor can immediately proceed to therapeutic intervention.',
    'service.ercp.treatment.li1': '<strong>Endoscopic stone removal:</strong> extracting calculi from bile ducts.',
    'service.ercp.treatment.li2': '<strong>Sphincterotomy:</strong> a small incision in the papilla to facilitate the passage of stones.',
    'service.ercp.treatment.li3': '<strong>Stenting:</strong> placement of stents to expand narrowed areas.',
    'service.ercp.prep.title': '4. Procedure and preparation',
    'service.ercp.prep.p1': 'ERCP is a serious medical intervention performed in a hospital setting.',
    'service.ercp.prep.li1': '<strong>Strict fasting:</strong> no food for at least 8 hours and no liquids for 4 hours before the procedure.',
    'service.ercp.prep.li2': '<strong>Tests:</strong> blood tests, coagulogram, and ECG are mandatory before ERCP.',
    'service.ercp.prep.li3': '<strong>Medications:</strong> inform your doctor about all medications you are taking.',
    'service.ercp.rec.title': '5. Recovery',
    'service.ercp.rec.p1': 'After the procedure, the patient remains under medical supervision in the clinic.',
    'service.ercp.rec.p2': 'In most cases, discharge is possible the next day.',
"""

# Inject into ru section
build_js = build_js.replace("'service.surgery.meta.desc':", ru_ercp_keys + "\n    'service.surgery.meta.desc':", 1)
# Inject into en section
build_js = build_js.replace("'service.surgery.meta.title': 'Surgery & Minimally Invasive Interventions | Dr. Teternik O.O.',", en_ercp_keys + "\n    'service.surgery.meta.title': 'Surgery & Minimally Invasive Interventions | Dr. Teternik O.O.',", 1)

with open(f'{base}/build.js', 'w', encoding='utf-8') as f:
    f.write(build_js)

# Update sitemap.template.xml
with open(f'{base}/sitemap.template.xml', 'r', encoding='utf-8') as f:
    sitemap = f.read()

ercp_sitemap = """
  <!-- ERCP -->
  <url>
    <loc>https://endo.kh.ua/ercp/</loc>
    <lastmod>2026-08-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://endo.kh.ua/ercp/"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://endo.kh.ua/ru/ercp/"/>
  </url>
  <url>
    <loc>https://endo.kh.ua/ru/ercp/</loc>
    <lastmod>2026-08-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="https://endo.kh.ua/ercp/"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://endo.kh.ua/ru/ercp/"/>
  </url>
"""

# Insert before </urlset>
sitemap = sitemap.replace('</urlset>', ercp_sitemap + '\n</urlset>')

with open(f'{base}/sitemap.template.xml', 'w', encoding='utf-8') as f:
    f.write(sitemap)


# Update index.html - add to Topics
with open(f'{base}/index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# Let's add the button to the Ultrasound & Surgery section (since it's the 3rd topic and fits ERCP)
btn_uk = '\n                <a href="/ercp/" class="btn btn--ghost">Детальніше про ЕРХПГ</a>'
index_html = index_html.replace('<a href="/surgery/" class="btn btn--ghost" data-i18n="topics.usg.btn2">Детальніше про Хірургію</a>', '<a href="/surgery/" class="btn btn--ghost" data-i18n="topics.usg.btn2">Детальніше про Хірургію</a>' + btn_uk)

with open(f'{base}/index.html', 'w', encoding='utf-8') as f:
    f.write(index_html)

print("Misc updates done.")
