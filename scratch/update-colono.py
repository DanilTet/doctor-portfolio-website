import re
import json

languages = {
    'ru': {
        'file': 'ru/colonoscopy/index.html',
        'h1_old': 'Колоноскопия',
        'h1_new': 'Колоноскопия в Харькове — 17-я больница',
        'intro_title': 'Когда необходима колоноскопия?',
        'intro_p1': 'Если вас беспокоят боли в животе, хронические запоры, диарея, появление крови в стуле, или вам больше 45 лет (для профилактики), вам необходима качественная <strong>колоноскопия в Харькове</strong>.',
        'intro_p2': 'Процедуры проводит врач-эндоскопист <strong>Тетерник Олег Александрович</strong> на современном видеоэндоскопе в специально оборудованном кабинете <strong>в 17-й городской больнице</strong>. Исследование проводится исключительно в состоянии медикаментозного сна (седации) — абсолютно без боли и страха. За одно обследование врач может сразу безболезненно удалить найденные полипы.',
        'intro_p3': 'Если у вас остались вопросы или вы хотите записаться — жмите на кнопку внизу страницы!',
        'faq_title': 'Частые вопросы (FAQ)',
        'q1': 'Больно ли делать колоноскопию?',
        'a1': 'Нет, процедура проводится под медикаментозным сном (седацией). Вы засыпаете, ничего не чувствуете во время обследования, а просыпаетесь уже после его окончания. Это современный и абсолютно безболезненный стандарт.',
        'q2': 'Сколько времени занимает процедура?',
        'a2': 'Само обследование длится около 15–30 минут. С учетом подготовки, переодевания и времени на пробуждение после седации, вы проведете в клинике примерно 1–1.5 часа.',
        'q3': 'Можно ли сразу удалить полипы?',
        'a3': 'Да, если во время колоноскопии врач обнаруживает полипы, они удаляются сразу же в ходе одной процедуры (при отсутствии противопоказаний). Это безболезненно и защищает вас от рака кишечника в будущем.'
    },
    'uk': {
        'file': 'colonoscopy/index.html',
        'h1_old': 'Колоноскопія (відеоколоноскопія)',
        'h1_new': 'Колоноскопія в Харкові — 17-а лікарня',
        'intro_title': 'Коли необхідна колоноскопія?',
        'intro_p1': 'Якщо вас турбують болі в животі, хронічні запори, діарея, поява крові в калі, або вам більше 45 років (для профілактики), вам необхідна якісна <strong>колоноскопія в Харкові</strong>.',
        'intro_p2': 'Процедури проводить лікар-ендоскопіст <strong>Тетернік Олег Олександрович</strong> на сучасному відеоендоскопі в спеціально обладнаному кабінеті <strong>в 17-й міській лікарні</strong>. Дослідження проводиться виключно у стані медикаментозного сну (седації) — абсолютно без болю та страху. За одне обстеження лікар може одразу безболісно видалити знайдені поліпи.',
        'intro_p3': 'Якщо у вас залишилися питання або ви хочете записатися — тисніть на кнопку внизу сторінки!',
        'faq_title': 'Поширені запитання (FAQ)',
        'q1': 'Чи боляче робити колоноскопію?',
        'a1': 'Ні, процедура проводиться під медикаментозним сном (седацією). Ви засинаєте, нічого не відчуваєте під час обстеження, а прокидаєтеся вже після його закінчення. Це сучасний і абсолютно безболісний стандарт.',
        'q2': 'Скільки часу займає процедура?',
        'a2': 'Саме обстеження триває близько 15–30 хвилин. З урахуванням підготовки, переодягання та часу на пробудження після седації, ви проведете в клініці приблизно 1–1.5 години.',
        'q3': 'Чи можна одразу видалити поліпи?',
        'a3': 'Так, якщо під час колоноскопії лікар виявляє поліпи, вони видаляються відразу в ході однієї процедури (за відсутності протипоказань). Це безболісно і захищає вас від раку кишечника в майбутньому.'
    },
    'en': {
        'file': 'en/colonoscopy/index.html',
        'h1_old': 'Colonoscopy',
        'h1_new': 'Colonoscopy in Kharkiv — 17th Hospital',
        'intro_title': 'When is a colonoscopy necessary?',
        'intro_p1': 'If you suffer from abdominal pain, chronic constipation, diarrhea, blood in your stool, or if you are over 45 (for prevention), you need a high-quality <strong>colonoscopy in Kharkiv</strong>.',
        'intro_p2': 'The procedures are performed by endoscopist <strong>Dr. Teternik Oleg</strong> using a modern video endoscope in a specially equipped room <strong>at the 17th City Hospital</strong>. The examination is performed exclusively under medication-induced sleep (sedation) — completely without pain or fear. During a single examination, the doctor can safely and painlessly remove any found polyps.',
        'intro_p3': 'If you have any questions or want to make an appointment — click the button at the bottom of the page!',
        'faq_title': 'Frequently Asked Questions (FAQ)',
        'q1': 'Is a colonoscopy painful?',
        'a1': 'No, the procedure is performed under medication-induced sleep (sedation). You fall asleep, feel nothing during the examination, and wake up after it is finished. This is a modern and completely painless standard.',
        'q2': 'How long does the procedure take?',
        'a2': 'The actual examination takes about 15–30 minutes. Taking into account preparation, changing clothes, and waking up after sedation, you will spend about 1–1.5 hours at the clinic.',
        'q3': 'Can polyps be removed immediately?',
        'a3': 'Yes, if the doctor finds polyps during the colonoscopy, they are removed immediately during the same procedure (unless there are contraindications). It is painless and protects you from colon cancer in the future.'
    }
}

faq_style = """
        <style>
          .faq-details {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 8px;
            margin-bottom: 12px;
            overflow: hidden;
            transition: background 0.3s ease;
          }
          .faq-details:hover {
            background: rgba(255, 255, 255, 0.04);
          }
          .faq-summary {
            padding: 12px 14px;
            font-weight: 600;
            font-size: 0.95rem;
            color: var(--color-text-light);
            cursor: pointer;
            list-style: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .faq-summary::-webkit-details-marker {
            display: none;
          }
          .faq-summary::after {
            content: '+';
            font-size: 1.5rem;
            line-height: 1;
            color: var(--color-primary);
            transition: transform 0.3s ease;
          }
          .faq-details[open] .faq-summary::after {
            content: '−';
            transform: rotate(180deg);
          }
          .faq-content {
            padding: 0 14px 14px 14px;
            color: var(--color-text);
            line-height: 1.6;
          }
        </style>
"""

for lang, data in languages.items():
    filepath = data['file']
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Failed to open {filepath}: {e}")
        continue

    # 1. Replace H1
    h1_pattern = re.compile(r'(<h1 class="section-title"[^>]*>)(.*?)(</h1>)')
    content = h1_pattern.sub(rf'\g<1>{data["h1_new"]}\g<3>', content)

    # 2. Add JSON-LD Schema for FAQ
    schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": data['q1'],
          "acceptedAnswer": {
            "@type": "Answer",
            "text": data['a1']
          }
        },
        {
          "@type": "Question",
          "name": data['q2'],
          "acceptedAnswer": {
            "@type": "Answer",
            "text": data['a2']
          }
        },
        {
          "@type": "Question",
          "name": data['q3'],
          "acceptedAnswer": {
            "@type": "Answer",
            "text": data['a3']
          }
        }
      ]
    }
    
    schema_script = f"\n  <!-- JSON-LD: FAQ -->\n  <script type=\"application/ld+json\">\n  {json.dumps(schema, ensure_ascii=False, indent=2)}\n  </script>\n</head>"
    if "FAQPage" not in content:
        content = content.replace("</head>", schema_script)

    # 3. Create the Intro block and FAQ block
    blocks_html = f"""
        <!-- Intro Section -->
        <div style="margin-bottom: 40px;">
          <h2 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.75rem; color: var(--color-text-light);">{data['intro_title']}</h2>
          <p style="margin-bottom: 16px;">{data['intro_p1']}</p>
          <p style="margin-bottom: 16px;">{data['intro_p2']}</p>
          <p style="margin-bottom: 0;">{data['intro_p3']}</p>
        </div>

        <!-- FAQ Section -->
        {faq_style}
        <div style="margin-bottom: 24px; margin-top: 0px;">
          <h2 style="margin-top: 0; margin-bottom: 12px; font-weight: 700; font-size: 1.25rem; color: var(--color-text-light); text-align: center;">{data['faq_title']}</h2>
          
          <details class="faq-details">
            <summary class="faq-summary">{data['q1']}</summary>
            <div class="faq-content">{data['a1']}</div>
          </details>
          
          <details class="faq-details">
            <summary class="faq-summary">{data['q2']}</summary>
            <div class="faq-content">{data['a2']}</div>
          </details>

          <details class="faq-details">
            <summary class="faq-summary">{data['q3']}</summary>
            <div class="faq-content">{data['a3']}</div>
          </details>
        </div>
"""
    
    # 4. Insert before TOC
    toc_marker = '<!-- Table of Contents'
    if '<!-- Intro Section -->' not in content and toc_marker in content:
        parts = content.split(toc_marker)
        content = parts[0] + blocks_html + '\n        ' + toc_marker + toc_marker.join(parts[1:])
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {filepath}")
