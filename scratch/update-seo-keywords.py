import re

# 1. Update compilePage in build.js to support data-i18n-content attribute
with open('build.js', 'r', encoding='utf-8') as f:
    build_js = f.read()

compile_page_old = """    if (langData) {
        $('[data-i18n]').each(function() {
            const key = $(this).attr('data-i18n');
            if (langData[key]) {
                const children = $(this).children('svg, img, .hero__badge-dot');
                if (children.length > 0) {
                    let textNodeReplaced = false;
                    $(this).contents().each(function() {
                       if (this.nodeType === 3 && this.nodeValue.trim() !== '' && !textNodeReplaced) {
                           this.nodeValue = this.nodeValue.replace(/[\s\S]+/, langData[key]);
                           textNodeReplaced = true;
                       }
                    });
                } else {
                    $(this).html(langData[key]);
                }
            }
        });
    }"""

compile_page_new = """    if (langData) {
        $('[data-i18n]').each(function() {
            const key = $(this).attr('data-i18n');
            if (langData[key]) {
                const children = $(this).children('svg, img, .hero__badge-dot');
                if (children.length > 0) {
                    let textNodeReplaced = false;
                    $(this).contents().each(function() {
                       if (this.nodeType === 3 && this.nodeValue.trim() !== '' && !textNodeReplaced) {
                           this.nodeValue = this.nodeValue.replace(/[\s\S]+/, langData[key]);
                           textNodeReplaced = true;
                       }
                    });
                } else {
                    $(this).html(langData[key]);
                }
            }
        });
        $('[data-i18n-content]').each(function() {
            const key = $(this).attr('data-i18n-content');
            if (langData[key]) {
                $(this).attr('content', langData[key]);
            }
        });
    }"""

# Replace in build.js
build_js = build_js.replace(compile_page_old, compile_page_new)

# Let's add meta description/keywords translations to translations dictionary in build.js
# First let's check translations structure:
# translations.ru: {
#   ...
# }
# translations.en: {
#   ...
# }

ru_seo_keys = """    // SEO Meta Keys
    'meta.desc': 'Тетерник Олег Александрович — врач-эндоскопист, хирург, УЗИ. Отзывы пациентов. Эндоскопия, ФГДС, колоноскопия, удаление полипов, УЗИ в Харькове.',
    'meta.keywords': 'ФГДС, зонд Харьков, глотнуть кишку, гастроскопия Харьков, колоноскопия Харьков, удаление полипов кишечника, УЗИ брюшной полости, седация, медикаментозный сон, Тетерник Олег, эндоскопия Харьков, ВГДС',
    'service.gastro.meta.desc': 'Детальная подготовка к гастроскопии (ФГДС, зонд желудка) в Харькове. Инструкции врача Тетерника О.А.: как глотнуть кишку без боли под седацией (наркозом).',
    'service.gastro.meta.keywords': 'ФГДС, зонд Харьков, глотнуть кишку, гастроскопия Харьков, зонт желудка, рак желудка, грыжа пищевода, опухоль желудка, язва двенадцатиперстной кишки, седация, медикаментозный сон, подготовка',
    'service.colono.meta.desc': 'Как подготовиться к колоноскопии препаратом Изиклин. Подробная инструкция врача-эндоскописта Тетерника О.А. об осмотре кишечника под наркозом (седацией).',
    'service.colono.meta.keywords': 'колоноскопия, колоноскопия седация, колоноскопия наркоз, подготовка к колоноскопии, Изиклин, рак толстой кишки, рак кишечника, опухоль кишечника, полипы кишечника',
    'service.uzd.meta.desc': 'Ультразвуковая диагностика (УЗИ) брюшной полости, почек и мочевого пузыря в Харькове. Безопасное и безболезненное обследование внутренних органов у врача Тетерника О.А.',
    'service.uzd.meta.keywords': 'УЗИ брюшной полости, узи органов, ультразвуковая диагностика Харьков, подготовка к узи, УЗИ почек, УЗИ щитовидной железы, Тетерник Олег',
    'service.surgery.meta.desc': 'Оперативная эндоскопия и малоинвазивная хирургия в Харькове. Удаление полипов кишечника (полипэктомия), остановка кровотечений, гастростома, лечение опухолей и ЭРХПГ.',
    'service.surgery.meta.keywords': 'удаление полипов кишечника, полипэктомия, оперативная эндоскопия, малоинвазивная хирургия, ЭРХПГ, желтуха Харьков, капсульная эндоскопия, гастростома, эндоскопическая гастростома',"""

en_seo_keys = """    // SEO Meta Keys
    'meta.desc': 'Teternik Oleg Oleksandrovych — Endoscopist, Surgeon, Ultrasound. Patient reviews. Endoscopy, EGD, colonoscopy, polyp removal in Kharkiv.',
    'meta.keywords': 'EGD, gastroscopy Kharkiv, colonoscopy Kharkiv, polyp removal, abdominal ultrasound, sedation, medical sleep, Teternik Oleg, endoscopy Kharkiv',
    'service.gastro.meta.desc': 'Detailed preparation for gastroscopy (EGD, stomach tube) in Kharkiv. Instructions by Dr. Teternik O.O. on how to undergo the procedure painlessly under sedation.',
    'service.gastro.meta.keywords': 'EGD preparation, gastroscopy Kharkiv, stomach probe, stomach cancer, esophagus hernia, gastric ulcer, sedation, medical sleep',
    'service.colono.meta.desc': 'How to prepare for colonoscopy using Eziclen. Detailed instructions by Dr. Teternik O.O. on bowel examination under sedation/anesthesia.',
    'service.colono.meta.keywords': 'colonoscopy preparation, colonoscopy sedation, colonoscopy anesthesia, Eziclen, colon cancer, bowel polyps',
    'service.uzd.meta.desc': 'Ultrasound diagnostics (USG) of the abdominal cavity, kidneys, and bladder in Kharkiv. Safe and painless internal organ scanning by Dr. Teternik O.O.',
    'service.uzd.meta.keywords': 'abdominal ultrasound, kidney ultrasound, thyroid ultrasound, USG Kharkiv, ultrasound preparation',
    'service.surgery.meta.desc': 'Operative endoscopy and minimally invasive surgery in Kharkiv. Removal of bowel polyps (polypectomy), hemostasis, gastrostomy, ERCP, and capsule endoscopy.',
    'service.surgery.meta.keywords': 'bowel polypectomy, polyp removal, operative endoscopy, minimally invasive surgery, ERCP, jaundice, gastrostomy, capsule endoscopy',"""

# Insert these keys into the translation dictionaries in build.js
# We can find translations = { ru: { and translations = { en: {
build_js = build_js.replace("translations = {\n  ru: {", "translations = {\n  ru: {\n" + ru_seo_keys)
build_js = build_js.replace("  en: {", "  en: {\n" + en_seo_keys)

with open('build.js', 'w', encoding='utf-8') as f:
    f.write(build_js)

print("build.js updated with SEO meta tag support and translations.")
