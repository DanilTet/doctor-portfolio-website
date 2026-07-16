import re

with open('build.js', 'r', encoding='utf-8') as f:
    build_js = f.read()

# 1. Update RU translations block for gastroscopy
ru_new = """    'service.gastro.meta.title': 'Гастроскопия | Врач Тетерник О.А.',
    'service.gastro.title': 'Гастроскопия',
    'service.gastro.subtitle': 'Современное эндоскопическое исследование желудка без мифов, боли и страха.',
    'service.gastro.btn': 'Записаться на гастроскопию',
    'service.gastro.toc.title': 'Путеводитель по вопросам подготовки:',
    'service.gastro.toc.item1': '1. Почему правильная подготовка важна?',
    'service.gastro.toc.item2': '2. Рекомендации за 1 день до обследования',
    'service.gastro.toc.item3': '3. Что делать в день гастроскопии?',
    'service.gastro.toc.item4': '4. Если вы постоянно принимаете лекарства',
    'service.gastro.toc.item5': '5. Если гастроскопия под седацией (во сне)',
    'service.gastro.toc.item6': '6. Что взять с собой и как одеться?',
    'service.gastro.why.title': '1. Почему правильная подготовка важна?',
    'service.gastro.why.p1': '<strong>Гастроскопия (ВГДС)</strong> — это точный метод обследования пищевода, желудка и двенадцатиперстной кишки. Чтобы врач смог детально осмотреть слизистую оболочку, выявить даже мелкие воспаления, язвы, полипы или ранние формы рака, желудок должен быть абсолютно пустым.',
    'service.gastro.why.p2': 'Даже небольшое количество пищи или жидкости в желудке может значительно ухудшить обзор слизистой оболочки, увеличить риск возникновения рвотного рефлекса во время процедуры и усложнить точную диагностику.',
    'service.gastro.diet1.title': '2. Рекомендации за 1 день до обследования',
    'service.gastro.diet1.li1': 'Питайтесь в обычном режиме, но избегайте переедания и тяжелой пищи.',
    'service.gastro.diet1.li2': 'Последний легкий прием пищи — не позднее <strong>19:00–20:00</strong> (если исследование запланировано на утро).',
    'service.gastro.diet1.li3': 'Категорически не употребляйте алкоголь накануне процедуры.',
    'service.gastro.day.title': '3. Что делать в день гастроскопии?',
    'service.gastro.day.morning_title': 'Если обследование утром:',
    'service.gastro.day.morning_li1': 'Не ешьте как минимум <strong>6–8 часов</strong> до процедуры.',
    'service.gastro.day.morning_li2': 'Не пейте молоко, кофе, соки или газированные напитки.',
    'service.gastro.day.morning_li3': 'Чистую негазированную воду можно пить небольшими глотками не позднее чем за <strong>2 часа</strong> до начала процедуры.',
    'service.gastro.day.afternoon_title': 'Если гастроскопия после обеда:',
    'service.gastro.day.afternoon_p': 'Разрешается легкий завтрак не позднее чем за <strong>6–8 часов</strong> до обследования. Любой дальнейший прием пищи после этого строго запрещен.',
    'service.gastro.med.title': '4. Если вы постоянно принимаете лекарства',
    'service.gastro.med.li1': 'Препараты от артериального давления и большинства сердечных заболеваний можно принять утром в обычном режиме, запив минимальным количеством чистой воды.',
    'service.gastro.med.li2': 'Если вы принимаете инсулин, сахароснижающие препараты или средства, разжижающие кровь (антикоагулянты), обязательно сообщите об этом врачу заранее.',
    'service.gastro.med.li3': 'Может потребоваться временная коррекция схемы приема или отмена некоторых лекарств по согласованию с врачом.',
    'service.gastro.sedation.title': '5. Если гастроскопия проводится под седацией (во сне)',
    'service.gastro.sedation.li1': 'Не ешьте как минимум <strong>6–8 часов</strong> до начала процедуры.',
    'service.gastro.sedation.li2': 'Не пейте никакой жидкости в течение последних <strong>2 часов</strong> до процедуры.',
    'service.gastro.sedation.li3': 'Внимание! После седации категорически запрещено управлять автомобилем в течение суток. Пожалуйста, заранее позаботьтесь о сопровождении домой.',
    'service.gastro.before.title': '6. Что взять с собой и как одеться?',
    'service.gastro.before.li1': 'Возьмите с собой результаты предыдущих гастроскопий, биопсий и других медицинских обследований (при наличии), чтобы врач мог оценить динамику.',
    'service.gastro.before.li2': 'Если вы носите съемные зубные протезы — их необходимо будет снять непосредственно перед исследованием.',
    'service.gastro.before.li3': 'Наденьте удобную, свободную одежду, которая не сдавливает шею, грудную клетку и живот.',"""

pattern_ru = r"    'service\.gastro\.meta\.title':.*?'service\.gastro\.btn': '[^']+',"
build_js = re.sub(pattern_ru, ru_new.strip(), build_js, count=1, flags=re.DOTALL)


# 2. Update EN translations block for gastroscopy
en_new = """    'service.gastro.meta.title': 'Gastroscopy | Dr. Teternik O.O.',
    'service.gastro.title': 'Gastroscopy',
    'service.gastro.subtitle': 'Modern endoscopic examination of the stomach without fear, pain, and discomfort.',
    'service.gastro.btn': 'Book a Gastroscopy',
    'service.gastro.toc.title': 'Preparation & Procedure Guide:',
    'service.gastro.toc.item1': '1. Why is proper preparation important?',
    'service.gastro.toc.item2': '2. Recommendations 1 day before the exam',
    'service.gastro.toc.item3': '3. What to do on the day of gastroscopy?',
    'service.gastro.toc.item4': '4. If you constantly take medications',
    'service.gastro.toc.item5': '5. If gastroscopy is under sedation (medical sleep)',
    'service.gastro.toc.item6': '6. What to bring and how to dress?',
    'service.gastro.why.title': '1. Why is proper preparation important?',
    'service.gastro.why.p1': '<strong>Gastroscopy (EGD)</strong> is a precise method of examining the esophagus, stomach, and duodenum. For the doctor to perform a detailed inspection of the mucous membrane, and detect even tiny inflammations, ulcers, polyps, or early cancer, the stomach must be completely empty.',
    'service.gastro.why.p2': 'Even a small amount of food or fluid in the stomach can significantly impair the visibility of the mucous membrane, increase the risk of vomiting reflex during the procedure, and complicate accurate diagnosis.',
    'service.gastro.diet1.title': '2. Recommendations 1 day before the exam',
    'service.gastro.diet1.li1': 'Eat as usual, but avoid overeating and heavy foods.',
    'service.gastro.diet1.li2': 'Last light meal — no later than <strong>19:00–20:00</strong> (if the procedure is scheduled for the morning).',
    'service.gastro.diet1.li3': 'Do not consume alcohol under any circumstances the night before the procedure.',
    'service.gastro.day.title': '3. What to do on the day of gastroscopy?',
    'service.gastro.day.morning_title': 'If the procedure is in the morning:',
    'service.gastro.day.morning_li1': 'Do not eat for at least <strong>6–8 hours</strong> before the procedure.',
    'service.gastro.day.morning_li2': 'Do not drink milk, coffee, juices, or carbonated beverages.',
    'service.gastro.day.morning_li3': 'Clean non-carbonated water can be drunk in small sips no later than <strong>2 hours</strong> before the procedure.',
    'service.gastro.day.afternoon_title': 'If the procedure is in the afternoon:',
    'service.gastro.day.afternoon_p': 'A light breakfast is allowed no later than <strong>6–8 hours</strong> before the examination. Any further food intake after this is strictly forbidden.',
    'service.gastro.med.title': '4. If you constantly take medications',
    'service.gastro.med.li1': 'Medications for blood pressure and most heart conditions can be taken in the morning as usual, with a minimal amount of clean water.',
    'service.gastro.med.li2': 'If you take insulin, blood sugar-lowering drugs, or blood thinners (anticoagulants), be sure to inform your doctor in advance.',
    'service.gastro.med.li3': 'A temporary adjustment of the intake schedule or cancellation of some medications might be needed in agreement with the doctor.',
    'service.gastro.sedation.title': '5. If gastroscopy is under sedation (medical sleep)',
    'service.gastro.sedation.li1': 'Do not eat for at least <strong>6–8 hours</strong> before the procedure.',
    'service.gastro.sedation.li2': 'Do not drink any fluids for the last <strong>2 hours</strong> before the procedure.',
    'service.gastro.sedation.li3': 'Warning! After sedation, driving a car is strictly prohibited for 24 hours. Please arrange for someone to accompany you home in advance.',
    'service.gastro.before.title': '6. What to bring and how to dress?',
    'service.gastro.before.li1': 'Bring the results of previous gastroscopies, biopsies, and other medical examinations (if available) so the doctor can assess the dynamics.',
    'service.gastro.before.li2': 'If you wear removable dentures, they must be removed immediately before the examination.',
    'service.gastro.before.li3': 'Wear comfortable, loose clothing that does not compress the neck, chest, or abdomen.',"""

# Replace the EN translation block
build_js = build_js.replace(
    """    'service.gastro.meta.title': 'Gastroscopy | Dr. Teternik O.O.',
    'service.gastro.title': 'Gastroscopy',
    'service.gastro.subtitle': 'Modern endoscopic examination of the stomach without fear, pain, and discomfort.',
    'service.gastro.p1': '<strong>Gastroscopy (esophagogastroduodenoscopy or EGD)</strong> — is a highly precise method of visual examination of the esophagus, stomach, and duodenum using a modern flexible endoscope.',
    'service.gastro.p2': 'This procedure is the "gold standard" in diagnosing gastritis, peptic ulcer disease, reflux, and detecting early stages of oncological diseases of the gastrointestinal tract.',
    'service.gastro.h1': 'Indications for the procedure:',
    'service.gastro.li1': 'Pain or discomfort in the upper abdomen.',
    'service.gastro.li2': 'Frequent heartburn, sour belching, bitterness in the mouth.',
    'service.gastro.li3': 'Sensation of a "lump" when swallowing food.',
    'service.gastro.li4': 'Persistent nausea, vomiting, or rapid weight loss.',
    'service.gastro.h2': 'How to prepare?',
    'service.gastro.p3': 'The examination is performed strictly <strong>fasting</strong>. The last meal should be no later than 8–10 hours before the procedure. Clean water (non-carbonated) can be drunk in small amounts at least 3–4 hours before the examination.',
    'service.gastro.btn': 'Book a Gastroscopy',""",
    en_new.strip()
)

with open('build.js', 'w', encoding='utf-8') as f:
    f.write(build_js)

print("build.js translations for gastroscopy updated successfully.")
