import os

def generate_ercp(src_path, dest_path, lang):
    with open(src_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Meta and Canonical
    html = html.replace('data-i18n-content="service.surgery.meta.desc"', 'data-i18n-content="service.ercp.meta.desc"')
    html = html.replace('data-i18n-content="service.surgery.meta.keywords"', 'data-i18n-content="service.ercp.meta.keywords"')
    html = html.replace('data-i18n="service.surgery.meta.title"', 'data-i18n="service.ercp.meta.title"')
    html = html.replace('/surgery/', '/ercp/')
    
    # Open Graph (we keep them static for now, as they are in the template, but we will change the text)
    if lang == 'uk':
        html = html.replace('content="Оперативна ендоскопія в Харкові — 17-а лікарня | Лікар Тетернік О.О."', 'content="ЕРХПГ в Харкові — Лікування жовчних протоків | Лікар Тетернік О.О."')
        html = html.replace('content="Видалення поліпів, зупинка кровотеч, ЕРХПГ в Харкові. Запис: +380994750967."', 'content="ЕРХПГ (ендоскопічна ретроградна холангіопанкреатографія), видалення каменів із жовчних протоків. Запис: +380994750967."')
    else:
        html = html.replace('content="Оперативная эндоскопия в Харькове — 17-я больница | Врач Тетерник О.А."', 'content="ЭРХПГ в Харькове — Лечение желчных протоков | Врач Тетерник О.А."')
        html = html.replace('content="Удаление полипов, остановка кровотечений, ЭРХПГ в Харькове. Запись: +380994750967."', 'content="ЭРХПГ (эндоскопическая ретроградная холангиопанкреатография), удаление камней из желчных протоков. Запись: +380994750967."')
    
    # JSON-LD
    if lang == 'uk':
        html = html.replace('"name": "Лікар Тетернік О.О. — Оперативна ендоскопія в Харкові"', '"name": "Лікар Тетернік О.О. — ЕРХПГ в Харкові"')
        html = html.replace('"name": "Оперативна ендоскопія, видалення поліпів"', '"name": "ЕРХПГ, ендоскопічне видалення каменів із жовчних протоків"')
    else:
        html = html.replace('"name": "Врач Тетерник О.А. — Оперативная эндоскопия в Харькове"', '"name": "Врач Тетерник О.А. — ЭРХПГ в Харькове"')
        html = html.replace('"name": "Оперативная эндоскопия, удаление полипов"', '"name": "ЭРХПГ, эндоскопическое удаление камней из желчных протоков"')
    # Keep "ProcedureType": "https://schema.org/SurgicalProcedure"

    # Replace all i18n keys
    html = html.replace('service.surgery.', 'service.ercp.')
    
    # Custom adjustments for anchors to avoid "surgery"
    html = html.replace('#about-surgery', '#about-ercp')
    html = html.replace('#prep-surgery', '#prep-ercp')
    
    # We will let build.js translate the contents of the page.
    # We will add a link to the article in the recovery section or end of page.
    if lang == 'uk':
        article_link = '<div style="margin-top: 32px; background: rgba(43,217,185,0.05); padding: 20px; border-radius: 8px; border-left: 4px solid var(--color-primary);"><h4 style="margin-top:0;margin-bottom:12px;font-size:1.1rem;color:var(--color-primary);">Корисна інформація</h4><p style="margin:0;"><a href="/articles/kameni-v-zhovchnij-prototsi/" style="color:inherit;text-decoration:underline;">Дізнайтеся більше про камені в жовчних протоках та холедохолітіаз у нашому блозі</a>.</p></div>'
    else:
        article_link = '<div style="margin-top: 32px; background: rgba(43,217,185,0.05); padding: 20px; border-radius: 8px; border-left: 4px solid var(--color-primary);"><h4 style="margin-top:0;margin-bottom:12px;font-size:1.1rem;color:var(--color-primary);">Полезная информация</h4><p style="margin:0;"><a href="/ru/articles/kameni-v-zhovchnij-prototsi/" style="color:inherit;text-decoration:underline;">Узнайте больше о камнях в желчных протоках и холедохолитиазе в нашем блоге</a>.</p></div>'

    html = html.replace('</div>\n\n        <div style="margin-top: 40px; text-align: center;">', article_link + '\n</div>\n\n        <div style="margin-top: 40px; text-align: center;">')

    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(html)

base = 'c:/oleg-site/doctor-portfolio-website'
generate_ercp(f'{base}/surgery/index.html', f'{base}/ercp/index.html', 'uk')
generate_ercp(f'{base}/ru/surgery/index.html', f'{base}/ru/ercp/index.html', 'ru')
print("ERCP pages created.")
